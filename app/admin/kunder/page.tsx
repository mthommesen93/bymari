"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Modal } from "@/components/admin/Modal";
import { dataStore } from "@/lib/store";
import { Client, ClientStatus } from "@/lib/types";
import { Search, Plus, Filter, Mail, Phone, Building, ArrowRight, UserCheck } from "lucide-react";

export default function KunderPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Client Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "Ny" as ClientStatus,
    requested_service: "Nettsider",
    internal_notes: "",
    next_activity_date: ""
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const json = await res.json();
      let data: Client[] = json.clients || [];

      if (showArchived) {
        data = data.filter(c => c.is_archived);
      } else {
        data = data.filter(c => !c.is_archived);
      }

      if (selectedStatus !== "Alle") {
        data = data.filter(c => c.status === selectedStatus);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        data = data.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          (c.requested_service && c.requested_service.toLowerCase().includes(q))
        );
      }

      setClients(data);
    } catch {
      const fallback = await dataStore.getClients();
      setClients(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [selectedStatus, showArchived, searchQuery]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company || null,
          email: formData.email,
          phone: formData.phone || null,
          status: formData.status,
          requested_service: formData.requested_service || null,
          internal_notes: formData.internal_notes || null,
          next_activity_date: formData.next_activity_date ? new Date(formData.next_activity_date).toISOString() : null,
          is_archived: false
        })
      });
    } catch (e) {
      await dataStore.createClient({ ...formData, is_archived: false });
    }

    setIsCreateModalOpen(false);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "Ny",
      requested_service: "Nettsider",
      internal_notes: "",
      next_activity_date: ""
    });
    loadClients();
  };

  const statusTabs = ["Alle", "Ny", "Kontaktet", "Møte avtalt", "Tilbud sendt", "Aktiv kunde", "Avsluttet"];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Kundehåndtering"
        description="Oversikt over alle potensielle og aktive kunder, prosjektstatus og oppfølging."
        action={{
          label: "Opprett ny kunde",
          onClick: () => setIsCreateModalOpen(true)
        }}
      />

      {/* Search & Filter Bar */}
      <div className="bg-white border border-sand p-4 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Søk på navn, virksomhet, e-post eller tjeneste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-warm-white border border-sand rounded-sm text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest-green"
            />
          </div>

          {/* Archive Toggle */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
                showArchived
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-charcoal/70 border-sand hover:bg-sand/20"
              }`}
            >
              {showArchived ? "Viser arkiverte" : "Vis arkiv"}
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-sand/40">
          {statusTabs.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? "bg-forest-green text-warm-white"
                  : "bg-warm-white text-charcoal/70 hover:text-charcoal hover:bg-sand/30"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-sand rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-charcoal/60 font-mono">
            Henter kunder...
          </div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <UserCheck className="w-8 h-8 text-charcoal/30 mx-auto" />
            <p className="text-sm font-medium text-charcoal">Ingen kunder funnet</p>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              {searchQuery ? "Prøv å endre søkeord eller statusfilter." : "Opprett din første kunde for å komme i gang."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-sand text-xs uppercase tracking-wider text-charcoal/60 font-mono font-normal">
                <tr>
                  <th className="py-3 px-4">Kunde & Virksomhet</th>
                  <th className="py-3 px-4">Kontakt</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ønsket tjeneste</th>
                  <th className="py-3 px-4">Neste oppfølging</th>
                  <th className="py-3 px-4 text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-sand/10 transition-colors group">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/kunder/${client.id}`}
                        className="font-medium text-charcoal hover:text-forest-green transition-colors block"
                      >
                        {client.name}
                      </Link>
                      {client.company && (
                        <span className="text-xs text-charcoal/60 flex items-center space-x-1 mt-0.5">
                          <Building className="w-3 h-3 inline shrink-0" />
                          <span>{client.company}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-charcoal/75 space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Mail className="w-3 h-3 text-charcoal/50" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3 h-3 text-charcoal/50" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-charcoal/80">
                      {client.requested_service || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-charcoal/70 font-mono">
                      {client.next_activity_date
                        ? new Date(client.next_activity_date).toLocaleDateString("no-NO", {
                            day: "numeric",
                            month: "short"
                          })
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/kunder/${client.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-forest-green hover:underline"
                      >
                        <span>Vis detaljer</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Opprett ny kunde */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Opprett ny kunde"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Navn <span className="text-forest-green">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="F.eks. Henrik Solberg"
                className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Virksomhet
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="F.eks. Nordic Light Kaffe"
                className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                E-post <span className="text-forest-green">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="henrik@nordiclight.no"
                className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+47 900 00 000"
                className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              >
                <option value="Ny">Ny</option>
                <option value="Kontaktet">Kontaktet</option>
                <option value="Møte avtalt">Møte avtalt</option>
                <option value="Tilbud sendt">Tilbud sendt</option>
                <option value="Aktiv kunde">Aktiv kunde</option>
                <option value="Avsluttet">Avsluttet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Ønsket tjeneste
              </label>
              <input
                type="text"
                value={formData.requested_service}
                onChange={(e) => setFormData({ ...formData, requested_service: e.target.value })}
                placeholder="F.eks. Nettsider"
                className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
              Neste aktivitet / oppfølgingsdato
            </label>
            <input
              type="date"
              value={formData.next_activity_date}
              onChange={(e) => setFormData({ ...formData, next_activity_date: e.target.value })}
              className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
              Interne notater
            </label>
            <textarea
              rows={3}
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              placeholder="Interne kommentarer om kunden eller prosjektet..."
              className="w-full px-3.5 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y"
            />
          </div>

          <div className="pt-4 border-t border-sand flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal/70 hover:bg-sand/30 rounded-sm"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-forest-green hover:bg-forest-green-hover text-warm-white rounded-sm transition-colors"
            >
              Opprett kunde
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
