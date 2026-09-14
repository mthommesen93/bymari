import React from "react";
import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Personvernerklæring — by mari",
  description: "Informasjon om hvordan by mari samler inn, behandler og beskytter personopplysninger i henhold til GDPR."
};

export default function PersonvernPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm text-forest-green hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tilbake til forsiden</span>
          </Link>

          <span className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium block mb-3">
            Juridisk & Sikkerhet
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-tight mb-8">
            Personvernerklæring
          </h1>

          <div className="prose prose-stone max-w-none text-charcoal/85 space-y-8 font-light text-base leading-relaxed">
            <p>
              Sist oppdatert: September 2026. Denne personvernerklæringen forklarer hvordan <strong>by mari</strong> (org. og kontakt: hei@bymari.no, bymari.no) samler inn, behandler og sikrer personopplysninger i samsvar med gjeldende personvernlovgivning (GDPR).
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-medium text-charcoal">1. Hvilke opplysninger samles inn?</h2>
              <p>
                Vi samler kun inn opplysninger som er strengt nødvendige for å besvare henvendelser, levere avtalte tjenester og administrere kundeforholdet:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Kontakthenvendelser:</strong> Navn, e-postadresse, virksomhetsnavn, ønsket tjeneste og prosjektbeskrivelse.</li>
                <li><strong>Kundeoppstart og spørreskjemaer:</strong> Informasjon du fyller ut i digitale skjemaer distribuert til deg (f.eks. merkevaremateriell, innhold, målgruppebeskrivelser, kontaktinformasjon).</li>
                <li><strong>Tekniske logger:</strong> Tidsstempel for når distribuerte skjemaer åpnes og sendes inn for å sikre sporing og hindre utilsiktet tap av svar.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-medium text-charcoal">2. Formålet med behandlingen</h2>
              <p>
                Opplysningene behandles utelukkende for å:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Følge opp og besvare henvendelser mottatt via nettsiden.</li>
                <li>Gjennomføre design- og utviklingsoppdrag i tråd med inngått avtale.</li>
                <li>Sikre trygg og nøyaktig overlevering av prosjektmateriell via skreddersydde skjemaer.</li>
                <li>Oppfylle lovpålagte regnskaps- og dokumentasjonskrav.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-medium text-charcoal">3. Lagring, tilgang og sikkerhet</h2>
              <p>
                Alle data lagres i sikre, krypterte databaser med strenge tilgangskontroller (Row Level Security). Kun autorisert administrator har tilgang til administrasjonspanelet. Kundeopplastede filer lagres i private lagringsbøtter og kan kun åpnes via tidsbegrensede, signerte adgangslenker.
              </p>
              <p>
                Vi selger eller videreformidler aldri dine personopplysninger til tredjeparter for markedsføringsformål.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-medium text-charcoal">4. Dine rettigheter</h2>
              <p>
                Du har i henhold til personopplysningsloven rett til:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Innsyn i hvilke personopplysninger vi har lagret om deg.</li>
                <li>Å be om retting av uriktige eller ufullstendige opplysninger.</li>
                <li>Å kreve sletting av dine opplysninger når de ikke lenger er nødvendige for formålet de ble samlet inn for.</li>
              </ul>
              <p>
                Ønsker du å benytte deg av dine rettigheter, ta kontakt direkte på <a href="mailto:hei@bymari.no" className="text-forest-green underline font-normal">hei@bymari.no</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
