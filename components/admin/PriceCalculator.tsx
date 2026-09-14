"use client";

import React, { useState, useMemo } from "react";
import { Client } from "@/lib/types";
import { dataStore } from "@/lib/store";
import { 
  Calculator, 
  Check, 
  Copy, 
  Send, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Trash2,
  Calendar,
  FileText
} from "lucide-react";

interface PriceCalculatorProps {
  client?: Client | null;
  onSaved?: () => void;
}

interface AddonOption {
  id: string;
  name: string;
  price: number;
  description: string;
  selected: boolean;
  quantity?: number;
  hasQuantity?: boolean;
}

export function PriceCalculator({ client, onSaved }: PriceCalculatorProps) {
  // Base package
  const [basePackage, setBasePackage] = useState<string>("simple_web");
  const [customBasePrice, setCustomBasePrice] = useState<number>(3500);

  // Addons
  const [addons, setAddons] = useState<AddonOption[]>([
    {
      id: "extra_pages",
      name: "Ekstra undersider",
      price: 750,
      description: "Undersider utover grunnpakken (f.eks. Tjenester, Om oss)",
      selected: false,
      hasQuantity: true,
      quantity: 2
    },
    {
      id: "cms_editor",
      name: "In-screen tekstredigering",
      price: 1200,
      description: "Lar kunden endre tekst og bilder direkte i nettleseren",
      selected: true
    },
    {
      id: "copywriting",
      name: "Teksthjelp & innholdsstruktur",
      price: 1500,
      description: "Gjennomgang og finpuss av tekster for tydelig budskap",
      selected: false
    },
    {
      id: "custom_form",
      name: "Skreddersydd kalkulator / skjema",
      price: 2400,
      description: "Interaktivt skjema med dynamisk logikk og prising",
      selected: false
    },
    {
      id: "file_upload",
      name: "Filopplastingsmodul",
      price: 900,
      description: "Sikker filopplasting for kundene",
      selected: false
    },
    {
      id: "domain_setup",
      name: "Domene- & DNS-oppsett",
      price: 650,
      description: "Hjelp til å koble til eget domene og e-postpekere",
      selected: true
    },
    {
      id: "maintenance",
      name: "Månedlig drift & oppfølging (Abonnement)",
      price: 590,
      description: "Serverdrift, sikkerhet og løpende hjelp hver måned",
      selected: false
    }
  ]);

  // Discount & Delivery time
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState<string>("3–7 virkedager");
  const [includeVat, setIncludeVat] = useState<boolean>(false);
  const [validityDays, setValidityDays] = useState<number>(14);

  // Custom extra line
  const [customLines, setCustomLines] = useState<{ id: string; name: string; price: number }[]>([]);
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomPrice, setNewCustomPrice] = useState("");

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const packages: Record<string, { name: string; price: number; desc: string }> = {
    simple_web: {
      name: "Enkel nettside (One-page / Lanseringsside)",
      price: 3500,
      desc: "1 ryddig, mobiltilpasset landingsside med introduksjon, tjenester og kontaktskjema."
    },
    standard_web: {
      name: "Komplett bedriftsnettside (Fler-siders)",
      price: 7500,
      desc: "Komplett nettside med 3–5 undersider, visuell profil, kontaktskjema og in-screen redigering."
    },
    app_form: {
      name: "Skreddersydd applikasjon / verktøy",
      price: 4900,
      desc: "Brukervennlig beregningsverktøy, spørreskjema eller kundeportal med sikkert adminmottak."
    },
    custom: {
      name: "Egendefinert prosjekt",
      price: customBasePrice,
      desc: "Spesialtilpasset prosjekt etter avtale."
    }
  };

  const toggleAddon = (id: string) => {
    setAddons(addons.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const updateAddonQty = (id: string, qty: number) => {
    setAddons(addons.map(a => a.id === id ? { ...a, quantity: Math.max(1, qty) } : a));
  };

  const addCustomLine = () => {
    if (!newCustomName || !newCustomPrice) return;
    setCustomLines([
      ...customLines,
      {
        id: "c-" + Date.now(),
        name: newCustomName,
        price: parseFloat(newCustomPrice) || 0
      }
    ]);
    setNewCustomName("");
    setNewCustomPrice("");
  };

  const removeCustomLine = (id: string) => {
    setCustomLines(customLines.filter(c => c.id !== id));
  };

  // Calculations
  const basePrice = basePackage === "custom" ? customBasePrice : packages[basePackage].price;

  const addonsTotal = useMemo(() => {
    return addons
      .filter(a => a.selected && a.id !== "maintenance")
      .reduce((sum, a) => sum + (a.hasQuantity ? a.price * (a.quantity || 1) : a.price), 0);
  }, [addons]);

  const customLinesTotal = useMemo(() => {
    return customLines.reduce((sum, c) => sum + c.price, 0);
  }, [customLines]);

  const subtotal = Math.max(0, basePrice + addonsTotal + customLinesTotal - discount);
  const vatAmount = includeVat ? subtotal * 0.25 : 0;
  const totalOneTime = subtotal + vatAmount;

  const monthlyMaintenance = addons.find(a => a.id === "maintenance" && a.selected)?.price || 0;

  // Generate clean quote text
  const quoteText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`TILBUD FRA BY MARI (bymari.no)`);
    lines.push(`Dato: ${new Date().toLocaleDateString("no-NO")}`);
    if (client) {
      lines.push(`Kunde: ${client.name}${client.company ? " (" + client.company + ")" : ""}`);
      lines.push(`E-post: ${client.email}`);
    }
    lines.push(`--------------------------------------------------`);
    lines.push(`LEVERANSE:`);
    lines.push(`• ${packages[basePackage].name}: kr ${basePrice.toLocaleString("no-NO")},-`);
    
    addons.filter(a => a.selected && a.id !== "maintenance").forEach(a => {
      if (a.hasQuantity) {
        lines.push(`• ${a.name} (${a.quantity} stk): kr ${(a.price * (a.quantity || 1)).toLocaleString("no-NO")},-`);
      } else {
        lines.push(`• ${a.name}: kr ${a.price.toLocaleString("no-NO")},-`);
      }
    });

    customLines.forEach(c => {
      lines.push(`• ${c.name}: kr ${c.price.toLocaleString("no-NO")},-`);
    });

    if (discount > 0) {
      lines.push(`• Rabatt: - kr ${discount.toLocaleString("no-NO")},-`);
    }

    lines.push(`--------------------------------------------------`);
    lines.push(`SUM EKS. MVA: kr ${subtotal.toLocaleString("no-NO")},-`);
    if (includeVat) {
      lines.push(`MVA (25%): kr ${vatAmount.toLocaleString("no-NO")},-`);
      lines.push(`TOTALT Å BETALE: kr ${totalOneTime.toLocaleString("no-NO")},-`);
    } else {
      lines.push(`TOTALPRIS: kr ${totalOneTime.toLocaleString("no-NO")},- (MVA-fritak under beløpsgrense)`);
    }

    if (monthlyMaintenance > 0) {
      lines.push(`Valgfri månedlig drift & oppfølging: kr ${monthlyMaintenance.toLocaleString("no-NO")},- / mnd`);
    }

    lines.push(`--------------------------------------------------`);
    lines.push(`VILKÅR & FREMDRIFT:`);
    lines.push(`• Estimert leveringstid: ${deliveryTime}`);
    lines.push(`• Betalingsplan: 50% ved oppstart, 50% ved ferdigstillelse og overlevering`);
    lines.push(`• Tilbudet er gyldig i ${validityDays} dager fra tilbudsdato`);
    lines.push(``);
    lines.push(`Med vennlig hilsen,`);
    lines.push(`by mari • hei@bymari.no • bymari.no`);

    return lines.join("\n");
  }, [basePackage, basePrice, addons, customLines, discount, subtotal, vatAmount, totalOneTime, monthlyMaintenance, deliveryTime, validityDays, includeVat, client]);

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToClient = async () => {
    if (!client) return;
    
    // Add internal note with quote
    await dataStore.addClientNote(
      client.id,
      `Pristilbud opprettet:\n${quoteText}`,
      "Mari"
    );

    // Update status to "Tilbud sendt"
    await dataStore.updateClient(client.id, {
      status: "Tilbud sendt",
      next_activity_date: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString()
    });

    setSavedMessage("Tilbudet er lagret på kunden, og status er oppdatert til «Tilbud sendt»!");
    setTimeout(() => setSavedMessage(""), 4000);
    if (onSaved) onSaved();
  };

  return (
    <div className="bg-white border border-sand p-6 sm:p-8 rounded-sm shadow-sm space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-sand gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-forest-green" />
            <h2 className="text-xl font-medium text-charcoal">Priskalkulator & Tilbudsbygger</h2>
          </div>
          <p className="text-xs text-charcoal/60 mt-1">
            {client ? `Kalkuler og send skreddersydd pristilbud til ${client.name}` : "Sett sammen estimat og pristilbud for oppdrag"}
          </p>
        </div>

        {savedMessage && (
          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configurator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Base Package */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-3">
              1. Velg grunnpakke
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(packages).map(([key, pkg]) => (
                <div
                  key={key}
                  onClick={() => setBasePackage(key)}
                  className={`p-4 border rounded-sm cursor-pointer transition-all ${
                    basePackage === key
                      ? "border-forest-green bg-forest-green-light/40 shadow-xs ring-1 ring-forest-green"
                      : "border-sand hover:border-forest-green/50 bg-warm-white/40"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-charcoal">{pkg.name}</p>
                    <span className="text-xs font-mono font-medium text-forest-green shrink-0 ml-2">
                      kr {pkg.price.toLocaleString("no-NO")},-
                    </span>
                  </div>
                  <p className="text-xs text-charcoal/65 mt-1.5 leading-relaxed">{pkg.desc}</p>
                </div>
              ))}
            </div>

            {basePackage === "custom" && (
              <div className="mt-3 p-3 bg-warm-white border border-sand rounded-sm flex items-center space-x-3">
                <span className="text-xs text-charcoal/70">Grunnpris for prosjektet:</span>
                <input
                  type="number"
                  value={customBasePrice}
                  onChange={(e) => setCustomBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-1 bg-white border border-sand rounded-sm text-sm font-mono focus:outline-none focus:border-forest-green"
                />
                <span className="text-xs font-mono">kr</span>
              </div>
            )}
          </div>

          {/* 2. Add-ons / Modules */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-3">
              2. Tilleggsmoduler & tjenester
            </label>
            <div className="space-y-2.5">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className={`p-3.5 border rounded-sm flex items-center justify-between transition-colors ${
                    addon.selected ? "border-forest-green bg-forest-green-light/30" : "border-sand/70 bg-warm-white/20"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`addon-${addon.id}`}
                      checked={addon.selected}
                      onChange={() => toggleAddon(addon.id)}
                      className="mt-1 rounded-xs text-forest-green focus:ring-forest-green border-sand"
                    />
                    <div>
                      <label htmlFor={`addon-${addon.id}`} className="text-sm font-medium text-charcoal cursor-pointer">
                        {addon.name}
                      </label>
                      <p className="text-xs text-charcoal/60">{addon.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 ml-3">
                    {addon.hasQuantity && addon.selected && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-charcoal/60">Antall:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={addon.quantity || 1}
                          onChange={(e) => updateAddonQty(addon.id, parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-0.5 bg-white border border-sand rounded-sm text-xs text-center font-mono focus:outline-none focus:border-forest-green"
                        />
                      </div>
                    )}
                    <span className="text-xs font-mono text-charcoal/80 font-medium">
                      + kr {(addon.hasQuantity && addon.selected ? addon.price * (addon.quantity || 1) : addon.price).toLocaleString("no-NO")},-
                      {addon.id === "maintenance" && "/mnd"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Custom line items */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium">
              3. Egendefinerte linjer (valgfritt)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Beskrivelse av spesialtillegg..."
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs focus:outline-none focus:border-forest-green"
              />
              <input
                type="number"
                placeholder="Beløp"
                value={newCustomPrice}
                onChange={(e) => setNewCustomPrice(e.target.value)}
                className="w-24 px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs font-mono focus:outline-none focus:border-forest-green"
              />
              <button
                type="button"
                onClick={addCustomLine}
                className="px-3 py-1.5 bg-warm-white border border-sand hover:bg-sand/30 text-xs font-medium rounded-sm flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Legg til</span>
              </button>
            </div>

            {customLines.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {customLines.map((c) => (
                  <div key={c.id} className="p-2 bg-white border border-sand rounded-sm flex items-center justify-between text-xs">
                    <span>{c.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">+ kr {c.price.toLocaleString("no-NO")},-</span>
                      <button
                        type="button"
                        onClick={() => removeCustomLine(c.id)}
                        className="text-charcoal/40 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Terms & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-sand/40">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-medium mb-1">
                Rabatt (kr)
              </label>
              <input
                type="number"
                value={discount || ""}
                placeholder="0"
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs font-mono focus:outline-none focus:border-forest-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-medium mb-1">
                Leveringstid
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs focus:outline-none focus:border-forest-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-medium mb-1">
                Gyldighet (dager)
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 14)}
                className="w-full px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs font-mono focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Price Summary & Actions (5 cols) */}
        <div className="lg:col-span-5 bg-warm-white border border-sand p-6 rounded-sm space-y-6 sticky top-8">
          <div className="border-b border-sand pb-4">
            <span className="text-xs uppercase tracking-wider text-sage-dark font-mono font-medium block mb-1">
              Beregnet tilbud
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-light text-charcoal tracking-tight">
                kr {totalOneTime.toLocaleString("no-NO")},-
              </span>
              <span className="text-xs text-charcoal/60">
                {includeVat ? "inkl. mva" : "eks. mva"}
              </span>
            </div>
            {monthlyMaintenance > 0 && (
              <p className="text-xs text-forest-green font-medium mt-1">
                + kr {monthlyMaintenance.toLocaleString("no-NO")},- per mnd (drift)
              </p>
            )}
          </div>

          {/* Line items summary */}
          <div className="space-y-2 text-xs text-charcoal/80">
            <div className="flex justify-between py-1 border-b border-sand/40">
              <span>{packages[basePackage].name}</span>
              <span className="font-mono">kr {basePrice.toLocaleString("no-NO")},-</span>
            </div>

            {addons.filter(a => a.selected && a.id !== "maintenance").map(a => (
              <div key={a.id} className="flex justify-between py-1 border-b border-sand/40">
                <span>{a.name} {a.hasQuantity ? `(${a.quantity} stk)` : ""}</span>
                <span className="font-mono">kr {(a.hasQuantity ? a.price * (a.quantity || 1) : a.price).toLocaleString("no-NO")},-</span>
              </div>
            ))}

            {customLines.map(c => (
              <div key={c.id} className="flex justify-between py-1 border-b border-sand/40">
                <span>{c.name}</span>
                <span className="font-mono">kr {c.price.toLocaleString("no-NO")},-</span>
              </div>
            ))}

            {discount > 0 && (
              <div className="flex justify-between py-1 text-emerald-800 font-medium">
                <span>Rabatt</span>
                <span className="font-mono">- kr {discount.toLocaleString("no-NO")},-</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleCopyQuote}
              className="w-full py-2.5 bg-white border border-sand hover:bg-sand/30 text-charcoal text-xs font-medium rounded-sm transition-colors flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-forest-green" />
                  <span>Tilbudstekst kopiert til utklippstavle!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-forest-green" />
                  <span>Kopier formatert tilbudstekst</span>
                </>
              )}
            </button>

            {client && (
              <button
                type="button"
                onClick={handleSaveToClient}
                className="w-full py-2.5 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lagre tilbud på kunden i CRM</span>
              </button>
            )}
          </div>

          {/* Preview collapsible textarea */}
          <div className="pt-2">
            <details className="text-xs text-charcoal/70 group">
              <summary className="cursor-pointer font-medium hover:text-charcoal flex items-center justify-between">
                <span>Vis råtekst for tilbudet</span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-forest-green">Forhåndsvis</span>
              </summary>
              <textarea
                readOnly
                rows={10}
                value={quoteText}
                className="w-full mt-3 p-3 bg-white border border-sand rounded-sm text-[11px] font-mono text-charcoal leading-relaxed resize-none focus:outline-none select-all"
              />
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
