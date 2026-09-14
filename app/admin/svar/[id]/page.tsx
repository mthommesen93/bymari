"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dataStore } from "@/lib/store";
import { Submission, ResponseStatus } from "@/lib/types";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Paperclip, 
  CheckCircle2, 
  User, 
  Calendar, 
  MessageSquare,
  Save
} from "lucide-react";

export default function SvarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [status, setStatus] = useState<ResponseStatus>("new");
  const [loading, setLoading] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const sub = await dataStore.getSubmissionById(id);
      if (sub) {
        setSubmission(sub);
        setInternalNotes(sub.internal_notes || "");
        setStatus(sub.status);
        // Mark as read if it was new
        if (sub.status === "new") {
          await dataStore.updateSubmission(id, { status: "read" });
          setStatus("read");
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleStatusChange = async (newStatus: ResponseStatus) => {
    setStatus(newStatus);
    await dataStore.updateSubmission(id, { status: newStatus });
  };

  const handleSaveNotes = async () => {
    await dataStore.updateSubmission(id, { internal_notes: internalNotes });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !submission) {
    return (
      <div className="py-20 text-center text-xs text-charcoal/60 font-mono">
        Laster svar...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/admin/svar"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-charcoal/70 hover:text-forest-green transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tilbake til svarinnboks</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-sand hover:bg-sand/20 text-xs font-medium text-charcoal rounded-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-forest-green" />
            <span>Skriv ut / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-sand p-8 sm:p-12 rounded-sm shadow-sm space-y-8 print-page">
        {/* Header Information */}
        <div className="border-b border-sand pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-sage-dark font-mono block mb-1">
              Skjemasvar
            </span>
            <h1 className="text-2xl sm:text-3xl font-light text-charcoal tracking-tight">
              {submission.form?.title || "Skjema"}
            </h1>
            <p className="mt-1 text-sm text-charcoal/70">
              Innsendt {new Date(submission.submitted_at).toLocaleDateString("no-NO", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          <div className="no-print flex items-center space-x-3">
            <span className="text-xs uppercase tracking-wider text-charcoal/60 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ResponseStatus)}
              className="px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs font-medium text-charcoal focus:outline-none focus:border-forest-green"
            >
              <option value="new">Nytt</option>
              <option value="read">Lest</option>
              <option value="in_progress">Under behandling</option>
              <option value="completed">Ferdig</option>
            </select>
          </div>
        </div>

        {/* Client details card if linked */}
        {submission.client && (
          <div className="p-4 bg-warm-white border border-sand rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-charcoal/50 font-mono block">Kunde:</span>
              <span className="font-medium text-charcoal">{submission.client.name}</span>
              {submission.client.company && <span> ({submission.client.company})</span>}
            </div>
            <div>
              <span className="text-charcoal/50 font-mono block">E-post:</span>
              <a href={`mailto:${submission.client.email}`} className="text-forest-green underline">
                {submission.client.email}
              </a>
            </div>
            <div>
              <span className="text-charcoal/50 font-mono block">Telefon:</span>
              <span>{submission.client.phone || "Ikke oppgitt"}</span>
            </div>
          </div>
        )}

        {/* Structured Answers Section */}
        <div className="space-y-6 pt-2">
          <h2 className="text-sm uppercase tracking-wider text-charcoal/60 font-mono font-medium border-b border-sand pb-2">
            Innsendte svar
          </h2>

          <div className="space-y-6">
            {(submission.answers || []).map((ans, idx) => {
              const displayVal = Array.isArray(ans.value) ? ans.value.join(", ") : (ans.value || "—");

              return (
                <div key={ans.id || idx} className="border-b border-sand/40 pb-4 space-y-1.5 last:border-0">
                  <span className="text-xs uppercase tracking-wider text-charcoal/60 font-medium block">
                    {idx + 1}. {ans.field_label}
                  </span>
                  <div className="text-sm sm:text-base text-charcoal font-light whitespace-pre-wrap leading-relaxed">
                    {displayVal}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Uploaded Files Section */}
        {(submission.files || []).length > 0 && (
          <div className="pt-6 border-t border-sand space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-charcoal/60 font-mono font-medium">
              Opplastede vedlegg ({submission.files?.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {submission.files?.map((file, i) => (
                <div key={i} className="p-4 border border-sand rounded-sm bg-warm-white/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Paperclip className="w-4 h-4 text-forest-green shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-charcoal truncate" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <p className="text-[11px] text-charcoal/50 font-mono">
                        {(file.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Tidsbegrenset signert nedlastingslenke generert for: " + file.file_name);
                    }}
                    className="no-print text-xs text-forest-green font-medium hover:underline inline-flex items-center space-x-1 shrink-0 ml-3"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Internal Notes Box (Never exposed to customer) */}
        <div className="pt-6 border-t border-sand space-y-3 no-print">
          <div className="flex items-center justify-between">
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium">
              Interne notater om svaret (kun for administrator)
            </label>
            {savedNotification && (
              <span className="text-xs text-emerald-700 font-medium inline-flex items-center space-x-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lagret!</span>
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Skriv interne vurderinger, oppfølgingspunkter eller kommentarer her..."
            className="w-full p-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lagre interne notater</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
