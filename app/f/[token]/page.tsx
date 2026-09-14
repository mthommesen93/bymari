"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { dataStore } from "@/lib/store";
import { FormDistribution, Form, FormField } from "@/lib/types";
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Upload, 
  FileText, 
  Check, 
  Lock, 
  Loader2,
  Calendar,
  Clock
} from "lucide-react";

// Helper to cleanly format line breaks from storage or raw strings
function renderCleanText(text?: string | null) {
  if (!text) return "";
  return text.replace(/\\n/g, "\n").replace(/\n/g, "\n");
}

export default function CustomerFormRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [distribution, setDistribution] = useState<FormDistribution | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<"fill" | "review" | "done">("fill");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadForm() {
      setLoading(true);
      const dist = await dataStore.getDistributionByToken(token);
      if (dist && dist.form) {
        setDistribution(dist);
        setForm(dist.form);
        await dataStore.markDistributionOpened(token);
      }
      setLoading(false);
    }
    loadForm();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-forest-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-charcoal/60 font-mono">Laster skjema...</p>
        </div>
      </div>
    );
  }

  // Token Validation Checks
  if (!distribution || !form) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-sand p-8 text-center rounded-sm shadow-sm space-y-4">
          <Logo size="md" showLink={false} />
          <div className="pt-4">
            <h1 className="text-xl font-medium text-charcoal">Ugyldig eller utløpt lenke</h1>
            <p className="mt-2 text-sm text-charcoal/70 font-light leading-relaxed">
              Vi finner ikke noe aktivt skjema knyttet til denne adressen. Vennligst ta kontakt på <a href="mailto:hei@bymari.no" className="underline text-forest-green">hei@bymari.no</a> dersom du mener dette er en feil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (distribution.status === "revoked") {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-sand p-8 text-center rounded-sm shadow-sm space-y-4">
          <Logo size="md" showLink={false} />
          <div className="pt-4">
            <h1 className="text-xl font-medium text-charcoal">Skjemaet er ikke lenger tilgjengelig</h1>
            <p className="mt-2 text-sm text-charcoal/70 font-light leading-relaxed">
              Tilgangen til dette skjemaet har blitt trukket tilbake av by mari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (distribution.status === "submitted") {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-sand p-8 text-center rounded-sm shadow-sm space-y-4">
          <Logo size="md" showLink={false} />
          <div className="w-12 h-12 bg-emerald-50 text-forest-green rounded-full flex items-center justify-center mx-auto mt-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-medium text-charcoal">Skjemaet er allerede besvart</h1>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed">
            Vi har allerede registrert svarene dine for dette skjemaet. Tusen takk!
          </p>
        </div>
      </div>
    );
  }

  if (distribution.expires_at && new Date(distribution.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-sand p-8 text-center rounded-sm shadow-sm space-y-4">
          <Logo size="md" showLink={false} />
          <h1 className="text-xl font-medium text-charcoal mt-4">Tidsfristen har utløpt</h1>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed">
            Fristen for å besvare dette skjemaet gikk ut {new Date(distribution.expires_at).toLocaleDateString("no-NO")}.
          </p>
        </div>
      </div>
    );
  }

  const fields = form.fields || [];

  // Conditional Logic Helper
  const isFieldVisible = (field: FormField) => {
    // Check if question 26 (Has website today) is "Nei"
    // If "Nei", hide questions 27, 28, 29
    const q26Field = fields.find(f => f.label.includes("26.") || f.id === "fld-ps-26");
    if (q26Field) {
      const q26Answer = answers[q26Field.id];
      const hasNoWebsite = q26Answer === "Nei";

      if (hasNoWebsite) {
        if (
          field.id === "fld-ps-27" || 
          field.id === "fld-ps-28" || 
          field.id === "fld-ps-29" ||
          field.label.startsWith("27.") ||
          field.label.startsWith("28.") ||
          field.label.startsWith("29.")
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleCheckboxToggle = (fieldId: string, optionLabel: string) => {
    const current = (answers[fieldId] as string[]) || [];
    if (current.includes(optionLabel)) {
      handleAnswerChange(fieldId, current.filter(v => v !== optionLabel));
    } else {
      handleAnswerChange(fieldId, [...current, optionLabel]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const uploadedObj = {
      id: "f-" + Date.now().toString(36),
      field_id: fieldId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
      file_path: `${token}/${file.name}`,
      created_at: new Date().toISOString()
    };
    setUploadedFiles(prev => [...prev, uploadedObj]);
    handleAnswerChange(fieldId, file.name);
  };

  // Step 1 -> Step 2 (Review)
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    fields.forEach(f => {
      // Only validate if field is currently visible
      if (isFieldVisible(f) && f.is_required && f.field_type !== "info") {
        const val = answers[f.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          errors[f.id] = "Dette feltet er obligatorisk.";
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMessage("Vennligst fyll ut alle obligatoriske felter før du går videre.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrorMessage("");
    setValidationErrors({});
    setCurrentStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 -> Submit
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const answersPayload = fields
        .filter(f => f.field_type !== "info" && isFieldVisible(f))
        .map(f => ({
          field_id: f.id,
          field_label: f.label,
          value: answers[f.id] ?? ""
        }));

      await dataStore.createSubmission({
        form_id: form.id,
        client_id: distribution.client_id,
        distribution_id: distribution.id,
        token,
        answers: answersPayload,
        files: uploadedFiles
      });

      setSubmitting(false);
      router.push(`/f/${token}/takk`);
    } catch (err: any) {
      console.error(err);
      setSubmitting(false);
      setErrorMessage("Det oppstod en feil under innsendingen. Vennligst prøv igjen.");
    }
  };

  return (
    <div className="min-h-screen bg-warm-white py-12 md:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Calm Header */}
        <div className="text-center space-y-4">
          <Logo size="lg" showLink={false} />
          <div className="pt-2">
            <h1 className="text-3xl sm:text-4xl font-light text-charcoal tracking-tight">
              {form.title}
            </h1>
            {form.introduction && (
              <div className="mt-4 text-base text-charcoal/80 font-light leading-relaxed max-w-xl mx-auto whitespace-pre-line">
                {renderCleanText(form.introduction)}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-sand/30 border border-sand p-3.5 rounded-sm flex items-center justify-between text-xs text-charcoal/70">
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] ${
              currentStep === "fill" ? "bg-forest-green text-warm-white" : "bg-emerald-600 text-white"
            }`}>
              {currentStep === "review" ? <Check className="w-3 h-3" /> : "1"}
            </span>
            <span className={currentStep === "fill" ? "font-medium text-charcoal" : ""}>Utfylling</span>
          </div>

          <span className="text-sand-dark">&rarr;</span>

          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] ${
              currentStep === "review" ? "bg-forest-green text-warm-white" : "bg-sand text-charcoal/60"
            }`}>
              2
            </span>
            <span className={currentStep === "review" ? "font-medium text-charcoal" : ""}>Se over og send inn</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Utfylling */}
        {currentStep === "fill" && (
          <form onSubmit={handleProceedToReview} className="bg-white border border-sand p-8 sm:p-12 rounded-sm shadow-sm space-y-8">
            {fields.map((field, idx) => {
              if (!isFieldVisible(field)) {
                return null;
              }

              // Render Info / Section divider headers
              if (field.field_type === "info") {
                return (
                  <div key={field.id || idx} className="pt-8 pb-3 border-b border-sand first:pt-0">
                    <h3 className="text-lg font-medium text-charcoal">
                      {field.label}
                    </h3>
                    {field.description && (
                      <p className="mt-1 text-xs text-charcoal/70 leading-relaxed font-light">
                        {renderCleanText(field.description)}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={field.id || idx} className="space-y-2 pt-1">
                  <div className="flex items-baseline justify-between flex-wrap gap-1">
                    <label className="block text-sm font-medium text-charcoal">
                      {field.label}
                      {field.is_required && (
                        <span className="text-forest-green ml-1 font-semibold" title="Obligatorisk">*</span>
                      )}
                    </label>

                    {!field.is_required && (
                      <span className="text-xs font-normal text-charcoal/45 font-mono">
                        (Valgfritt)
                      </span>
                    )}
                  </div>

                  {field.description && (
                    <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                      {renderCleanText(field.description)}
                    </p>
                  )}

                  {/* Field Type Renderers */}
                  {field.field_type === "text" && (
                    <input
                      type="text"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="Ditt svar..."
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                    />
                  )}

                  {field.field_type === "textarea" && (
                    <textarea
                      rows={4}
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="Skriv så utfyllende du ønsker..."
                      className="w-full p-4 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y leading-relaxed"
                    />
                  )}

                  {field.field_type === "email" && (
                    <input
                      type="email"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="din@epost.no"
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                    />
                  )}

                  {field.field_type === "phone" && (
                    <input
                      type="tel"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="+47 000 00 000"
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                    />
                  )}

                  {field.field_type === "number" && (
                    <input
                      type="number"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                    />
                  )}

                  {field.field_type === "date" && (
                    <input
                      type="date"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                    />
                  )}

                  {field.field_type === "radio" && (
                    <div className="space-y-2 pt-1">
                      {(field.options || []).map((opt) => (
                        <label 
                          key={opt.id} 
                          className={`flex items-center space-x-3 p-3.5 border rounded-sm cursor-pointer transition-colors text-sm ${
                            answers[field.id] === opt.label
                              ? "bg-forest-green-light/40 border-forest-green text-charcoal font-medium"
                              : "bg-warm-white/40 border-sand/70 hover:bg-warm-white text-charcoal/90"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`fld-${field.id}`}
                            checked={answers[field.id] === opt.label}
                            onChange={() => handleAnswerChange(field.id, opt.label)}
                            className="text-forest-green focus:ring-forest-green"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.field_type === "checkbox" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {(field.options || []).map((opt) => {
                        const checked = ((answers[field.id] as string[]) || []).includes(opt.label);
                        return (
                          <label 
                            key={opt.id} 
                            className={`flex items-center space-x-3 p-3 border rounded-sm cursor-pointer transition-colors text-sm ${
                              checked
                                ? "bg-forest-green-light/40 border-forest-green text-charcoal font-medium"
                                : "bg-warm-white/40 border-sand/70 hover:bg-warm-white text-charcoal/90"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxToggle(field.id, opt.label)}
                              className="rounded-xs text-forest-green focus:ring-forest-green"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.field_type === "select" && (
                    <select
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                    >
                      <option value="">-- Velg et alternativ --</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt.id} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.field_type === "file" && (
                    <div className="border border-dashed border-sand p-6 text-center rounded-sm bg-warm-white/40 space-y-2">
                      <Upload className="w-5 h-5 text-forest-green mx-auto" />
                      <p className="text-xs text-charcoal/80 font-medium">Last opp filer, logo eller annet materiell</p>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, field.id)}
                        className="text-xs text-charcoal/60 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-forest-green file:text-warm-white hover:file:bg-forest-green-hover cursor-pointer"
                      />
                      {answers[field.id] && (
                        <p className="text-xs text-emerald-800 font-medium pt-1">
                          Valgt fil: {answers[field.id]}
                        </p>
                      )}
                    </div>
                  )}

                  {validationErrors[field.id] && (
                    <p className="text-xs text-red-600 pt-1 font-medium">{validationErrors[field.id]}</p>
                  )}
                </div>
              );
            })}

            <div className="pt-8 border-t border-sand flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-forest-green hover:bg-forest-green-hover text-warm-white font-medium text-sm rounded-sm transition-colors flex items-center justify-center space-x-2 tracking-wide focus:outline-none shadow-sm"
              >
                <span>Neste: Se over svarene</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Review & Final Submission */}
        {currentStep === "review" && (
          <div className="bg-white border border-sand p-8 sm:p-12 rounded-sm shadow-sm space-y-8">
            <div className="border-b border-sand pb-4">
              <h2 className="text-xl font-light text-charcoal">Se over svarene dine før innsending</h2>
              <p className="text-xs text-charcoal/60 mt-1">
                Sjekk at informasjonen stemmer. Du kan gå tilbake for å redigere om noe mangler.
              </p>
            </div>

            <div className="divide-y divide-sand/60">
              {fields
                .filter(f => f.field_type !== "info" && isFieldVisible(f))
                .map((f, i) => {
                  const ans = answers[f.id];
                  const displayVal = Array.isArray(ans) ? ans.join(", ") : (ans || "—");

                  return (
                    <div key={f.id || i} className="py-4 space-y-1">
                      <p className="text-xs uppercase tracking-wider text-charcoal/60 font-medium">
                        {f.label}
                      </p>
                      <p className="text-sm text-charcoal font-normal whitespace-pre-wrap leading-relaxed">
                        {displayVal}
                      </p>
                    </div>
                  );
                })}
            </div>

            <div className="pt-6 border-t border-sand flex flex-col sm:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep("fill")}
                className="px-6 py-3 border border-sand hover:bg-sand/20 text-charcoal text-xs font-medium rounded-sm flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tilbake til utfylling</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-8 py-3.5 bg-forest-green hover:bg-forest-green-hover text-warm-white text-sm font-medium rounded-sm transition-colors flex items-center justify-center space-x-2 tracking-wide disabled:opacity-60 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sender inn svar...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Bekreft og send inn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
