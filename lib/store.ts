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
let deletedClientIds: Set<string> = new Set();

function getFs(): any {
  if (typeof window !== "undefined") return null;
  try {
    const req = eval("require");
    return req("fs");
  } catch {
    return null;
  }
}

function getPath(): any {
  if (typeof window !== "undefined") return null;
  try {
    const req = eval("require");
    return req("path");
  } catch {
    return null;
  }
}

function loadServerFile(): any {
  if (typeof window !== "undefined") return null;
  try {
    const fs = getFs();
    const path = getPath();
    if (!fs || !path) return null;
    const storeFile = path.join(process.cwd(), "data", "store_data.json");
    if (fs.existsSync(storeFile)) {
      const raw = fs.readFileSync(storeFile, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read store_data.json:", err);
  }
  return null;
}

function saveServerFile(data: any) {
  if (typeof window !== "undefined") return;
  try {
    const fs = getFs();
    const path = getPath();
    if (!fs || !path) return;
    const dataDir = path.join(process.cwd(), "data");
    const storeFile = path.join(dataDir, "store_data.json");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write store_data.json:", err);
  }
}

// LocalStorage helpers for browser caching
const CLIENTS_STORAGE_KEY = "bymari_clients_cache";
const FORMS_STORAGE_KEY = "bymari_forms_cache";
const ACTIVITIES_STORAGE_KEY = "bymari_activities_cache";
const QUOTES_STORAGE_KEY = "bymari_quotes_cache";
const DELETED_CLIENTS_STORAGE_KEY = "bymari_deleted_clients_cache";

export function syncStore() {
  if (typeof window === "undefined") {
    saveServerFile({
      clients,
      forms,
      distributions,
      submissions,
      notes,
      activities,
      quotes,
      deletedClientIds: Array.from(deletedClientIds)
    });
  } else {
    setStored(CLIENTS_STORAGE_KEY, clients);
    setStored(QUOTES_STORAGE_KEY, quotes);
    setStored(FORMS_STORAGE_KEY, forms);
    setStored(ACTIVITIES_STORAGE_KEY, activities);
    setStored(DELETED_CLIENTS_STORAGE_KEY, Array.from(deletedClientIds));
  }
}

// Initialize server data from disk
if (typeof window === "undefined") {
  const serverData = loadServerFile();
  if (serverData) {
    if (Array.isArray(serverData.deletedClientIds)) {
      deletedClientIds = new Set(serverData.deletedClientIds);
    }
    if (Array.isArray(serverData.clients) && serverData.clients.length > 0) {
      const existing = new Set(serverData.clients.map((c: any) => c.id || c.email?.toLowerCase()));
      initialClients.forEach(ic => {
        if (!deletedClientIds.has(ic.id) && !deletedClientIds.has(ic.email.toLowerCase())) {
          if (!existing.has(ic.id) && !existing.has(ic.email.toLowerCase())) serverData.clients.push(ic);
        }
      });
      clients = serverData.clients.filter((c: any) => !deletedClientIds.has(c.id) && !deletedClientIds.has(c.email?.toLowerCase()));
    }
    if (Array.isArray(serverData.quotes) && serverData.quotes.length > 0) {
      quotes = serverData.quotes;
    }
    if (Array.isArray(serverData.forms) && serverData.forms.length > 0) {
      const existing = new Set(serverData.forms.map((f: any) => f.id || f.slug));
      initialForms.forEach(ifm => {
        if (!existing.has(ifm.id) && !existing.has(ifm.slug)) serverData.forms.push(ifm);
      });
      forms = serverData.forms;
    }
    if (Array.isArray(serverData.distributions) && serverData.distributions.length > 0) {
      distributions = serverData.distributions;
    }
    if (Array.isArray(serverData.submissions) && serverData.submissions.length > 0) {
      submissions = serverData.submissions;
    }
    if (Array.isArray(serverData.notes) && serverData.notes.length > 0) {
      notes = serverData.notes;
    }
    if (Array.isArray(serverData.activities) && serverData.activities.length > 0) {
      activities = serverData.activities;
    }
  }
}

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
    if (typeof window !== "undefined") {
      const localDeleted = getStored<string[]>(DELETED_CLIENTS_STORAGE_KEY, []);
      localDeleted.forEach(id => deletedClientIds.add(id));
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: delData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "deleted_clients_all")
          .single();
        if (delData?.content && Array.isArray(delData.content)) {
          delData.content.forEach((d: string) => deletedClientIds.add(d));
        }
      } catch {}
    }

    let combinedClients: Client[] = clients.filter(c => !deletedClientIds.has(c.id) && !deletedClientIds.has(c.email?.toLowerCase()));

    // Only include initialClients that have NOT been deleted
    initialClients.forEach(ic => {
      if (!deletedClientIds.has(ic.id) && !deletedClientIds.has(ic.email?.toLowerCase())) {
        if (!combinedClients.some(c => c.id === ic.id || c.email?.toLowerCase() === ic.email?.toLowerCase())) {
          combinedClients.push(ic);
        }
      }
    });

    if (supabase) {
      // 1. Try SQL table 'clients'
      try {
        const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          data.forEach((c: any) => {
            if (!deletedClientIds.has(c.id) && !deletedClientIds.has(c.email?.toLowerCase())) {
              if (!combinedClients.some(existing => existing.id === c.id || existing.email?.toLowerCase() === c.email?.toLowerCase())) {
                combinedClients.push(c as Client);
              }
            }
          });
        }
      } catch (err) {
        console.warn("Supabase clients query error:", err);
      }

      // 2. Try site_content key: 'clients_all'
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "clients_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          scData.content.forEach((c: any) => {
            if (!deletedClientIds.has(c.id) && !deletedClientIds.has(c.email?.toLowerCase())) {
              if (!combinedClients.some(existing => existing.id === c.id || existing.email?.toLowerCase() === c.email?.toLowerCase())) {
                combinedClients.push(c as Client);
              }
            }
          });
        }
      } catch (scErr) {
        console.warn("site_content clients query fallback:", scErr);
      }
    }

    if (typeof window !== "undefined") {
      const local = getStored<Client[]>(CLIENTS_STORAGE_KEY, []);
      if (local.length > 0) {
        local.forEach(l => {
          if (!deletedClientIds.has(l.id) && !deletedClientIds.has(l.email?.toLowerCase())) {
            if (!combinedClients.some(existing => existing.id === l.id || existing.email?.toLowerCase() === l.email?.toLowerCase())) {
              combinedClients.push(l);
            }
          }
        });
      }
    }

    // Keep memory, disk and local storage in sync
    clients = combinedClients.filter(c => !deletedClientIds.has(c.id) && !deletedClientIds.has(c.email?.toLowerCase()));
    syncStore();

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
    const all = await this.getClients({ is_archived: false });
    const match = all.find(c => c.id === id);
    if (match) return match;
    const allWithArchived = await this.getClients();
    return allWithArchived.find(c => c.id === id) || clients.find(c => c.id === id) || null;
  },

  async createClient(data: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    const newClient: Client = {
      ...data,
      id: "c-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove from deleted list if re-added
    deletedClientIds.delete(newClient.id);
    if (newClient.email) {
      deletedClientIds.delete(newClient.email.toLowerCase());
    }

    // 1. Memory and Storage Sync
    clients.unshift(newClient);
    syncStore();

    // 2. Supabase SQL table
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from("clients").insert([{
          id: newClient.id,
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
        console.warn("Supabase create client table warning:", err);
      }

      // 3. Supabase site_content (key: clients_all)
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "clients_all")
          .single();

        const currentList = Array.isArray(scData?.content) ? scData.content : [];
        const updatedList = [newClient, ...currentList.filter((c: any) => c.id !== newClient.id && c.email?.toLowerCase() !== newClient.email?.toLowerCase())];

        await supabase.from("site_content").upsert({
          key: "clients_all",
          content: updatedList,
          updated_at: new Date().toISOString()
        });
      } catch (scErr) {
        console.warn("Supabase site_content clients_all save warning:", scErr);
      }

      // Update deleted_clients_all in Supabase
      try {
        await supabase.from("site_content").upsert({
          key: "deleted_clients_all",
          content: Array.from(deletedClientIds),
          updated_at: new Date().toISOString()
        });
      } catch {}
    }

    await this.logActivity({
      event_type: "client_created",
      description: `Kunde opprettet: ${newClient.name}${newClient.company ? " (" + newClient.company + ")" : ""}`,
      client_id: newClient.id,
      client_name: newClient.name
    });

    return newClient;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const existing = clients.find(c => c.id === id) || initialClients.find(c => c.id === id);
    const updated = {
      ...(existing || {}),
      ...updates,
      id,
      updated_at: new Date().toISOString()
    } as Client;

    if (updated.email) {
      deletedClientIds.delete(updated.email.toLowerCase());
    }
    deletedClientIds.delete(id);

    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = updated;
    } else {
      clients.unshift(updated);
    }
    syncStore();

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

      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "clients_all")
          .single();

        const currentList = Array.isArray(scData?.content) ? scData.content : [];
        const updatedList = currentList.map((c: any) => c.id === id ? { ...c, ...updated } : c);
        if (!updatedList.some((c: any) => c.id === id)) {
          updatedList.unshift(updated);
        }

        await supabase.from("site_content").upsert({
          key: "clients_all",
          content: updatedList,
          updated_at: new Date().toISOString()
        });
      } catch (scErr) {
        console.warn("Supabase site_content update client warning:", scErr);
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
    const target = clients.find(c => c.id === id) || initialClients.find(c => c.id === id);
    if (target?.email) {
      deletedClientIds.add(target.email.toLowerCase());
    }
    deletedClientIds.add(id);

    clients = clients.filter(c => c.id !== id && (!target?.email || c.email?.toLowerCase() !== target.email.toLowerCase()));
    syncStore();

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from("clients").delete().eq("id", id);
      } catch {}

      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "clients_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          const updatedList = scData.content.filter((c: any) => c.id !== id && (!target?.email || c.email?.toLowerCase() !== target.email.toLowerCase()));
          await supabase.from("site_content").upsert({
            key: "clients_all",
            content: updatedList,
            updated_at: new Date().toISOString()
          });
        }
      } catch {}

      try {
        await supabase.from("site_content").upsert({
          key: "deleted_clients_all",
          content: Array.from(deletedClientIds),
          updated_at: new Date().toISOString()
        });
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
    syncStore();

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
    syncStore();
    return updated;
  },

  async deleteForm(id: string): Promise<boolean> {
    const initialLen = forms.length;
    forms = forms.filter(f => f.id !== id);
    syncStore();
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
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "client_notes_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          const existingIds = new Set(notes.map(n => n.id));
          scData.content.forEach((n: ClientNote) => {
            if (!existingIds.has(n.id)) {
              notes.push(n);
              existingIds.add(n.id);
            }
          });
        }
      } catch (err) {
        console.warn("Supabase fetch notes error:", err);
      }
    }

    return notes
      .filter(n => n.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addClientNote(clientId: string, content: string, authorName = "Mari"): Promise<ClientNote> {
    const newNote: ClientNote = {
      id: "note-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      client_id: clientId,
      author_name: authorName,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    notes.unshift(newNote);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "client_notes_all")
          .single();

        const currentNotes = Array.isArray(scData?.content) ? scData.content : [];
        const updatedNotes = [newNote, ...currentNotes.filter((n: any) => n.id !== newNote.id)];

        await supabase.from("site_content").upsert({
          key: "client_notes_all",
          content: updatedNotes,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Supabase save note error:", err);
      }
    }

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

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "client_notes_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          const updatedNotes = scData.content.filter((n: any) => n.id !== noteId);
          await supabase.from("site_content").upsert({
            key: "client_notes_all",
            content: updatedNotes,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn("Supabase delete note error:", err);
      }
    }

    return notes.length < initialLen;
  },

  // --------------------------------------------------------------------------
  // QUOTES (Pristilbud)
  // --------------------------------------------------------------------------
  async getQuotes(filters?: { clientId?: string; status?: QuoteStatus; email?: string }): Promise<Quote[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "quotes_all")
          .single();

        if (scData?.content && Array.isArray(scData.content)) {
          const existingTokens = new Set(quotes.map(q => q.token));
          scData.content.forEach((q: Quote) => {
            if (!existingTokens.has(q.token)) {
              quotes.push(q);
              existingTokens.add(q.token);
            }
          });
        }
      } catch (err) {
        console.warn("Supabase fetch quotes error:", err);
      }
    }

    let result = [...quotes];
    if (filters?.clientId) {
      result = result.filter(q => q.client_id === filters.clientId || q.client?.id === filters.clientId);
    }
    if (filters?.email) {
      const emailLower = filters.email.toLowerCase().trim();
      result = result.filter(q => q.client?.email?.toLowerCase().trim() === emailLower);
    }
    if (filters?.status) {
      result = result.filter(q => q.status === filters.status);
    }
    return result.map(q => ({
      ...q,
      client: q.client || clients.find(c => c.id === q.client_id) || null
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getQuoteByToken(token: string): Promise<Quote | null> {
    const allQuotes = await this.getQuotes();
    const q = allQuotes.find(item => item.token === token);
    if (!q) return null;
    return {
      ...q,
      client: q.client || clients.find(c => c.id === q.client_id) || null
    };
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    const allQuotes = await this.getQuotes();
    const q = allQuotes.find(item => item.id === id);
    if (!q) return null;
    return {
      ...q,
      client: q.client || clients.find(c => c.id === q.client_id) || null
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
    const validityDays = Math.max(1, Number(data.validity_days) || 14);
    const expiresDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
    expiresDate.setHours(23, 59, 59, 999);
    const expiresAt = expiresDate.toISOString();

    const client = data.client_id ? (await this.getClientById(data.client_id)) : null;

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
      updated_at: new Date().toISOString(),
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company || ""
      } : null
    };

    quotes.unshift(newQuote);
    syncStore();

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "quotes_all")
          .single();

        const currentQuotes = Array.isArray(scData?.content) ? scData.content : [];
        const updatedQuotes = [newQuote, ...currentQuotes.filter((q: any) => q.token !== newQuote.token && q.id !== newQuote.id)];

        await supabase.from("site_content").upsert({
          key: "quotes_all",
          content: updatedQuotes,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Supabase create quote error:", err);
      }
    }

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

    return newQuote;
  },

  async updateQuote(tokenOrId: string, updates: Partial<Quote>): Promise<Quote | null> {
    const index = quotes.findIndex(q => q.token === tokenOrId || q.id === tokenOrId);
    const prev = index !== -1 ? quotes[index] : null;
    const updated: Quote = {
      ...(prev || {}),
      ...updates,
      updated_at: new Date().toISOString()
    } as Quote;

    if (index !== -1) {
      quotes[index] = updated;
    } else {
      quotes.unshift(updated);
    }
    syncStore();

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: scData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "quotes_all")
          .single();

        const currentQuotes = Array.isArray(scData?.content) ? scData.content : [];
        const updatedQuotes = currentQuotes.map((q: any) =>
          q.token === tokenOrId || q.id === tokenOrId ? { ...q, ...updated } : q
        );
        if (!updatedQuotes.some((q: any) => q.token === tokenOrId || q.id === tokenOrId)) {
          updatedQuotes.unshift(updated);
        }

        await supabase.from("site_content").upsert({
          key: "quotes_all",
          content: updatedQuotes,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Supabase update quote error:", err);
      }
    }

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
