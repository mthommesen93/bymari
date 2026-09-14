import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultSiteContent, SiteContent } from "@/lib/content-context";

let serverCachedContent: SiteContent | null = null;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "homepage")
      .single();

    if (!error && data?.content) {
      serverCachedContent = data.content as SiteContent;
      return NextResponse.json({ content: data.content });
    }
  } catch (err) {
    console.warn("[SiteContent API] Supabase query fallback:", err);
  }

  return NextResponse.json({ content: serverCachedContent || defaultSiteContent });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.content) {
      return NextResponse.json({ error: "Ugyldig innhold" }, { status: 400 });
    }

    serverCachedContent = body.content as SiteContent;

    try {
      const supabase = createAdminClient();
      await supabase
        .from("site_content")
        .upsert({
          key: "homepage",
          content: body.content,
          updated_at: new Date().toISOString()
        });
    } catch (dbErr) {
      console.warn("[SiteContent API] Supabase write fallback:", dbErr);
    }

    return NextResponse.json({ success: true, content: serverCachedContent });
  } catch (error) {
    console.error("[SiteContent API] Save error:", error);
    return NextResponse.json({ error: "Kunne ikke lagre" }, { status: 500 });
  }
}
