import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendQuoteEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId") || undefined;
    const email = searchParams.get("email") || undefined;
    const name = searchParams.get("name") || undefined;
    const status = (searchParams.get("status") as any) || undefined;

    let allQuotes: any[] = [];

    // 1. Fetch from site_content (key: quotes_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "quotes_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        allQuotes = scData.content;
      }
    } catch (scErr) {
      console.warn("site_content quotes query fallback:", scErr);
    }

    // 2. Fallback / merge with memory store
    if (allQuotes.length === 0) {
      const memQuotes = await dataStore.getQuotes();
      allQuotes = memQuotes;
    }

    if (clientId || email || name) {
      const normalizedEmail = email ? email.toLowerCase().trim() : "";
      const normalizedName = name ? name.toLowerCase().trim() : "";

      allQuotes = allQuotes.filter((q) => {
        // Direct ID match
        if (clientId && (q.client_id === clientId || q.client?.id === clientId || q.id === clientId)) {
          return true;
        }
        // Email match
        const qEmail = (q.client?.email || q.recipient_email || q.client_email || q.email || "").toLowerCase().trim();
        if (normalizedEmail && qEmail && qEmail === normalizedEmail) {
          return true;
        }
        // Name match
        const qName = (q.client?.name || q.recipient_name || q.client_name || "").toLowerCase().trim();
        if (normalizedName && qName && (qName === normalizedName || qName.includes(normalizedName) || normalizedName.includes(qName))) {
          return true;
        }
        return false;
      });
    }

    if (status) {
      allQuotes = allQuotes.filter((q) => q.status === status);
    }

    return NextResponse.json({
      success: true,
      quotes: allQuotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      clientName,
      clientEmail,
      packageName,
      basePrice,
      addons = [],
      customLines = [],
      discount = 0,
      subtotal,
      vatAmount = 0,
      totalPrice,
      monthlyPrice = 0,
      deliveryTime = "2–3 uker",
      validityDays = 14,
      emailSubject,
      emailIntro,
      sendEmailDirectly = true
    } = body;

    // Resolve or find client
    let client = null;
    if (clientId) {
      client = await dataStore.getClientById(clientId);
    }

    const recipientName = (client?.name || clientName || "").trim();
    const recipientEmail = (client?.email || clientEmail || "").trim();

    if (!recipientEmail || !recipientName) {
      return NextResponse.json(
        { success: false, error: "Kundenavn og e-postadresse er påkrevd for å sende tilbud." },
        { status: 400 }
      );
    }

    if (!client && recipientEmail) {
      const allClients = await dataStore.getClients();
      client = allClients.find(
        (c) => c.email.toLowerCase().trim() === recipientEmail.toLowerCase().trim()
      ) || null;
    }

    // If client does not exist in CRM, auto-register client
    if (!client) {
      client = await dataStore.createClient({
        name: recipientName,
        email: recipientEmail,
        status: "Tilbud sendt"
      });
    }

    // 1. Create quote in dataStore
    const quote = await dataStore.createQuote({
      client_id: client ? client.id : (clientId || null),
      package_name: packageName || "Skreddersydd prosjekt",
      base_price: Number(basePrice) || 0,
      addons: addons || [],
      custom_lines: customLines || [],
      discount: Number(discount) || 0,
      subtotal: Number(subtotal) || Number(totalPrice) || 0,
      vat_amount: Number(vatAmount) || 0,
      total_price: Number(totalPrice) || 0,
      monthly_price: Number(monthlyPrice) || 0,
      delivery_time: deliveryTime || "2–3 uker",
      validity_days: Number(validityDays) || 14,
      email_subject: emailSubject || `Pristilbud fra by mari: ${packageName || "Nettsideprosjekt"}`,
      email_intro: emailIntro || `Hei ${recipientName}, her er det skreddersydde pristilbudet for prosjektet ditt.`
    });

    // Attach full client details
    const fullQuoteRecord = {
      ...quote,
      client_id: client?.id || quote.client_id || null,
      client: {
        id: client?.id || quote.client_id || null,
        name: recipientName,
        email: recipientEmail,
        company: client?.company || ""
      }
    };

    // 2. Persist internal note on client in CRM
    if (client) {
      const quoteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://bymari.no"}/tilbud/${quote.token}`;
      try {
        await dataStore.addClientNote(
          client.id,
          `📄 Pristilbud sendt (${quote.package_name})\nTotalsum: kr ${quote.total_price.toLocaleString("no-NO")},-\nLeveringstid: ${quote.delivery_time}\nGyldig til: ${new Date(quote.expires_at).toLocaleDateString("no-NO")}\nLenke: ${quoteUrl}`,
          "Mari"
        );
        await dataStore.updateClient(client.id, {
          status: "Tilbud sendt",
          next_activity_date: quote.expires_at
        });
      } catch (noteErr) {
        console.warn("Failed saving quote note to client:", noteErr);
      }
    }

    // 3. Persist to Supabase site_content under quotes_all
    try {
      const supabase = createAdminClient();
      const { data: existingContent } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "quotes_all")
        .single();

      const currentList = Array.isArray(existingContent?.content) ? existingContent.content : [];
      const updatedList = [
        fullQuoteRecord,
        ...currentList.filter((q: any) => q.id !== fullQuoteRecord.id && q.token !== fullQuoteRecord.token)
      ];

      await supabase.from("site_content").upsert({
        key: "quotes_all",
        content: updatedList,
        updated_at: new Date().toISOString()
      });
    } catch (scErr) {
      console.warn("site_content quote upsert warning:", scErr);
    }

    // 3. Send interactive email via Resend
    let emailResult = null;
    if (sendEmailDirectly) {
      emailResult = await sendQuoteEmail({
        recipientEmail,
        recipientName,
        token: quote.token,
        emailSubject: quote.email_subject,
        emailIntro: quote.email_intro,
        packageName: quote.package_name,
        basePrice: quote.base_price,
        addons: quote.addons,
        customLines: quote.custom_lines,
        discount: quote.discount,
        subtotal: quote.subtotal,
        vatAmount: quote.vat_amount,
        totalPrice: quote.total_price,
        monthlyPrice: quote.monthly_price,
        deliveryTime: quote.delivery_time,
        validityDays: quote.validity_days
      });
    }

    return NextResponse.json({
      success: true,
      quote: fullQuoteRecord,
      emailSent: Boolean(emailResult?.success),
      emailResult
    });
  } catch (error: any) {
    console.error("Quote send API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Kunne ikke sende pristilbud" },
      { status: 500 }
    );
  }
}
