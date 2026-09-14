import { 
  Client, 
  ClientStatus, 
  Form, 
  FormStatus, 
  FormField, 
  FormDistribution, 
  Submission, 
  ResponseStatus, 
  ClientNote, 
  Activity, 
  DashboardMetrics,
  UploadedFile,
  Quote,
  QuoteStatus
} from "./types";
import { 
  initialClients, 
  initialForms, 
  initialDistributions, 
  initialSubmissions, 
  initialNotes, 
  initialActivities 
} from "./demo-data";
import { createClient as createBrowserClient } from "./supabase/client";
import { createAdminClient } from "./supabase/admin";

// Global cache for instant rendering
let clients: Client[] = [...initialClients];
let forms: Form[] = [...initialForms];
let distributions: FormDistribution[] = [...initialDistributions];
let submissions: Submission[] = [...initialSubmissions];
let notes: ClientNote[] = [...initialNotes];
let activities: Activity[] = [...initialActivities];
let quotes: Quote[] = [];

function getSupabase() {
  try {
    if (typeof window !== "undefined") {
      return createBrowserClient();
    }
    return createAdminClient();
  } catch (e) {
    return null;
  }
}

// LocalStorage helpers for browser caching
const CLIENTS_STORAGE_KEY = "bymari_clients_cache";
const FORMS_STORAGE_KEY = "bymari_forms_cache";
const ACTIVITIES_STORAGE_KEY = "bymari_activities_cache";
const QUOTES_STORAGE_KEY = "bymari_quotes_cache";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const dataStore = {
  // --------------------------------------------------------------------------
  // DASHBOARD METRICS
  // --------------------------------------------------------------------------
  async getMetrics(): Promise<DashboardMetrics> {
    const currentClients = await this.getClients();
    const currentDistributions = await this.getDistributions();
    const currentSubmissions = await this.getSubmissions();

    const activeClientsCount = currentClients.filter(c => !c.is_archived && c.status === "Aktiv kunde").length;
    const newLeadsCount = currentClients.filter(c => !c.is_archived && c.status === "Ny").length;
    const awaitingFormsCount = currentDistributions.filter(d => d.status === "sent" || d.status === "opened").length;
    const newResponsesCount = currentSubmissions.filter(s => s.status === "new").length;
    const upcomingFollowupsCount = currentClients.filter(c => c.next_activity_date && new Date(c.next_activity_date) >= new Date()).length;

    return {
      activeClientsCount,
      newLeadsCount,
      awaitingFormsCount,
      newResponsesCount,
      upcomingFollowupsCount
    };
  },

  // --------------------------------------------------------------------------
  // CLIENTS (CRM)
  // --------------------------------------------------------------------------
  async getClients(filters?: { query?: string; status?: ClientStatus; is_archived?: boolean }): Promise<Client[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from("clients").select("*").order("created_at", { ascending: false });
        if (filters?.is_archived !== undefined) {
          query = query.eq("is_archived", filters.is_archived);
        } else {
          query = query.eq("is_archived", false);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          clients = data as Client[];
          setStored(CLIENTS_STORAGE_KEY, clients);
        }
      } catch (err) {
        console.warn("Supabase clients query error:", err);
      }
    }

    if (typeof window !== "undefined") {
      const local = getStored<Client[]>(CLIENTS_STORAGE_KEY, []);
      if (local.length > 0) {
        // Merge
        const ids = new Set(clients.map(c => c.id));
        local.forEach(l => {
          if (!ids.has(l.id)) clients.push(l);
        });
      }
    }

    let result = [...clients];
    if (filters?.is_archived !== undefined) {
      result = result.filter(c => c.is_archived === filters.is_archived);
    } else {
      result = result.filter(c => !c.is_archived);
    }

    if (filters?.status) {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q) ||
        (c.requested_service && c.requested_service.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getClientById(id: string): Promise<Client | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
        if (!error && data) return data as Client;
      } catch {}
    }
    const all = await this.getClients({ is_archived: false });
    const match = all.find(c => c.id === id);
    if (match) return match;
    return clients.find(c => c.id === id) || null;
  },

  async createClient(data: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    const newClient: Client = {
      ...data,
      id: "c-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from("clients").insert([{
          name: newClient.name,
          company: newClient.company || null,
          email: newClient.email,
          phone: newClient.phone || null,
          status: newClient.status || "Ny",
          requested_service: newClient.requested_service || null,
          internal_notes: newClient.internal_notes || null,
          next_activity_date: newClient.next_activity_date || null,
          is_archived: false
        }]).select().single();

        if (!error && inserted) {
          newClient.id = inserted.id;
          newClient.created_at = inserted.created_at;
        }
      } catch (err) {
        console.warn("Supabase create client error:", err);
      }
    }

    clients.unshift(newClient);
    setStored(CLIENTS_STORAGE_KEY, clients);

    await this.logActivity({
      event_type: "client_created",
      description: `Kunde opprettet: ${newClient.name}${newClient.company ? " (" + newClient.company + ")" : ""}`,
      client_id: newClient.id,
      client_name: newClient.name
    });

    return newClient;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const index = clients.findIndex(c => c.id === id);
    const updated = {
      ...(index !== -1 ? clients[index] : {}),
      ...updates,
      id,
      updated_at: new Date().toISOString()
    } as Client;

    if (index !== -1) {
      clients[index] = updated;
    } else {
      clients.unshift(updated);
    }
    setStored(CLIENTS_STORAGE_KEY, clients);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from("clients").update({
          ...updates,
          updated_at: new Date().toISOString()
        }).eq("id", id);
      } catch (err) {
        console.warn("Supabase update client error:", err);
      }
    }

    await this.logActivity({
      event_type: "client_updated",
      description: `Kunde oppdatert: ${updated.name} (Status: ${updated.status})`,
      client_id: updated.id,
      client_name: updated.name
    });

    return updated;
  },

  async archiveClient(id: string, is_archived = true): Promise<boolean> {
    return (await this.updateClient(id, { is_archived })) !== null;
  },

  async deleteClient(id: string): Promise<boolean> {
    clients = clients.filter(c => c.id !== id);
    setStored(CLIENTS_STORAGE_KEY, clients);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from("clients").delete().eq("id", id);
      } catch {}
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // FORMS (Form Builder)
  // --------------------------------------------------------------------------
  async getForms(filters?: { status?: FormStatus; is_template?: boolean }): Promise<Form[]> {
    let result = [...forms];
    if (filters?.status) {
      result = result.filter(f => f.status === filters.status);
    }
    if (filters?.is_template !== undefined) {
      result = result.filter(f => f.is_template === filters.is_template);
    }
    return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async getFormById(id: string): Promise<Form | null> {
    return forms.find(f => f.id === id) || null;
  },

  async getFormBySlug(slug: string): Promise<Form | null> {
    return forms.find(f => f.slug === slug) || null;
  },

  async createForm(data: Partial<Form>): Promise<Form> {
    const newForm: Form = {
      id: "f-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      title: data.title || "Uten tittel",
      slug: data.slug || "skjema-" + Date.now().toString(36),
      introduction: data.introduction || "",
      confirmation_message: data.confirmation_message || "Tusen takk for dine svar.",
      status: data.status || "draft",
      is_template: data.is_template || false,
      fields: (data.fields || []).map((fld, idx) => ({
        ...fld,
        id: fld.id || "fld-" + idx + "-" + Math.random().toString(36).substr(2, 4),
        form_id: fld.form_id || "new",
        position: idx
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    newForm.fields?.forEach(f => { f.form_id = newForm.id; });
    forms.unshift(newForm);

    await this.logActivity({
      event_type: "form_created",
      description: `Nytt skjema opprettet: "${newForm.title}"`,
      form_id: newForm.id,
      form_title: newForm.title
    });

    return newForm;
  },

  async updateForm(id: string, updates: Partial<Form>): Promise<Form | null> {
    const index = forms.findIndex(f => f.id === id);
    if (index === -1) return null;

    const updated: Form = {
      ...forms[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    forms[index] = updated;
    return updated;
  },

  async deleteForm(id: string): Promise<boolean> {
    const initialLen = forms.length;
    forms = forms.filter(f => f.id !== id);
    return forms.length < initialLen;
  },

  // --------------------------------------------------------------------------
  // FORM DISTRIBUTIONS
  // --------------------------------------------------------------------------
  async getDistributions(filters?: { clientId?: string; formId?: string }): Promise<FormDistribution[]> {
    let result = [...distributions];
    if (filters?.clientId) {
      result = result.filter(d => d.client_id === filters.clientId);
    }
    if (filters?.formId) {
      result = result.filter(d => d.form_id === filters.formId);
    }
    return result.map(d => ({
      ...d,
      form: forms.find(f => f.id === d.form_id),
      client: clients.find(c => c.id === d.client_id)
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getDistributionByToken(token: string): Promise<FormDistribution | null> {
    const dist = distributions.find(d => d.token === token);
    if (!dist) return null;

    return {
      ...dist,
      form: forms.find(f => f.id === dist.form_id),
      client: clients.find(c => c.id === dist.client_id)
    };
  },

  async createDistribution(data: {
    form_id: string;
    client_id?: string | null;
    email_subject?: string;
    email_intro?: string;
    expires_at?: string | null;
  }): Promise<FormDistribution> {
    const token = "bm-" + Math.random().toString(36).substring(2, 10) + "-" + Date.now().toString(36);
    const newDist: FormDistribution = {
      id: "dist-" + Date.now().toString(36),
      form_id: data.form_id,
      client_id: data.client_id,
      token,
      email_subject: data.email_subject || "Skjema fra by mari",
      email_intro: data.email_intro || "",
      expires_at: data.expires_at || null,
      status: "sent",
      opened_at: null,
      submitted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    distributions.unshift(newDist);

    const form = forms.find(f => f.id === data.form_id);
    const client = data.client_id ? clients.find(c => c.id === data.client_id) : undefined;

    await this.logActivity({
      event_type: "form_sent",
      description: `Skjema "${form?.title || "Skjema"}" sendt til ${client?.name || "Kunde"}`,
      client_id: client?.id,
      client_name: client?.name,
      form_id: form?.id,
      form_title: form?.title
    });

    return {
      ...newDist,
      form,
      client
    };
  },

  async markDistributionOpened(token: string): Promise<void> {
    const dist = distributions.find(d => d.token === token);
    if (dist && dist.status === "sent") {
      dist.status = "opened";
      dist.opened_at = new Date().toISOString();
      dist.updated_at = new Date().toISOString();

      const form = forms.find(f => f.id === dist.form_id);
      const client = dist.client_id ? clients.find(c => c.id === dist.client_id) : undefined;
      await this.logActivity({
        event_type: "form_opened",
        description: `Skjema "${form?.title || "Skjema"}" åpnet av ${client?.name || "Mottaker"}`,
        client_id: client?.id,
        client_name: client?.name,
        form_id: form?.id,
        form_title: form?.title
      });
    }
  },

  async revokeDistribution(id: string): Promise<boolean> {
    const dist = distributions.find(d => d.id === id);
    if (!dist) return false;
    dist.status = "revoked";
    dist.updated_at = new Date().toISOString();
    return true;
  },

  // --------------------------------------------------------------------------
  // SUBMISSIONS & ANSWERS
  // --------------------------------------------------------------------------
  async getSubmissions(filters?: { status?: ResponseStatus; clientId?: string; formId?: string }): Promise<Submission[]> {
    let result = [...submissions];

    if (filters?.status) {
      result = result.filter(s => s.status === filters.status);
    }
    if (filters?.clientId) {
      result = result.filter(s => s.client_id === filters.clientId);
    }
    if (filters?.formId) {
      result = result.filter(s => s.form_id === filters.formId);
    }

    return result.map(s => ({
      ...s,
      form: forms.find(f => f.id === s.form_id),
      client: clients.find(c => c.id === s.client_id),
      distribution: distributions.find(d => d.id === s.distribution_id)
    })).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async getSubmissionById(id: string): Promise<Submission | null> {
    const s = submissions.find(item => item.id === id);
    if (!s) return null;

    return {
      ...s,
      form: forms.find(f => f.id === s.form_id),
      client: clients.find(c => c.id === s.client_id),
      distribution: distributions.find(d => d.id === s.distribution_id)
    };
  },

  async createSubmission(payload: {
    form_id: string;
    client_id?: string | null;
    distribution_id?: string | null;
    token?: string;
    answers: { field_id?: string; field_label: string; value: any }[];
    files?: UploadedFile[];
  }): Promise<Submission> {
    const newSub: Submission = {
      id: "sub-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      form_id: payload.form_id,
      client_id: payload.client_id,
      distribution_id: payload.distribution_id,
      status: "new",
      internal_notes: "",
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: payload.answers.map((ans, idx) => ({
        id: "ans-" + idx + "-" + Date.now().toString(36),
        submission_id: "pending",
        field_id: ans.field_id || null,
        field_label: ans.field_label,
        value: ans.value,
        created_at: new Date().toISOString()
      })),
      files: payload.files || []
    };

    newSub.answers?.forEach(a => { a.submission_id = newSub.id; });
    submissions.unshift(newSub);

    if (payload.distribution_id) {
      const dist = distributions.find(d => d.id === payload.distribution_id);
      if (dist) {
        dist.status = "submitted";
        dist.submitted_at = new Date().toISOString();
        dist.updated_at = new Date().toISOString();
      }
    } else if (payload.token) {
      const dist = distributions.find(d => d.token === payload.token);
      if (dist) {
        dist.status = "submitted";
        dist.submitted_at = new Date().toISOString();
        dist.updated_at = new Date().toISOString();
      }
    }

    const form = forms.find(f => f.id === payload.form_id);
    const client = payload.client_id ? clients.find(c => c.id === payload.client_id) : undefined;

    await this.logActivity({
      event_type: "form_submitted",
      description: `Nytt svar mottatt på "${form?.title || "Skjema"}" fra ${client?.name || "Mottaker"}`,
      client_id: client?.id,
      client_name: client?.name,
      form_id: form?.id,
      form_title: form?.title,
      submission_id: newSub.id
    });

    return {
      ...newSub,
      form,
      client
    };
  },

  async updateSubmission(id: string, updates: { status?: ResponseStatus; internal_notes?: string }): Promise<Submission | null> {
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) return null;

    const prev = submissions[index];
    const updated = {
      ...prev,
      ...updates,
      updated_at: new Date().toISOString()
    };
    submissions[index] = updated;

    if (updates.status && updates.status !== prev.status) {
      const form = forms.find(f => f.id === updated.form_id);
      await this.logActivity({
        event_type: "response_status_changed",
        description: `Svarstatus endret til "${updates.status}" for "${form?.title || "Skjema"}"`,
        submission_id: updated.id,
        client_id: updated.client_id
      });
    }

    return updated;
  },

  // --------------------------------------------------------------------------
  // CLIENT NOTES
  // --------------------------------------------------------------------------
  async getClientNotes(clientId: string): Promise<ClientNote[]> {
    return notes
      .filter(n => n.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addClientNote(clientId: string, content: string, authorName = "Mari"): Promise<ClientNote> {
    const newNote: ClientNote = {
      id: "note-" + Date.now().toString(36),
      client_id: clientId,
      author_name: authorName,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    notes.unshift(newNote);

    const client = clients.find(c => c.id === clientId);
    await this.logActivity({
      event_type: "note_added",
      description: `Internt notat lagt til på ${client?.name || "kunde"}`,
      client_id: clientId,
      client_name: client?.name
    });

    return newNote;
  },

  async deleteClientNote(noteId: string): Promise<boolean> {
    const initialLen = notes.length;
    notes = notes.filter(n => n.id !== noteId);
    return notes.length < initialLen;
  },

  // --------------------------------------------------------------------------
  // QUOTES (Pristilbud)
  // --------------------------------------------------------------------------
  async getQuotes(filters?: { clientId?: string; status?: QuoteStatus }): Promise<Quote[]> {
    let result = [...quotes];
    if (filters?.clientId) {
      result = result.filter(q => q.client_id === filters.clientId);
    }
    if (filters?.status) {
      result = result.filter(q => q.status === filters.status);
    }
    return result.map(q => ({
      ...q,
      client: clients.find(c => c.id === q.client_id) || null
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getQuoteByToken(token: string): Promise<Quote | null> {
    const q = quotes.find(item => item.token === token);
    if (!q) return null;
    return {
      ...q,
      client: clients.find(c => c.id === q.client_id) || null
    };
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    const q = quotes.find(item => item.id === id);
    if (!q) return null;
    return {
      ...q,
      client: clients.find(c => c.id === q.client_id) || null
    };
  },

  async createQuote(data: {
    client_id: string | null;
    package_name: string;
    base_price: number;
    addons: { name: string; price: number; quantity?: number }[];
    custom_lines: { name: string; price: number }[];
    discount: number;
    subtotal: number;
    vat_amount: number;
    total_price: number;
    monthly_price?: number;
    delivery_time: string;
    validity_days: number;
    email_subject: string;
    email_intro?: string;
  }): Promise<Quote> {
    const token = "tk-quote-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);
    const expiresAt = new Date(Date.now() + (data.validity_days || 14) * 24 * 60 * 60 * 1000).toISOString();

    const newQuote: Quote = {
      id: "quote-" + Date.now().toString(36),
      client_id: data.client_id,
      token,
      package_name: data.package_name,
      base_price: data.base_price,
      addons: data.addons || [],
      custom_lines: data.custom_lines || [],
      discount: data.discount || 0,
      subtotal: data.subtotal,
      vat_amount: data.vat_amount || 0,
      total_price: data.total_price,
      monthly_price: data.monthly_price || 0,
      delivery_time: data.delivery_time || "2–3 uker",
      validity_days: data.validity_days || 14,
      expires_at: expiresAt,
      email_subject: data.email_subject,
      email_intro: data.email_intro || "",
      status: "sent",
      accepted_at: null,
      declined_at: null,
      signed_name: null,
      client_note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    quotes.unshift(newQuote);
    setStored(QUOTES_STORAGE_KEY, quotes);

    const client = data.client_id ? clients.find(c => c.id === data.client_id) : null;
    if (client) {
      await this.updateClient(client.id, { status: "Tilbud sendt" });
    }

    await this.logActivity({
      event_type: "quote_sent",
      description: `Pristilbud (${data.package_name} - kr ${data.total_price.toLocaleString("no-NO")},-) sendt til ${client?.name || "Kunde"}`,
      client_id: client?.id,
      client_name: client?.name,
      metadata: { quote_id: newQuote.id, token: newQuote.token, total_price: data.total_price }
    });

    return {
      ...newQuote,
      client
    };
  },

  async updateQuote(tokenOrId: string, updates: Partial<Quote>): Promise<Quote | null> {
    const index = quotes.findIndex(q => q.token === tokenOrId || q.id === tokenOrId);
    if (index === -1) return null;

    const prev = quotes[index];
    const updated: Quote = {
      ...prev,
      ...updates,
      updated_at: new Date().toISOString()
    };
    quotes[index] = updated;
    setStored(QUOTES_STORAGE_KEY, quotes);

    return updated;
  },

  // --------------------------------------------------------------------------
  // ACTIVITIES (Audit Log)
  // --------------------------------------------------------------------------
  async getActivities(limit = 50): Promise<Activity[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(limit);
        if (!error && data && data.length > 0) {
          activities = data as Activity[];
          setStored(ACTIVITIES_STORAGE_KEY, activities);
        }
      } catch {}
    }
    return activities.slice(0, limit);
  },

  async logActivity(data: {
    event_type: Activity["event_type"];
    description: string;
    client_id?: string | null;
    client_name?: string;
    form_id?: string | null;
    form_title?: string;
    submission_id?: string | null;
    metadata?: Record<string, any>;
  }): Promise<Activity> {
    const act: Activity = {
      id: "act-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
      event_type: data.event_type,
      description: data.description,
      client_id: data.client_id,
      client_name: data.client_name,
      form_id: data.form_id,
      form_title: data.form_title,
      submission_id: data.submission_id,
      metadata: data.metadata || {},
      created_at: new Date().toISOString()
    };
    activities.unshift(act);
    setStored(ACTIVITIES_STORAGE_KEY, activities);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from("activities").insert([{
          event_type: data.event_type,
          description: data.description,
          client_id: data.client_id || null,
          form_id: data.form_id || null,
          submission_id: data.submission_id || null,
          metadata: data.metadata || {}
        }]);
      } catch {}
    }

    return act;
  },

  // --------------------------------------------------------------------------
  // RESET / SEED
  // --------------------------------------------------------------------------
  async resetToSeedData() {
    clients = [...initialClients];
    forms = [...initialForms];
    distributions = [...initialDistributions];
    submissions = [...initialSubmissions];
    notes = [...initialNotes];
    activities = [...initialActivities];
    if (typeof window !== "undefined") {
      localStorage.removeItem(CLIENTS_STORAGE_KEY);
      localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
    }
    return true;
  }
};
