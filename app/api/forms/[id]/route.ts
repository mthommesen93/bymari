import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { initialForms } from "@/lib/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { Form } from "@/lib/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Check Supabase site_content (forms_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "forms_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        const found = scData.content.find((f: any) => f.id === id || f.slug === id);
        if (found) {
          return NextResponse.json({ success: true, form: found });
        }
      }
    } catch (scErr) {
      console.warn("site_content form lookup error:", scErr);
    }

    // 2. Check dataStore / initialForms
    const form = (await dataStore.getFormById(id)) || initialForms.find(f => f.id === id || f.slug === id);
    if (!form) {
      return NextResponse.json({ success: false, error: "Skjema ikke funnet" }, { status: 404 });
    }

    return NextResponse.json({ success: true, form });
  } catch (error: any) {
    console.error("Form GET by ID error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await dataStore.updateForm(id, body);

    // Save to Supabase site_content (forms_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "forms_all")
        .single();

      const allBaseForms = await dataStore.getForms();
      const currentList: Form[] = Array.isArray(scData?.content) && scData.content.length > 0 
        ? scData.content 
        : allBaseForms;

      const formToSave = updated || { ...body, id, updated_at: new Date().toISOString() };
      const updatedList = currentList.map((f: any) => (f.id === id ? { ...f, ...formToSave } : f));
      
      // If not in currentList, add it
      if (!updatedList.some((f: any) => f.id === id)) {
        updatedList.unshift(formToSave);
      }

      await supabase.from("site_content").upsert({
        key: "forms_all",
        content: updatedList,
        updated_at: new Date().toISOString()
      });
    } catch (scErr) {
      console.warn("Supabase form update error:", scErr);
    }

    return NextResponse.json({
      success: true,
      form: updated || body
    });
  } catch (error: any) {
    console.error("Form PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dataStore.deleteForm(id);

    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "forms_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        const filtered = scData.content.filter((f: any) => f.id !== id);
        await supabase.from("site_content").upsert({
          key: "forms_all",
          content: filtered,
          updated_at: new Date().toISOString()
        });
      }
    } catch (scErr) {
      console.warn("Supabase form delete error:", scErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Form DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
