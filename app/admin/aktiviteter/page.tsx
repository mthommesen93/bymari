"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { dataStore } from "@/lib/store";
import { Activity } from "@/lib/types";
import { 
  Activity as ActivityIcon, 
  Clock, 
  Send, 
  Eye, 
  CheckCircle2, 
  UserPlus, 
  MessageSquare, 
  FileText,
  Filter
} from "lucide-react";

export default function AktiviteterPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterType, setFilterType] = useState<string>("Alle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const acts = await dataStore.getActivities(100);
      setActivities(acts);
      setLoading(false);
    }
    load();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "contact_inquiry":
      case "client_created":
        return <UserPlus className="w-4 h-4 text-forest-green" />;
      case "form_sent":
        return <Send className="w-4 h-4 text-blue-600" />;
      case "form_opened":
        return <Eye className="w-4 h-4 text-amber-600" />;
      case "form_submitted":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "note_added":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "form_created":
      case "form_published":
        return <FileText className="w-4 h-4 text-stone-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-charcoal/60" />;
    }
  };

  const filterOptions = [
    { label: "Alle hendelser", value: "Alle" },
    { label: "Henvendelser & Kunder", value: "client" },
    { label: "Utsendelser", value: "form_sent" },
    { label: "Innsendinger", value: "form_submitted" },
    { label: "Notater", value: "note_added" }
  ];

  const filtered = activities.filter(a => {
    if (filterType === "Alle") return true;
    if (filterType === "client") return a.event_type.includes("client") || a.event_type === "contact_inquiry";
    return a.event_type === filterType;
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Aktivitetslogg"
        description="Komplett tidslinje over hendelser, skjemautsendelser, kundeoppdateringer og henvendelser."
      />

      {/* Filter Tabs */}
      <div className="bg-white border border-sand p-4 rounded-sm flex items-center space-x-2 overflow-x-auto">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilterType(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
              filterType === opt.value
                ? "bg-forest-green text-warm-white"
                : "bg-warm-white text-charcoal/70 hover:text-charcoal hover:bg-sand/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline Card */}
      <div className="bg-white border border-sand rounded-sm p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-charcoal/60 font-mono">
            Henter aktivitetslogg...
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-charcoal/60">
            Ingen aktiviteter funnet i denne kategorien.
          </p>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand">
            {filtered.map((act) => (
              <div key={act.id} className="relative group">
                {/* Icon bubble */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-sand flex items-center justify-center -translate-x-1/2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-green"></span>
                </div>

                <div className="bg-warm-white/40 border border-sand/60 p-4 rounded-sm space-y-1.5 transition-colors group-hover:border-forest-green/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getEventIcon(act.event_type)}
                      <span className="text-xs uppercase tracking-wider text-charcoal/60 font-mono font-medium">
                        {act.event_type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-charcoal/50 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(act.created_at).toLocaleDateString("no-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-charcoal font-normal leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
