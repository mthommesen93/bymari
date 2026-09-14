import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const caseStudies = [
  {
    title: "Nordic Light Kaffebrenneri",
    client: "Nordic Light Kaffe",
    category: "Nettsider & E-handel",
    description: "En rolig og sanselig digital tilstedeværelse for et mikrobrenneri, med fokus på kaffeopprinnelse, brennemetoder og sømløs abonnementsbestilling.",
    result: "Tydelig profil som formidler håndverkskvalitet og forenkler kaffeabonnement.",
    imageBg: "bg-[#EAE4DC]",
    imageAspect: "Kaffeposer og ren typografi på naturfarget lin",
    tag: "Eksempelarbeid",
    linkText: "Se detaljer"
  },
  {
    title: "Fjord Arkitektur Portfolio",
    client: "Fjord Arkitektur AS",
    category: "Design & Utvikling",
    description: "Minimalistisk porteføljenettsted som fremhever arkitektoniske kvaliteter gjennom presis typografi, generøs hvitflate og fotografi i stort format.",
    result: "Enkelt for oppdragsgivere å utforske prosjekter og forstå filosofien bak bygningene.",
    imageBg: "bg-[#DFE3DE]",
    imageAspect: "Arkitektoniske linjer og trematerialer i nordisk dagslys",
    tag: "Eksempelarbeid",
    linkText: "Se detaljer"
  },
  {
    title: "Varde Prosjektberegner",
    client: "Varde Rådgivning",
    category: "Applikasjon & Skjemaer",
    description: "Brukervennlig webapplikasjon og kundeskjema for beregning av energiattester og automatisert sammenstilling av tilstandsrapporter for næringsbygg.",
    result: "Forenklet datainnsamling fra kunden og sparte flere timer per prosjekt.",
    imageBg: "bg-[#E6E1D8]",
    imageAspect: "Strukturert grensesnitt med dynamiske beregninger",
    tag: "Eksempelarbeid",
    linkText: "Se detaljer"
  }
];

export function Work() {
  return (
    <section id="arbeid" className="py-24 md:py-36 border-b border-sand scroll-mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-24">
          <span className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium block mb-4">
            Arbeid
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-tight leading-snug">
            Utvalgte arbeider
          </h2>
          <p className="mt-4 text-base text-charcoal/70 font-light">
            Eksempler på hvordan gjennomarbeidet design og ryddig kode skaper gode brukeropplevelser.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-24">
          {caseStudies.map((project, index) => (
            <div 
              key={index}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              {/* Image / Graphic container */}
              <div className={`lg:col-span-7 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className={`w-full aspect-[16/10] ${project.imageBg} border border-sand rounded-sm p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden group`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.16em] text-charcoal/60 bg-warm-white/80 px-3 py-1 rounded-sm">
                      {project.tag}
                    </span>
                    <span className="text-xs font-mono text-charcoal/50">
                      Case 0{index + 1}
                    </span>
                  </div>

                  <div className="my-auto text-center py-6">
                    <div className="inline-block border border-charcoal/20 bg-warm-white/90 px-6 py-4 rounded-sm shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-sage-dark mb-1 font-mono">{project.category}</p>
                      <h4 className="text-lg sm:text-xl font-normal text-charcoal">{project.title}</h4>
                    </div>
                  </div>

                  <div className="text-xs text-charcoal/60 text-right italic">
                    {project.imageAspect}
                  </div>
                </div>
              </div>

              {/* Text info */}
              <div className={`lg:col-span-5 space-y-6 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div>
                  <div className="flex items-center space-x-3 text-xs uppercase tracking-widest text-sage-dark mb-2">
                    <span>{project.client}</span>
                    <span>&bull;</span>
                    <span>{project.category}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-light text-charcoal">
                    {project.title}
                  </h3>
                </div>

                <p className="text-base text-charcoal/80 font-light leading-relaxed">
                  {project.description}
                </p>

                <div className="p-4 bg-sand/20 border-l-2 border-forest-green rounded-r-sm">
                  <p className="text-xs uppercase tracking-wider text-charcoal/60 font-medium mb-1">Resultat</p>
                  <p className="text-sm text-charcoal font-normal">{project.result}</p>
                </div>

                <div>
                  <Link
                    href="#kontakt"
                    className="inline-flex items-center space-x-1.5 text-sm font-medium text-forest-green hover:text-forest-green-hover group focus:outline-none focus-visible:underline"
                  >
                    <span>Diskuter et lignende prosjekt</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
