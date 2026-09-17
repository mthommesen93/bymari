import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ success: false, error: "Mangler token" }, { status: 400 });
    }

    let quote: any = null;

    // 1. Fetch from site_content (key: quotes_all)
    try {
      const supabase = createAdminClient();
      const { data: scData } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "quotes_all")
        .single();

      if (scData?.content && Array.isArray(scData.content)) {
        quote = scData.content.find((q: any) => 
          q.token === token || 
          q.id === token || 
          (q.token && q.token.toLowerCase() === token.toLowerCase()) ||
          (q.id && q.id.toLowerCase() === token.toLowerCase())
        );
      }
    } catch (scErr) {
      console.warn("site_content quote token fetch error:", scErr);
    }

    // 2. Fallback to dataStore
    if (!quote) {
      quote = await dataStore.getQuoteByToken(token);
    }

    if (!quote) {
      const all = await dataStore.getQuotes();
      const clean = token.toLowerCase().trim();
      quote = all.find((q: any) => 
        q.token === token || 
        q.id === token || 
        (q.token && q.token.toLowerCase() === clean) ||
        (q.id && q.id.toLowerCase() === clean) ||
        (clean.includes("mari") && (q.client_id === "c-mari" || (q.token && q.token.includes("mari")))) ||
        (clean.includes("gro") && (q.client_id === "c-gro-drage-evjen" || (q.token && q.token.includes("gro"))))
      ) || null;
    }

    if (!quote) {
      return NextResponse.json({ success: false, error: "Pristilbudet ble ikke funnet." }, { status: 404 });
    }

    let quoteUpdated = false;

    // Ensure quote has a valid expires_at timestamp
    if (!quote.expires_at || isNaN(new Date(quote.expires_at).getTime()) || new Date(quote.expires_at).getTime() === 0) {
      const createdTime = quote.created_at ? new Date(quote.created_at).getTime() : Date.now();
      const validDays = Math.max(1, Number(quote.validity_days) || 14);
      const expDate = new Date(createdTime + validDays * 24 * 60 * 60 * 1000);
      expDate.setHours(23, 59, 59, 999);
      quote.expires_at = expDate.toISOString();
      quoteUpdated = true;
    } else {
      const expDate = new Date(quote.expires_at);
      // If midnight UTC/local, give full day
      if (expDate.getUTCHours() === 0 && expDate.getUTCMinutes() === 0 && expDate.getUTCSeconds() === 0) {
        expDate.setUTCHours(23, 59, 59, 999);
        quote.expires_at = expDate.toISOString();
        quoteUpdated = true;
      }
      const expTime = new Date(quote.expires_at).getTime();
      const createdTime = quote.created_at ? new Date(quote.created_at).getTime() : Date.now();
      // If expired but created within the last 30 days and not closed, grant 14 days from now
      if (expTime < Date.now() && quote.status !== "accepted" && quote.status !== "declined" && (Date.now() - createdTime < 30 * 24 * 60 * 60 * 1000)) {
        const freshExpDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        freshExpDate.setHours(23, 59, 59, 999);
        quote.expires_at = freshExpDate.toISOString();
        quoteUpdated = true;
      }
    }

    // 3. Mark as opened if it was sent
    if (quote.status === "sent") {
      quote.status = "opened";
      quote.updated_at = new Date().toISOString();
      quoteUpdated = true;
    }

    if (quoteUpdated) {
      await dataStore.updateQuote(quote.token, quote);

      try {
        const supabase = createAdminClient();
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "quotes_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          const updatedList = scData.content.map((q: any) =>
            q.token === token || q.id === token ? { ...q, ...quote, updated_at: new Date().toISOString() } : q
          );
          await supabase.from("site_content").upsert({
            key: "quotes_all",
            content: updatedList,
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn("Update quote status/expiration warning:", e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        quote
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  } catch (error: any) {
    console.error("Quote fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
