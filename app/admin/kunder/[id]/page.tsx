"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Modal } from "@/components/admin/Modal";
import { dataStore } from "@/lib/store";
import { PriceCalculator } from "@/components/admin/PriceCalculator";
import { Client, ClientStatus, ClientNote, FormDistribution, Submission, Quote } from "@/lib/types";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  FileText, 
  Send, 
  Inbox, 
  Paperclip, 
  MessageSquare, 
  Trash2, 
  Archive, 
  Check, 
  Plus,
  ExternalLink,
  Download,
  Calculator,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

export default function KundeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [distributions, setDistributions] = useState<FormDistribution[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState<"notater" | "skjemaer" | "svar" | "tilbud" | "filer">("notater");
  const [loading, setLoading] = useState(true);

  // Note form state
  const [noteContent, setNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Edit Client Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});

  const loadClientData = async () => {
    setLoading(true);
    let c: Client | null = null;
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const json = await res.json();
        c = json.client || null;
      }
    } catch {}

    if (!c) {
      c = await dataStore.getClientById(id);
    }

    if (!c) {
      router.push("/admin/kunder");
      return;
    }

    let [n, d, s, q] = await Promise.all([
      dataStore.getClientNotes(id),
      dataStore.getDistributions({ clientId: id }),
      dataStore.getSubmissions({ clientId: id }),
      dataStore.getQuotes({ clientId: id })
    ]);

    try {
      const clientEmail = c?.email ? encodeURIComponent(c.email) : "";
      const [dRes, sRes, qRes, nRes] = await Promise.all([
        fetch(`/api/forms/distribute?clientId=${id}`),
        fetch(`/api/forms/submissions?clientId=${id}`),
        fetch(`/api/quotes/send?clientId=${id}${clientEmail ? `&email=${clientEmail}` : ""}`),
        fetch(`/api/clients/${id}/notes`)
      ]);
      if (dRes.ok) {
        const dJson = await dRes.json();
        if (dJson.distributions && dJson.distributions.length > 0) d = dJson.distributions;
      }
      if (sRes.ok) {
        const sJson = await sRes.json();
        if (sJson.submissions && sJson.submissions.length > 0) s = sJson.submissions;
      }
      if (qRes.ok) {
        const qJson = await qRes.json();
        if (qJson.quotes && qJson.quotes.length > 0) q = qJson.quotes;
      }
      if (nRes.ok) {
        const nJson = await nRes.json();
        if (nJson.notes && nJson.notes.length > 0) n = nJson.notes;
      }
    } catch {}

    setClient(c);
    setEditForm(c);
    setNotes(n);
    setDistributions(d);
    setSubmissions(s);
    setQuotes(q);
    setLoading(false);
  };

  useEffect(() => {
    loadClientData();
  }, [id]);

  const handleStatusChange = async (newStatus: ClientStatus) => {
    if (!client) return;
    const updated = await dataStore.updateClient(client.id, { status: newStatus });
    if (updated) setClient(updated);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !client) return;
    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent.trim(), authorName: "Mari" })
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [data.note, ...prev]);
      } else {
        const newNote = await dataStore.addClientNote(client.id, noteContent.trim(), "Mari");
        setNotes((prev) => [newNote, ...prev]);
      }
    } catch {
      const newNote = await dataStore.addClientNote(client.id, noteContent.trim(), "Mari");
      setNotes((prev) => [newNote, ...prev]);
    }
    setNoteContent("");
    setIsSubmittingNote(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    const updated = await dataStore.updateClient(client.id, editForm);
    if (updated) setClient(updated);
    setIsEditModalOpen(false);
  };

  const handleArchiveToggle = async () => {
    if (!client) return;
    await dataStore.archiveClient(client.id, !client.is_archived);
    loadClientData();
  };

  const handleDelete = async () => {
    if (!client) return;
    await dataStore.deleteClient(client.id);
    router.push("/admin/kunder");
  };

  if (loading || !client) {
    return (
      <div className="py-20 text-center text-xs text-charcoal/60 font-mono">
        Laster kundedetaljer...
      </div>
    );
  }

  // Collect all files from all submissions
  const allFiles = submissions.flatMap(s => (s.files || []).map(f => ({ ...f, submission: s })));

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/admin/kunder"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-charcoal/70 hover:text-forest-green transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tilbake til kundeoversikt</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-sand p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-sand">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-light text-charcoal tracking-tight">
                {client.name}
              </h1>
              {client.is_archived && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-stone-200 text-stone-700 rounded-sm">
                  Arkivert
                </span>
              )}
            </div>
            {client.company && (
              <p className="text-sm text-charcoal/70 flex items-center space-x-1.5 mt-1">
                <Building className="w-3.5 h-3.5 text-charcoal/50" />
                <span>{client.company}</span>
              </p>
            )}
          </div>

          {/* Quick Actions & Status Dropdown */}
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-charcoal/60 font-medium">Status:</span>
              <select
                value={client.status}
                onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
                className="px-3 py-1.5 bg-warm-white border border-sand rounded-sm text-xs font-medium text-charcoal focus:outline-none focus:border-forest-green"
              >
                <option value="Ny">Ny</option>
                <option value="Kontaktet">Kontaktet</option>
                <option value="Møte avtalt">Møte avtalt</option>
                <option value="Tilbud sendt">Tilbud sendt</option>
                <option value="Aktiv kunde">Aktiv kunde</option>
                <option value="Avsluttet">Avsluttet</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium bg-forest-green hover:bg-forest-green-hover text-warm-white rounded-sm transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Lag pristilbud</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium bg-warm-white border border-sand hover:bg-sand/30 rounded-sm transition-colors"
            >
              Rediger info
            </button>

            <button
              type="button"
              onClick={handleArchiveToggle}
              className="px-3 py-1.5 text-xs font-medium text-charcoal/70 hover:bg-sand/30 border border-sand rounded-sm transition-colors"
              title={client.is_archived ? "Gjenopprett" : "Arkiver"}
            >
              <Archive className="w-3.5 h-3.5 inline mr-1" />
              <span>{client.is_archived ? "Gjenopprett" : "Arkiver"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 rounded-sm transition-colors"
              title="Slett kunde"
            >
              <Trash2 className="w-3.5 h-3.5 inline" />
            </button>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-mono block mb-1">E-post</span>
            <a href={`mailto:${client.email}`} className="text-forest-green hover:underline flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{client.email}</span>
            </a>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-mono block mb-1">Telefon</span>
            <div className="text-charcoal flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-charcoal/40 shrink-0" />
              <span>{client.phone || "Ikke oppgitt"}</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-mono block mb-1">Ønsket tjeneste</span>
            <span className="text-charcoal font-medium">{client.requested_service || "Ikke spesifisert"}</span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-mono block mb-1">Neste oppfølging</span>
            <span className="text-charcoal flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-charcoal/40 shrink-0" />
              <span>
                {client.next_activity_date
                  ? new Date(client.next_activity_date).toLocaleDateString("no-NO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })
                  : "Ingen planlagt"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Client Details */}
      <div className="border-b border-sand flex items-center space-x-8">
        <button
          type="button"
          onClick={() => setActiveTab("notater")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "notater"
              ? "border-forest-green text-charcoal"
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <span className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Interne notater ({notes.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("skjemaer")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "skjemaer"
              ? "border-forest-green text-charcoal"
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <span className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Utsendte skjemaer ({distributions.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("svar")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "svar"
              ? "border-forest-green text-charcoal"
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <span className="flex items-center space-x-2">
            <Inbox className="w-4 h-4" />
            <span>Mottatte svar ({submissions.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tilbud")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "tilbud"
              ? "border-forest-green text-charcoal"
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <span className="flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Pristilbud ({quotes.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("filer")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "filer"
              ? "border-forest-green text-charcoal"
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <span className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4" />
            <span>Opplastede filer ({allFiles.length})</span>
          </span>
        </button>
      </div>

      {/* Tab 1: Interne Notater */}
      {activeTab === "notater" && (
        <div className="space-y-6">
          {/* Note Input Box */}
          <form onSubmit={handleAddNote} className="bg-white border border-sand p-6 rounded-sm space-y-3">
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium">
              Legg til et internt notat
            </label>
            <textarea
              rows={3}
              required
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Skriv referat fra møte, oppfølgingsnotat eller interne vurderinger..."
              className="w-full p-3 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green resize-y"
            />
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-charcoal/50">Kun synlig for administrator. Vises aldri for kunden.</span>
              <button
                type="submit"
                disabled={isSubmittingNote || !noteContent.trim()}
                className="px-4 py-2 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors disabled:opacity-50"
              >
                Lagre notat
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-sm text-charcoal/60 py-8 text-center bg-white border border-sand rounded-sm">
                Ingen interne notater registrert ennå.
              </p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white border border-sand p-5 rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-charcoal/60 border-b border-sand/40 pb-2">
                    <span className="font-medium text-charcoal">{note.author_name}</span>
                    <span className="font-mono">
                      {new Date(note.created_at).toLocaleDateString("no-NO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal/90 whitespace-pre-wrap leading-relaxed font-light">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Utsendte Skjemaer */}
      {activeTab === "skjemaer" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-charcoal/70">
              Skjemaer og spørreundersøkelser sendt til denne kunden.
            </p>
            <Link
              href="/admin/skjemaer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-forest-green text-warm-white rounded-sm hover:bg-forest-green-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Send nytt skjema</span>
            </Link>
          </div>

          <div className="bg-white border border-sand rounded-sm overflow-hidden">
            {distributions.length === 0 ? (
              <p className="text-sm text-charcoal/60 py-12 text-center">
                Ingen skjemaer er distribuert til denne kunden ennå.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-sand text-xs uppercase tracking-wider text-charcoal/60 font-mono">
                  <tr>
                    <th className="py-3 px-4">Skjematittel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sendt dato</th>
                    <th className="py-3 px-4">Sikker lenke</th>
                    <th className="py-3 px-4 text-right">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {distributions.map((dist) => (
                    <tr key={dist.id} className="hover:bg-sand/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-charcoal">
                        {dist.form?.title || "Skjema"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={dist.status} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-charcoal/70 font-mono">
                        {new Date(dist.created_at).toLocaleDateString("no-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-charcoal/60">
                        /f/{dist.token}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/f/${dist.token}`}
                          target="_blank"
                          className="text-xs text-forest-green hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Åpne</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Mottatte Svar */}
      {activeTab === "svar" && (
        <div className="space-y-6">
          <div className="bg-white border border-sand rounded-sm overflow-hidden">
            {submissions.length === 0 ? (
              <p className="text-sm text-charcoal/60 py-12 text-center">
                Ingen skjemasvar mottatt fra denne kunden ennå.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-sand text-xs uppercase tracking-wider text-charcoal/60 font-mono">
                  <tr>
                    <th className="py-3 px-4">Skjema</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mottatt dato</th>
                    <th className="py-3 px-4">Antall svar</th>
                    <th className="py-3 px-4 text-right">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-sand/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-charcoal">
                        {sub.form?.title || "Skjema"}
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
                      <td className="py-3.5 px-4 text-xs text-charcoal/70">
                        {sub.answers?.length || 0} felter besvart
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/svar/${sub.id}`}
                          className="text-xs font-medium text-forest-green hover:underline"
                        >
                          Vis svar &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Pristilbud */}
      {activeTab === "tilbud" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-charcoal/70">
              Pristilbud og avtaler sendt til {client.name}.
            </p>
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-forest-green text-warm-white rounded-sm hover:bg-forest-green-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Opprett / send nytt tilbud</span>
            </button>
          </div>

          <div className="bg-white border border-sand rounded-sm overflow-hidden">
            {quotes.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-sm text-charcoal/60">
                  Ingen pristilbud er sendt til denne kunden ennå.
                </p>
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="px-4 py-2 bg-forest-green text-warm-white text-xs font-medium rounded-sm hover:bg-forest-green-hover transition-colors"
                >
                  Lag et pristilbud nå
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-sand text-xs uppercase tracking-wider text-charcoal/60 font-mono">
                  <tr>
                    <th className="py-3 px-4">Pakke / Leveranse</th>
                    <th className="py-3 px-4">Beløp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sendt dato</th>
                    <th className="py-3 px-4">Gyldig til</th>
                    <th className="py-3 px-4 text-right">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {quotes.map((q) => (
                    <tr key={q.id || q.token} className="hover:bg-sand/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-charcoal">
                        {q.package_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-forest-green">
                        kr {q.total_price.toLocaleString("no-NO")},-
                      </td>
                      <td className="py-3.5 px-4">
                        {q.status === "accepted" && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Akseptert {q.signed_name ? `(${q.signed_name})` : ""}
                          </span>
                        )}
                        {q.status === "declined" && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-sm">
                            <XCircle className="w-3 h-3 mr-1" />
                            Avvist
                          </span>
                        )}
                        {q.status === "opened" && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-sm">
                            <Clock className="w-3 h-3 mr-1" />
                            Åpnet av kunde
                          </span>
                        )}
                        {q.status === "sent" && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-sm">
                            <Send className="w-3 h-3 mr-1" />
                            Sendt
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-charcoal/70 font-mono">
                        {new Date(q.created_at).toLocaleDateString("no-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-charcoal/70 font-mono">
                        {new Date(q.expires_at).toLocaleDateString("no-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/tilbud/${q.token}`}
                          target="_blank"
                          className="text-xs text-forest-green hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Vis tilbud</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Opplastede Filer */}
      {activeTab === "filer" && (
        <div className="space-y-6">
          <div className="bg-white border border-sand rounded-sm p-6">
            {allFiles.length === 0 ? (
              <p className="text-sm text-charcoal/60 py-8 text-center">
                Ingen filer er lastet opp av denne kunden ennå.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFiles.map((file, idx) => (
                  <div key={idx} className="border border-sand p-4 rounded-sm bg-warm-white/50 flex flex-col justify-between">
                    <div className="flex items-start space-x-3">
                      <Paperclip className="w-5 h-5 text-forest-green shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-charcoal truncate" title={file.file_name}>
                          {file.file_name}
                        </p>
                        <p className="text-xs text-charcoal/50 font-mono mt-0.5">
                          {(file.file_size / 1024 / 1024).toFixed(2)} MB &bull; {file.mime_type}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-sand/40 flex justify-between items-center text-xs">
                      <span className="text-charcoal/50 font-mono">
                        {new Date(file.created_at).toLocaleDateString("no-NO")}
                      </span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Signert nedlastingslenke generert for: " + file.file_name);
                        }}
                        className="text-forest-green hover:underline font-medium inline-flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Last ned</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Rediger kundeopplysninger"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Navn
              </label>
              <input
                type="text"
                required
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Virksomhet
              </label>
              <input
                type="text"
                value={editForm.company || ""}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                E-post
              </label>
              <input
                type="email"
                required
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ClientStatus })}
                className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
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
                value={editForm.requested_service || ""}
                onChange={(e) => setEditForm({ ...editForm, requested_service: e.target.value })}
                className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-1">
              Neste oppfølgingsdato
            </label>
            <input
              type="date"
              value={editForm.next_activity_date ? editForm.next_activity_date.split("T")[0] : ""}
              onChange={(e) => setEditForm({ ...editForm, next_activity_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-3 py-2 bg-warm-white border border-sand rounded-sm text-sm focus:outline-none focus:border-forest-green"
            />
          </div>

          <div className="pt-4 border-t border-sand flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal/70 hover:bg-sand/30 rounded-sm"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-forest-green hover:bg-forest-green-hover text-warm-white rounded-sm transition-colors"
            >
              Lagre endringer
            </button>
          </div>
        </form>
      </Modal>

      {/* Quote Builder Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={`Pristilbud for ${client.name}`}
        maxWidth="xl"
      >
        <PriceCalculator 
          client={client} 
          onSaved={() => {
            loadClientData();
            setActiveTab("tilbud");
          }} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Bekreft sletting av kunde"
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal/85">
            Er du helt sikker på at du vil slette <strong>{client.name}</strong>? Denne handlingen kan ikke angres.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-sm">
            Merk: For å bevare historikk anbefales det vanligvis å sette status til «Avsluttet» eller «Arkivert» fremfor permanent sletting.
          </div>
          <div className="pt-4 border-t border-sand flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal/70 hover:bg-sand/30 rounded-sm"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 text-xs font-medium bg-red-700 hover:bg-red-800 text-white rounded-sm transition-colors"
            >
              Slett kunde permanent
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
