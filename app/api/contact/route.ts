import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { dataStore } from "@/lib/store";
import { sendContactNotificationEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactFormSchema.parse(body);

    // 1. Create client lead in CRM
    const newClient = await dataStore.createClient({
      name: validated.name,
      company: validated.company || null,
      email: validated.email,
      phone: null,
      status: "Ny",
      requested_service: validated.service,
      internal_notes: `Innsendt fra kontaktskjema: ${validated.message}`,
      next_activity_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_archived: false
    });

    // 2. Record contact inquiry activity
    await dataStore.logActivity({
      event_type: "contact_inquiry",
      description: `Ny henvendelse fra ${validated.name}${validated.company ? " (" + validated.company + ")" : ""} – "${validated.service}"`,
      client_id: newClient.id,
      client_name: newClient.name,
      metadata: { message: validated.message, service: validated.service }
    });

    // 3. Send notification email to admin via Resend
    await sendContactNotificationEmail({
      name: validated.name,
      email: validated.email,
      company: validated.company,
      service: validated.service,
      message: validated.message
    });

    return NextResponse.json({
      success: true,
      message: "Takk for din henvendelse! Jeg tar kontakt snart.",
      clientId: newClient.id
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors?.[0]?.message || error.message || "Kunne ikke behandle henvendelsen"
      },
      { status: 400 }
    );
  }
}
