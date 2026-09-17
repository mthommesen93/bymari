import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { initialForms, initialClients } from "@/lib/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ success: false, error: "Mangler token" }, { status: 400 });
    }

    // 1. Check if token matches ANY master form slug or ID
    const allForms = await dataStore.getForms();
    const matchedMasterForm = allForms.find(f => f.slug === token || f.id === token) || 
      (token === "prosjektskjema" || token === "f-prosjektskjema" ? initialForms[0] : null) ||
      (token === "kort-skjema" || token === "f-kort-prosjektskjema" ? initialForms.find(f => f.id === "f-kort-prosjektskjema") : null);

    if (matchedMasterForm) {
      return NextResponse.json({
        success: true,
        distribution: {
          id: `dist-master-${matchedMasterForm.slug || matchedMasterForm.id}`,
          form_id: matchedMasterForm.id,
          client_id: null,
          token: token,
          status: "sent",
          expires_at: null,
          created_at: new Date().toISOString()
        },
        form: matchedMasterForm
      });
    }

    const templateForm = (await dataStore.getFormById("f-prosjektskjema")) || initialForms[0];

    // 2. Query Supabase / dataStore for distribution by token
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
        console.warn("Supabase distribution lookup error:", err);
      }
    }

    // 3. If token was generated prior to database sync or is an active customer link, reconstruct gracefully
    if (!dist) {
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

      // Save to Supabase so it's registered for subsequent calls and submission
      try {
        const supabase = createAdminClient();
        await supabase.from("form_distributions").upsert([{
          id: dist.id,
          form_id: templateForm.id,
          client_id: defaultClient?.id || null,
          token: token,
          status: "sent",
          email_subject: dist.email_subject,
          email_intro: dist.email_intro
        }], { onConflict: "token" });
      } catch (dbErr) {
        console.warn("Auto-register distribution error:", dbErr);
      }
    }

    // 4. Ensure form is loaded
    let targetFormId = dist.form_id || dist.form?.id || "f-prosjektskjema";
    let form = dist.form || (await dataStore.getFormById(targetFormId)) || allForms.find(f => f.id === targetFormId) || templateForm;
    if (!form.fields || form.fields.length === 0) {
      form = (await dataStore.getFormById(targetFormId)) || templateForm;
    }

    // 5. Ensure client is loaded if client_id exists
    let client = dist.client;
    if (!client && dist.client_id) {
      client = await dataStore.getClientById(dist.client_id);
      if (client) dist.client = client;
    }

    // 6. Mark distribution as opened
    try {
      await dataStore.markDistributionOpened(token);
      const supabase = createAdminClient();
      await supabase
        .from("form_distributions")
        .update({ status: "opened", opened_at: new Date().toISOString() })
        .eq("token", token)
        .eq("status", "sent");
    } catch {}

    return NextResponse.json({
      success: true,
      distribution: dist,
      form
    });
  } catch (error: any) {
    console.error("Form token route error:", error);
    return NextResponse.json({ success: false, error: error.message || "Feil ved henting av skjema" }, { status: 500 });
  }
}


