"use client";

import React from "react";
import { Header } from "@/components/public/Header";
import { Hero } from "@/components/public/Hero";
import { Services } from "@/components/public/Services";
import { Process } from "@/components/public/Process";
import { Contact } from "@/components/public/Contact";
import { Footer } from "@/components/public/Footer";
import { VisualEditorToolbar } from "@/components/editor/VisualEditorToolbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white relative">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <Process />
        <Contact />
      </main>
      <Footer />
      {/* Floating in-screen visual editor toolbar */}
      <VisualEditorToolbar />
    </div>
  );
}
