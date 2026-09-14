"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dataStore } from "@/lib/store";
import { Submission, ResponseStatus } from "@/lib/types";
import { Inbox, Download, ArrowRight, Search, FileText, User, Paperclip } from "lucide-react";

export default function SvarPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    setLoading(true);
    const filterOptions: any = {};
    if (selectedStatus !== "Alle") {
      filterOptions.status = selectedStatus as ResponseStatus;
    }
    const data = await dataStore.getSubmissions(filterOptions);
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedStatus]);

  const handleExportCSV = () => {
    const headers = ["Innsendt dato", "Skjema", "Kunde", "E-post", "Status", "Antall svar"];
    const rows = submissions.map(s => [
      new Date(s.submitted_at).toISOString(),
      s.form?.title || "Skjema",
      s.client?.name || "Anonym",
      s.client?.email || "",
      s.status,
      s.answers?.length || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bymari-skjemasvar-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusFilters = [
    { label: "Alle svar", value: "Alle" },
    { label: "Nye", value: "new" },
    { label: "Leste", value: "read" },
    { label: "Under behandling", value: "in_progress" },
    { label: "Ferdig", value: "completed" }
  ];

  const filtered = submissions.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.form?.title && s.form.title.toLowerCase().includes(q)) ||
      (s.client?.name && s.client.name.toLowerCase().includes(q)) ||
      (s.client?.email && s.client.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Svar og innsendinger"
        description="Behandle mottatte spørreskjemaer, inspiser svar og administrer prosessforløpet."
      >
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-sand hover:bg-sand/30 text-charcoal text-xs font-medium rounded-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-forest-green" />
          <span>Eksporter CSV</span>
        </button>
      </AdminHeader>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-sand p-4 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Søk i svar etter skjematittel, kunde eller e-post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {statusFilters.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedStatus(s.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  selectedStatus === s.value
                    ? "bg-forest-green text-warm-white"
                    : "bg-warm-white text-charcoal/70 hover:text-charcoal hover:bg-sand/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-sand rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-charcoal/60 font-mono">
            Henter svar...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white space-y-3">
            <Inbox className="w-8 h-8 text-charcoal/30 mx-auto" />
            <p className="text-sm font-medium text-charcoal">Ingen svar funnet</p>
            <p className="text-xs text-charcoal/60">Når kunder fyller ut skjemaer, dukker svarene opp her.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-sand text-xs uppercase tracking-wider text-charcoal/60 font-mono">
              <tr>
                <th className="py-3 px-4">Skjema</th>
                <th className="py-3 px-4">Kunde</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Mottatt tidspunkt</th>
                <th className="py-3 px-4">Filer</th>
                <th className="py-3 px-4 text-right">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-sand/10 transition-colors group">
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    <Link href={`/admin/svar/${sub.id}`} className="hover:text-forest-green">
                      {sub.form?.title || "Uten tittel"}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-charcoal/80">
                    <p className="font-medium text-charcoal">{sub.client?.name || "Anonym mottaker"}</p>
                    {sub.client?.email && <p className="text-charcoal/50">{sub.client.email}</p>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-charcoal/70 font-mono">
                    {new Date(sub.submitted_at).toLocaleDateString("no-NO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-charcoal/60">
                    {(sub.files || []).length > 0 ? (
                      <span className="inline-flex items-center space-x-1 text-forest-green font-medium">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{sub.files?.length}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/svar/${sub.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-forest-green hover:underline"
                    >
                      <span>Åpne svar</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
