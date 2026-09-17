export type ClientStatus = "Ny" | "Kontaktet" | "Møte avtalt" | "Tilbud sendt" | "Aktiv kunde" | "Avsluttet";

export type FormStatus = "draft" | "published" | "archived";

export type FieldType = 
  | "text" 
  | "textarea" 
  | "email" 
  | "phone" 
  | "number" 
  | "date" 
  | "radio" 
  | "checkbox" 
  | "select" 
  | "file" 
  | "info";

export type DistributionStatus = 
  | "created" 
  | "sent" 
  | "opened" 
  | "started" 
  | "submitted" 
  | "expired" 
  | "revoked";

export type ResponseStatus = "new" | "read" | "in_progress" | "completed";

export interface Client {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  status: ClientStatus;
  requested_service?: string | null;
  internal_notes?: string | null;
  next_activity_date?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  form_id: string;
  field_type: FieldType;
  label: string;
  description?: string | null;
  is_required: boolean;
  options?: FormFieldOption[];
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface Form {
  id: string;
  title: string;
  slug: string;
  introduction?: string | null;
  confirmation_message: string;
  status: FormStatus;
  is_template: boolean;
  fields?: FormField[];
  created_at: string;
  updated_at: string;
}

export interface FormDistribution {
  id: string;
  form_id: string;
  client_id?: string | null;
  recipient_email?: string | null;
  token: string;
  email_subject?: string | null;
  email_intro?: string | null;
  expires_at?: string | null;
  status: DistributionStatus;
  opened_at?: string | null;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  form?: Form;
  client?: Client;
}

export interface SubmissionAnswer {
  id: string;
  submission_id: string;
  field_id?: string | null;
  field_label: string;
  value: any;
  created_at?: string;
}

export interface UploadedFile {
  id: string;
  submission_id?: string | null;
  client_id?: string | null;
  distribution_id?: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  url?: string;
}

export interface Submission {
  id: string;
  form_id: string;
  client_id?: string | null;
  distribution_id?: string | null;
  status: ResponseStatus;
  internal_notes?: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  // Joins
  form?: Form;
  client?: Client;
  distribution?: FormDistribution;
  answers?: SubmissionAnswer[];
  files?: UploadedFile[];
}

export interface QuoteItem {
  name: string;
  price: number;
  quantity?: number;
}

export type QuoteStatus = "sent" | "opened" | "accepted" | "declined" | "expired";

export interface Quote {
  id: string;
  client_id: string | null;
  token: string;
  package_name: string;
  base_price: number;
  addons: QuoteItem[];
  custom_lines: QuoteItem[];
  discount: number;
  subtotal: number;
  vat_amount: number;
  total_price: number;
  monthly_price?: number;
  delivery_time: string;
  validity_days: number;
  expires_at: string;
  email_subject: string;
  email_intro?: string;
  status: QuoteStatus;
  accepted_at?: string | null;
  declined_at?: string | null;
  signed_name?: string | null;
  client_note?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  client?: Client | null;
}

export interface ClientNote {
  id: string;
  client_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  event_type: 
    | "client_created" 
    | "client_updated" 
    | "form_created" 
    | "form_published" 
    | "form_sent" 
    | "form_opened" 
    | "form_submitted" 
    | "quote_sent"
    | "quote_accepted"
    | "quote_declined"
    | "response_status_changed" 
    | "note_added"
    | "contact_inquiry";
  description: string;
  client_id?: string | null;
  form_id?: string | null;
  submission_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  // Joins
  client_name?: string;
  form_title?: string;
}

export interface DashboardMetrics {
  activeClientsCount: number;
  newLeadsCount: number;
  awaitingFormsCount: number;
  newResponsesCount: number;
  upcomingFollowupsCount: number;
}

