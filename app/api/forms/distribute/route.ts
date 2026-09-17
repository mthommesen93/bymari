import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendFormDistributionEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { initialDistributions } from "@/lib/demo-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId") || undefined;
    const clientId = searchParams.get("clientId") || undefined;
    const email = searchParams.get("email") || undefined;

    let allDistributions: any[] = [];

    // 1. Fetch from site_content (key: form_distributions_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "form_distributions_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        allDistributions = scData.content;
      }
    } catch (scErr) {
      console.warn("site_content distributions query fallback:", scErr);
    }

    // 2. Fetch from relational database table
    try {
      const supabase = createAdminClient();
      let query = supabase
        .from("form_distributions")
        .select("*, form:forms(*), client:clients(*)")
        .order("created_at", { ascending: false });

      if (formId) query = query.eq("form_id", formId);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const existingIds = new Set(allDistributions.map(d => d.id || d.token));
        data.forEach(d => {
          if (!existingIds.has(d.id) && !existingIds.has(d.token)) {
            allDistributions.push(d);
          }
        });
      }
    } catch (dbErr) {
      console.warn("DB distributions fetch fallback:", dbErr);
    }

    // 3. Fallback / Merge with memory & disk distributions
    try {
      const memoryDistributions = await dataStore.getDistributions({ formId, clientId, email });
      const existingIds = new Set(allDistributions.map(d => d.id || d.token));
      memoryDistributions.forEach(md => {
        if (!existingIds.has(md.id) && !existingIds.has(md.token)) {
          allDistributions.push(md);
        }
      });
    } catch (memErr) {
      console.warn("dataStore distributions fallback:", memErr);
    }

    if (allDistributions.length === 0) {
      allDistributions = [...initialDistributions];
    }

    if (formId) {
      allDistributions = allDistributions.filter(d => d.form_id === formId || d.form?.id === formId);
    }
    if (clientId || email) {
      const filterEmail = email ? email.toLowerCase().trim() : "";
      allDistributions = allDistributions.filter(d => {
        const matchClient = clientId && (d.client_id === clientId || d.client?.id === clientId);
        const matchEmail = filterEmail && (
          (d.recipient_email && d.recipient_email.toLowerCase().trim() === filterEmail) ||
          (d.client?.email && d.client.email.toLowerCase().trim() === filterEmail) ||
          (d.client_email && d.client_email.toLowerCase().trim() === filterEmail)
        );
        return matchClient || matchEmail;
      });
    }

    return NextResponse.json({
      success: true,
      distributions: allDistributions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    });
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
      recipient_email: client ? client.email : null,
      email_subject: emailSubject || `Skjema fra by mari: ${form.title}`,
      email_intro: emailIntro || "",
      expires_at: formattedExpiresAt
    });

    const fullDistRecord = {
      ...newDist,
      recipient_email: client ? client.email : null,
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug,
        introduction: form.introduction,
        confirmation_message: form.confirmation_message,
        fields: form.fields || []
      },
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company
      } : null
    };

    // 2. Dual-layer persistence in Supabase
    try {
      const supabase = createAdminClient();

      // Layer A: Save in site_content key "form_distributions_all"
      try {
        const { data: existingContent } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "form_distributions_all")
          .single();

        const currentList = Array.isArray(existingContent?.content) ? existingContent.content : [...initialDistributions];
        const updatedList = [fullDistRecord, ...currentList.filter((d: any) => d.id !== fullDistRecord.id && d.token !== fullDistRecord.token)];

        await supabase.from("site_content").upsert({
          key: "form_distributions_all",
          content: updatedList,
          updated_at: new Date().toISOString()
        });
      } catch (scErr) {
        console.warn("site_content distribution upsert error:", scErr);
      }

      // Layer B: Relational table
      try {
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
      } catch (relErr) {
        console.warn("Relational distribution insert fallback:", relErr);
      }
    } catch (dbErr) {
      console.warn("Supabase distribution write fallback:", dbErr);
    }

    // 3. Send email via Resend on the server to the client
    let emailResult = null;
    if (sendEmailDirectly && client && client.email) {
      const origin = req.headers.get("origin");
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
      const currentBaseUrl = origin || (host ? `${proto}://${host}` : undefined);

      emailResult = await sendFormDistributionEmail({
        recipientEmail: client.email,
        recipientName: client.name,
        formTitle: form.title,
        emailSubject: emailSubject || `Skjema fra by mari: ${form.title}`,
        emailIntro: emailIntro,
        token: newDist.token,
        appUrl: currentBaseUrl
      });
    }

    return NextResponse.json({
      success: true,
      distribution: fullDistRecord,
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


