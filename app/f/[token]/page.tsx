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
  Clock,
  Palette,
  Sparkles,
  Layers,
  Sparkle
} from "lucide-react";

// Visual Color Palettes Preset Definitions
const COLOR_PALETTES: Record<string, { title: string; subtitle: string; swatches: string[] }> = {
  "jordtoner": {
    title: "Jordtoner & Varm Sand",
    subtitle: "Rolig, naturlig, beige og varmt",
    swatches: ["#FAF8F5", "#EFE8DE", "#D5C7B2", "#9E8C73", "#4A3F35"]
  },
  "gronntoner": {
    title: "Dyp Skoggrønn & Salvie",
    subtitle: "Organisk, harmonisk og naturpreget",
    swatches: ["#F4F6F4", "#D1DCD3", "#8FA796", "#34463B", "#1C2720"]
  },
  "monokrom": {
    title: "Minimalistisk Sort, Hvit & Grå",
    subtitle: "Tidløst, rent, stramt og moderne",
    swatches: ["#FFFFFF", "#F3F4F6", "#D1D5DB", "#4B5563", "#111827"]
  },
  "pastell": {
    title: "Duse Pasteller & Varm Pudder",
    subtitle: "Mykt, lyst, innbydende og feminint",
    swatches: ["#FDF8F5", "#F7E5DE", "#ECC2B3", "#C99786", "#6A4A40"]
  },
  "morke_toner": {
    title: "Midnattsblå, Antrasitt & Gull",
    subtitle: "Eksklusivt, luksuriøst og sobert",
    swatches: ["#1A202C", "#2D3748", "#1E293B", "#C5A880", "#E2E8F0"]
  },
  "friske_farger": {
    title: "Friske & Spreke Kontraster",
    subtitle: "Energisk, moderne og iøynefallende",
    swatches: ["#FFF9EB", "#F59E0B", "#10B981", "#3B82F6", "#1E293B"]
  }
};

function getPaletteInfo(opt: { label: string; value?: string }) {
  const val = (opt.value || "").toLowerCase();
  const lbl = opt.label.toLowerCase();
  const key = Object.keys(COLOR_PALETTES).find(k => 
    val === k || 
    lbl.includes(k) ||
    (k === "jordtoner" && (lbl.includes("jordtoner") || lbl.includes("sand") || lbl.includes("beige"))) ||
    (k === "gronntoner" && (lbl.includes("skoggrønn") || lbl.includes("salvie") || lbl.includes("natur"))) ||
    (k === "monokrom" && (lbl.includes("sort") || lbl.includes("monokrom") || lbl.includes("hvit og grå"))) ||
    (k === "pastell" && (lbl.includes("pastell") || lbl.includes("pudder"))) ||
    (k === "morke_toner" && (lbl.includes("midnatt") || lbl.includes("antrasitt") || lbl.includes("gull") || lbl.includes("dype farger"))) ||
    (k === "friske_farger" && (lbl.includes("frisk") || lbl.includes("sprek")))
  );
  return key ? COLOR_PALETTES[key] : null;
}

const STYLE_CARDS: Record<string, { title: string; subtitle: string; tag: string; fontClass: string; preview: string }> = {
  "klassisk_elegant": {
    title: "Klassisk & Elegant",
    subtitle: "Tidløs eleganse, harmonisk ro og diskré luksus",
    tag: "Tidløs & Sofistikert",
    fontClass: "font-serif italic",
    preview: "Aa — by mari"
  },
  "varm_personlig": {
    title: "Varm & Personlig",
    subtitle: "Innbydende, naturlig, nær og ekte",
    tag: "Organisk & Innbydende",
    fontClass: "font-sans font-medium",
    preview: "Ekte & Varm"
  },
  "moderne_minimalistisk": {
    title: "Moderne & Minimalistisk",
    subtitle: "Rene linjer, stram struktur, fokus og luft",
    tag: "Strukturert & Rent",
    fontClass: "font-sans font-light tracking-widest uppercase",
    preview: "MODERNE MINIMALISME"
  },
  "kreativ_leken": {
    title: "Kreativ & Leken",
    subtitle: "Nyskapende, fargerik, dynamisk og uventet",
    tag: "Modig & Nyskapende",
    fontClass: "font-sans font-bold",
    preview: "Kreativt & Nytt"
  },
  "eksklusiv_sober": {
    title: "Eksklusiv & Sober",
    subtitle: "Premium finish, autoritær ro og luksuriøse detaljer",
    tag: "High-End & Sobert",
    fontClass: "font-serif tracking-wider uppercase",
    preview: "PREMIUM FINISH"
  },
  "ra_industriell": {
    title: "Rå & Industriell",
    subtitle: "Tydelig tyngde, kontraster, upolert og kraftfull",
    tag: "Karakter & Kraft",
    fontClass: "font-mono font-medium tracking-wider",
    preview: "[ RÅ KRAFT ]"
  }
};

function getStyleCardInfo(opt: { label: string; value?: string }) {
  const val = (opt.value || "").toLowerCase();
  const lbl = opt.label.toLowerCase();
  const key = Object.keys(STYLE_CARDS).find(k => 
    val === k ||
    (k === "klassisk_elegant" && (lbl.includes("klassisk") || lbl.includes("elegant"))) ||
    (k === "varm_personlig" && (lbl.includes("varm") || lbl.includes("personlig"))) ||
    (k === "moderne_minimalistisk" && (lbl.includes("moderne") || lbl.includes("minimalistisk"))) ||
    (k === "kreativ_leken" && (lbl.includes("kreativ") || lbl.includes("leken"))) ||
    (k === "eksklusiv_sober" && (lbl.includes("eksklusiv") || lbl.includes("sober"))) ||
    (k === "ra_industriell" && (lbl.includes("rå") || lbl.includes("industriell")))
  );
  return key ? STYLE_CARDS[key] : null;
}

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

  // Helper to determine if the deadline has passed (with end-of-day grace period)
  const isFormExpired = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    const exp = new Date(expiresAt);
    if (isNaN(exp.getTime())) return false;
    // If the time is set to midnight UTC/local (00:00:00), grant until 23:59:59.999 of that day
    if (exp.getUTCHours() === 0 && exp.getUTCMinutes() === 0 && exp.getUTCSeconds() === 0) {
      exp.setUTCHours(23, 59, 59, 999);
    }
    return exp.getTime() < Date.now();
  };

  useEffect(() => {
    async function loadForm() {
      setLoading(true);
      try {
        const res = await fetch(`/api/forms/${token}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.distribution && data.form) {
            setDistribution(data.distribution);
            setForm(data.form);
          } else {
            setDistribution(null);
            setForm(null);
          }
        } else {
          // Fallback to dataStore
          const dist = await dataStore.getDistributionByToken(token);
          if (dist && dist.form) {
            setDistribution(dist);
            setForm(dist.form);
          }
        }
      } catch (err) {
        console.warn("Fetch form error, attempting fallback:", err);
        const dist = await dataStore.getDistributionByToken(token);
        if (dist && dist.form) {
          setDistribution(dist);
          setForm(dist.form);
        }
      }
      setLoading(false);
    }
    if (token) {
      loadForm();
    }
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
  const activeForm = form || initialForms[0];

  if (!distribution) {
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

  if (isFormExpired(distribution.expires_at)) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-sand p-8 text-center rounded-sm shadow-sm space-y-4">
          <Logo size="md" showLink={false} />
          <h1 className="text-xl font-medium text-charcoal mt-4">Tidsfristen har utløpt</h1>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed">
            Fristen for å besvare dette skjemaet gikk ut {new Date(distribution.expires_at!).toLocaleDateString("no-NO")}.
          </p>
        </div>
      </div>
    );
  }

  const fields = activeForm.fields || initialForms[0].fields || [];

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

      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          form_id: activeForm.id,
          client_id: distribution.client_id,
          distribution_id: distribution.id,
          answers: answersPayload,
          files: uploadedFiles
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Det oppstod en feil under innsendingen.");
      }

      setSubmitting(false);
      router.push(`/f/${token}/takk`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitting(false);
      setErrorMessage(err.message || "Det oppstod en feil under innsendingen. Vennligst prøv igjen.");
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
              {activeForm.title}
            </h1>
            {activeForm.introduction && (
              <div className="mt-4 text-base text-charcoal/80 font-light leading-relaxed max-w-xl mx-auto whitespace-pre-line">
                {renderCleanText(activeForm.introduction)}
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

                  {field.field_type === "radio" && (() => {
                    const isBinaryJaNei = field.options?.length === 2 && 
                      field.options.some(o => o.label.toLowerCase() === "ja") && 
                      field.options.some(o => o.label.toLowerCase() === "nei");

                    const isStyleQuestion = field.label.toLowerCase().includes("stil") || 
                      field.label.toLowerCase().includes("stemning") ||
                      field.id === "fld-ks-7";

                    if (isBinaryJaNei) {
                      return (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {(field.options || []).map((opt) => {
                            const isSelected = answers[field.id] === opt.label;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleAnswerChange(field.id, opt.label)}
                                className={`py-4 px-6 rounded-sm border text-center font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                                  isSelected
                                    ? "bg-forest-green text-warm-white border-forest-green shadow-sm ring-2 ring-forest-green/20"
                                    : "bg-warm-white/60 hover:bg-warm-white border-sand text-charcoal/90 hover:border-forest-green/40"
                                }`}
                              >
                                {isSelected && <Check className="w-4 h-4 mr-1 text-warm-white" />}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    }

                    if (isStyleQuestion) {
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {(field.options || []).map((opt) => {
                            const isSelected = answers[field.id] === opt.label;
                            const styleInfo = getStyleCardInfo(opt);
                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleAnswerChange(field.id, opt.label)}
                                className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                                  isSelected
                                    ? "bg-forest-green-light/40 border-forest-green shadow-sm ring-1 ring-forest-green"
                                    : "bg-warm-white/40 border-sand hover:bg-warm-white hover:border-sand-dark"
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    {styleInfo?.tag ? (
                                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-sand/40 text-charcoal/80 rounded-xs">
                                        {styleInfo.tag}
                                      </span>
                                    ) : <span />}
                                    <input
                                      type="radio"
                                      name={`fld-${field.id}`}
                                      checked={isSelected}
                                      onChange={() => handleAnswerChange(field.id, opt.label)}
                                      className="text-forest-green focus:ring-forest-green"
                                    />
                                  </div>
                                  <p className="text-sm font-medium text-charcoal">
                                    {styleInfo?.title || opt.label}
                                  </p>
                                  {styleInfo?.subtitle && (
                                    <p className="text-xs text-charcoal/60 leading-relaxed font-light">
                                      {styleInfo.subtitle}
                                    </p>
                                  )}
                                </div>
                                {styleInfo?.preview && (
                                  <div className={`p-2.5 bg-white/80 border border-sand/60 rounded-xs text-center ${styleInfo.fontClass}`}>
                                    {styleInfo.preview}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    return (
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
                    );
                  })()}

                  {field.field_type === "checkbox" && (() => {
                    const isColorQuestion = field.label.toLowerCase().includes("farge") || 
                      field.label.toLowerCase().includes("palett") || 
                      field.id === "fld-ks-6";

                    const isStyleQuestion = field.label.toLowerCase().includes("stil") || 
                      field.label.toLowerCase().includes("stemning") ||
                      field.id === "fld-ks-7";

                    if (isColorQuestion) {
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {(field.options || []).map((opt) => {
                            const checked = ((answers[field.id] as string[]) || []).includes(opt.label);
                            const palette = getPaletteInfo(opt);
                            const isCustomOption = opt.label.toLowerCase().includes("egne faste") || opt.label.toLowerCase().includes("egne fargekoder");
                            const isMariSuggestion = opt.label.toLowerCase().includes("åpen for forslag");

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleCheckboxToggle(field.id, opt.label)}
                                className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                                  checked
                                    ? "bg-forest-green-light/40 border-forest-green shadow-sm ring-1 ring-forest-green"
                                    : "bg-warm-white/40 border-sand hover:bg-warm-white hover:border-sand-dark"
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5">
                                      {palette ? (
                                        <Palette className="w-3.5 h-3.5 text-forest-green" />
                                      ) : isMariSuggestion ? (
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                      ) : (
                                        <Layers className="w-3.5 h-3.5 text-charcoal/60" />
                                      )}
                                      <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/60">
                                        {palette ? "Fargepalett" : isMariSuggestion ? "Anbefaling" : "Tilpasset"}
                                      </span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleCheckboxToggle(field.id, opt.label)}
                                      className="rounded-xs text-forest-green focus:ring-forest-green"
                                    />
                                  </div>
                                  <p className="text-sm font-medium text-charcoal">
                                    {palette?.title || opt.label}
                                  </p>
                                  <p className="text-xs text-charcoal/65 leading-relaxed font-light">
                                    {palette?.subtitle || (isCustomOption ? "Du oppgir fargekoder eller sender profilmanual" : isMariSuggestion ? "Mari designer en harmonisk fargepalett for deg" : "")}
                                  </p>
                                </div>

                                {palette && palette.swatches && (
                                  <div className="flex items-center space-x-2 pt-2 border-t border-sand/40">
                                    {palette.swatches.map((hex, sIdx) => (
                                      <span
                                        key={sIdx}
                                        style={{ backgroundColor: hex }}
                                        className="w-6 h-6 rounded-full border border-sand shadow-xs inline-block shrink-0 transition-transform hover:scale-110"
                                        title={hex}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    if (isStyleQuestion) {
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {(field.options || []).map((opt) => {
                            const checked = ((answers[field.id] as string[]) || []).includes(opt.label);
                            const styleInfo = getStyleCardInfo(opt);
                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleCheckboxToggle(field.id, opt.label)}
                                className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                                  checked
                                    ? "bg-forest-green-light/40 border-forest-green shadow-sm ring-1 ring-forest-green"
                                    : "bg-warm-white/40 border-sand hover:bg-warm-white hover:border-sand-dark"
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    {styleInfo?.tag ? (
                                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-sand/40 text-charcoal/80 rounded-xs">
                                        {styleInfo.tag}
                                      </span>
                                    ) : <span />}
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleCheckboxToggle(field.id, opt.label)}
                                      className="rounded-xs text-forest-green focus:ring-forest-green"
                                    />
                                  </div>
                                  <p className="text-sm font-medium text-charcoal">
                                    {styleInfo?.title || opt.label}
                                  </p>
                                  {styleInfo?.subtitle && (
                                    <p className="text-xs text-charcoal/60 leading-relaxed font-light">
                                      {styleInfo.subtitle}
                                    </p>
                                  )}
                                </div>
                                {styleInfo?.preview && (
                                  <div className={`p-2.5 bg-white/80 border border-sand/60 rounded-xs text-center ${styleInfo.fontClass}`}>
                                    {styleInfo.preview}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    return (
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
                    );
                  })()}

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
