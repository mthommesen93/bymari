import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { initialForms } from "@/lib/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { Form } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    let allForms: Form[] = [];

    // 1. Fetch from Supabase site_content (key: forms_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "forms_all")
        .single();

      if (scData?.content && Array.isArray(scData.content) && scData.content.length > 0) {
        allForms = scData.content;
      }
    } catch (scErr) {
      console.warn("site_content forms fetch fallback:", scErr);
    }

    // 2. Merge with dataStore / initialForms to ensure templates always exist
    const baseForms = await dataStore.getForms();
    const existingIds = new Set(allForms.map(f => f.id));
    
    // Add any base templates not already in allForms
    baseForms.forEach(bf => {
      if (!existingIds.has(bf.id)) {
        allForms.push(bf);
      }
    });

    if (allForms.length === 0) {
      allForms = [...initialForms];
    }

    return NextResponse.json({
      success: true,
      forms: allForms.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    });
  } catch (error: any) {
    console.error("Forms GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const createdForm = await dataStore.createForm(body);

    // Persist to Supabase site_content (forms_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "forms_all")
        .single();

      const currentList = Array.isArray(scData?.content) ? scData.content : [...initialForms];
      const updatedList = [createdForm, ...currentList.filter((f: any) => f.id !== createdForm.id)];

      await supabase.from("site_content").upsert({
        key: "forms_all",
        content: updatedList,
        updated_at: new Date().toISOString()
      });
    } catch (scErr) {
      console.warn("Supabase forms_all save error:", scErr);
    }

    return NextResponse.json({
      success: true,
      form: createdForm
    });
  } catch (error: any) {
    console.error("Forms POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
