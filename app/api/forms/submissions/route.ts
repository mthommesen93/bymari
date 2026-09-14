import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId") || undefined;
    const clientId = searchParams.get("clientId") || undefined;

    const supabase = createAdminClient();
    try {
      let query = supabase
        .from("submissions")
        .select("*, form:forms(*), client:clients(*), answers:submission_answers(*), files:uploaded_files(*)")
        .order("submitted_at", { ascending: false });

      if (formId) query = query.eq("form_id", formId);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, submissions: data });
      }
    } catch (dbErr) {
      console.warn("DB submissions query fallback:", dbErr);
    }

    const memorySubmissions = await dataStore.getSubmissions({ formId, clientId });
    return NextResponse.json({ success: true, submissions: memorySubmissions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
