import { Client, Form, FormDistribution, Submission, ClientNote, Activity } from "./types";

export const initialClients: Client[] = [
  {
    id: "c1-nordic-light",
    name: "Henrik Solberg",
    company: "Nordic Light Kaffe",
    email: "henrik@nordiclightkaffe.no",
    phone: "+47 912 34 567",
    status: "Aktiv kunde",
    requested_service: "Nettsider & Enkel Nettbutikk",
    internal_notes: "Kvalitetsfokusert mikrobrenneri. Trenger ny nettside med abonnementsmodul og rolig skandinavisk formspråk.",
    next_activity_date: "2026-09-22T10:00:00Z",
    is_archived: false,
    created_at: "2026-08-10T09:30:00Z",
    updated_at: "2026-09-12T14:20:00Z"
  },
  {
    id: "c2-fjord-ark",
    name: "Astrid Lindgren",
    company: "Fjord Arkitektur AS",
    email: "astrid@fjordarkitektur.no",
    phone: "+47 988 77 665",
    status: "Tilbud sendt",
    requested_service: "Design og prototyper",
    internal_notes: "Arkitektkontor i Oslo. Ønsker porteføljeside med fokus på store bilder og presis typografi. Tilbud oversendt forrige uke.",
    next_activity_date: "2026-09-18T14:00:00Z",
    is_archived: false,
    created_at: "2026-09-02T11:00:00Z",
    updated_at: "2026-09-10T16:45:00Z"
  },
  {
    id: "c3-oslo-keramikk",
    name: "Sofie Dahl",
    company: "Oslo Keramikkverksted",
    email: "sofie@oslokeramikk.no",
    phone: "+47 412 90 811",
    status: "Møte avtalt",
    requested_service: "Nettsider",
    internal_notes: "Verksted og galleri på Grünerløkka. Skal ha kursoversikt og påmeldingsskjema.",
    next_activity_date: "2026-09-16T13:30:00Z",
    is_archived: false,
    created_at: "2026-09-08T08:15:00Z",
    updated_at: "2026-09-13T10:00:00Z"
  },
  {
    id: "c4-varde-konsulent",
    name: "Magnus Berg",
    company: "Varde Rådgivning",
    email: "magnus@varderadgivning.no",
    phone: "+47 900 12 345",
    status: "Ny",
    requested_service: "Applikasjoner",
    internal_notes: "Innsendt via nettsidens kontaktskjema. Ønsker et internt beregningsverktøy for energimerking.",
    next_activity_date: "2026-09-15T09:00:00Z",
    is_archived: false,
    created_at: "2026-09-14T07:20:00Z",
    updated_at: "2026-09-14T07:20:00Z"
  },
  {
    id: "c5-bark-mobler",
    name: "Eirik Haugen",
    company: "Bark Møbeldesign",
    email: "eirik@barkdesign.no",
    phone: "+47 480 23 119",
    status: "Avsluttet",
    requested_service: "Nettsider",
    internal_notes: "Prosjekt levert og godkjent våren 2026. Svært fornøyd kunde.",
    next_activity_date: null,
    is_archived: false,
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-06-15T12:00:00Z"
  }
];

export const initialForms: Form[] = [
  {
  "id": "f-prosjektskjema",
  "title": "Prosjektskjema",
  "slug": "prosjektskjema",
  "introduction": "Takk for at du vurderer By Mari.\\n\\nDette skjemaet gir meg et bedre bilde av virksomheten, kundene deres og løsningen dere ønsker. Svarene trenger ikke være detaljerte eller endelige. De brukes som utgangspunkt for den første demoen og vårt neste møte.\\n\\nDet tar omtrent 10 minutter å fylle ut skjemaet.",
  "confirmation_message": "Takk for svarene!\\n\\nJeg går gjennom informasjonen og bruker den som utgangspunkt for den første demoen og vårt neste møte. Jeg tar kontakt dersom jeg trenger noen avklaringer underveis.\\n\\nHilsen By Mari",
  "status": "published",
  "is_template": true,
  "created_at": "2026-09-14T20:05:55.731Z",
  "updated_at": "2026-09-14T20:05:55.731Z",
  "fields": [
    {
      "id": "fld-sec-1",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "1. Kontaktinformasjon",
      "description": "Grunnleggende informasjon om virksomheten og kontaktperson.",
      "is_required": false,
      "position": 0
    },
    {
      "id": "fld-ps-1",
      "form_id": "f-prosjektskjema",
      "field_type": "text",
      "label": "1. Hva heter virksomheten?",
      "description": "",
      "is_required": true,
      "position": 1
    },
    {
      "id": "fld-ps-2",
      "form_id": "f-prosjektskjema",
      "field_type": "text",
      "label": "2. Hva heter kontaktpersonen?",
      "description": "",
      "is_required": true,
      "position": 2
    },
    {
      "id": "fld-ps-3",
      "form_id": "f-prosjektskjema",
      "field_type": "email",
      "label": "3. Hva er epostadressen din?",
      "description": "",
      "is_required": true,
      "position": 3
    },
    {
      "id": "fld-ps-4",
      "form_id": "f-prosjektskjema",
      "field_type": "phone",
      "label": "4. Hva er telefonnummeret ditt?",
      "description": "",
      "is_required": false,
      "position": 4
    },
    {
      "id": "fld-sec-2",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "2. Om virksomheten",
      "description": "Hjelp oss å forstå hva dere gjør og hvem dere henvender dere til.",
      "is_required": false,
      "position": 5
    },
    {
      "id": "fld-ps-5",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "5. Hva tilbyr virksomheten?",
      "description": "Beskriv kort de viktigste produktene eller tjenestene.",
      "is_required": true,
      "position": 6
    },
    {
      "id": "fld-ps-6",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "6. Hvem er de viktigste kundene deres?",
      "description": "Beskriv gjerne alder, behov, bosted, bransje eller andre relevante kjennetegn.",
      "is_required": true,
      "position": 7
    },
    {
      "id": "fld-ps-7",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "7. Hva skiller virksomheten fra konkurrentene?",
      "description": "",
      "is_required": false,
      "position": 8
    },
    {
      "id": "fld-ps-8",
      "form_id": "f-prosjektskjema",
      "field_type": "text",
      "label": "8. Hvor holder virksomheten til, og hvilke områder betjener dere?",
      "description": "",
      "is_required": false,
      "position": 9
    },
    {
      "id": "fld-sec-3",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "3. Prosjektet",
      "description": "Mål, formål og primærhandling for den nye løsningen.",
      "is_required": false,
      "position": 10
    },
    {
      "id": "fld-ps-9",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "9. Hva ønsker dere hjelp med?",
      "description": "Velg alle områder som er aktuelle.",
      "is_required": true,
      "options": [
        {
          "id": "p9-1",
          "label": "Ny nettside",
          "value": "ny_nettside"
        },
        {
          "id": "p9-2",
          "label": "Oppgradering av eksisterende nettside",
          "value": "oppgradering"
        },
        {
          "id": "p9-3",
          "label": "Nettbutikk",
          "value": "nettbutikk"
        },
        {
          "id": "p9-4",
          "label": "Webapplikasjon",
          "value": "webapplikasjon"
        },
        {
          "id": "p9-5",
          "label": "Landingsside",
          "value": "landingsside"
        },
        {
          "id": "p9-6",
          "label": "Kundeportal",
          "value": "kundeportal"
        },
        {
          "id": "p9-7",
          "label": "Design og prototype",
          "value": "design_prototype"
        },
        {
          "id": "p9-8",
          "label": "Annet",
          "value": "annet"
        }
      ],
      "position": 11
    },
    {
      "id": "fld-ps-10",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "10. Hvorfor ønsker dere en ny løsning?",
      "description": "Eksempel: få flere kunder, modernisere virksomheten, forbedre kundeopplevelsen eller effektivisere en arbeidsprosess.",
      "is_required": false,
      "position": 12
    },
    {
      "id": "fld-ps-11",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "11. Hva er det viktigste løsningen skal oppnå?",
      "description": "Velg gjerne inntil tre alternativer.",
      "is_required": true,
      "options": [
        {
          "id": "p11-1",
          "label": "Skaffe flere henvendelser",
          "value": "henvendelser"
        },
        {
          "id": "p11-2",
          "label": "Øke salget",
          "value": "salg"
        },
        {
          "id": "p11-3",
          "label": "Presentere produkter eller tjenester",
          "value": "presentere"
        },
        {
          "id": "p11-4",
          "label": "Bygge tillit",
          "value": "tillit"
        },
        {
          "id": "p11-5",
          "label": "Gjøre informasjon lettere tilgjengelig",
          "value": "informasjon"
        },
        {
          "id": "p11-6",
          "label": "Forenkle bestilling eller reservasjon",
          "value": "bestilling"
        },
        {
          "id": "p11-7",
          "label": "Automatisere en arbeidsprosess",
          "value": "automatisering"
        },
        {
          "id": "p11-8",
          "label": "Tilby selvbetjening",
          "value": "selvbetjening"
        },
        {
          "id": "p11-9",
          "label": "Samle inn potensielle kunder",
          "value": "leads"
        },
        {
          "id": "p11-10",
          "label": "Annet",
          "value": "annet"
        }
      ],
      "position": 13
    },
    {
      "id": "fld-ps-12",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "12. Hva ønsker dere at besøkende først og fremst skal gjøre?",
      "description": "Velg det primære målet for en besøkende.",
      "is_required": true,
      "options": [
        {
          "id": "p12-1",
          "label": "Ta kontakt",
          "value": "ta_kontakt"
        },
        {
          "id": "p12-2",
          "label": "Be om tilbud",
          "value": "be_om_tilbud"
        },
        {
          "id": "p12-3",
          "label": "Bestille time",
          "value": "bestille_time"
        },
        {
          "id": "p12-4",
          "label": "Kjøpe et produkt",
          "value": "kjope_produkt"
        },
        {
          "id": "p12-5",
          "label": "Registrere en konto",
          "value": "registrere_konto"
        },
        {
          "id": "p12-6",
          "label": "Melde seg på",
          "value": "melde_pa"
        },
        {
          "id": "p12-7",
          "label": "Besøke et fysisk sted",
          "value": "besoke_sted"
        },
        {
          "id": "p12-8",
          "label": "Finne informasjon",
          "value": "finne_info"
        },
        {
          "id": "p12-9",
          "label": "Bruke en digital tjeneste",
          "value": "bruke_tjeneste"
        },
        {
          "id": "p12-10",
          "label": "Annet",
          "value": "annet"
        }
      ],
      "position": 14
    },
    {
      "id": "fld-sec-4",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "4. Innhold",
      "description": "Sider, tekster, bilder og materiell.",
      "is_required": false,
      "position": 15
    },
    {
      "id": "fld-ps-13",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "13. Hvilke sider eller områder ønsker dere?",
      "description": "Velg de sidene som er aktuelle.",
      "is_required": true,
      "options": [
        {
          "id": "p13-1",
          "label": "Forside",
          "value": "forside"
        },
        {
          "id": "p13-2",
          "label": "Om virksomheten",
          "value": "om_oss"
        },
        {
          "id": "p13-3",
          "label": "Produkter",
          "value": "produkter"
        },
        {
          "id": "p13-4",
          "label": "Tjenester",
          "value": "tjenester"
        },
        {
          "id": "p13-5",
          "label": "Priser",
          "value": "priser"
        },
        {
          "id": "p13-6",
          "label": "Kontakt",
          "value": "kontakt"
        },
        {
          "id": "p13-7",
          "label": "Ofte stilte spørsmål",
          "value": "faq"
        },
        {
          "id": "p13-8",
          "label": "Referanser eller kundeomtaler",
          "value": "referanser"
        },
        {
          "id": "p13-9",
          "label": "Galleri",
          "value": "galleri"
        },
        {
          "id": "p13-10",
          "label": "Ansatte",
          "value": "ansatte"
        },
        {
          "id": "p13-11",
          "label": "Artikler eller nyheter",
          "value": "nyheter"
        },
        {
          "id": "p13-12",
          "label": "Bestilling",
          "value": "bestilling"
        },
        {
          "id": "p13-13",
          "label": "Innlogging",
          "value": "innlogging"
        },
        {
          "id": "p13-14",
          "label": "Nettbutikk",
          "value": "nettbutikk"
        },
        {
          "id": "p13-15",
          "label": "Annet",
          "value": "annet"
        }
      ],
      "position": 16
    },
    {
      "id": "fld-ps-14",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "14. Hvilket innhold har dere allerede?",
      "description": "Kryss av for hva som er klart.",
      "is_required": true,
      "options": [
        {
          "id": "p14-1",
          "label": "Logo",
          "value": "logo"
        },
        {
          "id": "p14-2",
          "label": "Tekster",
          "value": "tekster"
        },
        {
          "id": "p14-3",
          "label": "Bilder",
          "value": "bilder"
        },
        {
          "id": "p14-4",
          "label": "Video",
          "value": "video"
        },
        {
          "id": "p14-5",
          "label": "Produktinformasjon",
          "value": "produktinfo"
        },
        {
          "id": "p14-6",
          "label": "Prislister",
          "value": "prislister"
        },
        {
          "id": "p14-7",
          "label": "Kundeomtaler",
          "value": "kundeomtaler"
        },
        {
          "id": "p14-8",
          "label": "Grafisk profil",
          "value": "grafisk_profil"
        },
        {
          "id": "p14-9",
          "label": "Vi trenger hjelp med innholdet",
          "value": "trenger_hjelp"
        }
      ],
      "position": 17
    },
    {
      "id": "fld-ps-15",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "15. Hvem skal skrive tekstene?",
      "description": "",
      "is_required": false,
      "options": [
        {
          "id": "p15-1",
          "label": "Vi leverer ferdige tekster",
          "value": "ferdige_tekster"
        },
        {
          "id": "p15-2",
          "label": "Vi leverer et utkast",
          "value": "utkast"
        },
        {
          "id": "p15-3",
          "label": "Vi ønsker hjelp med tekstene",
          "value": "trenger_hjelp"
        },
        {
          "id": "p15-4",
          "label": "Ikke avklart",
          "value": "ikke_avklart"
        }
      ],
      "position": 18
    },
    {
      "id": "fld-ps-16",
      "form_id": "f-prosjektskjema",
      "field_type": "file",
      "label": "16. Last gjerne opp logo, bilder eller annet relevant materiale.",
      "description": "Støtter PDF, PNG, JPG opptil 10 MB.",
      "is_required": false,
      "position": 19
    },
    {
      "id": "fld-sec-5",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "5. Funksjoner",
      "description": "Funksjonalitet, integrasjoner og tekniske behov.",
      "is_required": false,
      "position": 20
    },
    {
      "id": "fld-ps-17",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "17. Hvilke funksjoner ønsker dere?",
      "description": "Kryss av for ønskede elementer.",
      "is_required": true,
      "options": [
        {
          "id": "p17-1",
          "label": "Kontaktskjema",
          "value": "kontaktskjema"
        },
        {
          "id": "p17-2",
          "label": "Timebestilling",
          "value": "timebestilling"
        },
        {
          "id": "p17-3",
          "label": "Reservasjon",
          "value": "reservasjon"
        },
        {
          "id": "p17-4",
          "label": "Betaling",
          "value": "betaling"
        },
        {
          "id": "p17-5",
          "label": "Nettbutikk",
          "value": "nettbutikk"
        },
        {
          "id": "p17-6",
          "label": "Produktkatalog",
          "value": "produktkatalog"
        },
        {
          "id": "p17-7",
          "label": "Brukerinnlogging",
          "value": "brukerinnlogging"
        },
        {
          "id": "p17-8",
          "label": "Kundeportal",
          "value": "kundeportal"
        },
        {
          "id": "p17-9",
          "label": "Søk",
          "value": "sok"
        },
        {
          "id": "p17-10",
          "label": "Kart og veibeskrivelse",
          "value": "kart"
        },
        {
          "id": "p17-11",
          "label": "Nyhetsbrev",
          "value": "nyhetsbrev"
        },
        {
          "id": "p17-12",
          "label": "Chat",
          "value": "chat"
        },
        {
          "id": "p17-13",
          "label": "Flere språk",
          "value": "flere_sprak"
        },
        {
          "id": "p17-14",
          "label": "Integrasjon med andre systemer",
          "value": "integrasjon"
        },
        {
          "id": "p17-15",
          "label": "Annet",
          "value": "annet"
        }
      ],
      "position": 21
    },
    {
      "id": "fld-ps-18",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "18. Skal brukerne kunne opprette en konto?",
      "description": "",
      "is_required": false,
      "options": [
        {
          "id": "p18-1",
          "label": "Ja",
          "value": "ja"
        },
        {
          "id": "p18-2",
          "label": "Nei",
          "value": "nei"
        },
        {
          "id": "p18-3",
          "label": "Ikke avklart",
          "value": "ikke_avklart"
        }
      ],
      "position": 22
    },
    {
      "id": "fld-ps-19",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "19. Skal løsningen motta betaling?",
      "description": "",
      "is_required": false,
      "options": [
        {
          "id": "p19-1",
          "label": "Ja",
          "value": "ja"
        },
        {
          "id": "p19-2",
          "label": "Nei",
          "value": "nei"
        },
        {
          "id": "p19-3",
          "label": "Kanskje senere",
          "value": "kanskje_senere"
        },
        {
          "id": "p19-4",
          "label": "Ikke avklart",
          "value": "ikke_avklart"
        }
      ],
      "position": 23
    },
    {
      "id": "fld-ps-20",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "20. Må løsningen kobles til andre systemer?",
      "description": "Eksempel: kalender, betaling, kunderegister, lager eller epost.",
      "is_required": false,
      "position": 24
    },
    {
      "id": "fld-sec-6",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "6. Visuelt uttrykk",
      "description": "Stil, stemning og merkevarefølelse.",
      "is_required": false,
      "position": 25
    },
    {
      "id": "fld-ps-21",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "21. Hvordan ønsker dere at løsningen skal oppleves?",
      "description": "Velg gjerne mellom tre og fem ord.",
      "is_required": true,
      "options": [
        {
          "id": "p21-1",
          "label": "Profesjonell",
          "value": "profesjonell"
        },
        {
          "id": "p21-2",
          "label": "Moderne",
          "value": "moderne"
        },
        {
          "id": "p21-3",
          "label": "Enkel",
          "value": "enkel"
        },
        {
          "id": "p21-4",
          "label": "Eksklusiv",
          "value": "eksklusiv"
        },
        {
          "id": "p21-5",
          "label": "Personlig",
          "value": "personlig"
        },
        {
          "id": "p21-6",
          "label": "Kreativ",
          "value": "kreativ"
        },
        {
          "id": "p21-7",
          "label": "Trygg",
          "value": "trygg"
        },
        {
          "id": "p21-8",
          "label": "Teknologisk",
          "value": "teknologisk"
        },
        {
          "id": "p21-9",
          "label": "Tradisjonell",
          "value": "tradisjonell"
        },
        {
          "id": "p21-10",
          "label": "Minimalistisk",
          "value": "minimalistisk"
        },
        {
          "id": "p21-11",
          "label": "Fargerik",
          "value": "fargerik"
        },
        {
          "id": "p21-12",
          "label": "Varm",
          "value": "varm"
        },
        {
          "id": "p21-13",
          "label": "Annet",
          "value": "annet"
        }
      ],
      "position": 26
    },
    {
      "id": "fld-ps-22",
      "form_id": "f-prosjektskjema",
      "field_type": "checkbox",
      "label": "22. Har dere en eksisterende visuell profil?",
      "description": "",
      "is_required": false,
      "options": [
        {
          "id": "p22-1",
          "label": "Logo",
          "value": "logo"
        },
        {
          "id": "p22-2",
          "label": "Farger",
          "value": "farger"
        },
        {
          "id": "p22-3",
          "label": "Skrifttyper",
          "value": "skrifttyper"
        },
        {
          "id": "p22-4",
          "label": "Grafiske elementer",
          "value": "grafiske_elementer"
        },
        {
          "id": "p22-5",
          "label": "Profilmanual",
          "value": "profilmanual"
        },
        {
          "id": "p22-6",
          "label": "Nei",
          "value": "nei"
        }
      ],
      "position": 27
    },
    {
      "id": "fld-ps-23",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "23. Er det bestemte farger eller uttrykk dere ønsker å bruke eller unngå?",
      "description": "",
      "is_required": false,
      "position": 28
    },
    {
      "id": "fld-ps-24",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "24. Finnes det nettsider eller applikasjoner dere liker?",
      "description": "Legg gjerne ved to eller tre lenker, og forklar kort hva dere liker ved dem.",
      "is_required": false,
      "position": 29
    },
    {
      "id": "fld-ps-25",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "25. Finnes det uttrykk eller løsninger dere ikke liker?",
      "description": "",
      "is_required": false,
      "position": 30
    },
    {
      "id": "fld-sec-7",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "7. Eksisterende løsning",
      "description": "Erfaringer og videreføring fra dagens oppsett.",
      "is_required": false,
      "position": 31
    },
    {
      "id": "fld-ps-26",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "26. Har dere en nettside eller applikasjon i dag?",
      "description": "Legg ved lenken dersom det er relevant.",
      "is_required": true,
      "options": [
        {
          "id": "p26-1",
          "label": "Ja",
          "value": "ja"
        },
        {
          "id": "p26-2",
          "label": "Nei",
          "value": "nei"
        }
      ],
      "position": 32
    },
    {
      "id": "fld-ps-27",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "27. Hva fungerer godt med dagens løsning?",
      "description": "",
      "is_required": false,
      "position": 33
    },
    {
      "id": "fld-ps-28",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "28. Hva fungerer dårlig eller bør forbedres?",
      "description": "",
      "is_required": false,
      "position": 34
    },
    {
      "id": "fld-ps-29",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "29. Er det innhold eller funksjoner som skal videreføres?",
      "description": "",
      "is_required": false,
      "position": 35
    },
    {
      "id": "fld-sec-8",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "8. Drift og oppfølging",
      "description": "Vedlikehold og oppdateringer etter lansering.",
      "is_required": false,
      "position": 36
    },
    {
      "id": "fld-ps-30",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "30. Hvem skal oppdatere løsningen etter lansering?",
      "description": "",
      "is_required": false,
      "options": [
        {
          "id": "p30-1",
          "label": "Vi ønsker å gjøre det selv",
          "value": "gjore_selv"
        },
        {
          "id": "p30-2",
          "label": "By Mari skal gjøre det",
          "value": "by_mari"
        },
        {
          "id": "p30-3",
          "label": "En kombinasjon",
          "value": "kombinasjon"
        },
        {
          "id": "p30-4",
          "label": "Ikke avklart",
          "value": "ikke_avklart"
        }
      ],
      "position": 37
    },
    {
      "id": "fld-ps-31",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "31. Ønsker dere opplæring i hvordan løsningen brukes og oppdateres?",
      "description": "",
      "is_required": false,
      "options": [
        {
          "id": "p31-1",
          "label": "Ja",
          "value": "ja"
        },
        {
          "id": "p31-2",
          "label": "Nei",
          "value": "nei"
        },
        {
          "id": "p31-3",
          "label": "Kanskje",
          "value": "kanskje"
        }
      ],
      "position": 38
    },
    {
      "id": "fld-sec-9",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "9. Tid og budsjett",
      "description": "Fremdriftsplan, tidsfrister og økonomiske rammer.",
      "is_required": false,
      "position": 39
    },
    {
      "id": "fld-ps-32",
      "form_id": "f-prosjektskjema",
      "field_type": "text",
      "label": "32. Når ønsker dere at løsningen skal være ferdig?",
      "description": "Oppgi dato, måned eller ønsket tidsramme.",
      "is_required": true,
      "position": 40
    },
    {
      "id": "fld-ps-33",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "33. Er lanseringen knyttet til en bestemt hendelse eller frist?",
      "description": "",
      "is_required": false,
      "position": 41
    },
    {
      "id": "fld-ps-34",
      "form_id": "f-prosjektskjema",
      "field_type": "radio",
      "label": "34. Har dere satt av et budsjett?",
      "description": "",
      "is_required": true,
      "options": [
        {
          "id": "p34-1",
          "label": "Under 15 000 kroner",
          "value": "under_15k"
        },
        {
          "id": "p34-2",
          "label": "Fra 15 000 til 30 000 kroner",
          "value": "15k_30k"
        },
        {
          "id": "p34-3",
          "label": "Fra 30 000 til 60 000 kroner",
          "value": "30k_60k"
        },
        {
          "id": "p34-4",
          "label": "Fra 60 000 til 100 000 kroner",
          "value": "60k_100k"
        },
        {
          "id": "p34-5",
          "label": "Over 100 000 kroner",
          "value": "over_100k"
        },
        {
          "id": "p34-6",
          "label": "Ønsker å diskutere dette",
          "value": "diskutere"
        }
      ],
      "position": 42
    },
    {
      "id": "fld-ps-35",
      "form_id": "f-prosjektskjema",
      "field_type": "text",
      "label": "35. Hvem skal godkjenne design, innhold og kostnader?",
      "description": "",
      "is_required": false,
      "position": 43
    },
    {
      "id": "fld-sec-10",
      "form_id": "f-prosjektskjema",
      "field_type": "info",
      "label": "10. Demo og neste møte",
      "description": "Forventninger til den første demoen og oppstartsmøtet.",
      "is_required": false,
      "position": 44
    },
    {
      "id": "fld-ps-36",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "36. Hva er det viktigste at den første demoen viser?",
      "description": "",
      "is_required": true,
      "position": 45
    },
    {
      "id": "fld-ps-37",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "37. Hvilke sider eller funksjoner bør prioriteres i demoen?",
      "description": "",
      "is_required": true,
      "position": 46
    },
    {
      "id": "fld-ps-38",
      "form_id": "f-prosjektskjema",
      "field_type": "textarea",
      "label": "38. Er det noe annet jeg bør vite før jeg starter?",
      "description": "",
      "is_required": false,
      "position": 47
    }
  ]
},

  {
    id: "f1-oppstart",
    title: "Prosjektoppstart & Behovsavklaring",
    slug: "prosjektoppstart",
    introduction: "Velkommen til prosjektoppstart med by mari. Dette skjemaet hjelper oss med å avklare mål, målgruppe og visuelle preferanser før vi går i gang med design og utvikling.",
    confirmation_message: "Tusen takk for dine svar. Jeg går nøye gjennom informasjonen og tar kontakt for neste steg i prosessen.",
    status: "published",
    is_template: true,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-15T14:00:00Z",
    fields: [
      {
        id: "fld-1",
        form_id: "f1-oppstart",
        field_type: "info",
        label: "Om prosessen",
        description: "Bruk gjerne 10-15 minutter på å svare så presist du kan. Det er helt i orden om du ikke har alle detaljer klare ennå.",
        is_required: false,
        position: 0
      },
      {
        id: "fld-2",
        form_id: "f1-oppstart",
        field_type: "text",
        label: "Hva er virksomhetens viktigste mål med den nye løsningen?",
        description: "F.eks. øke henvendelser, tydeliggjøre tjenester, automatisere bestillinger.",
        is_required: true,
        position: 1
      },
      {
        id: "fld-3",
        form_id: "f1-oppstart",
        field_type: "textarea",
        label: "Hvem er den primære målgruppen?",
        description: "Beskriv kundene dine, deres behov og hva de ser etter når de besøker dere.",
        is_required: true,
        position: 2
      },
      {
        id: "fld-4",
        form_id: "f1-oppstart",
        field_type: "checkbox",
        label: "Hvilke funksjoner eller elementer trengs?",
        description: "Velg det som er aktuelt.",
        is_required: false,
        options: [
          { id: "opt-1", label: "Responsiv nettside for mobil og desktop", value: "responsive" },
          { id: "opt-2", label: "Kontaktskjema med e-postvarsling", value: "contact" },
          { id: "opt-3", label: "Portefølje eller prosjektvisning", value: "portfolio" },
          { id: "opt-4", label: "Enkel publiseringsløsning for nyheter/artikler", value: "blog" },
          { id: "opt-5", label: "Kundeadministrasjon eller skjemamottak", value: "admin" }
        ],
        position: 3
      },
      {
        id: "fld-5",
        form_id: "f1-oppstart",
        field_type: "radio",
        label: "Hva er ønsket tidsramme for ferdigstilling?",
        description: "Velg det som passer best for planene deres.",
        is_required: true,
        options: [
          { id: "time-1", label: "Så snart som mulig (under 4 uker)", value: "urgent" },
          { id: "time-2", label: "1 til 2 måneder", value: "standard" },
          { id: "time-3", label: "Fleksibel tidsramme / utover høsten", value: "flexible" }
        ],
        position: 4
      },
      {
        id: "fld-6",
        form_id: "f1-oppstart",
        field_type: "file",
        label: "Last opp eksisterende logo, merkevareguide eller bilder",
        description: "Støtter PDF, PNG, JPG opptil 10 MB.",
        is_required: false,
        position: 5
      },
      {
        id: "fld-7",
        form_id: "f1-oppstart",
        field_type: "textarea",
        label: "Er det andre tanker eller inspirasjon du ønsker å dele?",
        description: "Lenker til nettsider du liker, spesielle ønsker eller spørsmål.",
        is_required: false,
        position: 6
      }
    ]
  },
  {
    id: "f2-innhold",
    title: "Innsamling av tekst og innhold",
    slug: "innhold-og-tekst",
    introduction: "For at nettsiden skal bli så god og presis som mulig, samler vi her inn nøkkelinnhold for de ulike seksjonene.",
    confirmation_message: "Takk for oversendt innhold. Jeg integrerer dette i designutkastet.",
    status: "published",
    is_template: true,
    created_at: "2026-08-20T12:00:00Z",
    updated_at: "2026-08-22T09:00:00Z",
    fields: [
      {
        id: "inf-1",
        form_id: "f2-innhold",
        field_type: "text",
        label: "Hovedoverskrift / slagord for forsiden",
        description: "Kort setning som oppsummerer hva dere tilbyr.",
        is_required: true,
        position: 0
      },
      {
        id: "inf-2",
        form_id: "f2-innhold",
        field_type: "textarea",
        label: "Kort introduksjonstekst",
        description: "1-2 avsnitt som forteller hvem dere er og hva dere gjør.",
        is_required: true,
        position: 1
      },
      {
        id: "inf-3",
        form_id: "f2-innhold",
        field_type: "file",
        label: "Last opp høyoppløselige bilder eller dokumenter",
        description: "Bilder av ansatte, lokaler, produkter eller referanseprosjekter.",
        is_required: false,
        position: 2
      }
    ]
  },
  {
    id: "f3-evaluering",
    title: "Evaluering etter lansering",
    slug: "evaluering",
    introduction: "Vi setter stor pris på dine tilbakemeldinger etter at vi har lansert den nye løsningen.",
    confirmation_message: "Tusen takk for dine verdifulle tilbakemeldinger!",
    status: "draft",
    is_template: false,
    created_at: "2026-09-01T14:00:00Z",
    updated_at: "2026-09-01T14:00:00Z",
    fields: [
      {
        id: "ev-1",
        form_id: "f3-evaluering",
        field_type: "select",
        label: "Hvordan opplevde du samarbeidet og prosessen?",
        is_required: true,
        options: [
          { id: "e1", label: "Svært ryddig og profesjonelt", value: "5" },
          { id: "e2", label: "Bra og oversiktlig", value: "4" },
          { id: "e3", label: "Gjennomsnittlig", value: "3" },
          { id: "e4", label: "Behov for forbedringer", value: "2" }
        ],
        position: 0
      },
      {
        id: "ev-2",
        form_id: "f3-evaluering",
        field_type: "textarea",
        label: "Hva var det mest positive med samarbeidet?",
        is_required: false,
        position: 1
      }
    ]
  }
];

export const initialDistributions: FormDistribution[] = [
  {
  "id": "dist-prosjektskjema-hoved",
  "form_id": "f-prosjektskjema",
  "client_id": null,
  "token": "prosjektskjema",
  "email_subject": "Prosjektskjema fra By Mari",
  "email_intro": "Hei! For at vi skal få et best mulig bilde av virksomheten og prosjektet ditt, ber vi deg vennligst fylle ut dette skjemaet.",
  "expires_at": null,
  "status": "sent",
  "opened_at": null,
  "submitted_at": null,
  "created_at": "2026-09-14T20:05:55.731Z",
  "updated_at": "2026-09-14T20:05:55.731Z"
},

  {
    id: "dist-1",
    form_id: "f1-oppstart",
    client_id: "c1-nordic-light",
    token: "nordic-light-oppstart-2026",
    email_subject: "Prosjektoppstart med by mari – Behovsavklaring",
    email_intro: "Hei Henrik, vi gleder oss til å gå i gang med den nye nettsiden for Nordic Light Kaffe. Vennligst fyll ut dette skjemaet når det passer.",
    expires_at: "2026-10-31T23:59:59Z",
    status: "submitted",
    opened_at: "2026-09-12T10:15:00Z",
    submitted_at: "2026-09-12T14:10:00Z",
    created_at: "2026-09-10T09:00:00Z",
    updated_at: "2026-09-12T14:10:00Z"
  },
  {
    id: "dist-2",
    form_id: "f1-oppstart",
    client_id: "c2-fjord-ark",
    token: "fjord-ark-oppstart-9821",
    email_subject: "Behovsavklaring for Fjord Arkitektur",
    email_intro: "Hei Astrid, her er skjemaet for å avklare innhold og mål for porteføljesiden.",
    expires_at: "2026-10-15T23:59:59Z",
    status: "opened",
    opened_at: "2026-09-13T16:20:00Z",
    submitted_at: null,
    created_at: "2026-09-13T14:00:00Z",
    updated_at: "2026-09-13T16:20:00Z"
  },
  {
    id: "dist-3",
    form_id: "f2-innhold",
    client_id: "c3-oslo-keramikk",
    token: "oslo-keramikk-innhold-3401",
    email_subject: "Materiell og tekst for Oslo Keramikkverksted",
    email_intro: "Hei Sofie, vennligst last opp bilder og tekst når du har det klart.",
    expires_at: "2026-11-01T23:59:59Z",
    status: "sent",
    opened_at: null,
    submitted_at: null,
    created_at: "2026-09-14T08:00:00Z",
    updated_at: "2026-09-14T08:00:00Z"
  }
];

export const initialSubmissions: Submission[] = [
  {
    id: "sub-1",
    form_id: "f1-oppstart",
    client_id: "c1-nordic-light",
    distribution_id: "dist-1",
    status: "read",
    internal_notes: "Gode og tydelige svar. Henrik prioriterer mobilvisning og enkel abonnementsbestilling for kaffebønner.",
    submitted_at: "2026-09-12T14:10:00Z",
    created_at: "2026-09-12T14:10:00Z",
    updated_at: "2026-09-13T09:00:00Z",
    answers: [
      {
        id: "ans-1",
        submission_id: "sub-1",
        field_id: "fld-2",
        field_label: "Hva er virksomhetens viktigste mål med den nye løsningen?",
        value: "Vi ønsker å fremstå som det fremste kvalitetsbrenneriet i regionen og gjøre det lekende lett for privatkunder å abonnere på ferskbrent kaffe."
      },
      {
        id: "ans-2",
        submission_id: "sub-1",
        field_id: "fld-3",
        field_label: "Hvem er den primære målgruppen?",
        value: "Kaffeentusiaster i alderen 25-55 år, samt kafeer og bedrifter som ønsker spesialkaffe av høyeste kvalitet."
      },
      {
        id: "ans-3",
        submission_id: "sub-1",
        field_id: "fld-4",
        field_label: "Hvilke funksjoner eller elementer trengs?",
        value: ["Responsiv nettside for mobil og desktop", "Portefølje eller prosjektvisning", "Kontaktskjema med e-postvarsling"]
      },
      {
        id: "ans-4",
        submission_id: "sub-1",
        field_id: "fld-5",
        field_label: "Hva er ønsket tidsramme for ferdigstilling?",
        value: "1 til 2 måneder"
      },
      {
        id: "ans-5",
        submission_id: "sub-1",
        field_id: "fld-7",
        field_label: "Er det andre tanker eller inspirasjon du ønsker å dele?",
        value: "Vi liker rene, jordnære farger og masse luft, akkurat som By Mari sin stil!"
      }
    ],
    files: [
      {
        id: "fil-1",
        submission_id: "sub-1",
        client_id: "c1-nordic-light",
        distribution_id: "dist-1",
        file_name: "nordic_light_brandguide_v2.pdf",
        file_path: "nordic-light-oppstart-2026/nordic_light_brandguide_v2.pdf",
        file_size: 2450000,
        mime_type: "application/pdf",
        created_at: "2026-09-12T14:09:00Z"
      }
    ]
  }
];

export const initialNotes: ClientNote[] = [
  {
    id: "n-1",
    client_id: "c1-nordic-light",
    author_name: "Mari",
    content: "Gjennomførte en hyggelig digital oppstartssamtale. Henrik likte skissene for layout og fargeprofil.",
    created_at: "2026-09-13T11:00:00Z",
    updated_at: "2026-09-13T11:00:00Z"
  },
  {
    id: "n-2",
    client_id: "c2-fjord-ark",
    author_name: "Mari",
    content: "Sendte tilbud på komplett redesign og porteføljeoppsett med fokus på arkitekturfotografi.",
    created_at: "2026-09-10T16:45:00Z",
    updated_at: "2026-09-10T16:45:00Z"
  }
];

export const initialActivities: Activity[] = [
  {
    id: "act-1",
    event_type: "contact_inquiry",
    description: "Ny henvendelse mottatt fra Magnus Berg (Varde Rådgivning) via kontaktskjema.",
    client_id: "c4-varde-konsulent",
    client_name: "Magnus Berg",
    created_at: "2026-09-14T07:20:00Z"
  },
  {
    id: "act-2",
    event_type: "form_sent",
    description: "Skjema «Innsamling av tekst og innhold» sendt til Sofie Dahl (Oslo Keramikkverksted).",
    client_id: "c3-oslo-keramikk",
    client_name: "Sofie Dahl",
    form_id: "f2-innhold",
    form_title: "Innsamling av tekst og innhold",
    created_at: "2026-09-14T08:00:00Z"
  },
  {
    id: "act-3",
    event_type: "form_opened",
    description: "Skjema «Prosjektoppstart & Behovsavklaring» åpnet av Astrid Lindgren (Fjord Arkitektur AS).",
    client_id: "c2-fjord-ark",
    client_name: "Astrid Lindgren",
    form_id: "f1-oppstart",
    form_title: "Prosjektoppstart & Behovsavklaring",
    created_at: "2026-09-13T16:20:00Z"
  },
  {
    id: "act-4",
    event_type: "note_added",
    description: "Internt notat lagt til på Henrik Solberg (Nordic Light Kaffe).",
    client_id: "c1-nordic-light",
    client_name: "Henrik Solberg",
    created_at: "2026-09-13T11:00:00Z"
  },
  {
    id: "act-5",
    event_type: "form_submitted",
    description: "Henrik Solberg sendte inn svar på «Prosjektoppstart & Behovsavklaring».",
    client_id: "c1-nordic-light",
    client_name: "Henrik Solberg",
    form_id: "f1-oppstart",
    form_title: "Prosjektoppstart & Behovsavklaring",
    submission_id: "sub-1",
    created_at: "2026-09-12T14:10:00Z"
  }
];
