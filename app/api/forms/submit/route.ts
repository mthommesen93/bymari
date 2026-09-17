import { NextRequest, NextResponse } from "next/server";
import { dataStore, syncStore } from "@/lib/store";
import { sendFormSubmissionNotificationEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { initialForms, initialClients } from "@/lib/demo-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, form_id, client_id, distribution_id, answers = [], files = [] } = body;

    if (!form_id || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: "Manglende påkrevde parametere" }, { status: 400 });
    }

    const form = (await dataStore.getFormById(form_id)) || initialForms.find(f => f.id === form_id) || initialForms[0];

    // Extract contact information from answers
    const contactPerson = (answers.find((a: any) => 
      a.field_label && (
        a.field_label.toLowerCase().includes("kontaktperson") || 
        a.field_label.toLowerCase().includes("hva heter kontaktpersonen") || 
        a.field_label.toLowerCase().includes("hva heter du") ||
        a.field_label.toLowerCase().includes("ditt navn") ||
        a.field_label.toLowerCase().includes("navn")
      )
    )?.value as string)?.trim() || "";

    const contactEmail = (answers.find((a: any) => 
      a.field_label && (
        a.field_label.toLowerCase().includes("epost") || 
        a.field_label.toLowerCase().includes("e-post")
      )
    )?.value as string)?.trim() || "";

    const companyName = (answers.find((a: any) => 
      a.field_label && (
        a.field_label.toLowerCase().includes("virksomhet") || 
        a.field_label.toLowerCase().includes("bedrift") ||
        a.field_label.toLowerCase().includes("prosjekt")
      )
    )?.value as string)?.trim() || "";

    const phone = (answers.find((a: any) => 
      a.field_label && (
        a.field_label.toLowerCase().includes("telefon") || 
        a.field_label.toLowerCase().includes("mobil")
      )
    )?.value as string)?.trim() || "";

    // 1. Resolve client
    let client = client_id ? await dataStore.getClientById(client_id) : null;

    // Try resolve from distribution token if client not explicitly specified
    let matchedDist: any = null;
    if (token) {
      matchedDist = await dataStore.getDistributionByToken(token);
      if (matchedDist?.client_id && !client) {
        client = await dataStore.getClientById(matchedDist.client_id);
      } else if (matchedDist?.recipient_email && !client) {
        const allClients = await dataStore.getClients();
        client = allClients.find(c => c.email.toLowerCase().trim() === matchedDist.recipient_email.toLowerCase().trim()) || null;
      }
    }

    // Try resolve by submitted email or contact name
    if (!client && (contactEmail || contactPerson)) {
      const allClients = await dataStore.getClients();
      if (contactEmail) {
        client = allClients.find(c => c.email.toLowerCase().trim() === contactEmail.toLowerCase()) || null;
      }
      if (!client && contactPerson) {
        client = allClients.find(c => c.name.toLowerCase().trim() === contactPerson.toLowerCase()) || null;
      }
    }

    // If still no client found, auto-create a client in CRM so submissions are never lost
    if (!client && (contactPerson || contactEmail || companyName)) {
      client = await dataStore.createClient({
        name: contactPerson || companyName || "Ny henvendelse",
        company: companyName || "",
        email: contactEmail || "",
        phone: phone || "",
        status: "Ny",
        requested_service: form.title || "Nettsider & Visuell profil",
        internal_notes: `Opprettet automatisk fra innsendt skjema "${form.title}".`,
        is_archived: false
      });
    }

    const resolvedClientId = client?.id || null;
    const resolvedClientName = client?.name || contactPerson || "Innsender";
    const resolvedClientEmail = client?.email || contactEmail || "";
    const resolvedClientCompany = client?.company || companyName || "";

    // 2. Create submission in dataStore
    const submission = await dataStore.createSubmission({
      form_id: form.id,
      client_id: resolvedClientId,
      distribution_id: distribution_id || matchedDist?.id || null,
      token,
      answers,
      files
    });

    const fullSubmissionRecord: any = {
      ...submission,
      form_id: form.id,
      client_id: resolvedClientId,
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug
      },
      client: {
        id: resolvedClientId || "c-anon",
        name: resolvedClientName,
        email: resolvedClientEmail,
        company: resolvedClientCompany,
        phone: client?.phone || phone || ""
      },
      answers: answers.map((ans: any, idx: number) => ({
        id: "ans-" + idx + "-" + Date.now().toString(36),
        submission_id: submission.id,
        field_id: ans.field_id || null,
        field_label: ans.field_label,
        value: ans.value
      })),
      files: files || []
    };

    // Update submission record in dataStore with full client and form info
    await dataStore.updateSubmission(submission.id, fullSubmissionRecord);

    // 3. Dual-layer persistence in Supabase
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
          client_id: resolvedClientId,
          distribution_id: distribution_id || matchedDist?.id || null,
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

    // 4. Send notification email to admin (hei@bymari.no)
    try {
      await sendFormSubmissionNotificationEmail({
        formTitle: form.title,
        clientName: resolvedClientName,
        clientEmail: resolvedClientEmail,
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



