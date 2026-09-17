import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { initialForms, initialClients } from "@/lib/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { Form } from "@/lib/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = id;

    if (!token) {
      return NextResponse.json({ success: false, error: "Mangler parameter" }, { status: 400 });
    }

    // 1. Check if token matches ANY master form slug or ID
    const allForms = await dataStore.getForms();
    const matchedMasterForm = allForms.find(f => f.slug === token || f.id === token) || 
      (token === "kort-skjema" || token === "f-kort-prosjektskjema" ? initialForms.find(f => f.id === "f-kort-prosjektskjema") : null) ||
      (token === "prosjektskjema" || token === "f-prosjektskjema" ? initialForms.find(f => f.id === "f-prosjektskjema") : null) ||
      initialForms.find(f => f.id === token || f.slug === token);

    // 2. Query Supabase site_content for form directly
    let directForm: any = matchedMasterForm || null;
    if (!directForm) {
      try {
        const supabase = createAdminClient();
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "forms_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          directForm = scData.content.find((f: any) => f.id === id || f.slug === id);
        }
      } catch {}
    }

    if (!directForm) {
      directForm = (await dataStore.getFormById(id)) || initialForms.find(f => f.id === id || f.slug === id);
    }

    // 3. Query Supabase / dataStore for distribution by token
    let dist: any = await dataStore.getDistributionByToken(token);

    if (!dist) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("form_distributions")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (!error && data) {
          dist = data;
        }
      } catch (err) {
        console.warn("Supabase distribution lookup warning:", err);
      }
    }

    // 4. Default template form (Kort prosjektskjema preferred)
    const defaultShortForm = (await dataStore.getFormById("f-kort-prosjektskjema")) || 
                             initialForms.find(f => f.id === "f-kort-prosjektskjema") || 
                             initialForms[0];

    const templateForm = directForm || defaultShortForm;

    // If it's a distribution token or master slug
    if (dist || matchedMasterForm || token.startsWith("bm-") || token.includes("skjema")) {
      if (!dist && matchedMasterForm) {
        dist = {
          id: `dist-master-${matchedMasterForm.slug || matchedMasterForm.id}`,
          form_id: matchedMasterForm.id,
          client_id: null,
          token: token,
          status: "sent",
          expires_at: null,
          created_at: new Date().toISOString()
        };
      } else if (!dist) {
        const allClients = await dataStore.getClients();
        const defaultClient = allClients[0] || initialClients[0];
        dist = {
          id: "dist-" + token,
          form_id: templateForm.id,
          client_id: defaultClient?.id || null,
          token: token,
          status: "sent",
          email_subject: `Skjema fra By Mari`,
          email_intro: "Hei! Her er skjemaet ditt.",
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          form: templateForm,
          client: defaultClient
        };
      }

      // Resolve the actual target form ID
      let targetFormId = dist.form_id || dist.form?.id || templateForm.id;
      
      // Always look up the complete form with fields
      let form = (await dataStore.getFormById(targetFormId)) || 
                 initialForms.find(f => f.id === targetFormId || f.slug === targetFormId) || 
                 allForms.find(f => f.id === targetFormId || f.slug === targetFormId) ||
                 directForm || 
                 templateForm;

      // Fallback: If form still has empty fields, get from initialForms
      if (!form || !form.fields || form.fields.length === 0) {
        const fallback = initialForms.find(f => f.id === targetFormId || f.slug === targetFormId) || 
                         initialForms.find(f => f.id === "f-kort-prosjektskjema") || 
                         initialForms[0];
        form = { ...form, ...fallback };
      }

      let client = dist.client;
      if (!client && dist.client_id) {
        client = await dataStore.getClientById(dist.client_id);
        if (client) dist.client = client;
      }

      try {
        await dataStore.markDistributionOpened(token);
      } catch {}

      return NextResponse.json({
        success: true,
        distribution: dist,
        form
      });
    }

    if (directForm) {
      // Ensure directForm has complete fields
      if (!directForm.fields || directForm.fields.length === 0) {
        const fallback = initialForms.find(f => f.id === directForm.id || f.slug === directForm.slug);
        if (fallback) directForm = { ...directForm, fields: fallback.fields };
      }
      return NextResponse.json({
        success: true,
        form: directForm,
        distribution: {
          id: `dist-${directForm.id}`,
          form_id: directForm.id,
          token: directForm.slug || directForm.id,
          status: "sent",
          created_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ success: false, error: "Skjema ikke funnet" }, { status: 404 });
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
