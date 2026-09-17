import { NextRequest, NextResponse } from "next/server";
import { dataStore, reloadServerData } from "@/lib/store";
import { initialQuotes } from "@/lib/demo-data";
import { 
  sendQuoteAcceptedNotificationEmail, 
  sendQuoteDeclinedNotificationEmail 
} from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => ({}));
    const { action, signedName, note, reason, quoteId, quoteToken } = body;

    if (!token && !quoteToken && !quoteId) {
      return NextResponse.json({ success: false, error: "Mangler token" }, { status: 400 });
    }

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json({ success: false, error: "Ugyldig handling. Må være 'accept' eller 'decline'." }, { status: 400 });
    }

    reloadServerData();

    // 1. Fetch current quote
    let quote: any = null;
    const lookupKeys = [token, quoteToken, quoteId, body.id, body.token].filter(Boolean).map(k => String(k).trim());
    const lowerLookupKeys = lookupKeys.map(k => k.toLowerCase());

    // Try Supabase site_content first
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "quotes_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        quote = scData.content.find((q: any) => 
          lookupKeys.includes(q.token) || 
          lookupKeys.includes(q.id) ||
          lowerLookupKeys.includes((q.token || "").toLowerCase()) ||
          lowerLookupKeys.includes((q.id || "").toLowerCase())
        );
      }
    } catch (scErr) {
      console.warn("site_content quote token fetch error:", scErr);
    }

    // Try dataStore
    if (!quote) {
      for (const key of lookupKeys) {
        quote = await dataStore.getQuoteByToken(key);
        if (quote) break;
        quote = await dataStore.getQuoteById(key);
        if (quote) break;
      }
    }

    // Try finding in all quotes list
    if (!quote) {
      const all = await dataStore.getQuotes();
      quote = all.find((q: any) => {
        const qToken = (q.token || "").toLowerCase();
        const qId = (q.id || "").toLowerCase();
        return lowerLookupKeys.some(k => 
          k === qToken || 
          k === qId || 
          (k.includes("mari") && (qToken.includes("mari") || qId.includes("mari") || q.client_id === "c-mari")) ||
          (k.includes("gro") && (qToken.includes("gro") || qId.includes("gro") || q.client_id === "c-gro-drage-evjen"))
        );
      }) || null;
    }

    // Try initialQuotes fallback
    if (!quote) {
      quote = initialQuotes.find(q => 
        lowerLookupKeys.includes(q.token.toLowerCase()) || 
        lowerLookupKeys.includes(q.id.toLowerCase()) ||
        (lowerLookupKeys.some(k => k.includes("mari")) && q.token.includes("mari")) ||
        (lowerLookupKeys.some(k => k.includes("gro")) && q.token.includes("gro"))
      ) || null;
    }

    if (!quote) {
      return NextResponse.json({ success: false, error: "Pristilbudet ble ikke funnet." }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const clientName = quote.client?.name || signedName || "Kunden";
    const clientEmail = quote.client?.email || "";

    // Resolve client ID if needed
    let targetClientId = quote.client_id || quote.client?.id;
    if (!targetClientId && (quote.client?.email || clientEmail)) {
      const emailToMatch = (quote.client?.email || clientEmail).toLowerCase().trim();
      const allClients = await dataStore.getClients();
      const matched = allClients.find(c => c.email.toLowerCase().trim() === emailToMatch);
      if (matched) targetClientId = matched.id;
    }

    if (action === "accept") {
      quote.status = "accepted";
      quote.accepted_at = nowIso;
      quote.signed_name = signedName || quote.client?.name || "Kunde";
      quote.client_note = note || "";
      quote.updated_at = nowIso;
      if (targetClientId) quote.client_id = targetClientId;

      // Update CRM client status to "Aktiv kunde"
      if (targetClientId) {
        try {
          await dataStore.updateClient(targetClientId, { status: "Aktiv kunde" });
          await dataStore.addClientNote(
            targetClientId,
            `🎉 Pristilbud (${quote.package_name} - kr ${quote.total_price.toLocaleString("no-NO")},-) akseptert av ${clientName}${note ? `\nKommentar: ${note}` : ""}`,
            "System"
          );
        } catch (cErr) {
          console.warn("Could not update client status:", cErr);
        }
      }

      // Log activity
      try {
        await dataStore.logActivity({
          event_type: "quote_accepted",
          description: `🎉 Pristilbud (${quote.package_name} - kr ${quote.total_price.toLocaleString("no-NO")},-) akseptert av ${clientName}`,
          client_id: targetClientId || null,
          client_name: clientName,
          metadata: { quote_id: quote.id, total_price: quote.total_price, signed_name: signedName }
        });
      } catch (actErr) {
        console.warn("Could not log activity:", actErr);
      }

      // Send email alert to Mari
      try {
        await sendQuoteAcceptedNotificationEmail({
          quoteId: quote.id,
          clientName: quote.client?.name || signedName || "Kunde",
          clientEmail: quote.client?.email || clientEmail || "",
          totalPrice: quote.total_price,
          signedName: signedName || quote.client?.name || "",
          note: note || ""
        });
      } catch (emErr) {
        console.warn("Could not send quote accepted email:", emErr);
      }
    } else {
      quote.status = "declined";
      quote.declined_at = nowIso;
      quote.client_note = reason || note || "";
      quote.updated_at = nowIso;
      if (targetClientId) quote.client_id = targetClientId;

      // Update CRM client status if applicable
      if (targetClientId) {
        try {
          await dataStore.updateClient(targetClientId, { status: "Avsluttet" });
          await dataStore.addClientNote(
            targetClientId,
            `✕ Pristilbud (${quote.package_name}) avvist av ${clientName}${reason || note ? `\nBegrunnelse: ${reason || note}` : ""}`,
            "System"
          );
        } catch (cErr) {
          console.warn("Could not update client status:", cErr);
        }
      }

      // Log activity
      try {
        await dataStore.logActivity({
          event_type: "quote_declined",
          description: `Pristilbud (${quote.package_name}) avvist av ${clientName}`,
          client_id: targetClientId || null,
          client_name: clientName,
          metadata: { quote_id: quote.id, reason: reason || note }
        });
      } catch (actErr) {
        console.warn("Could not log activity:", actErr);
      }

      // Send email alert to Mari
      try {
        await sendQuoteDeclinedNotificationEmail({
          quoteId: quote.id,
          clientName: quote.client?.name || "Kunde",
          clientEmail: quote.client?.email || clientEmail || "",
          totalPrice: quote.total_price,
          reason: reason || note || ""
        });
      } catch (emErr) {
        console.warn("Could not send quote declined email:", emErr);
      }
    }

    // Persist to dataStore
    try {
      await dataStore.updateQuote(quote.token, quote);
      if (quote.id && quote.id !== quote.token) {
        await dataStore.updateQuote(quote.id, quote);
      }
    } catch (dsErr) {
      console.warn("dataStore updateQuote error:", dsErr);
    }

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
        q.token === quote.token || q.id === quote.id ? quote : q
      );
      if (!updatedList.some((q: any) => q.token === quote.token || q.id === quote.id)) {
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
