import { z } from "zod";

// Contact form on public marketing website
export const contactFormSchema = z.object({
  name: z.string().min(2, "Navn må ha minst 2 tegn"),
  email: z.string().email("Vennligst oppgi en gyldig e-postadresse"),
  company: z.string().optional(),
  service: z.string().min(1, "Vennligst velg hva du trenger hjelp med"),
  message: z.string().min(10, "Fortell litt mer om prosjektet (minst 10 tegn)")
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Client creation & update
export const clientSchema = z.object({
  name: z.string().min(2, "Navn må fylles ut"),
  company: z.string().optional().nullable(),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional().nullable(),
  status: z.enum(["Ny", "Kontaktet", "Møte avtalt", "Tilbud sendt", "Aktiv kunde", "Avsluttet"]),
  requested_service: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  next_activity_date: z.string().optional().nullable(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Form builder field
export const formFieldOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Valgtekst kan ikke være tom"),
  value: z.string().min(1, "Verdi kan ikke være tom")
});

export const formFieldSchema = z.object({
  id: z.string(),
  form_id: z.string(),
  field_type: z.enum([
    "text", "textarea", "email", "phone", "number",
    "date", "radio", "checkbox", "select", "file", "info"
  ]),
  label: z.string().min(1, "Spørsmålstekst er påkrevd"),
  description: z.string().optional().nullable(),
  is_required: z.boolean(),
  options: z.array(formFieldOptionSchema).optional(),
  position: z.number().int().nonnegative()
});

export const formSchema = z.object({
  title: z.string().min(2, "Skjematittel må ha minst 2 tegn"),
  slug: z.string().min(2, "Skjemaslug må fylles ut"),
  introduction: z.string().optional().nullable(),
  confirmation_message: z.string().min(5, "Bekreftelsesmelding må fylles ut"),
  status: z.enum(["draft", "published", "archived"]),
  is_template: z.boolean(),
  fields: z.array(formFieldSchema).optional()
});

export type FormFormData = z.infer<typeof formSchema>;

// Form distribution
export const formDistributionSchema = z.object({
  form_id: z.string().min(1, "Velg et skjema"),
  client_id: z.string().optional().nullable(),
  email_subject: z.string().min(2, "E-postemne er påkrevd"),
  email_intro: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  send_email: z.boolean().default(true)
});

export type FormDistributionData = z.infer<typeof formDistributionSchema>;

// Internal Client Note
export const clientNoteSchema = z.object({
  content: z.string().min(2, "Notattekst kan ikke være tom")
});
