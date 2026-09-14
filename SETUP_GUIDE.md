# Oppsettsveiledning for "by mari" (bymari.no)

Dette dokumentet gir en komplett, trinnvis veiledning for å sette opp og drifte **by mari** nettsiden og det private administrasjonssystemet i produksjon og lokalt.

---

## 1. Oversikt over arkitektur

- **Frontend & Admin:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database & Sikkerhet:** Supabase PostgreSQL med Row Level Security (RLS)
- **Autentisering:** Supabase Auth (kun for autoriserte administratorer)
- **Fillagring:** Supabase Storage (privat bøtte `client-uploads` med tidsbegrensede signerte lenker)
- **E-postutsending:** Resend API (`By Mari <hei@bymari.no>`)

---

## 2. Miljøvariabler (.env.local)

Opprett en fil kalt `.env.local` i rotmappen med følgende variabler:

```env
# Supabase konfigurasjon
NEXT_PUBLIC_SUPABASE_URL=https://ditt-prosjekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=din-service-role-secret-key

# Resend e-postkonfigurasjon
RESEND_API_KEY=re_123456789...
EMAIL_FROM="By Mari <hei@bymari.no>"
ADMIN_NOTIFICATION_EMAIL=hei@bymari.no

# Applikasjonens URL
NEXT_PUBLIC_APP_URL=https://bymari.no
```

---

## 3. Supabase-oppsett & Databasemigrasjoner

### Steg 3.1: Opprett prosjekt
1. Gå til [supabase.com](https://supabase.com) og opprett et nytt prosjekt (f.eks. `bymari-production`).
2. Velg region nærmest Norge (f.eks. `eu-north-1` Stockholm eller `eu-central-1` Frankfurt).

### Steg 3.2: Kjør SQL-migrasjon
1. Åpne **SQL Editor** i Supabase Dashboard.
2. Lim inn og kjør innholdet fra filen:
   `supabase/migrations/20260101000000_init_schema.sql`
3. Dette oppretter automatisk:
   - Alle 10 tabeller (`profiles`, `clients`, `forms`, `form_fields`, `form_distributions`, `submissions`, `submission_answers`, `uploaded_files`, `client_notes`, `activities`)
   - Indekser for rask søking og filtrering
   - Row Level Security (RLS) retningslinjer for sikkerhet

### Steg 3.3: Opprett privat lagringsbøtte (Storage)
1. Gå til **Storage** i Supabase.
2. Opprett en ny bøtte med navn: `client-uploads`
3. Sett **Public bucket** til **Disabled** (privat bøtte).

---

## 4. Opprettelse av administratorkonto

Offentlig registrering er deaktivert. For å opprette din administratorkonto:

1. Gå til **Authentication -> Users** i Supabase Dashboard.
2. Klikk **Add User -> Create User**.
3. Oppgi e-post (`hei@bymari.no`) og et sikkert passord.
4. Kryss av for **Auto Confirm User**.
5. Gå deretter til SQL Editor og knytt brukeren til `profiles`-tabellen:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   SELECT id, email, 'Mari', 'admin'
   FROM auth.users
   WHERE email = 'hei@bymari.no'
   ON CONFLICT (id) DO NOTHING;
   ```

---

## 5. Resend e-postoppsett & Domenevalidering

1. Logg inn på [resend.com](https://resend.com).
2. Gå til **Domains -> Add Domain** og legg inn `bymari.no`.
3. Legg inn de oppgitte DNS-postene (DKIM, SPF, MX) hos din domeneleverandør for `bymari.no`.
4. Gå til **API Keys** og generer en nøkkel med fulle sendingsrettigheter.
5. Lim inn nøkkelen som `RESEND_API_KEY` i miljøvariablene.

---

## 6. Lokal utvikling

```bash
# 1. Installer avhengigheter
npm install

# 2. Start utviklingsserver
npm run dev

# 3. Åpne i nettleser
# Nettside: http://localhost:3000
# Adminpanel: http://localhost:3000/admin
```

---

## 7. Produksjonsdistribusjon (Vercel)

1. Push kildekoden til et privat GitHub-repository.
2. Importer prosjektet på [Vercel](https://vercel.com).
3. Legg inn miljøvariablene fra seksjon 2 i Vercels **Environment Variables**.
4. Koble til domenet `bymari.no` under **Project Settings -> Domains**.
5. Distribusjonen bygger og publiserer automatisk!
