-- ==============================================================================
-- BY MARI - SEED DATA SCRIPT (Inkluderer komplett Prosjektskjema)
-- ==============================================================================

-- 1. Insert Prosjektskjema
INSERT INTO public.forms (id, title, slug, introduction, confirmation_message, status, is_template)
VALUES (
  'f-prosjektskjema',
  'Prosjektskjema',
  'prosjektskjema',
  'Takk for at du vurderer By Mari. Dette skjemaet gir meg et bedre bilde av virksomheten, kundene deres og løsningen dere ønsker. Svarene trenger ikke være detaljerte eller endelige. De brukes som utgangspunkt for den første demoen og vårt neste møte. Det tar omtrent 10 minutter å fylle ut skjemaet.',
  'Takk for svarene! Jeg går gjennom informasjonen og bruker den som utgangspunkt for den første demoen og vårt neste møte. Jeg tar kontakt dersom jeg trenger noen avklaringer underveis. Hilsen By Mari',
  'published',
  true
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, introduction = EXCLUDED.introduction;

-- 2. Insert Default Distribution Token
INSERT INTO public.form_distributions (id, form_id, token, email_subject, email_intro, status)
VALUES (
  'dist-prosjektskjema-hoved',
  'f-prosjektskjema',
  'prosjektskjema',
  'Prosjektskjema fra By Mari',
  'Hei! For at vi skal få et best mulig bilde av virksomheten og prosjektet ditt, ber vi deg vennligst fylle ut dette skjemaet.',
  'sent'
) ON CONFLICT (id) DO NOTHING;
