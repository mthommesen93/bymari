"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, FormField, FieldType, FormFieldOption } from "@/lib/types";
import { dataStore } from "@/lib/store";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Edit3, 
  Save, 
  Sparkles,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Calendar,
  CheckSquare,
  Radio,
  List,
  Upload,
  Info,
  CheckCircle2
} from "lucide-react";

interface FormBuilderProps {
  initialForm?: Form | null;
  isNew?: boolean;
}

export function FormBuilder({ initialForm, isNew = false }: FormBuilderProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Form>>({
    id: initialForm?.id || undefined,
    title: initialForm?.title || "Nytt spørreskjema",
    slug: initialForm?.slug || "skjema-" + Date.now().toString(36),
    introduction: initialForm?.introduction || "",
    confirmation_message: initialForm?.confirmation_message || "Tusen takk for dine svar. Jeg tar kontakt med deg for videre oppfølging.",
    status: initialForm?.status || "draft",
    is_template: initialForm?.is_template || false,
    fields: initialForm?.fields || [
      {
        id: "fld-1",
        form_id: initialForm?.id || "temp",
        field_type: "text",
        label: "Hva er virksomhetens viktigste mål?",
        description: "Beskriv kort hva du ønsker å oppnå.",
        is_required: true,
        position: 0
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Field Management Functions
  const handleAddField = (type: FieldType) => {
    const fields = formData.fields || [];
    const newField: FormField = {
      id: "fld-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
      form_id: formData.id || "temp",
      field_type: type,
      label: type === "info" ? "Viktig informasjon" : "Nytt spørsmål",
      description: "",
      is_required: type !== "info",
      position: fields.length,
      options: ["radio", "checkbox", "select"].includes(type) ? [
        { id: "opt-1", label: "Alternativ 1", value: "alt_1" },
        { id: "opt-2", label: "Alternativ 2", value: "alt_2" }
      ] : undefined
    };

    setFormData({
      ...formData,
      fields: [...fields, newField]
    });
  };

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    const fields = [...(formData.fields || [])];
    fields[index] = { ...fields[index], ...updates };
    setFormData({ ...formData, fields });
  };

  const handleDuplicateField = (index: number) => {
    const fields = [...(formData.fields || [])];
    const source = fields[index];
    const duplicated: FormField = {
      ...source,
      id: "fld-" + Date.now().toString(36),
      label: source.label + " (Kopi)",
      position: index + 1
    };
    fields.splice(index + 1, 0, duplicated);
    // Reindex positions
    fields.forEach((f, idx) => { f.position = idx; });
    setFormData({ ...formData, fields });
  };

  const handleDeleteField = (index: number) => {
    const fields = [...(formData.fields || [])];
    fields.splice(index, 1);
    fields.forEach((f, idx) => { f.position = idx; });
    setFormData({ ...formData, fields });
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const fields = [...(formData.fields || [])];
    if (direction === "up" && index > 0) {
      const temp = fields[index];
      fields[index] = fields[index - 1];
      fields[index - 1] = temp;
    } else if (direction === "down" && index < fields.length - 1) {
      const temp = fields[index];
      fields[index] = fields[index + 1];
      fields[index + 1] = temp;
    }
    fields.forEach((f, idx) => { f.position = idx; });
    setFormData({ ...formData, fields });
  };

  // Option management for radio/select/checkbox
  const handleAddOption = (fieldIndex: number) => {
    const fields = [...(formData.fields || [])];
    const target = fields[fieldIndex];
    const options = target.options || [];
    const newOpt: FormFieldOption = {
      id: "opt-" + Date.now().toString(36),
      label: "Alternativ " + (options.length + 1),
      value: "alt_" + (options.length + 1)
    };
    target.options = [...options, newOpt];
    setFormData({ ...formData, fields });
  };

  const handleUpdateOption = (fieldIndex: number, optionIndex: number, label: string) => {
    const fields = [...(formData.fields || [])];
    const target = fields[fieldIndex];
    if (target.options) {
      target.options[optionIndex].label = label;
      target.options[optionIndex].value = label.toLowerCase().replace(/\s+/g, "_");
      setFormData({ ...formData, fields });
    }
  };

  const handleDeleteOption = (fieldIndex: number, optionIndex: number) => {
    const fields = [...(formData.fields || [])];
    const target = fields[fieldIndex];
    if (target.options && target.options.length > 1) {
      target.options.splice(optionIndex, 1);
      setFormData({ ...formData, fields });
    }
  };

  // Save form
  const handleSave = async () => {
    setIsSaving(true);
    if (isNew || !formData.id) {
      const created = await dataStore.createForm(formData);
      setIsSaving(false);
      router.push(`/admin/skjemaer/${created.id}`);
    } else {
      await dataStore.updateForm(formData.id, formData);
      setIsSaving(false);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2500);
    }
  };

  const fieldTypeIcons: Record<FieldType, any> = {
    text: Type,
    textarea: AlignLeft,
    email: Mail,
    phone: Phone,
    number: Hash,
    date: Calendar,
    radio: Radio,
    checkbox: CheckSquare,
    select: List,
    file: Upload,
    info: Info
  };

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Kort tekst",
    textarea: "Lang tekst",
    email: "E-post",
    phone: "Telefon",
    number: "Tall",
    date: "Dato",
    radio: "Enkeltvalg",
    checkbox: "Flervalg",
    select: "Nedtrekksmeny",
    file: "Filopplasting",
    info: "Infotekst"
  };

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-sand">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/skjemaer"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-charcoal/70 hover:text-forest-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Skjemaoversikt</span>
          </Link>
          <span className="text-sand-dark">&bull;</span>
          <span className="text-xs uppercase tracking-wider text-charcoal/60 font-mono">
            {isNew ? "Opprett skjema" : "Rediger skjema"}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {savedNotification && (
            <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-medium animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lagret!</span>
            </span>
          )}

          {/* Mode Switcher */}
          <div className="bg-sand/30 p-0.5 rounded-sm flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm flex items-center space-x-1.5 transition-colors ${
                activeTab === "edit"
                  ? "bg-white text-charcoal shadow-xs"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Rediger</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm flex items-center space-x-1.5 transition-colors ${
                activeTab === "preview"
                  ? "bg-white text-charcoal shadow-xs"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Forhåndsvis</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors shadow-sm focus:outline-none"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Lagrer..." : "Lagre skjema"}</span>
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column: Form Meta & Fields (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Form Meta Box */}
            <div className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-4">
              <h2 className="text-xs uppercase tracking-wider text-sage-dark font-mono font-medium">
                Hovedinnstillinger
              </h2>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Skjematittel <span className="text-forest-green">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="F.eks. Prosjektoppstart & Behovsavklaring"
                  className="w-full px-3.5 py-2.5 bg-warm-white border border-sand rounded-sm text-base font-normal text-charcoal focus:outline-none focus:border-forest-green"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Introduksjonstekst for kunden
                </label>
                <textarea
                  rows={3}
                  value={formData.introduction || ""}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  placeholder="Kort tekst som forklarer hensikten med skjemaet og gir veiledning..."
                  className="w-full p-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Bekreftelsesmelding etter innsending
                </label>
                <textarea
                  rows={2}
                  value={formData.confirmation_message || ""}
                  onChange={(e) => setFormData({ ...formData, confirmation_message: e.target.value })}
                  placeholder="Takkemelding som vises til kunden når skjemaet er levert..."
                  className="w-full p-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y"
                />
              </div>
            </div>

            {/* Questions / Fields List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-charcoal">
                  Spørsmål og felter ({(formData.fields || []).length})
                </h2>
                <span className="text-xs text-charcoal/50">
                  Dra eller bruk piltastene for å endre rekkefølge
                </span>
              </div>

              {(formData.fields || []).map((field, index) => {
                const Icon = fieldTypeIcons[field.field_type] || Type;
                const isChoiceType = ["radio", "checkbox", "select"].includes(field.field_type);

                return (
                  <div
                    key={field.id || index}
                    className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-4 transition-all hover:border-forest-green/40"
                  >
                    {/* Header bar of field */}
                    <div className="flex items-center justify-between pb-3 border-b border-sand/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-sm bg-sand/30 text-charcoal/70 flex items-center justify-center text-xs font-mono">
                          {index + 1}
                        </span>
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-forest-green bg-forest-green-light px-2 py-0.5 rounded-sm">
                          <Icon className="w-3 h-3" />
                          <span>{fieldTypeLabels[field.field_type]}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMoveField(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-charcoal/50 hover:text-charcoal disabled:opacity-20 rounded-sm"
                          title="Flytt opp"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(index, "down")}
                          disabled={index === (formData.fields?.length || 1) - 1}
                          className="p-1 text-charcoal/50 hover:text-charcoal disabled:opacity-20 rounded-sm"
                          title="Flytt ned"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateField(index)}
                          className="p-1 text-charcoal/50 hover:text-charcoal rounded-sm"
                          title="Dupliser felt"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(index)}
                          className="p-1 text-red-600 hover:text-red-800 rounded-sm"
                          title="Slett felt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question text input */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                        {field.field_type === "info" ? "Overskrift / Tittel" : "Spørsmålstekst"}
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                        placeholder="F.eks. Hva er ønsket tidslinje for levering?"
                        className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
                      />
                    </div>

                    {/* Description input */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal/60 font-medium mb-1">
                        {field.field_type === "info" ? "Informasjonstekst" : "Hjelpetekst / beskrivelse (valgfri)"}
                      </label>
                      <input
                        type="text"
                        value={field.description || ""}
                        onChange={(e) => handleUpdateField(index, { description: e.target.value })}
                        placeholder="F.eks. Skriv gjerne så utfyllende du ønsker..."
                        className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-xs focus:outline-none focus:border-forest-green"
                      />
                    </div>

                    {/* Options manager if choice type */}
                    {isChoiceType && (
                      <div className="p-4 bg-warm-white/70 border border-sand/60 rounded-sm space-y-3">
                        <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium">
                          Svaralternativer
                        </label>
                        <div className="space-y-2">
                          {(field.options || []).map((opt, optIdx) => (
                            <div key={opt.id || optIdx} className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-sand-dark"></span>
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => handleUpdateOption(index, optIdx, e.target.value)}
                                className="flex-1 px-2.5 py-1 bg-white border border-sand rounded-sm text-xs focus:outline-none focus:border-forest-green"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteOption(index, optIdx)}
                                className="p-1 text-charcoal/40 hover:text-red-700"
                                title="Fjern valg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddOption(index)}
                          className="text-xs font-medium text-forest-green hover:underline inline-flex items-center space-x-1 pt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Legg til alternativ</span>
                        </button>
                      </div>
                    )}

                    {/* Required Toggle */}
                    {field.field_type !== "info" && (
                      <div className="pt-2 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`req-${field.id || index}`}
                          checked={field.is_required}
                          onChange={(e) => handleUpdateField(index, { is_required: e.target.checked })}
                          className="rounded-xs text-forest-green focus:ring-forest-green border-sand"
                        />
                        <label htmlFor={`req-${field.id || index}`} className="text-xs text-charcoal/80 cursor-pointer">
                          Dette feltet er obligatorisk å svare på
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Field Toolbox & Form Status (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            {/* Add Field Toolbox */}
            <div className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-sage-dark font-mono font-medium">
                Legg til nytt felt
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(fieldTypeLabels) as FieldType[]).map((type) => {
                  const Icon = fieldTypeIcons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddField(type)}
                      className="p-2.5 bg-warm-white border border-sand hover:bg-sand/30 text-charcoal rounded-sm text-xs font-medium flex items-center space-x-2 transition-colors text-left"
                    >
                      <Icon className="w-3.5 h-3.5 text-forest-green shrink-0" />
                      <span className="truncate">{fieldTypeLabels[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Publishing & Template Options */}
            <div className="bg-white border border-sand p-6 rounded-sm shadow-sm space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-sage-dark font-mono font-medium">
                Status og mal
              </h3>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                  Skjemastatus
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-xs font-medium text-charcoal focus:outline-none focus:border-forest-green"
                >
                  <option value="draft">Kladd (ikke publisert)</option>
                  <option value="published">Publisert (klar til utsendelse)</option>
                  <option value="archived">Arkivert</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-2 border-t border-sand/40">
                <input
                  type="checkbox"
                  id="is_template"
                  checked={formData.is_template}
                  onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                  className="rounded-xs text-forest-green focus:ring-forest-green border-sand"
                />
                <label htmlFor="is_template" className="text-xs text-charcoal/80 cursor-pointer">
                  Lagre som gjenbrukbar mal
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Customer Preview Mode */
        <div className="max-w-2xl mx-auto bg-warm-white border border-sand p-8 sm:p-12 rounded-sm shadow-md space-y-8">
          <div className="p-3 bg-sand/30 border border-sand text-xs text-charcoal/70 text-center rounded-sm">
            Dette er en direkte forhåndsvisning av hvordan skjemaet fremstår for kunden.
          </div>

          <div className="text-center pb-8 border-b border-sand space-y-3">
            <span className="text-xl tracking-brand lowercase font-normal">by mari</span>
            <h1 className="text-3xl font-light text-charcoal tracking-tight">{formData.title}</h1>
            {formData.introduction && (
              <p className="text-sm text-charcoal/80 font-light leading-relaxed max-w-lg mx-auto whitespace-pre-line">
                {formData.introduction.replace(/\\n/g, "\n")}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {(formData.fields || []).map((field, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-sm font-medium text-charcoal">
                  {field.label}
                  {field.is_required && <span className="text-forest-green ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-charcoal/60 leading-relaxed">{field.description}</p>
                )}

                {/* Simulated field inputs */}
                {field.field_type === "text" && (
                  <input
                    type="text"
                    disabled
                    placeholder="Ditt svar her..."
                    className="w-full px-4 py-2.5 bg-white border border-sand rounded-sm text-sm"
                  />
                )}

                {field.field_type === "textarea" && (
                  <textarea
                    rows={4}
                    disabled
                    placeholder="Skriv utfyllende her..."
                    className="w-full p-4 bg-white border border-sand rounded-sm text-sm"
                  />
                )}

                {field.field_type === "email" && (
                  <input
                    type="email"
                    disabled
                    placeholder="navn@epost.no"
                    className="w-full px-4 py-2.5 bg-white border border-sand rounded-sm text-sm"
                  />
                )}

                {field.field_type === "phone" && (
                  <input
                    type="tel"
                    disabled
                    placeholder="+47 000 00 000"
                    className="w-full px-4 py-2.5 bg-white border border-sand rounded-sm text-sm"
                  />
                )}

                {field.field_type === "number" && (
                  <input
                    type="number"
                    disabled
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-white border border-sand rounded-sm text-sm"
                  />
                )}

                {field.field_type === "date" && (
                  <input
                    type="date"
                    disabled
                    className="w-full px-4 py-2.5 bg-white border border-sand rounded-sm text-sm"
                  />
                )}

                {field.field_type === "radio" && (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center space-x-3 text-sm text-charcoal cursor-not-allowed">
                        <input type="radio" name={`preview-${idx}`} disabled className="text-forest-green" />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.field_type === "checkbox" && (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center space-x-3 text-sm text-charcoal cursor-not-allowed">
                        <input type="checkbox" disabled className="rounded-xs text-forest-green" />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.field_type === "select" && (
                  <select disabled className="w-full px-4 py-2.5 bg-white border border-sand rounded-sm text-sm">
                    <option>Velg et alternativ...</option>
                    {(field.options || []).map((opt, oIdx) => (
                      <option key={oIdx}>{opt.label}</option>
                    ))}
                  </select>
                )}

                {field.field_type === "file" && (
                  <div className="border-2 border-dashed border-sand p-6 text-center rounded-sm bg-white">
                    <Upload className="w-6 h-6 text-charcoal/40 mx-auto mb-2" />
                    <p className="text-xs text-charcoal/70">Klikk for å laste opp eller dra filer hit</p>
                    <p className="text-[11px] text-charcoal/40 mt-1">PDF, PNG, JPG opptil 10 MB</p>
                  </div>
                )}

                {field.field_type === "info" && (
                  <div className="p-4 bg-sand/20 border-l-2 border-forest-green rounded-r-sm text-xs text-charcoal/80 leading-relaxed">
                    {field.description || "Informasjonsblokk for kunden."}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-sand">
            <button
              type="button"
              disabled
              className="w-full py-3.5 bg-forest-green text-warm-white font-medium text-sm rounded-sm opacity-60 cursor-not-allowed"
            >
              Send inn svar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
