import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { initialForms } from "@/lib/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ success: false, error: "Mangler token" }, { status: 400 });
    }

    // 1. Check if token is the master template slug "prosjektskjema"
    if (token === "prosjektskjema" || token === "f-prosjektskjema") {
      const templateForm = (await dataStore.getFormById("f-prosjektskjema")) || initialForms[0];
      return NextResponse.json({
        success: true,
        distribution: {
          id: "dist-master-prosjektskjema",
          form_id: templateForm.id,
          client_id: null,
          token: "prosjektskjema",
          status: "sent",
          expires_at: null,
          created_at: new Date().toISOString()
        },
        form: templateForm
      });
    }

    // 2. Query Supabase / dataStore for distribution by token
    let dist = await dataStore.getDistributionByToken(token);

    if (!dist) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("form_distributions")
          .select("*, form:forms(*, fields:form_fields(*)), client:clients(*)")
          .eq("token", token)
          .single();

        if (!error && data) {
          dist = data;
        }
      } catch (err) {
        console.warn("Supabase distribution lookup error:", err);
      }
    }

    if (!dist) {
      return NextResponse.json({ success: false, error: "Ugyldig eller utløpt lenke" }, { status: 404 });
    }

    // 3. Ensure form is loaded
    let form = dist.form || (await dataStore.getFormById(dist.form_id)) || initialForms[0];
    if (!form.fields || form.fields.length === 0) {
      form = initialForms[0];
    }

    // 4. Ensure client is loaded if client_id exists
    let client = dist.client;
    if (!client && dist.client_id) {
      client = await dataStore.getClientById(dist.client_id);
      if (client) dist.client = client;
    }

    // 5. Mark distribution as opened
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

