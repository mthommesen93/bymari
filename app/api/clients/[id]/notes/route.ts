import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let allNotes: any[] = [];

    const client = await dataStore.getClientById(id);
    const clientEmail = client?.email ? client.email.toLowerCase().trim() : "";
    const clientName = client?.name ? client.name.toLowerCase().trim() : "";

    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "client_notes_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        allNotes = scData.content.filter((n: any) => {
          if (n.client_id === id) return true;
          if (client && (n.client_id === client.id || n.clientId === client.id)) return true;
          const noteEmail = (n.client_email || n.email || "").toLowerCase().trim();
          if (clientEmail && noteEmail && noteEmail === clientEmail) return true;
          const noteName = (n.client_name || n.name || "").toLowerCase().trim();
          if (clientName && noteName && noteName === clientName) return true;
          return false;
        });
      }
    } catch (e) {}

    if (allNotes.length === 0) {
      const memNotes = await dataStore.getClientNotes(id);
      allNotes = memNotes;
    }

    return NextResponse.json({
      success: true,
      notes: allNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, authorName = "Mari" } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Innhold er påkrevd." }, { status: 400 });
    }

    const newNote = await dataStore.addClientNote(id, content.trim(), authorName);

    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "client_notes_all")
        .single();

      const currentNotes = Array.isArray(scData?.content) ? scData.content : [];
      const updatedNotes = [newNote, ...currentNotes.filter((n: any) => n.id !== newNote.id)];

      await supabase.from("site_content").upsert({
        key: "client_notes_all",
        content: updatedNotes,
        updated_at: new Date().toISOString()
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      note: newNote
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
