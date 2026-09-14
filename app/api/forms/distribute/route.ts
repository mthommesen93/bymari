import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendFormDistributionEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId") || undefined;
    const clientId = searchParams.get("clientId") || undefined;

    const supabase = createAdminClient();
    try {
      let query = supabase
        .from("form_distributions")
        .select("*, form:forms(*), client:clients(*)")
        .order("created_at", { ascending: false });

      if (formId) query = query.eq("form_id", formId);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, distributions: data });
      }
    } catch (dbErr) {
      console.warn("DB distributions fetch fallback:", dbErr);
    }

    const memoryDistributions = await dataStore.getDistributions({ formId, clientId });
    return NextResponse.json({ success: true, distributions: memoryDistributions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formId, clientId, emailSubject, emailIntro, expiresAt, sendEmailDirectly } = body;

    if (!formId) {
      return NextResponse.json({ success: false, error: "Mangler skjema-ID" }, { status: 400 });
    }

    const form = await dataStore.getFormById(formId);
    if (!form) {
      return NextResponse.json({ success: false, error: "Skjema ikke funnet" }, { status: 404 });
    }

    const client = clientId ? await dataStore.getClientById(clientId) : null;

    // Calculate end-of-day expiration if provided
    let formattedExpiresAt: string | null = null;
    if (expiresAt) {
      const datePart = expiresAt.includes("T") ? expiresAt.split("T")[0] : expiresAt;
      // Set to 23:59:59.999 UTC of that date so client has until end of day
      formattedExpiresAt = new Date(`${datePart}T23:59:59.999Z`).toISOString();
    }

    // 1. Create distribution in store & memory
    const newDist = await dataStore.createDistribution({
      form_id: form.id,
      client_id: client ? client.id : null,
      email_subject: emailSubject || `Skjema fra by mari: ${form.title}`,
      email_intro: emailIntro || "",
      expires_at: formattedExpiresAt
    });

    // 2. Persist to Supabase if connected
    try {
      const supabase = createAdminClient();
      await supabase.from("form_distributions").insert([{
        id: newDist.id,
        form_id: form.id,
        client_id: client ? client.id : null,
        token: newDist.token,
        email_subject: newDist.email_subject,
        email_intro: newDist.email_intro,
        expires_at: newDist.expires_at,
        status: "sent"
      }]);
    } catch (dbErr) {
      console.warn("Supabase distribution write fallback:", dbErr);
    }

    // 3. Send email via Resend on the server to the client
    let emailResult = null;
    if (sendEmailDirectly && client && client.email) {
      emailResult = await sendFormDistributionEmail({
        recipientEmail: client.email,
        recipientName: client.name,
        formTitle: form.title,
        emailSubject: emailSubject || `Skjema fra by mari: ${form.title}`,
        emailIntro: emailIntro,
        token: newDist.token
      });
    }

    return NextResponse.json({
      success: true,
      distribution: newDist,
      emailSent: Boolean(emailResult?.success),
      emailResult
    });
  } catch (error: any) {
    console.error("Form distribute API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Kunne ikke distribuere skjema" },
      { status: 500 }
    );
  }
}

