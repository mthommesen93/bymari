"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dataStore } from "@/lib/store";
import { DashboardMetrics, Client, Activity, Submission } from "@/lib/types";
import { 
  Users, 
  UserPlus, 
  Send, 
  Inbox, 
  Calendar, 
  ArrowRight, 
  Plus, 
  FileText,
  Clock
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let clientsList: Client[] = [];
        let submissionsList: Submission[] = [];
        let distributionsList: any[] = [];

        try {
          const [cRes, sRes, dRes] = await Promise.all([
            fetch("/api/clients"),
            fetch("/api/forms/submissions"),
            fetch("/api/forms/distribute")
          ]);
          if (cRes.ok) {
            const cJson = await cRes.json();
            if (cJson.clients) clientsList = cJson.clients;
          }
          if (sRes.ok) {
            const sJson = await sRes.json();
            if (sJson.submissions) submissionsList = sJson.submissions;
          }
          if (dRes.ok) {
            const dJson = await dRes.json();
            if (dJson.distributions) distributionsList = dJson.distributions;
          }
        } catch {}

        if (clientsList.length === 0) clientsList = await dataStore.getClients();
        if (submissionsList.length === 0) submissionsList = await dataStore.getSubmissions();
        if (distributionsList.length === 0) distributionsList = await dataStore.getDistributions();

        const act = await dataStore.getActivities(6);

        const activeClientsCount = clientsList.filter(c => !c.is_archived && c.status === "Aktiv kunde").length;
        const newLeadsCount = clientsList.filter(c => !c.is_archived && c.status === "Ny").length;
        const awaitingFormsCount = distributionsList.filter(d => d.status === "sent" || d.status === "opened").length;
        const newResponsesCount = submissionsList.filter(s => s.status === "new").length;
        const upcomingFollowupsCount = clientsList.filter(c => c.next_activity_date && new Date(c.next_activity_date) >= new Date()).length;

        setMetrics({
          activeClientsCount,
          newLeadsCount,
          awaitingFormsCount,
          newResponsesCount,
          upcomingFollowupsCount
        });
        setRecentClients(clientsList.slice(0, 4));
        setRecentSubmissions(submissionsList.slice(0, 3));
        setActivities(act);
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center text-sm text-charcoal/60 font-mono">
        Laster oversikt...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <AdminHeader
        title="Oversikt"
        description="Sanntidsoversikt over kunder, skjemaflyt og innkomne svar for by mari."
      >
        <Link
          href="/admin/skjemaer/ny"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-charcoal bg-white border border-sand hover:bg-sand/20 rounded-sm transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-forest-green" />
          <span>Nytt skjema</span>
        </Link>
      </AdminHeader>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          label="Aktive kunder"
          value={metrics.activeClientsCount}
          sublabel="Pågående oppdrag"
          icon={Users}
          href="/admin/kunder?status=Aktiv+kunde"
        />
        <StatCard
          label="Nye henvendelser"
          value={metrics.newLeadsCount}
          sublabel="Venter oppfølging"
          icon={UserPlus}
          href="/admin/kunder?status=Ny"
        />
        <StatCard
          label="Venter på svar"
          value={metrics.awaitingFormsCount}
          sublabel="Utsendte skjemaer"
          icon={Send}
          href="/admin/skjemaer"
        />
        <StatCard
          label="Nye svar"
          value={metrics.newResponsesCount}
          sublabel="Uleste innsendinger"
          icon={Inbox}
          href="/admin/svar?status=new"
        />
        <StatCard
          label="Kommende oppgaver"
          value={metrics.upcomingFollowupsCount}
          sublabel="Planlagte aktiviteter"
          icon={Calendar}
          href="/admin/kunder"
        />
      </div>

      {/* Main Split: Left (Clients & Submissions), Right (Activity Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Leads / Customers */}
          <div className="bg-white border border-sand rounded-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
              <h2 className="text-base font-medium text-charcoal">Siste kunder og henvendelser</h2>
              <Link
                href="/admin/kunder"
                className="text-xs font-medium text-forest-green hover:underline inline-flex items-center space-x-1"
              >
                <span>Se alle kunder</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentClients.length === 0 ? (
              <p className="text-sm text-charcoal/60 py-6 text-center">Ingen registrerte kunder ennå.</p>
            ) : (
              <div className="divide-y divide-sand/60">
                {recentClients.map((client) => (
                  <div key={client.id} className="py-3.5 flex items-center justify-between group">
                    <div className="space-y-0.5">
                      <Link
                        href={`/admin/kunder/${client.id}`}
                        className="text-sm font-medium text-charcoal hover:text-forest-green transition-colors"
                      >
                        {client.name}
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-charcoal/60">
                        {client.company && <span>{client.company}</span>}
                        {client.company && <span>&bull;</span>}
                        <span>{client.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={client.status} />
                      <Link
                        href={`/admin/kunder/${client.id}`}
                        className="text-xs text-charcoal/50 group-hover:text-forest-green transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Form Submissions */}
          <div className="bg-white border border-sand rounded-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
              <h2 className="text-base font-medium text-charcoal">Siste mottatte skjemasvar</h2>
              <Link
                href="/admin/svar"
                className="text-xs font-medium text-forest-green hover:underline inline-flex items-center space-x-1"
              >
                <span>Åpne svarinnboks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-charcoal/60 py-6 text-center">Ingen mottatte skjemasvar ennå.</p>
            ) : (
              <div className="divide-y divide-sand/60">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="py-3.5 flex items-center justify-between group">
                    <div className="space-y-0.5">
                      <Link
                        href={`/admin/svar/${sub.id}`}
                        className="text-sm font-medium text-charcoal hover:text-forest-green transition-colors"
                      >
                        {sub.form?.title || "Skjema"}
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-charcoal/60">
                        <span>Fra: {sub.client?.name || "Anonym"}</span>
                        <span>&bull;</span>
                        <span>{new Date(sub.submitted_at).toLocaleDateString("no-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={sub.status} />
                      <Link
                        href={`/admin/svar/${sub.id}`}
                        className="text-xs text-charcoal/50 group-hover:text-forest-green transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) - Live Activity Timeline */}
        <div className="lg:col-span-4 bg-white border border-sand rounded-sm p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
            <h2 className="text-base font-medium text-charcoal">Siste aktiviteter</h2>
            <Link
              href="/admin/aktiviteter"
              className="text-xs font-medium text-forest-green hover:underline"
            >
              Hele loggen
            </Link>
          </div>

          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="text-xs space-y-1 pb-3 border-b border-sand/40 last:border-0 last:pb-0">
                <p className="text-charcoal/85 leading-relaxed font-normal">
                  {act.description}
                </p>
                <div className="flex items-center space-x-1.5 text-charcoal/50 text-[11px] font-mono">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(act.created_at).toLocaleDateString("no-NO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
