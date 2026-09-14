"use client";

import React, { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Quote } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Mail,
  Check,
  X,
  Loader2
} from "lucide-react";

export default function CustomerQuotePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const searchParams = useSearchParams();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [signName, setSignName] = useState("");
  const [acceptNote, setAcceptNote] = useState("");
  const [acceptAgreement, setAcceptAgreement] = useState(true);
  const [declineReason, setDeclineReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch quote
  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quotes/${token}`);
        const data = await res.json();
        if (res.ok && data.success && data.quote) {
          setQuote(data.quote);
          if (data.quote.client?.name) {
            setSignName(data.quote.client.name);
          }
        } else {
          setError(data.error || "Fant ikke pristilbudet.");
        }
      } catch (err: any) {
        setError(err.message || "Kunne ikke laste tilbudet.");
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadQuote();
    }
  }, [token]);

  // Check URL params for direct action
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "accept" && quote && quote.status !== "accepted" && quote.status !== "declined") {
      setShowAcceptModal(true);
    } else if (action === "decline" && quote && quote.status !== "accepted" && quote.status !== "declined") {
      setShowDeclineModal(true);
    }
  }, [searchParams, quote]);

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptAgreement) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          signedName: signName,
          note: acceptNote
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.quote) {
        setQuote(data.quote);
        setShowAcceptModal(false);
        setSuccessMessage("Tusen takk! Pristilbudet er nå akseptert. Vi tar kontakt med deg for oppstart.");
      } else {
        setError(data.error || "Kunne ikke fullføre aksept.");
      }
    } catch (err: any) {
      setError(err.message || "Det oppstod en feil.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline",
          reason: declineReason
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.quote) {
        setQuote(data.quote);
        setShowDeclineModal(false);
        setSuccessMessage("Tilbudet er registrert som avvist. Takk for tilbakemeldingen.");
      } else {
        setError(data.error || "Kunne ikke registrere avvisning.");
      }
    } catch (err: any) {
      setError(err.message || "Det oppstod en feil.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-7 h-7 border-2 border-[#34463B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#20211F]/60 font-mono">Laster pristilbud...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#DED7CB] p-8 text-center rounded-sm shadow-sm space-y-4">
          <Logo size="md" showLink={false} />
          <div className="pt-2">
            <h1 className="text-xl font-medium text-[#20211F]">Kunne ikke åpne tilbudet</h1>
            <p className="mt-2 text-sm text-[#20211F]/70 font-light leading-relaxed">
              {error || "Vi finner ikke noe aktivt pristilbud på denne adressen."}
            </p>
            <div className="pt-4">
              <a
                href="mailto:hei@bymari.no"
                className="inline-block px-5 py-2.5 bg-[#34463B] text-white text-xs font-medium rounded-sm hover:bg-[#28372E] transition-colors"
              >
                Kontakt hei@bymari.no
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(quote.expires_at).getTime() < Date.now() && quote.status === "sent";
  const isAccepted = quote.status === "accepted";
  const isDeclined = quote.status === "declined";

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#20211F] py-10 md:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DED7CB]/80">
          <div>
            <Logo size="lg" showLink={false} />
            <p className="text-xs text-[#877B6C] tracking-wide mt-1">
              Design & Utvikling for moderne merkevarer
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-[#877B6C] font-mono">
            <span>Ref: {quote.token.slice(0, 14)}</span>
            <span>•</span>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 hover:text-[#20211F] transition-colors py-1 px-2.5 border border-[#DED7CB] rounded-sm bg-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Skriv ut / PDF</span>
            </button>
          </div>
        </header>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Status Banners */}
        {isAccepted && !successMessage && (
          <div className="p-4 bg-[#EBF3ED] border border-[#C4DEC9] text-[#2E5C38] rounded-sm flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Dette pristilbudet er akseptert {quote.accepted_at ? `den ${new Date(quote.accepted_at).toLocaleDateString("no-NO")}` : ""} {quote.signed_name ? `av ${quote.signed_name}` : ""}.
              </span>
            </div>
            <span className="text-xs bg-[#2E5C38] text-white px-2.5 py-1 rounded-sm uppercase tracking-wider font-mono">
              Akseptert
            </span>
          </div>
        )}

        {isDeclined && !successMessage && (
          <div className="p-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-sm flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <XCircle className="w-5 h-5 text-gray-500" />
              <span className="text-sm">
                Dette pristilbudet ble avvist {quote.declined_at ? `den ${new Date(quote.declined_at).toLocaleDateString("no-NO")}` : ""}.
              </span>
            </div>
            <span className="text-xs bg-gray-600 text-white px-2.5 py-1 rounded-sm uppercase tracking-wider font-mono">
              Avvist
            </span>
          </div>
        )}

        {isExpired && !isAccepted && !isDeclined && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-sm flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <span className="text-sm">
              Dette tilbudet utløp {new Date(quote.expires_at).toLocaleDateString("no-NO")}. Ta kontakt for et oppdatert tilbud.
            </span>
          </div>
        )}

        {/* Quote Document Card */}
        <div className="bg-white border border-[#DED7CB] rounded-sm shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Document Title & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#ECE7DF]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#34463B] font-semibold bg-[#EBF3ED] px-2.5 py-1 rounded-sm">
                Pristilbud & Spesifikasjon
              </span>
              <h1 className="text-2xl sm:text-3xl font-light text-[#20211F] mt-3">
                {quote.package_name}
              </h1>
              {quote.client && (
                <div className="mt-2 text-sm text-[#4A4B48] space-y-0.5">
                  <p className="font-medium text-[#20211F]">
                    Utarbeidet for: {quote.client.name} {quote.client.company ? `(${quote.client.company})` : ""}
                  </p>
                  <p className="text-xs text-[#877B6C]">{quote.client.email}</p>
                </div>
              )}
            </div>

            <div className="text-xs text-[#877B6C] space-y-1 sm:text-right font-mono">
              <p>Dato: {new Date(quote.created_at).toLocaleDateString("no-NO")}</p>
              <p>Gyldig til: {new Date(quote.expires_at).toLocaleDateString("no-NO")}</p>
            </div>
          </div>

          {/* Intro Message */}
          {quote.email_intro && (
            <div className="p-5 bg-[#F7F5F0] border-l-2 border-[#34463B] rounded-r-sm text-sm text-[#20211F] font-light leading-relaxed whitespace-pre-line">
              {quote.email_intro}
            </div>
          )}

          {/* Specification / Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#877B6C] font-semibold">
              Leveranseoversikt
            </h3>

            <div className="border border-[#ECE7DF] rounded-sm overflow-hidden divide-y divide-[#ECE7DF]">
              
              {/* Base Package Line */}
              <div className="p-4 flex items-center justify-between bg-warm-white/40">
                <div>
                  <p className="text-sm font-medium text-[#20211F]">{quote.package_name}</p>
                  <p className="text-xs text-[#877B6C]">Hovedleveranse inkludert grunnoppsett, responsivt design og publisering</p>
                </div>
                <div className="text-sm font-mono text-[#20211F] font-medium text-right">
                  kr {quote.base_price.toLocaleString("no-NO")},-
                </div>
              </div>

              {/* Addons */}
              {quote.addons && quote.addons.length > 0 && quote.addons.map((add, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#20211F]">
                      {add.name} {add.quantity && add.quantity > 1 ? `(${add.quantity} stk)` : ""}
                    </p>
                    <p className="text-xs text-[#877B6C]">Tilleggstjeneste</p>
                  </div>
                  <div className="text-sm font-mono text-[#20211F] text-right">
                    kr {((add.price || 0) * (add.quantity || 1)).toLocaleString("no-NO")},-
                  </div>
                </div>
              ))}

              {/* Custom Lines */}
              {quote.custom_lines && quote.custom_lines.length > 0 && quote.custom_lines.map((c, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#20211F]">{c.name}</p>
                    <p className="text-xs text-[#877B6C]">Tilpasset leveranse</p>
                  </div>
                  <div className="text-sm font-mono text-[#20211F] text-right">
                    kr {Number(c.price || 0).toLocaleString("no-NO")},-
                  </div>
                </div>
              ))}

              {/* Discount if present */}
              {quote.discount > 0 && (
                <div className="p-4 flex items-center justify-between bg-emerald-50/50">
                  <p className="text-sm font-medium text-[#2E5C38]">Avtalt rabatt</p>
                  <p className="text-sm font-mono font-medium text-[#2E5C38] text-right">
                    - kr {quote.discount.toLocaleString("no-NO")},-
                  </p>
                </div>
              )}

              {/* Total Calculation */}
              <div className="p-5 bg-[#F7F5F0] space-y-2">
                <div className="flex items-center justify-between text-base sm:text-lg font-medium text-[#20211F]">
                  <span>Totalpris (engangssum):</span>
                  <span className="text-xl sm:text-2xl text-[#34463B] font-mono font-semibold">
                    kr {quote.total_price.toLocaleString("no-NO")},-
                  </span>
                </div>
                <p className="text-[11px] text-[#877B6C]">
                  {quote.vat_amount > 0 ? "Prisen er inkl. mva." : "Pris ekskl. mva. iht. gjeldende faktureringsregler."}
                </p>

                {quote.monthly_price && quote.monthly_price > 0 ? (
                  <div className="pt-3 mt-3 border-t border-[#DED7CB] flex items-center justify-between text-xs text-[#4A4B48]">
                    <span>Valgfri månedlig drifts- og vedlikeholdsavtale:</span>
                    <span className="font-mono font-semibold text-[#34463B]">
                      kr {quote.monthly_price.toLocaleString("no-NO")},- / mnd
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Terms & Delivery Time Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border border-[#ECE7DF] rounded-sm bg-[#F7F5F0]/60 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#34463B]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Estimert leveringstid</span>
              </div>
              <p className="text-sm font-medium text-[#20211F]">{quote.delivery_time}</p>
              <p className="text-[11px] text-[#877B6C]">Fra mottatt prosjektskjema og alt nødvendig innhold.</p>
            </div>

            <div className="p-4 border border-[#ECE7DF] rounded-sm bg-[#F7F5F0]/60 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#34463B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Betalingsbetingelser</span>
              </div>
              <p className="text-sm font-medium text-[#20211F]">50 / 50 fordeling</p>
              <p className="text-[11px] text-[#877B6C]">50% ved prosjektoppstart, 50% ved godkjent overlevering.</p>
            </div>
          </div>

          {/* CTA Actions (If not yet responded) */}
          {!isAccepted && !isDeclined && (
            <div className="pt-6 border-t border-[#ECE7DF] space-y-4">
              <div className="text-center space-y-1 pb-2">
                <h3 className="text-base font-medium text-[#20211F]">
                  Ønsker du å gå videre med dette tilbudet?
                </h3>
                <p className="text-xs text-[#877B6C]">
                  Ved aksept reserveres oppstartsdato, og vi sender deg velkomstdokument og fremdriftsplan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-[#34463B] hover:bg-[#28372E] text-white font-medium text-sm rounded-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Aksepter tilbud</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeclineModal(true)}
                  className="w-full sm:w-auto px-6 py-4 border border-[#DED7CB] hover:bg-sand/30 text-[#737470] hover:text-[#20211F] font-medium text-sm rounded-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Avvis tilbud</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-6 border-t border-[#ECE7DF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#877B6C] gap-2">
            <span>by mari • Organisasjonsnummer: 935 918 809</span>
            <span>Spørsmål? Send e-post til <a href="mailto:hei@bymari.no" className="underline text-[#34463B]">hei@bymari.no</a></span>
          </div>
        </div>

      </div>

      {/* ACCEPT CONFIRMATION MODAL */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#DED7CB] rounded-sm shadow-xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#2E5C38] font-semibold">
                  Bekreftelse
                </span>
                <h2 className="text-xl font-medium text-[#20211F] mt-1">
                  Aksepter pristilbud
                </h2>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAcceptSubmit} className="space-y-4">
              <div className="p-3.5 bg-[#F7F5F0] rounded-sm text-xs space-y-1">
                <p className="text-[#20211F] font-medium">{quote.package_name}</p>
                <p className="text-[#34463B] font-mono font-semibold">Totalpris: kr {quote.total_price.toLocaleString("no-NO")},-</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#20211F] mb-1">
                  Fullt navn (signatur) *
                </label>
                <input
                  type="text"
                  required
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  placeholder="Ola Nordmann"
                  className="w-full px-3.5 py-2.5 bg-warm-white border border-[#DED7CB] rounded-sm text-sm focus:outline-none focus:border-[#34463B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#20211F] mb-1">
                  Kommentar / ønsket oppstartsdato (valgfritt)
                </label>
                <textarea
                  rows={2}
                  value={acceptNote}
                  onChange={(e) => setAcceptNote(e.target.value)}
                  placeholder="F.eks. Vi gleder oss til å komme i gang..."
                  className="w-full p-3 bg-warm-white border border-[#DED7CB] rounded-sm text-xs focus:outline-none focus:border-[#34463B]"
                />
              </div>

              <label className="flex items-start space-x-2.5 text-xs text-[#4A4B48] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={acceptAgreement}
                  onChange={(e) => setAcceptAgreement(e.target.checked)}
                  className="mt-0.5 rounded text-[#34463B] focus:ring-[#34463B]"
                />
                <span>
                  Jeg godkjenner pristilbudet på kr {quote.total_price.toLocaleString("no-NO")},- og betalingsbetingelsene.
                </span>
              </label>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-sm border border-red-200">
                  {error}
                </p>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2.5 border border-[#DED7CB] text-xs font-medium text-[#737470] hover:text-[#20211F] rounded-sm"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={submitting || !signName.trim() || !acceptAgreement}
                  className="px-6 py-2.5 bg-[#34463B] hover:bg-[#28372E] text-white text-xs font-medium rounded-sm transition-colors disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sender bekreftelse...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Bekreft og aksepter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECLINE CONFIRMATION MODAL */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#DED7CB] rounded-sm shadow-xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#737470] font-semibold">
                  Avvisning
                </span>
                <h2 className="text-xl font-medium text-[#20211F] mt-1">
                  Avvis pristilbud
                </h2>
              </div>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <p className="text-xs text-[#737470] leading-relaxed">
                Er det noe som ikke passet, eller ønsker du justeringer i omfang eller pris? Gi oss gjerne en kort tilbakemelding.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#20211F] mb-1">
                  Tilbakemelding / grunn (valgfritt)
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="F.eks. prosjektet er utsatt, eller budsjettet er annerledes..."
                  className="w-full p-3 bg-warm-white border border-[#DED7CB] rounded-sm text-xs focus:outline-none focus:border-[#34463B]"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-sm border border-red-200">
                  {error}
                </p>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 py-2.5 border border-[#DED7CB] text-xs font-medium text-[#737470] hover:text-[#20211F] rounded-sm"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#737470] hover:bg-[#5C5D59] text-white text-xs font-medium rounded-sm transition-colors disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Registrerer...</span>
                    </>
                  ) : (
                    <span>Avvis tilbud</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
