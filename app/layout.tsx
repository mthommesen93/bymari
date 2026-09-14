import type { Metadata } from "next";
import { ContentProvider } from "@/lib/content-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "by mari — Digitale løsninger, laget med omhu",
  description: "Jeg designer og utvikler tydelige nettsider og applikasjoner for virksomheter som ønsker å fremstå profesjonelle og gjøre det enkelt for kundene å velge dem.",
  keywords: ["designstudio", "nettsider", "applikasjoner", "webutvikling", "design", "prototyper", "by mari", "bymari.no"],
  authors: [{ name: "by mari" }],
  openGraph: {
    title: "by mari — Digitale løsninger, laget med omhu",
    description: "Design og utvikling av tydelige nettsider og applikasjoner.",
    url: "https://bymari.no",
    siteName: "by mari",
    locale: "nb_NO",
    type: "website"
  },
  icons: {
    icon: "/brand/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-warm-white text-charcoal antialiased selection:bg-sand selection:text-charcoal flex flex-col font-sans">
        <ContentProvider>
          {children}
        </ContentProvider>
      </body>
    </html>
  );
}
