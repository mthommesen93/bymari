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

  // Send Quote Email Modal State
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(client?.id || "");
  const [recipientName, setRecipientName] = useState<string>(client?.name || "");
  const [recipientEmail, setRecipientEmail] = useState<string>(client?.email || "");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailIntro, setEmailIntro] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessResult, setSendSuccessResult] = useState<{ quote: any; url: string } | null>(null);

  // Sync recipient when client prop changes
  React.useEffect(() => {
    if (client) {
      setSelectedRecipientId(client.id);
      setRecipientName(client.name);
      setRecipientEmail(client.email);
    }
  }, [client]);

  // Load clients list if needed for picker
  React.useEffect(() => {
    async function loadAllClients() {
      try {
        const c = await dataStore.getClients();
        setAllClients(c);
      } catch (err) {
        console.warn("Failed loading clients in calculator:", err);
      }
    }
    loadAllClients();
  }, []);

  const openSendModal = () => {
    const pkgName = packages[basePackage]?.name || "Skreddersydd prosjekt";
    const name = client?.name || recipientName || "kunde";
    setEmailSubject(`Pristilbud fra by mari: ${pkgName}`);
    setEmailIntro(`Hei ${name},\n\nTakk for en hyggelig samtale om prosjektet ditt! Her er det skreddersydde pristilbudet med spesifikasjon av leveransen og betingelser.`);
    setSendSuccessResult(null);
    setIsSendModalOpen(true);
  };

  const handleRecipientSelect = (clientId: string) => {
    setSelectedRecipientId(clientId);
    const matched = allClients.find(c => c.id === clientId);
    if (matched) {
      setRecipientName(matched.name);
      setRecipientEmail(matched.email);
      const pkgName = packages[basePackage]?.name || "Skreddersydd prosjekt";
      setEmailIntro(`Hei ${matched.name},\n\nTakk for en hyggelig samtale om prosjektet ditt! Her er det skreddersydde pristilbudet med spesifikasjon av leveransen og betingelser.`);
    }
  };

  const handleSendQuoteEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientName.trim()) {
      alert("Vennligst oppgi navn og e-postadresse til mottaker.");
      return;
    }

    setIsSending(true);
    try {
      const selectedAddons = addons
        .filter(a => a.selected && a.id !== "maintenance")
        .map(a => ({
          name: a.name,
          price: a.price,
          quantity: a.hasQuantity ? (a.quantity || 1) : 1
        }));

      const res = await fetch("/api/quotes/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedRecipientId || null,
          clientName: recipientName.trim(),
          clientEmail: recipientEmail.trim(),
          packageName: packages[basePackage].name,
          basePrice,
          addons: selectedAddons,
          customLines,
          discount,
          subtotal,
          vatAmount,
          totalPrice: totalOneTime,
          monthlyPrice: monthlyMaintenance,
          deliveryTime,
          validityDays,
          emailSubject,
          emailIntro,
          sendEmailDirectly: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Kunne ikke sende pristilbudet.");
      }

      setSendSuccessResult({
        quote: data.quote,
        url: `${window.location.origin}/tilbud/${data.quote.token}`
      });

      setSavedMessage(`Pristilbudet er sendt til ${recipientEmail}!`);
      setTimeout(() => setSavedMessage(""), 5000);
      if (onSaved) onSaved();
    } catch (err: any) {
      alert(err.message || "Det oppstod en feil under sending av tilbud.");
    } finally {
      setIsSending(false);
    }
  };

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
              onClick={openSendModal}
              className="w-full py-3 bg-[#34463B] hover:bg-[#28372E] text-white text-xs font-semibold rounded-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Send pristilbud til kunde per e-post</span>
            </button>

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
                className="w-full py-2.5 bg-sand/30 hover:bg-sand/50 text-charcoal text-xs font-medium border border-sand rounded-sm transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lagre kun som internt notat i CRM</span>
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

      {/* SEND QUOTE MODAL */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#DED7CB] rounded-sm shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#34463B] font-semibold">
                  E-postutsending
                </span>
                <h2 className="text-xl font-medium text-[#20211F] mt-1">
                  Send pristilbud til kunde
                </h2>
              </div>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {sendSuccessResult ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-sm font-semibold">Pristilbudet er sendt!</p>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    E-post med interaktive aksept-/avvisningsknapper er sendt til <strong>{recipientEmail}</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-[#F7F5F0] border border-[#DED7CB] rounded-sm space-y-2">
                  <label className="block text-[11px] uppercase font-mono tracking-wider text-[#877B6C] font-semibold">
                    Direkte lenke til kundens tilbudsside:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={sendSuccessResult.url}
                      className="flex-1 px-3 py-1.5 bg-white border border-[#DED7CB] rounded-sm text-xs font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(sendSuccessResult.url);
                        alert("Lenke kopiert til utklippstavlen!");
                      }}
                      className="px-3 py-1.5 bg-[#34463B] text-white text-xs font-medium rounded-sm hover:bg-[#28372E] shrink-0"
                    >
                      Kopier lenke
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSendModalOpen(false);
                      setSendSuccessResult(null);
                    }}
                    className="px-5 py-2 bg-[#34463B] text-white text-xs font-medium rounded-sm hover:bg-[#28372E]"
                  >
                    Lukk vindu
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendQuoteEmail} className="space-y-4">
                {/* Summary Pill */}
                <div className="p-3.5 bg-[#F7F5F0] border border-[#DED7CB] rounded-sm flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#20211F]">{packages[basePackage].name}</span>
                    <p className="text-[#877B6C] text-[11px]">Leveringstid: {deliveryTime} • Gyldighet: {validityDays} dager</p>
                  </div>
                  <span className="text-base font-mono font-semibold text-[#34463B]">
                    kr {totalOneTime.toLocaleString("no-NO")},-
                  </span>
                </div>

                {/* Recipient select or manual */}
                {allClients.length > 0 && !client && (
                  <div>
                    <label className="block text-xs font-medium text-[#20211F] mb-1">
                      Velg eksisterende kunde fra CRM (valgfritt)
                    </label>
                    <select
                      value={selectedRecipientId}
                      onChange={(e) => handleRecipientSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-warm-white border border-[#DED7CB] rounded-sm text-xs font-medium text-[#20211F] focus:outline-none focus:border-[#34463B]"
                    >
                      <option value="">-- Velg kunde eller skriv inn manuelt nedenfor --</option>
                      {allClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.company ? `(${c.company})` : ""} - {c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#20211F] mb-1">
                      Kundenavn *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Ola Nordmann"
                      className="w-full px-3 py-2 bg-warm-white border border-[#DED7CB] rounded-sm text-xs focus:outline-none focus:border-[#34463B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#20211F] mb-1">
                      Mottakers e-postadresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="kunde@bedrift.no"
                      className="w-full px-3 py-2 bg-warm-white border border-[#DED7CB] rounded-sm text-xs focus:outline-none focus:border-[#34463B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20211F] mb-1">
                    E-postemne *
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-white border border-[#DED7CB] rounded-sm text-xs focus:outline-none focus:border-[#34463B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20211F] mb-1">
                    Personlig hilsen / introduksjon i e-posten
                  </label>
                  <textarea
                    rows={4}
                    value={emailIntro}
                    onChange={(e) => setEmailIntro(e.target.value)}
                    placeholder="Skriv en personlig innledning..."
                    className="w-full p-3 bg-warm-white border border-[#DED7CB] rounded-sm text-xs focus:outline-none focus:border-[#34463B] leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-warm-white border border-[#DED7CB] rounded-sm text-[11px] text-[#4A4B48] leading-relaxed space-y-1">
                  <p className="font-semibold text-[#20211F]">✨ Interaktiv e-post med svarknapper:</p>
                  <p>
                    E-posten sendes fra <strong>hei@bymari.no</strong> med profesjonell spesifikasjonstabell og to direkte svarknapper: <strong>«Aksepter tilbud»</strong> og <strong>«Avvis tilbud»</strong>.
                  </p>
                  <p>
                    Når kunden aksepterer, oppdateres status i CRM automatisk til <strong>«Aktiv kunde»</strong>, og du mottar et e-postvarsel umiddelbart.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DED7CB] flex items-center justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setIsSendModalOpen(false)}
                    className="px-4 py-2 border border-[#DED7CB] text-xs font-medium text-[#737470] hover:text-[#20211F] rounded-sm"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !recipientName.trim() || !recipientEmail.trim()}
                    className="px-6 py-2 bg-[#34463B] hover:bg-[#28372E] text-white text-xs font-semibold rounded-sm transition-colors disabled:opacity-60 flex items-center space-x-1.5 shadow-sm"
                  >
                    {isSending ? (
                      <span>Sender tilbud...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send tilbud nå</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
