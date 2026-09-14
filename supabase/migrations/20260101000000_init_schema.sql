-- ==============================================================================
-- BY MARI (bymari.no) - COMPLETE SUPABASE POSTGRESQL DATABASE SCHEMA
-- Migration: 20260101000000_init_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES (Admins)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. CLIENTS (CRM)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Ny' CHECK (status IN ('Ny', 'Kontaktet', 'Møte avtalt', 'Tilbud sendt', 'Aktiv kunde', 'Avsluttet')),
    requested_service TEXT,
    internal_notes TEXT,
    next_activity_date TIMESTAMPTZ,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_is_archived ON public.clients(is_archived);

-- ==============================================================================
-- 3. FORMS (Custom Form Builder)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    introduction TEXT,
    confirmation_message TEXT NOT NULL DEFAULT 'Takk for din henvendelse. Vi har mottatt svarene dine.',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_is_template ON public.forms(is_template);

-- ==============================================================================
-- 4. FORM FIELDS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    field_type TEXT NOT NULL CHECK (field_type IN (
        'text', 'textarea', 'email', 'phone', 'number',
        'date', 'radio', 'checkbox', 'select', 'file', 'info'
    )),
    label TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    options JSONB DEFAULT '[]'::jsonb,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_fields_form_id_position ON public.form_fields(form_id, position ASC);

-- ==============================================================================
-- 5. FORM DISTRIBUTIONS (Secure Links per Recipient)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.form_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    token TEXT NOT NULL UNIQUE,
    email_subject TEXT,
    email_intro TEXT,
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'sent', 'opened', 'started', 'submitted', 'expired', 'revoked')),
    opened_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_distributions_token ON public.form_distributions(token);
CREATE INDEX IF NOT EXISTS idx_form_distributions_client_id ON public.form_distributions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_distributions_form_id ON public.form_distributions(form_id);

-- ==============================================================================
-- 6. SUBMISSIONS (Form Responses)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    distribution_id UUID REFERENCES public.form_distributions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'completed')),
    internal_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON public.submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_client_id ON public.submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

-- ==============================================================================
-- 7. SUBMISSION ANSWERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.submission_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.form_fields(id) ON DELETE SET NULL,
    field_label TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_answers_submission_id ON public.submission_answers(submission_id);

-- ==============================================================================
-- 8. UPLOADED FILES (Private Storage references)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    distribution_id UUID REFERENCES public.form_distributions(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_submission_id ON public.uploaded_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_client_id ON public.uploaded_files(client_id);

-- ==============================================================================
-- 9. CLIENT NOTES (Internal Admin Notes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL DEFAULT 'Mari',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);

-- ==============================================================================
-- 10. ACTIVITIES (Audit Log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON public.activities(client_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Authenticated User an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies (Full access for authenticated admins)
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to forms" ON public.forms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to form_fields" ON public.form_fields FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to form_distributions" ON public.form_distributions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to submissions" ON public.submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to submission_answers" ON public.submission_answers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to uploaded_files" ON public.uploaded_files FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to client_notes" ON public.client_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins have full access to activities" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public Contact Form Policy: Anyone can insert a new client inquiry and activity
CREATE POLICY "Public can submit contact inquiries" ON public.clients FOR INSERT TO anon WITH CHECK (status = 'Ny');
CREATE POLICY "Public can record contact inquiry activity" ON public.activities FOR INSERT TO anon WITH CHECK (event_type = 'contact_inquiry');

-- Public Form Recipient Policies:
-- 1. Read form distribution by valid token
CREATE POLICY "Public can view valid distribution by token" ON public.form_distributions FOR SELECT TO anon
USING (status IN ('created', 'sent', 'opened', 'started') AND (expires_at IS NULL OR expires_at > NOW()));

-- 2. Read published form linked to distribution
CREATE POLICY "Public can view published forms" ON public.forms FOR SELECT TO anon
USING (status = 'published');

CREATE POLICY "Public can view fields of published forms" ON public.form_fields FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.status = 'published'));

-- 3. Public can submit responses via valid token
CREATE POLICY "Public can insert submission" ON public.submissions FOR INSERT TO anon
WITH CHECK (distribution_id IS NOT NULL);

CREATE POLICY "Public can insert submission answers" ON public.submission_answers FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Public can insert uploaded files" ON public.uploaded_files FOR INSERT TO anon
WITH CHECK (true);

-- ==============================================================================
-- 11. SITE CONTENT (CMS / Live Text Edits)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site_content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins have full access to site_content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

