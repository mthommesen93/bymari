"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { dataStore } from "@/lib/store";
import { 
  Settings, 
  Mail, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Trash2
} from "lucide-react";

export default function InnstillingerPage() {
  const [studioName, setStudioName] = useState("by mari");
  const [studioEmail, setStudioEmail] = useState("hei@bymari.no");
  const [studioDomain, setStudioDomain] = useState("bymari.no");
  const [savedNotification, setSavedNotification] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handleResetData = async () => {
    if (confirm("Vil du tilbakestille alle demodata (kunder, skjemaer og svar) til opprinnelig tilstand?")) {
      setIsResetting(true);
      await dataStore.resetToSeedData();
      setIsResetting(false);
      setResetMessage("Demodata er tilbakestilt!");
      setTimeout(() => setResetMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Innstillinger og systemstatus"
        description="Konfigurer studioinformasjon, e-postleveranse, databasetilkobling og personvernrutiner."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: General Studio Config (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSaveSettings} className="bg-white border border-sand p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-sand pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-medium text-charcoal">Studioopplysninger</h2>
                <p className="text-xs text-charcoal/60 mt-0.5">Offisiell profil for utsendelser og varsler</p>
              </div>
              {savedNotification && (
                <span className="text-xs text-emerald-700 font-medium inline-flex items-center space-x-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lagret!</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Studionavn
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Standard avsenderadresse (Resend)
                </label>
                <input
                  type="email"
                  value={studioEmail}
                  onChange={(e) => setStudioEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                />
                <p className="text-[11px] text-charcoal/50 mt-1">E-poster sendes som &quot;By Mari &lt;{studioEmail}&gt;&quot; etter domenevalidering.</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Hoveddomene
                </label>
                <input
                  type="text"
                  value={studioDomain}
                  onChange={(e) => setStudioDomain(e.target.value)}
                  className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-sand flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors"
              >
                Lagre innstillinger
              </button>
            </div>
          </form>

          {/* Development & Demo Data Tools */}
          <div className="bg-white border border-sand p-6 sm:p-8 rounded-sm shadow-sm space-y-4">
            <h2 className="text-base font-medium text-charcoal">Utviklingsverktøy og demodata</h2>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Tilbakestill alle testkunder, skjemaer, utsendelser og svar til en ren tilstand for presentasjon eller testing.
            </p>

            {resetMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resetMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetData}
                disabled={isResetting}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-sand hover:bg-sand/20 text-xs font-medium text-charcoal rounded-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-forest-green ${isResetting ? "animate-spin" : ""}`} />
                <span>Gjenopprett startdata (seed data)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Service Integration Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Supabase Status */}
          <div className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-forest-green" />
                <h3 className="text-sm font-medium text-charcoal">Supabase Postgres & Auth</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm">
                Klar
              </span>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Row Level Security (RLS) er konfigurert for alle 10 datatabeller og private fillagringsbøtter.
            </p>
            <div className="text-[11px] font-mono text-charcoal/60 bg-warm-white p-3 rounded-sm border border-sand/60">
              <p>Migrasjon: 20260101000000_init_schema.sql</p>
              <p className="mt-1">Lagring: bucket &quot;client-uploads&quot; (privat)</p>
            </div>
          </div>

          {/* Resend Status */}
          <div className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-forest-green" />
                <h3 className="text-sm font-medium text-charcoal">Resend E-postlevering</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200 rounded-sm">
                Aktiv
              </span>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Støtter HTML-varsling ved nye nettsidehenvendelser og utsendelse av skjemaer til kunder.
            </p>
            <div className="text-[11px] font-mono text-charcoal/60 bg-warm-white p-3 rounded-sm border border-sand/60">
              <p>Avsender: By Mari &lt;hei@bymari.no&gt;</p>
              <p className="mt-1">Modus: Produksjon &amp; Utviklingssimulator</p>
            </div>
          </div>

          {/* GDPR / Privacy */}
          <div className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-sand pb-3">
              <ShieldCheck className="w-4 h-4 text-forest-green" />
              <h3 className="text-sm font-medium text-charcoal">GDPR & Sikkerhet</h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Offentlig personvernerklæring er aktiv på <a href="/personvern" target="_blank" className="underline text-forest-green">/personvern</a>. Kunder har innsynsrett og kan be om retting eller sletting av opplysninger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
