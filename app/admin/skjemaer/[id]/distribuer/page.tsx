"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dataStore } from "@/lib/store";
import { Form, Client, FormDistribution } from "@/lib/types";
import { 
  ArrowLeft, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Mail,
  Calendar,
  User,
  ShieldCheck,
  Ban
} from "lucide-react";

export default function DistribuerSkjemaPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState(formId);
  const [clients, setClients] = useState<Client[]>([]);
  const [distributions, setDistributions] = useState<FormDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Distribution form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailIntro, setEmailIntro] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [sendEmailDirectly, setSendEmailDirectly] = useState(true);

  const [isDistributing, setIsDistributing] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async (activeId = selectedFormId) => {
    setLoading(true);
    try {
      // 1. Fetch all forms
      let loadedForms: Form[] = [];
      try {
        const fRes = await fetch("/api/forms");
        if (fRes.ok) {
          const fJson = await fRes.json();
          if (fJson.forms) loadedForms = fJson.forms;
        }
      } catch {}
      if (loadedForms.length === 0) {
        loadedForms = await dataStore.getForms();
      }
      setAllForms(loadedForms);

      // 2. Fetch specific form
      const f = loadedForms.find(item => item.id === activeId || item.slug === activeId) || (await dataStore.getFormById(activeId));
      setForm(f);

      // 3. Fetch clients
      let loadedClients: Client[] = [];
      try {
        const clientRes = await fetch("/api/clients", { cache: "no-store" });
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          if (clientData.clients && Array.isArray(clientData.clients)) {
            loadedClients = clientData.clients;
          }
        }
      } catch (err) {
        console.warn("Client fetch warning:", err);
        loadedClients = await dataStore.getClients();
      }
      setClients(loadedClients);

      // 4. Fetch distributions
      let loadedDists: FormDistribution[] = [];
      try {
        const distRes = await fetch(`/api/forms/distribute?formId=${activeId}`);
        if (distRes.ok) {
          const distData = await distRes.json();
          if (distData.distributions) loadedDists = distData.distributions;
        }
      } catch {}
      if (loadedDists.length === 0) {
        loadedDists = await dataStore.getDistributions({ formId: activeId });
      }
      setDistributions(loadedDists);

      if (f) {
        setEmailSubject(`Skjema fra by mari: ${f.title}`);
        setEmailIntro(`Hei, vi gleder oss til samarbeidet. Vennligst fyll ut dette skjemaet når du har mulighet.`);
      }
    } catch (err) {
      console.error("loadData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedFormId);
  }, [selectedFormId]);

  const handleFormChange = (newId: string) => {
    setSelectedFormId(newId);
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setIsDistributing(true);
    setSuccessMessage("");

    const client = clients.find(c => c.id === selectedClientId);

    try {
      const res = await fetch("/api/forms/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          clientId: selectedClientId || null,
          emailSubject,
          emailIntro,
          expiresAt: expiresAt || null,
          sendEmailDirectly
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(
          `Sikker lenke opprettet!${sendEmailDirectly && client ? " E-post er nå sendt fra hei@bymari.no til " + client.email : ""}`
        );
      } else {
        alert("Kunne ikke distribuere skjema: " + (data.error || "Ukjent feil"));
      }
    } catch (err: any) {
      console.error("Distribution error:", err);
      alert("Feil ved utsendelse: " + err.message);
    } finally {
      setIsDistributing(false);
      loadData(selectedFormId);
    }
  };

  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/f/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRevoke = async (distId: string) => {
    if (confirm("Er du sikker på at du vil tilbakekalle denne lenken? Kunden vil ikke lenger kunne åpne eller sende inn skjemaet.")) {
      await dataStore.revokeDistribution(distId);
      loadData(selectedFormId);
    }
  };

  if (loading || !form) {
    return (
      <div className="py-20 text-center text-xs text-charcoal/60 font-mono">
        Laster distribusjonsdetaljer...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/admin/skjemaer"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-charcoal/70 hover:text-forest-green transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tilbake til skjemaer</span>
        </Link>
      </div>

      <AdminHeader
        title={`Distribuer skjema: "${form.title}"`}
        description="Generer sikre, krypterte recipient-lenker og send direkte til kunden på e-post via Resend."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Distribution Form (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-sand p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-sand pb-4">
            <h2 className="text-base font-medium text-charcoal">Send til kunde</h2>
            <p className="text-xs text-charcoal/60 mt-1">
              Hver utsendelse får en unik, uforutsigbar tilgangstoken (/f/[token]).
            </p>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleDistribute} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Velg skjema som skal sendes
              </label>
              <select
                value={selectedFormId}
                onChange={(e) => handleFormChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-white border border-sand rounded-sm text-sm font-medium text-charcoal focus:outline-none focus:border-forest-green"
              >
                {allForms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id === "f-kort-prosjektskjema" ? "⭐ " : ""}{f.title} ({f.fields?.length || 0} spørsmål){f.id === "f-kort-prosjektskjema" ? " — ANBEFALT (3–5 min)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Velg kunde fra CRM
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              >
                <option value="">-- Generer generell lenke (uten kunde) --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""} — {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                E-postemne
              </label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Skjema fra by mari"
                className="w-full px-3.5 py-2.5 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Personlig e-postintroduksjon
              </label>
              <textarea
                rows={3}
                value={emailIntro}
                onChange={(e) => setEmailIntro(e.target.value)}
                placeholder="Hei Henrik, her er forberedelsesskjemaet for prosjektet..."
                className="w-full p-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Utløpsdato <span className="text-charcoal/50 font-normal">(valgfritt)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>

            {selectedClientId && (
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="send_email"
                  checked={sendEmailDirectly}
                  onChange={(e) => setSendEmailDirectly(e.target.checked)}
                  className="rounded-xs text-forest-green focus:ring-forest-green border-sand"
                />
                <label htmlFor="send_email" className="text-xs text-charcoal/80 cursor-pointer">
                  Send e-postvarsel automatisk via Resend (hei@bymari.no)
                </label>
              </div>
            )}

            <div className="pt-4 border-t border-sand">
              <button
                type="submit"
                disabled={isDistributing}
                className="w-full py-3 bg-forest-green hover:bg-forest-green-hover text-warm-white font-medium text-xs rounded-sm transition-colors flex items-center justify-center space-x-2 tracking-wide disabled:opacity-60 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isDistributing ? "Oppretter..." : "Opprett og distribuer"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Existing Distributions & Tracking (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-sand p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-sand pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-charcoal">Utsendte lenker ({distributions.length})</h2>
              <p className="text-xs text-charcoal/60 mt-1">Status og åpningssporing for dette skjemaet</p>
            </div>
          </div>

          {distributions.length === 0 ? (
            <p className="text-sm text-charcoal/60 py-12 text-center">
              Dette skjemaet har ingen aktive utsendelser ennå.
            </p>
          ) : (
            <div className="space-y-4">
              {distributions.map((dist) => (
                <div key={dist.id} className="border border-sand p-4 rounded-sm space-y-3 bg-warm-white/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        {dist.client?.name || "Generell lenke"}
                      </p>
                      {dist.client?.email && (
                        <p className="text-xs text-charcoal/60">{dist.client.email}</p>
                      )}
                    </div>
                    <StatusBadge status={dist.status} />
                  </div>

                  <div className="flex items-center space-x-2 bg-white border border-sand px-3 py-1.5 rounded-sm text-xs font-mono text-charcoal/80">
                    <span className="truncate flex-1">/f/{dist.token}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(dist.token)}
                      className="p-1 text-forest-green hover:underline flex items-center space-x-1 shrink-0 font-sans"
                      title="Kopier lenke"
                    >
                      {copiedToken === dist.token ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Kopiert!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Kopier</span>
                        </>
                      )}
                    </button>
                    <Link
                      href={`/f/${dist.token}`}
                      target="_blank"
                      className="p-1 text-charcoal/60 hover:text-charcoal shrink-0"
                      title="Åpne skjema i ny fane"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-charcoal/50 font-mono pt-1">
                    <span>
                      Opprettet {new Date(dist.created_at).toLocaleDateString("no-NO", { day: "numeric", month: "short" })}
                    </span>
                    {dist.status !== "revoked" && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(dist.id)}
                        className="text-red-700 hover:underline font-sans inline-flex items-center space-x-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Tilbakekall</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
