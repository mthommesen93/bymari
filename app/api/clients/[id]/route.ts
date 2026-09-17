import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dataStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await dataStore.getClientById(id);
  if (!client) {
    return NextResponse.json({ error: "Kunde ikke funnet" }, { status: 404 });
  }
  return NextResponse.json({ client });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await dataStore.updateClient(id, body);
  return NextResponse.json({ success: true, client: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dataStore.deleteClient(id);
  return NextResponse.json({ success: true });
}
