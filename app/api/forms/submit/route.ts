import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { sendFormSubmissionNotificationEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { initialForms, initialClients } from "@/lib/demo-data";

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

    const form = (await dataStore.getFormById(form_id)) || initialForms[0];
    let client = client_id ? await dataStore.getClientById(client_id) : null;
    if (!client) {
      const allClients = await dataStore.getClients();
      client = allClients[0] || initialClients[0];
    }

    const contactPerson = (answers.find((a: any) => a.field_label.toLowerCase().includes("kontaktperson") || a.field_label.toLowerCase().includes("hva heter kontaktpersonen") || a.field_label.toLowerCase().includes("navn"))?.value as string) || client?.name || "Gro Drage Evjen";
    const contactEmail = (answers.find((a: any) => a.field_label.toLowerCase().includes("epost") || a.field_label.toLowerCase().includes("e-post"))?.value as string) || client?.email || "grodrageevjen@gmail.com";
    const companyName = (answers.find((a: any) => a.field_label.toLowerCase().includes("virksomhet") || a.field_label.toLowerCase().includes("bedrift"))?.value as string) || client?.company || "";

    const fullSubmissionRecord = {
      ...submission,
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug
      },
      client: {
        id: client?.id || "c-gro-drage-evjen",
        name: contactPerson,
        email: contactEmail,
        company: companyName
      },
      answers: answers.map((ans: any, idx: number) => ({
        id: "ans-" + idx + "-" + Date.now().toString(36),
        field_id: ans.field_id || null,
        field_label: ans.field_label,
        value: ans.value
      })),
      files: files || []
    };

    // 2. Dual-layer persistence in Supabase
    try {
      const supabase = createAdminClient();

      // Layer A: Save in site_content key "form_submissions_all"
      try {
        const { data: existingContent } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "form_submissions_all")
          .single();

        const currentList = Array.isArray(existingContent?.content) ? existingContent.content : [];
        const updatedList = [fullSubmissionRecord, ...currentList.filter((s: any) => s.id !== fullSubmissionRecord.id)];

        await supabase.from("site_content").upsert({
          key: "form_submissions_all",
          content: updatedList,
          updated_at: new Date().toISOString()
        });
      } catch (scErr) {
        console.warn("site_content submissions upsert error:", scErr);
      }

      // Layer B: Direct relational tables
      try {
        if (token) {
          await supabase
            .from("form_distributions")
            .update({
              status: "submitted",
              submitted_at: new Date().toISOString()
            })
            .eq("token", token);
        }

        await supabase.from("submissions").insert([{
          id: submission.id,
          form_id: form.id,
          client_id: client?.id || null,
          distribution_id: distribution_id || null,
          status: "new",
          submitted_at: submission.submitted_at
        }]);

        if (answers.length > 0) {
          const answersPayload = answers.map((ans: any) => ({
            submission_id: submission.id,
            field_id: ans.field_id || null,
            field_label: ans.field_label,
            value: ans.value
          }));
          await supabase.from("submission_answers").insert(answersPayload);
        }
      } catch (relErr) {
        console.warn("Relational tables insert fallback:", relErr);
      }
    } catch (dbErr) {
      console.warn("Supabase general persistence fallback:", dbErr);
    }

    // 3. Send notification email to admin (hei@bymari.no)
    try {
      await sendFormSubmissionNotificationEmail({
        formTitle: form.title,
        clientName: contactPerson,
        clientEmail: contactEmail,
        token,
        submissionId: submission.id,
        answers
      });
    } catch (emailErr) {
      console.warn("Submission notification email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      submission: fullSubmissionRecord
    });
  } catch (err: any) {
    console.error("Form submission API error:", err);
    return NextResponse.json({ success: false, error: err.message || "Feil under innsending" }, { status: 500 });
  }
}


