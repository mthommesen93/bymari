"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PriceCalculator } from "@/components/admin/PriceCalculator";
import { dataStore } from "@/lib/store";
import { Client } from "@/lib/types";

export default function KalkulatorPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await dataStore.getClients();
      setClients(c);
      setLoading(false);
    }
    load();
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Priskalkulator & Tilbudsgenerator"
        description="Kalkuler priser for nettsider og enkle applikasjoner, og generer profesjonelle tilbudsskriv til kunder."
      />

      <div className="bg-white border border-sand p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <label className="text-xs uppercase tracking-wider text-charcoal/70 font-medium">
            Knytt til kunde (valgfritt):
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs font-medium text-charcoal focus:outline-none focus:border-forest-green"
          >
            <option value="">-- Generelt tilbud (uten spesifikk kunde) --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PriceCalculator client={selectedClient} />
    </div>
  );
}
