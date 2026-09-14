# by mari — Digitalt designstudio

Offisiell nettside og privat administrasjonssystem for det norske digitale designstudioet **by mari** ([bymari.no](https://bymari.no)).

> **“Digitale løsninger, laget med omhu.”**

---

## Hovedfunksjoner

### 1. Offentlig markedsføringsnettside
- **Skandinavisk visuell identitet:** Minimalistisk, rolig layout med varm hvit (#F7F5F0), charcoal (#20211F) og skogsgrønn (#34463B).
- **Manrope typografi:** Tydelig hierarki og behagelig linjehøyde.
- **Tjenester:** 4 nummererte kjerneområder (Nettsider, Applikasjoner, Design og prototyper, Videre oppfølging).
- **Utvalgte arbeider:** Strukturert visning av prosjekteksempler med formål og resultater.
- **Prosess:** 4 tydelige steg fra idé til lansering (Forstå, Utforske, Utvikle, Lansere).
- **Kontaktskjema:** Direkte registrering i CRM og e-postvarsling til administrator via Resend.
- **Personvernerklæring:** GDPR-tilpasset side på `/personvern`.

### 2. Privat administrasjonspanel (`/admin`)
- **Oversikt / Dashboard:** Sanntidsoversikt over aktive kunder, nye leads, skjemaer som venter på svar, og siste aktiviteter.
- **Kundehåndtering (CRM):** Søk, statusfiltrering (`Ny`, `Kontaktet`, `Møte avtalt`, `Tilbud sendt`, `Aktiv kunde`, `Avsluttet`), interne notater, filoversikt og historikk.
- **Skjemabygger:** Visuell bygger med 11 felttyper, gjenbrukbare maler og direkte forhåndsvisning.
- **Skjemadistribusjon:** Generering av unike, krypterte lenker (`/f/[token]`), e-postutsendelse med merkevaremal («Åpne skjema») og åpningssporing.
- **Kundeopplevelse (`/f/[token]`):** Ingen kontokrav for kunden. Trinnvis utfylling, svarbevaring, filopplasting og låsing etter innsending.
- **Svarbehandling:** Gjennomgang av svar, nedlasting av vedlegg, utskriftsvisning (PDF) og CSV-eksport.
- **Aktivitetslogg & Innstillinger:** Komplett revisjonsspor og testverktøy for startdata.

---

## Rask start

Se [SETUP_GUIDE.md](SETUP_GUIDE.md) for fullstendig oppsett av Supabase og Resend.
