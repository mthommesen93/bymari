import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/admin";

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
        quote = scData.content.find((q: any) => q.token === token || q.id === token);
      }
    } catch (scErr) {
      console.warn("site_content quote token fetch error:", scErr);
    }

    // 2. Fallback to dataStore
    if (!quote) {
      quote = await dataStore.getQuoteByToken(token);
    }

    if (!quote) {
      return NextResponse.json({ success: false, error: "Pristilbudet ble ikke funnet." }, { status: 404 });
    }

    // 3. Mark as opened if it was sent
    if (quote.status === "sent") {
      quote.status = "opened";
      quote.updated_at = new Date().toISOString();

      await dataStore.updateQuote(quote.token, { status: "opened" });

      try {
        const supabase = createAdminClient();
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "quotes_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          const updatedList = scData.content.map((q: any) =>
            q.token === token || q.id === token ? { ...q, status: "opened", updated_at: new Date().toISOString() } : q
          );
          await supabase.from("site_content").upsert({
            key: "quotes_all",
            content: updatedList,
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn("Update quote status to opened warning:", e);
      }
    }

    return NextResponse.json({
      success: true,
      quote
    });
  } catch (error: any) {
    console.error("Quote fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
