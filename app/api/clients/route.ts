import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initialClients } from "@/lib/demo-data";
import { dataStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const is_archived = searchParams.has("is_archived") ? searchParams.get("is_archived") === "true" : undefined;

    const allClients = await dataStore.getClients({ query, status, is_archived });
    return NextResponse.json({ success: true, clients: allClients });
  } catch (error: any) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Navn og e-post er påkrevd" }, { status: 400 });
    }

    const newClient = await dataStore.createClient(body);
    return NextResponse.json({ success: true, client: newClient });
  } catch (error: any) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: error.message || "Kunne ikke opprette kunde" }, { status: 500 });
  }
}
