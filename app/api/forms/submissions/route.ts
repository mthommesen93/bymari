import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/admin";
import { initialSubmissions } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId") || undefined;
    const clientId = searchParams.get("clientId") || undefined;

    let allSubmissions: any[] = [];

    // 1. Fetch from site_content table (key: form_submissions_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "form_submissions_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        allSubmissions = scData.content;
      }
    } catch (scErr) {
      console.warn("site_content submissions query fallback:", scErr);
    }

    // 2. Fetch from relational submissions table
    try {
      const supabase = createAdminClient();
      let query = supabase
        .from("submissions")
        .select("*, form:forms(*), client:clients(*), answers:submission_answers(*), files:uploaded_files(*)")
        .order("submitted_at", { ascending: false });

      if (formId) query = query.eq("form_id", formId);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const existingIds = new Set(allSubmissions.map(s => s.id));
        data.forEach(d => {
          if (!existingIds.has(d.id)) {
            allSubmissions.push(d);
          }
        });
      }
    } catch (dbErr) {
      console.warn("DB submissions query fallback:", dbErr);
    }

    // 3. Fallback to memory / initial submissions if empty
    if (allSubmissions.length === 0) {
      const memorySubmissions = await dataStore.getSubmissions({ formId, clientId });
      allSubmissions = memorySubmissions.length > 0 ? memorySubmissions : initialSubmissions;
    }

    // Filter if query params provided
    if (formId) {
      allSubmissions = allSubmissions.filter(s => s.form_id === formId || s.form?.id === formId);
    }
    if (clientId) {
      allSubmissions = allSubmissions.filter(s => s.client_id === clientId || s.client?.id === clientId);
    }

    return NextResponse.json({
      success: true,
      submissions: allSubmissions.sort((a, b) => new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime())
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, internal_notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Mangler svar-ID" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update in site_content
    try {
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "form_submissions_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        const updated = scData.content.map((s: any) => {
          if (s.id === id) {
            return {
              ...s,
              status: status || s.status,
              internal_notes: internal_notes !== undefined ? internal_notes : s.internal_notes,
              updated_at: new Date().toISOString()
            };
          }
          return s;
        });

        await supabase.from("site_content").upsert({
          key: "form_submissions_all",
          content: updated,
          updated_at: new Date().toISOString()
        });
      }
    } catch {}

    // Update in relational table
    try {
      const updates: any = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (internal_notes !== undefined) updates.internal_notes = internal_notes;

      await supabase.from("submissions").update(updates).eq("id", id);
    } catch {}

    await dataStore.updateSubmission(id, { status, internal_notes });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

