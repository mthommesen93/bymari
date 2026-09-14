import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendFormSubmissionNotificationEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, form_id, client_id, distribution_id, answers, files } = body;

    if (!form_id || !answers) {
      return NextResponse.json({ success: false, error: "Manglende påkrevde parametere" }, { status: 400 });
    }

    // 1. Create submission in dataStore
    const submission = await dataStore.createSubmission({
      form_id,
      client_id,
      distribution_id,
      token,
      answers,
      files
    });

    const form = await dataStore.getFormById(form_id);
    const client = client_id ? await dataStore.getClientById(client_id) : null;

    // 2. Persist to Supabase if connected
    try {
      const supabase = createAdminClient();
      
      // Update distribution status
      if (token) {
        await supabase
          .from("form_distributions")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString()
          })
          .eq("token", token);
      }

      // Insert submission
      const { data: subData, error: subError } = await supabase
        .from("submissions")
        .insert([{
          id: submission.id,
          form_id: form_id,
          client_id: client_id || null,
          distribution_id: distribution_id || null,
          status: "new",
          submitted_at: submission.submitted_at
        }])
        .select()
        .single();

      if (!subError && subData && answers.length > 0) {
        // Insert answers
        const answersPayload = answers.map((ans: any) => ({
          submission_id: subData.id,
          field_id: ans.field_id || null,
          field_label: ans.field_label,
          value: ans.value
        }));
        await supabase.from("submission_answers").insert(answersPayload);
      }
    } catch (dbErr) {
      console.warn("Supabase submission persistence fallback:", dbErr);
    }

    // 3. Send notification email to admin (hei@bymari.no)
    try {
      await sendFormSubmissionNotificationEmail({
        formTitle: form?.title || "Prosjektskjema",
        clientName: client?.name || (answers.find((a: any) => a.field_label.includes("kontaktperson") || a.field_label.includes("navn"))?.value as string) || "En kunde",
        clientEmail: client?.email || (answers.find((a: any) => a.field_label.includes("epost") || a.field_label.includes("e-post"))?.value as string),
        token,
        submissionId: submission.id,
        answers
      });
    } catch (emailErr) {
      console.warn("Submission notification email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id
    });
  } catch (err: any) {
    console.error("Form submission API error:", err);
    return NextResponse.json({ success: false, error: err.message || "Feil under innsending" }, { status: 500 });
  }
}

