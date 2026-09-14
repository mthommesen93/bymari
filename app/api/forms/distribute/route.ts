import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendFormDistributionEmail } from "@/lib/resend";

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

    // 1. Create distribution in store
    const newDist = await dataStore.createDistribution({
      form_id: form.id,
      client_id: client ? client.id : null,
      email_subject: emailSubject,
      email_intro: emailIntro,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
    });

    // 2. Send email via Resend on the server to the client
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
