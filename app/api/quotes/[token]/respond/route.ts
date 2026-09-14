import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { 
  sendQuoteAcceptedNotificationEmail, 
  sendQuoteDeclinedNotificationEmail 
} from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { action, signedName, note, reason } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: "Mangler token" }, { status: 400 });
    }

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json({ success: false, error: "Ugyldig handling. Må være 'accept' eller 'decline'." }, { status: 400 });
    }

    // 1. Fetch current quote
    let quote: any = null;
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "quotes_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        quote = scData.content.find((q: any) => q.token === token || q.id === token);
      }
    } catch (scErr) {
      console.warn("site_content quote token fetch error:", scErr);
    }

    if (!quote) {
      quote = await dataStore.getQuoteByToken(token);
    }

    if (!quote) {
      return NextResponse.json({ success: false, error: "Pristilbudet ble ikke funnet." }, { status: 404 });
    }

    if (quote.status === "accepted" || quote.status === "declined") {
      return NextResponse.json({
        success: false,
        error: `Dette tilbudet er allerede ${quote.status === "accepted" ? "akseptert" : "avslått"}.`,
        quote
      }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const clientName = quote.client?.name || signedName || "Kunden";
    const clientEmail = quote.client?.email || "";

    if (action === "accept") {
      quote.status = "accepted";
      quote.accepted_at = nowIso;
      quote.signed_name = signedName || quote.client?.name || "Kunde";
      quote.client_note = note || "";
      quote.updated_at = nowIso;

      // Update CRM client status to "Aktiv kunde"
      if (quote.client_id) {
        await dataStore.updateClient(quote.client_id, { status: "Aktiv kunde" });
      }

      // Log activity
      await dataStore.logActivity({
        event_type: "quote_accepted",
        description: `🎉 Pristilbud (${quote.package_name} - kr ${quote.total_price.toLocaleString("no-NO")},-) akseptert av ${clientName}`,
        client_id: quote.client_id || null,
        client_name: clientName,
        metadata: { quote_id: quote.id, total_price: quote.total_price, signed_name: signedName }
      });

      // Send email alert to Mari
      await sendQuoteAcceptedNotificationEmail({
        quoteId: quote.id,
        clientName: quote.client?.name || signedName || "Kunde",
        clientEmail: quote.client?.email || "",
        totalPrice: quote.total_price,
        signedName: signedName || quote.client?.name || "",
        note: note || ""
      });
    } else {
      quote.status = "declined";
      quote.declined_at = nowIso;
      quote.client_note = reason || note || "";
      quote.updated_at = nowIso;

      // Update CRM client status if applicable
      if (quote.client_id) {
        await dataStore.updateClient(quote.client_id, { status: "Avsluttet" });
      }

      // Log activity
      await dataStore.logActivity({
        event_type: "quote_declined",
        description: `Pristilbud (${quote.package_name}) avvist av ${clientName}`,
        client_id: quote.client_id || null,
        client_name: clientName,
        metadata: { quote_id: quote.id, reason: reason || note }
      });

      // Send email alert to Mari
      await sendQuoteDeclinedNotificationEmail({
        quoteId: quote.id,
        clientName: quote.client?.name || "Kunde",
        clientEmail: quote.client?.email || "",
        totalPrice: quote.total_price,
        reason: reason || note || ""
      });
    }

    // Persist to dataStore
    await dataStore.updateQuote(quote.token, quote);

    // Persist to Supabase site_content
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "quotes_all")
        .single();

      const currentList = Array.isArray(scData?.content) ? scData.content : [];
      const updatedList = currentList.map((q: any) =>
        q.token === token || q.id === quote.id ? quote : q
      );
      if (!updatedList.some((q: any) => q.token === token || q.id === quote.id)) {
        updatedList.unshift(quote);
      }

      await supabase.from("site_content").upsert({
        key: "quotes_all",
        content: updatedList,
        updated_at: nowIso
      });
    } catch (e) {
      console.warn("Error saving updated quote to site_content:", e);
    }

    return NextResponse.json({
      success: true,
      message: action === "accept" ? "Tilbudet er akseptert. Tusen takk!" : "Tilbudet er avvist.",
      quote
    });
  } catch (error: any) {
    console.error("Quote respond error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
