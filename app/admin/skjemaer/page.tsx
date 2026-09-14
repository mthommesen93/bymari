"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dataStore } from "@/lib/store";
import { Form, FormStatus } from "@/lib/types";
import { FileText, Plus, Send, Copy, ExternalLink, Sparkles, Check, MoreVertical } from "lucide-react";

export default function SkjemaerPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
  const [loading, setLoading] = useState(true);

  const loadForms = async () => {
    setLoading(true);
    const filterOptions: any = {};
    if (selectedStatus !== "Alle") {
      filterOptions.status = selectedStatus as FormStatus;
    }
    const data = await dataStore.getForms(filterOptions);
    setForms(data);
    setLoading(false);
  };

  useEffect(() => {
    loadForms();
  }, [selectedStatus]);

  const handleDuplicate = async (form: Form) => {
    await dataStore.createForm({
      title: form.title + " (Kopi)",
      slug: form.slug + "-kopi-" + Math.random().toString(36).substring(2, 6),
      introduction: form.introduction,
      confirmation_message: form.confirmation_message,
      status: "draft",
      is_template: false,
      fields: form.fields || []
    });
    loadForms();
  };

  const statusFilters = ["Alle", "published", "draft", "archived"];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Skjemaer og spørreundersøkelser"
        description="Bygg skreddersydde oppstartsskjemaer, innholdsinnsamling og evalueringer for dine kunder."
        action={{
          label: "Nytt skjema",
          href: "/admin/skjemaer/ny"
        }}
      />

      {/* Filter Tabs */}
      <div className="bg-white border border-sand p-4 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {statusFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStatus(s)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-sm capitalize transition-colors ${
                selectedStatus === s
                  ? "bg-forest-green text-warm-white"
                  : "bg-warm-white text-charcoal/70 hover:text-charcoal hover:bg-sand/30"
              }`}
            >
              {s === "Alle" ? "Alle skjemaer" : s === "published" ? "Publiserte" : s === "draft" ? "Kladd" : "Arkivert"}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-charcoal/60 font-mono">
            Henter skjemaer...
          </div>
        ) : forms.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-sand rounded-sm space-y-3">
            <FileText className="w-8 h-8 text-charcoal/30 mx-auto" />
            <p className="text-sm font-medium text-charcoal">Ingen skjemaer funnet</p>
            <Link
              href="/admin/skjemaer/ny"
              className="inline-flex items-center space-x-1 text-xs font-medium text-forest-green hover:underline"
            >
              <span>Opprett ditt første skjema nå &rarr;</span>
            </Link>
          </div>
        ) : (
          forms.map((form) => (
            <div
              key={form.id}
              className="bg-white border border-sand p-6 rounded-sm shadow-sm flex flex-col justify-between hover:border-forest-green/40 transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <StatusBadge status={form.status} />
                  {form.is_template && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-sage-dark bg-sage-light px-2 py-0.5 rounded-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>Mal</span>
                    </span>
                  )}
                </div>

                <div>
                  <Link
                    href={`/admin/skjemaer/${form.id}`}
                    className="text-lg font-normal text-charcoal group-hover:text-forest-green transition-colors block"
                  >
                    {form.title}
                  </Link>
                  {form.introduction && (
                    <p className="mt-1 text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                      {form.introduction}
                    </p>
                  )}
                </div>

                <div className="pt-2 text-xs text-charcoal/60 font-mono flex items-center space-x-3">
                  <span>{form.fields?.length || 0} spørsmål</span>
                  <span>&bull;</span>
                  <span>
                    Oppdatert{" "}
                    {new Date(form.updated_at).toLocaleDateString("no-NO", {
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-sand/60 flex items-center justify-between">
                <Link
                  href={`/admin/skjemaer/${form.id}`}
                  className="text-xs font-medium text-charcoal hover:text-forest-green"
                >
                  Rediger &rarr;
                </Link>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(form)}
                    className="p-1.5 text-charcoal/60 hover:text-charcoal hover:bg-sand/30 rounded-sm text-xs"
                    title="Dupliser skjema"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/admin/skjemaer/${form.id}/distribuer`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send til kunde</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
