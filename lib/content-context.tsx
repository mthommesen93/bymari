"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  details: string[];
}

export interface ProcessStep {
  step: string;
  title: string;
  text: string;
  detail: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    heading: string;
    subtext: string;
    primaryCta: string;
    secondaryCta: string;
  };
  services: {
    badge: string;
    heading: string;
    items: ServiceItem[];
  };
  process: {
    badge: string;
    heading: string;
    subtext: string;
    steps: ProcessStep[];
  };
  contact: {
    badge: string;
    heading: string;
    subtext: string;
    email: string;
    location: string;
  };
  footer: {
    motto: string;
    subtext: string;
    copyright: string;
  };
}

export const defaultSiteContent: SiteContent = {
  hero: {
    badge: "Digitalt designstudio • Oslo",
    heading: "Digitale løsninger, laget med omhu.",
    subtext: "Jeg designer og utvikler tydelige nettsider og applikasjoner for virksomheter som ønsker å fremstå profesjonelle og gjøre det enkelt for kundene å velge dem.",
    primaryCta: "Fortell om prosjektet",
    secondaryCta: "Se hvordan jeg jobber"
  },
  services: {
    badge: "Tjenester",
    heading: "Det du trenger for å lykkes digitalt.",
    items: [
      {
        number: "01",
        title: "Nettsider",
        description: "Profesjonelle nettsider tilpasset virksomheten, kundene og målene dine.",
        details: [
          "Skreddersydd layout og design",
          "Responsiv tilpasning for alle skjermer",
          "Hurtig lastetid og god søkemotoroptimalisering",
          "Brukervennlig publiseringsverktøy"
        ]
      },
      {
        number: "02",
        title: "Applikasjoner",
        description: "Enkle og brukervennlige løsninger som gjør digitale oppgaver lettere.",
        details: [
          "Spesialtilpassede nettskjemaer og beregningsverktøy",
          "Kundeportaler og interne arbeidsflater",
          "Sikker datalagring og håndtering",
          "Sømløs integrasjon mot eksisterende systemer"
        ]
      },
      {
        number: "03",
        title: "Design og prototyper",
        description: "Tydelige konsepter som lar deg se og teste løsningen før den bygges.",
        details: [
          "Visuell identitet og typografisk retning",
          "Klikkbare prototyper for testing",
          "Tydelig informasjonsarkitektur",
          "Designsystem for videre utvikling"
        ]
      },
      {
        number: "04",
        title: "Videre oppfølging",
        description: "Hjelp med innhold, forbedringer og vedlikehold etter lansering.",
        details: [
          "Løpende tekniske oppdateringer og sikkerhet",
          "Innholdshjelp og rådgivning",
          "Videreutvikling av ny funksjonalitet",
          "Rask og personlig support"
        ]
      }
    ]
  },
  process: {
    badge: "Prosess",
    heading: "En ryddig prosess fra idé til lansering.",
    subtext: "Forutsigbare steg og tett dialog sikrer at prosjektet holdes på plan og oppnår ønsket resultat.",
    steps: [
      {
        step: "01",
        title: "Forstå",
        text: "Vi avklarer behov, målgruppe og hva løsningen skal oppnå.",
        detail: "Gjennom en ryddig oppstartssamtale og et enkelt forberedelsesskjema samler vi nødvendig innsikt og setter klare rammer."
      },
      {
        step: "02",
        title: "Utforske",
        text: "Jeg lager en visuell retning og en enkel demo.",
        detail: "Du får se hvordan løsningen vil fungere og se ut før kodingen starter, slik at vi er trygge på retningen."
      },
      {
        step: "03",
        title: "Utvikle",
        text: "Løsningen bygges, testes og tilpasses ulike skjermstørrelser.",
        detail: "Alt kodes med moderne standarder, god tilgjengelighet, hurtig lastetid og full responsivitet på mobil og pc."
      },
      {
        step: "04",
        title: "Lansere",
        text: "Alt kvalitetssikres før løsningen publiseres.",
        detail: "Vi går gjennom alt sammen, kobler til domene, tester skjemaer og sørger for at du er klar til å ta imot kunder."
      }
    ]
  },
  contact: {
    badge: "Kontakt",
    heading: "Har du en idé eller et prosjekt du ønsker å diskutere?",
    subtext: "Fortell kort om virksomheten og hva du trenger hjelp med. Jeg tar kontakt for en uforpliktende prat.",
    email: "hei@bymari.no",
    location: "Oslo, Norge"
  },
  footer: {
    motto: "Digitale løsninger, laget med omhu.",
    subtext: "Spesialist på skreddersydde nettsider, webapplikasjoner og digitale skjemaer for virksomheter.",
    copyright: "by mari. Alle rettigheter reservert."
  }
};

interface ContentContextType {
  content: SiteContent;
  isEditing: boolean;
  isAdmin: boolean;
  setIsEditing: (val: boolean) => void;
  updateField: (path: string, value: any) => void;
  updateServiceDetail: (serviceIndex: number, detailIndex: number, value: string) => void;
  saveContent: () => Promise<boolean>;
  resetContent: () => void;
  hasUnsavedChanges: boolean;
  logout: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check admin session and load persisted content on mount
  useEffect(() => {
    try {
      // Check admin status
      const authCookie = document.cookie.split("; ").find(row => row.startsWith("bymari_auth="));
      const hasCookieAuth = authCookie && authCookie.split("=")[1] === "active";
      const hasStorageAuth = localStorage.getItem("bymari_admin_session") === "true";
      const userIsAdmin = Boolean(hasCookieAuth || hasStorageAuth);
      setIsAdmin(userIsAdmin);

      // 1. First check local cache for instant render
      const saved = localStorage.getItem("bymari_site_content");
      if (saved) {
        try {
          setContent(JSON.parse(saved));
        } catch {}
      }

      // 2. Fetch live global content from server/database for everyone
      fetch("/api/content")
        .then(res => res.json())
        .then(data => {
          if (data && data.content) {
            setContent(data.content);
            localStorage.setItem("bymari_site_content", JSON.stringify(data.content));
          }
        })
        .catch(err => console.warn("Could not fetch remote content:", err));

      // Only allow auto-edit mode if user is authorized as admin
      const params = new URLSearchParams(window.location.search);
      if (userIsAdmin && params.get("edit") === "true") {
        setIsEditing(true);
      }
    } catch (e) {
      console.error("Failed to load custom content:", e);
    }
  }, []);

  const updateField = (path: string, value: any) => {
    if (!isAdmin) return;
    setContent(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let curr = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const updateServiceDetail = (serviceIndex: number, detailIndex: number, value: string) => {
    if (!isAdmin) return;
    setContent(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy.services.items[serviceIndex]?.details) {
        copy.services.items[serviceIndex].details[detailIndex] = value;
      }
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const saveContent = async () => {
    if (!isAdmin) return false;
    try {
      localStorage.setItem("bymari_site_content", JSON.stringify(content));
      
      // Save globally to server / Supabase
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        setHasUnsavedChanges(false);
        return true;
      }
      setHasUnsavedChanges(false);
      return true;
    } catch (e) {
      console.error("Failed to save content:", e);
      return false;
    }
  };

  const resetContent = () => {
    if (!isAdmin) return;
    if (confirm("Vil du tilbakestille alle tekster til de opprinnelige By Mari standardtekstene?")) {
      setContent(defaultSiteContent);
      localStorage.removeItem("bymari_site_content");
      fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: defaultSiteContent })
      }).catch(console.error);
      setHasUnsavedChanges(false);
    }
  };

  const logout = () => {
    document.cookie = "bymari_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("bymari_admin_session");
    setIsAdmin(false);
    setIsEditing(false);
  };

  const handleSetIsEditing = (val: boolean) => {
    if (!isAdmin) {
      setIsEditing(false);
      return;
    }
    setIsEditing(val);
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        isEditing: isAdmin && isEditing,
        isAdmin,
        setIsEditing: handleSetIsEditing,
        updateField,
        updateServiceDetail,
        saveContent,
        resetContent,
        hasUnsavedChanges,
        logout
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    return {
      content: defaultSiteContent,
      isEditing: false,
      isAdmin: false,
      setIsEditing: () => {},
      updateField: () => {},
      updateServiceDetail: () => {},
      saveContent: async () => false,
      resetContent: () => {},
      hasUnsavedChanges: false,
      logout: () => {}
    };
  }
  return context;
}

