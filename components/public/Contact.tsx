"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useContent } from "@/lib/content-context";
import { EditableText } from "@/components/editor/EditableText";

export function Contact() {
  const { content, updateField } = useContent();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "Nettsider",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Noe gikk galt under innsendingen. Vennligst prøv igjen.");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        company: "",
        service: "Nettsider",
        message: ""
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Kunne ikke sende henvendelsen. Sjekk internettforbindelsen og prøv igjen.");
    }
  };

  return (
    <section id="kontakt" className="py-24 md:py-36 scroll-mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-5 space-y-6">
            <EditableText
              value={content.contact.badge}
              onSave={(val) => updateField("contact.badge", val)}
              className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium block"
            />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-tight leading-snug">
              <EditableText
                value={content.contact.heading}
                onSave={(val) => updateField("contact.heading", val)}
                as="span"
                multiline
              />
            </h2>
            <p className="text-base sm:text-lg text-charcoal/80 font-light leading-relaxed">
              <EditableText
                value={content.contact.subtext}
                onSave={(val) => updateField("contact.subtext", val)}
                as="span"
                multiline
              />
            </p>
            
            <div className="pt-8 border-t border-sand space-y-4 text-sm text-charcoal/70">
              <div>
                <p className="text-xs uppercase tracking-wider text-sage-dark font-mono mb-1">Direkte e-post</p>
                <a href={`mailto:${content.contact.email}`} className="text-base text-charcoal hover:text-forest-green underline font-normal">
                  <EditableText
                    value={content.contact.email}
                    onSave={(val) => updateField("contact.email", val)}
                  />
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-sage-dark font-mono mb-1">Lokasjon</p>
                <p className="text-base text-charcoal">
                  <EditableText
                    value={content.contact.location}
                    onSave={(val) => updateField("contact.location", val)}
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white/60 border border-sand p-8 sm:p-12 rounded-sm shadow-sm">
            {status === "success" ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 bg-forest-green/10 text-forest-green rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-light text-charcoal">Takk for din henvendelse!</h3>
                <p className="text-base text-charcoal/80 font-light max-w-md mx-auto">
                  Jeg har mottatt meldingen din og tar kontakt på e-post innen 1-2 virkedager.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-sm font-medium text-forest-green hover:underline"
                  >
                    Send en ny melding
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
                      Navn <span className="text-forest-green">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ditt fulle navn"
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
                      E-post <span className="text-forest-green">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="din@epost.no"
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
                      Virksomhet <span className="text-charcoal/40 font-normal">(valgfritt)</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Firmanavn AS"
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
                      Hva trenger du hjelp med? <span className="text-forest-green">*</span>
                    </label>
                    <select
                      id="service"
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-charcoal focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green text-sm"
                    >
                      <option value="Nettsider">Nettsider</option>
                      <option value="Enkle applikasjoner">Enkle applikasjoner</option>
                      <option value="Annet">Annet / Rådgivning</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
                    Fortell kort om prosjektet <span className="text-forest-green">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Beskriv gjerne hva dere ønsker å oppnå, ønsket tidslinje eller spesielle behov..."
                    className="w-full px-4 py-3 bg-warm-white border border-sand rounded-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green text-sm resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full sm:w-auto px-8 py-4 bg-forest-green hover:bg-forest-green-hover text-warm-white font-medium text-sm rounded-sm transition-colors flex items-center justify-center space-x-2 tracking-wide disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sender forespørsel...</span>
                      </>
                    ) : (
                      <span>Send forespørsel</span>
                    )}
                  </button>
                  <p className="mt-3 text-xs text-charcoal/50">
                    Ved å sende inn godtar du at by mari kontakter deg vedrørende henvendelsen. Se vår{" "}
                    <a href="/personvern" className="underline hover:text-charcoal">personvernerklæring</a>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
