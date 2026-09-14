import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendQuoteEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId") || undefined;
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
      const memQuotes = await dataStore.getQuotes({ clientId, status });
      allQuotes = memQuotes;
    }

    if (clientId) {
      allQuotes = allQuotes.filter((q) => q.client_id === clientId || q.client?.id === clientId);
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

    const recipientName = client?.name || clientName;
    const recipientEmail = client?.email || clientEmail;

    if (!recipientEmail || !recipientName) {
      return NextResponse.json(
        { success: false, error: "Kundenavn og e-postadresse er påkrevd for å sende tilbud." },
        { status: 400 }
      );
    }

    // 1. Create quote in dataStore
    const quote = await dataStore.createQuote({
      client_id: client ? client.id : null,
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

    // Attach client details
    const fullQuoteRecord = {
      ...quote,
      client: {
        id: client?.id || null,
        name: recipientName,
        email: recipientEmail,
        company: client?.company || ""
      }
    };

    // 2. Persist to Supabase site_content under quotes_all
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
