import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initialClients } from "@/lib/demo-data";
import { dataStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ clients: data });
    }
  } catch (err) {
    console.warn("Clients fetch DB error:", err);
  }

  const memoryClients = await dataStore.getClients();
  return NextResponse.json({ clients: memoryClients.length > 0 ? memoryClients : initialClients });
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
