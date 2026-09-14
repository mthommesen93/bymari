import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "demo_key";
export const resend = new Resend(resendApiKey);

export const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || "By Mari <hei@bymari.no>";
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "hei@bymari.no";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bymari.no";

/**
 * Generate a Scandinavian branded HTML email layout for By Mari
 */
export function renderByMariEmailHtml(options: {
  title: string;
  intro?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  return `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin:0; padding:0; background-color:#F7F5F0; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; color:#20211F; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F7F5F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #DED7CB; border-radius: 4px; padding: 40px 32px; text-align: left;">
          <tr>
            <td style="padding-bottom: 32px; border-bottom: 1px solid #F4F1EB;">
              <span style="font-size: 24px; font-weight: 400; letter-spacing: 0.18em; color: #20211F; text-transform: lowercase;">by mari</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px; padding-bottom: 16px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: #20211F; line-height: 1.4;">${options.title}</h1>
              ${options.intro ? `<p style="margin: 0 0 20px 0; font-size: 15px; color: #4A4B48; line-height: 1.6;">${options.intro}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              ${options.contentHtml}
            </td>
          </tr>
          ${options.ctaUrl && options.ctaText ? `
          <tr>
            <td style="padding-top: 16px; padding-bottom: 32px;" align="left">
              <a href="${options.ctaUrl}" style="display: inline-block; background-color: #34463B; color: #FFFFFF; font-size: 15px; font-weight: 500; text-decoration: none; padding: 14px 28px; border-radius: 3px; letter-spacing: 0.02em;">
                ${options.ctaText}
              </a>
            </td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #F4F1EB; font-size: 13px; color: #877B6C; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">${options.footerNote || "by mari — Digitale løsninger, laget med omhu."}</p>
              <p style="margin: 0; color: #A59888;">bymari.no &bull; Oslo, Norge</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactNotificationEmail(data: {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
}) {
  if (process.env.NODE_ENV === "test" || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "demo_key") {
    console.log("[Resend Simulator] Contact lead logged:", data);
    return { success: true, simulated: true };
  }

  const contentHtml = `
    <div style="background-color: #F7F5F0; padding: 20px; border-radius: 4px; border: 1px solid #DED7CB;">
      <p style="margin: 0 0 8px 0;"><strong>Navn:</strong> ${data.name}</p>
      <p style="margin: 0 0 8px 0;"><strong>E-post:</strong> <a href="mailto:${data.email}" style="color: #34463B;">${data.email}</a></p>
      ${data.company ? `<p style="margin: 0 0 8px 0;"><strong>Virksomhet:</strong> ${data.company}</p>` : ""}
      <p style="margin: 0 0 8px 0;"><strong>Ønsket tjeneste:</strong> ${data.service}</p>
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #DED7CB;">
        <p style="margin: 0 0 4px 0; font-weight: 500;">Prosjektbeskrivelse:</p>
        <p style="margin: 0; white-space: pre-wrap; color: #20211F;">${data.message}</p>
      </div>
    </div>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `Ny henvendelse: ${data.name} (${data.service})`,
      html: renderByMariEmailHtml({
        title: "Ny henvendelse fra bymari.no",
        intro: "En potensiell kunde har sendt inn en forespørsel via kontaktskjemaet på nettsiden.",
        contentHtml,
        ctaText: "Åpne adminpanel",
        ctaUrl: `${APP_URL}/admin/kunder`
      })
    });
    return { success: true, data: res };
  } catch (error) {
    console.error("Resend contact notification error:", error);
    return { success: false, error };
  }
}

export async function sendFormDistributionEmail(data: {
  recipientEmail: string;
  recipientName: string;
  formTitle: string;
  emailSubject: string;
  emailIntro?: string;
  token: string;
}) {
  const formUrl = `${APP_URL}/f/${data.token}`;

  if (process.env.NODE_ENV === "test" || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "demo_key") {
    console.log(`[Resend Simulator] Form distribution email to ${data.recipientEmail} (${formUrl})`);
    return { success: true, simulated: true, url: formUrl };
  }

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #4A4B48;">
      For å sikre et ryddig og skreddersydd resultat for prosjektet ditt, ber vi deg vennligst fylle ut skjemaet <strong>«${data.formTitle}»</strong>.
    </p>
    <p style="margin: 0; font-size: 14px; color: #877B6C;">
      Du trenger ikke opprette noen brukerkonto for å svare. Skjemaet lagrer fremgangen din underveis.
    </p>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: data.recipientEmail,
      subject: data.emailSubject,
      html: renderByMariEmailHtml({
        title: data.formTitle,
        intro: data.emailIntro || `Hei ${data.recipientName}, her er skjemaet for prosjektet ditt.`,
        contentHtml,
        ctaText: "Åpne skjema",
        ctaUrl: formUrl
      })
    });
    return { success: true, data: res, url: formUrl };
  } catch (error) {
    console.error("Resend form distribution error:", error);
    return { success: false, error };
  }
}

export async function sendFormSubmissionNotificationEmail(data: {
  formTitle: string;
  clientName?: string;
  clientEmail?: string;
  token?: string;
  submissionId: string;
  answers: { field_label: string; value: any }[];
}) {
  if (process.env.NODE_ENV === "test" || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "demo_key") {
    console.log("[Resend Simulator] Submission notification received for:", data.formTitle);
    return { success: true, simulated: true };
  }

  const answersHtml = data.answers
    .map(
      (a) => `
      <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ECE7DF;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #877B6C; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">${a.field_label}</p>
        <p style="margin: 0; font-size: 14px; color: #20211F; white-space: pre-wrap;">${Array.isArray(a.value) ? a.value.join(", ") : (a.value || "—")}</p>
      </div>`
    )
    .join("");

  const contentHtml = `
    <div style="background-color: #F7F5F0; padding: 20px; border-radius: 4px; border: 1px solid #DED7CB; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0;"><strong>Skjema:</strong> ${data.formTitle}</p>
      ${data.clientName ? `<p style="margin: 0 0 8px 0;"><strong>Innsender:</strong> ${data.clientName}</p>` : ""}
      ${data.clientEmail ? `<p style="margin: 0 0 8px 0;"><strong>E-post:</strong> <a href="mailto:${data.clientEmail}" style="color: #34463B;">${data.clientEmail}</a></p>` : ""}
    </div>
    <div style="margin-top: 16px;">
      <h3 style="font-size: 15px; font-weight: 600; color: #20211F; margin-bottom: 12px;">Mottatte svar:</h3>
      ${answersHtml}
    </div>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `Nytt skjemasvar: ${data.formTitle}${data.clientName ? " fra " + data.clientName : ""}`,
      html: renderByMariEmailHtml({
        title: `Nytt svar på ${data.formTitle}`,
        intro: `Et nytt svar er registrert${data.clientName ? " fra " + data.clientName : ""}.`,
        contentHtml,
        ctaText: "Se alle svar i adminpanelet",
        ctaUrl: `${APP_URL}/admin/svar`
      })
    });
    return { success: true, data: res };
  } catch (error) {
    console.error("Resend form submission notification error:", error);
    return { success: false, error };
  }
}

/**
 * Send interactive Quote email to client with Accept / Decline action buttons
 */
export async function sendQuoteEmail(data: {
  recipientEmail: string;
  recipientName: string;
  token: string;
  emailSubject: string;
  emailIntro?: string;
  packageName: string;
  basePrice: number;
  addons: { name: string; price: number; quantity?: number }[];
  customLines: { name: string; price: number }[];
  discount: number;
  subtotal: number;
  vatAmount: number;
  totalPrice: number;
  monthlyPrice?: number;
  deliveryTime: string;
  validityDays: number;
}) {
  const quoteUrl = `${APP_URL}/tilbud/${data.token}`;
  const acceptUrl = `${APP_URL}/tilbud/${data.token}?action=accept`;
  const declineUrl = `${APP_URL}/tilbud/${data.token}?action=decline`;

  if (process.env.NODE_ENV === "test" || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "demo_key") {
    console.log(`[Resend Simulator] Quote email to ${data.recipientEmail} (${quoteUrl})`);
    return { success: true, simulated: true, url: quoteUrl };
  }

  // Build items HTML table
  const addonsRows = data.addons
    .map(
      (a) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #4A4B48; font-size: 14px;">
          • ${a.name} ${a.quantity ? `(${a.quantity} stk)` : ""}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #20211F; font-size: 14px; text-align: right; font-family: monospace;">
          kr ${(a.price * (a.quantity || 1)).toLocaleString("no-NO")},-
        </td>
      </tr>`
    )
    .join("");

  const customRows = data.customLines
    .map(
      (c) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #4A4B48; font-size: 14px;">
          • ${c.name}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #20211F; font-size: 14px; text-align: right; font-family: monospace;">
          kr ${c.price.toLocaleString("no-NO")},-
        </td>
      </tr>`
    )
    .join("");

  const contentHtml = `
    <div style="background-color: #F7F5F0; border: 1px solid #DED7CB; border-radius: 4px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #20211F; text-transform: uppercase; letter-spacing: 0.05em;">
        Spesifikasjon av leveransen
      </h3>

      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #20211F; font-size: 14px; font-weight: 500;">
            ${data.packageName}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #20211F; font-size: 14px; text-align: right; font-family: monospace;">
            kr ${data.basePrice.toLocaleString("no-NO")},-
          </td>
        </tr>
        ${addonsRows}
        ${customRows}
        ${data.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #2E5C38; font-size: 14px; font-weight: 500;">
            • Rabatt
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ECE7DF; color: #2E5C38; font-size: 14px; text-align: right; font-family: monospace;">
            - kr ${data.discount.toLocaleString("no-NO")},-
          </td>
        </tr>` : ""}
      </table>

      <div style="border-top: 2px solid #34463B; padding-top: 14px; margin-top: 8px;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="font-size: 16px; font-weight: 600; color: #20211F;">
              TOTALPRIS:
            </td>
            <td style="font-size: 20px; font-weight: 600; color: #34463B; text-align: right; font-family: monospace;">
              kr ${data.totalPrice.toLocaleString("no-NO")},-
            </td>
          </tr>
          ${data.monthlyPrice && data.monthlyPrice > 0 ? `
          <tr>
            <td style="font-size: 13px; color: #877B6C; padding-top: 4px;">
              Valgfri månedlig drift:
            </td>
            <td style="font-size: 13px; color: #34463B; text-align: right; font-family: monospace; padding-top: 4px;">
              kr ${data.monthlyPrice.toLocaleString("no-NO")},- / mnd
            </td>
          </tr>` : ""}
        </table>
      </div>
    </div>

    <div style="margin-bottom: 28px; padding: 16px; background-color: #FFFFFF; border: 1px solid #ECE7DF; border-radius: 4px; font-size: 13px; color: #4A4B48;">
      <p style="margin: 0 0 6px 0;"><strong>Estimert leveringstid:</strong> ${data.deliveryTime}</p>
      <p style="margin: 0 0 6px 0;"><strong>Betalingsbetingelser:</strong> 50% ved oppstart, 50% ved ferdigstillelse og overlevering.</p>
      <p style="margin: 0;"><strong>Gyldighet:</strong> Tilbudet er gyldig i ${data.validityDays} dager fra i dag.</p>
    </div>

    <!-- ACTION BUTTONS: ACCEPT / DECLINE -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #ECE7DF; text-align: center;">
      <p style="margin: 0 0 20px 0; font-size: 15px; font-weight: 500; color: #20211F;">
        Hva tenker du om tilbudet?
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
        <tr>
          <!-- ACCEPT BUTTON -->
          <td align="center" style="padding-right: 12px;">
            <a href="${acceptUrl}" style="display: inline-block; background-color: #34463B; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 3px; letter-spacing: 0.02em;">
              ✓ Aksepter tilbud
            </a>
          </td>
          <!-- DECLINE BUTTON -->
          <td align="center" style="padding-left: 12px;">
            <a href="${declineUrl}" style="display: inline-block; background-color: #FFFFFF; color: #737470; border: 1px solid #DED7CB; font-size: 14px; font-weight: 500; text-decoration: none; padding: 13px 22px; border-radius: 3px;">
              ✕ Avvis tilbud
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 20px 0 0 0; font-size: 12px; color: #877B6C;">
        Du kan også <a href="${quoteUrl}" style="color: #34463B; text-decoration: underline;">se hele tilbudet i nettleseren</a>.
      </p>
    </div>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: data.recipientEmail,
      subject: data.emailSubject,
      html: renderByMariEmailHtml({
        title: `Pristilbud til ${data.recipientName}`,
        intro: data.emailIntro || `Hei ${data.recipientName}, her er det skreddersydde pristilbudet for prosjektet ditt.`,
        contentHtml,
        footerNote: "by mari — Digitale løsninger, laget med omhu."
      })
    });
    return { success: true, data: res, url: quoteUrl };
  } catch (error) {
    console.error("Resend quote email error:", error);
    return { success: false, error };
  }
}

/**
 * Notify Mari when client accepts quote
 */
export async function sendQuoteAcceptedNotificationEmail(data: {
  quoteId: string;
  clientName: string;
  clientEmail: string;
  totalPrice: number;
  signedName?: string;
  note?: string;
}) {
  if (process.env.NODE_ENV === "test" || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "demo_key") {
    console.log(`[Resend Simulator] Quote accepted by ${data.clientName}`);
    return { success: true, simulated: true };
  }

  const contentHtml = `
    <div style="background-color: #EBF3ED; border: 1px solid #C4DEC9; border-radius: 4px; padding: 24px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px 0; color: #2E5C38; font-size: 16px;">🎉 Gratulerer, tilbudet er akseptert!</h3>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #20211F;"><strong>Kunde:</strong> ${data.clientName} (${data.clientEmail})</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #20211F;"><strong>Beløp:</strong> kr ${data.totalPrice.toLocaleString("no-NO")},-</p>
      ${data.signedName ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #20211F;"><strong>Signert av:</strong> ${data.signedName}</p>` : ""}
      ${data.note ? `<p style="margin: 0; font-size: 14px; color: #20211F;"><strong>Kommentar fra kunden:</strong> ${data.note}</p>` : ""}
    </div>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `🎉 Tilbud akseptert av ${data.clientName} (kr ${data.totalPrice.toLocaleString("no-NO")},-)`,
      html: renderByMariEmailHtml({
        title: "Pristilbud akseptert!",
        intro: `Kunden har takket ja til tilbudet. Status i CRM er oppdatert til «Aktiv kunde».`,
        contentHtml,
        ctaText: "Åpne kundekort i admin",
        ctaUrl: `${APP_URL}/admin/kunder`
      })
    });
    return { success: true, data: res };
  } catch (error) {
    console.error("Resend quote accepted notification error:", error);
    return { success: false, error };
  }
}

/**
 * Notify Mari when client declines quote
 */
export async function sendQuoteDeclinedNotificationEmail(data: {
  quoteId: string;
  clientName: string;
  clientEmail: string;
  totalPrice: number;
  reason?: string;
}) {
  if (process.env.NODE_ENV === "test" || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "demo_key") {
    console.log(`[Resend Simulator] Quote declined by ${data.clientName}`);
    return { success: true, simulated: true };
  }

  const contentHtml = `
    <div style="background-color: #F7F5F0; border: 1px solid #DED7CB; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #20211F;"><strong>Kunde:</strong> ${data.clientName} (${data.clientEmail})</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #20211F;"><strong>Tilbudsbeløp:</strong> kr ${data.totalPrice.toLocaleString("no-NO")},-</p>
      ${data.reason ? `<p style="margin: 0; font-size: 14px; color: #20211F;"><strong>Oppgitt grunn / tilbakemelding:</strong> ${data.reason}</p>` : ""}
    </div>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `Tilbud avvist av ${data.clientName}`,
      html: renderByMariEmailHtml({
        title: "Pristilbud avvist",
        intro: `Kunden har takket nei til tilbudet.`,
        contentHtml,
        ctaText: "Se kunde i admin",
        ctaUrl: `${APP_URL}/admin/kunder`
      })
    });
    return { success: true, data: res };
  } catch (error) {
    console.error("Resend quote declined notification error:", error);
    return { success: false, error };
  }
}