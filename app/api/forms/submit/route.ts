import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, form_id, client_id, distribution_id, answers, files } = body;

    if (!form_id || !answers) {
      return NextResponse.json({ success: false, error: "Manglende påkrevde parametere" }, { status: 400 });
    }

    const submission = await dataStore.createSubmission({
      form_id,
      client_id,
      distribution_id,
      token,
      answers,
      files
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id
    });
  } catch (err: any) {
    console.error("Form submission API error:", err);
    return NextResponse.json({ success: false, error: err.message || "Feil under innsending" }, { status: 500 });
  }
}
