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
  UploadedFile
} from "./types";
import { 
  initialClients, 
  initialForms, 
  initialDistributions, 
  initialSubmissions, 
  initialNotes, 
  initialActivities 
} from "./demo-data";

// In-memory data structures (persisted in global memory during dev server lifecycle)
let clients: Client[] = [...initialClients];
let forms: Form[] = [...initialForms];
let distributions: FormDistribution[] = [...initialDistributions];
let submissions: Submission[] = [...initialSubmissions];
let notes: ClientNote[] = [...initialNotes];
let activities: Activity[] = [...initialActivities];

// Helper to simulate asynchronous database operations
const delay = (ms = 50) => new Promise(res => setTimeout(res, ms));

export const dataStore = {
  // --------------------------------------------------------------------------
  // DASHBOARD METRICS
  // --------------------------------------------------------------------------
  async getMetrics(): Promise<DashboardMetrics> {
    await delay();
    const activeClientsCount = clients.filter(c => !c.is_archived && c.status === "Aktiv kunde").length;
    const newLeadsCount = clients.filter(c => !c.is_archived && c.status === "Ny").length;
    const awaitingFormsCount = distributions.filter(d => d.status === "sent" || d.status === "opened").length;
    const newResponsesCount = submissions.filter(s => s.status === "new").length;
    const upcomingFollowupsCount = clients.filter(c => c.next_activity_date && new Date(c.next_activity_date) >= new Date()).length;

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
    await delay();
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
    await delay();
    return clients.find(c => c.id === id) || null;
  },

  async createClient(data: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    await delay();
    const newClient: Client = {
      ...data,
      id: "c-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    clients.unshift(newClient);

    await this.logActivity({
      event_type: "client_created",
      description: `Kunde opprettet: ${newClient.name}${newClient.company ? " (" + newClient.company + ")" : ""}`,
      client_id: newClient.id,
      client_name: newClient.name
    });

    return newClient;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    await delay();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...clients[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    clients[index] = updated;

    await this.logActivity({
      event_type: "client_updated",
      description: `Kunde oppdatert: ${updated.name} (Status: ${updated.status})`,
      client_id: updated.id,
      client_name: updated.name
    });

    return updated;
  },

  async archiveClient(id: string, is_archived = true): Promise<boolean> {
    await delay();
    const client = clients.find(c => c.id === id);
    if (!client) return false;
    client.is_archived = is_archived;
    client.updated_at = new Date().toISOString();
    return true;
  },

  async deleteClient(id: string): Promise<boolean> {
    await delay();
    const initialLen = clients.length;
    clients = clients.filter(c => c.id !== id);
    return clients.length < initialLen;
  },

  // --------------------------------------------------------------------------
  // FORMS (Form Builder)
  // --------------------------------------------------------------------------
  async getForms(filters?: { status?: FormStatus; is_template?: boolean }): Promise<Form[]> {
    await delay();
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
    await delay();
    return forms.find(f => f.id === id) || null;
  },

  async getFormBySlug(slug: string): Promise<Form | null> {
    await delay();
    return forms.find(f => f.slug === slug) || null;
  },

  async createForm(data: Partial<Form>): Promise<Form> {
    await delay();
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
    await delay();
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
    await delay();
    const initialLen = forms.length;
    forms = forms.filter(f => f.id !== id);
    return forms.length < initialLen;
  },

  // --------------------------------------------------------------------------
  // FORM DISTRIBUTIONS
  // --------------------------------------------------------------------------
  async getDistributions(filters?: { clientId?: string; formId?: string }): Promise<FormDistribution[]> {
    await delay();
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
    await delay();
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
    await delay();
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
    await delay();
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
    await delay();
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
    await delay();
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
    await delay();
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

    // Update distribution status to submitted
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
    await delay();
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
    await delay();
    return notes
      .filter(n => n.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addClientNote(clientId: string, content: string, authorName = "Mari"): Promise<ClientNote> {
    await delay();
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
    await delay();
    const initialLen = notes.length;
    notes = notes.filter(n => n.id !== noteId);
    return notes.length < initialLen;
  },

  // --------------------------------------------------------------------------
  // ACTIVITIES (Audit Log)
  // --------------------------------------------------------------------------
  async getActivities(limit = 50): Promise<Activity[]> {
    await delay();
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
    return true;
  }
};
