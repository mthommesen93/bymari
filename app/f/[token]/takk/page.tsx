"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { dataStore } from "@/lib/store";
import { FormDistribution, Form } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

function renderCleanText(text?: string | null) {
  if (!text) return "";
  return text.replace(/\\n/g, "\n").replace(/\n/g, "\n");
}

export default function SubmissionConfirmationPage() {
  const params = useParams();
  const token = params.token as string;
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    async function load() {
      const dist = await dataStore.getDistributionByToken(token);
      if (dist && dist.form) {
        setForm(dist.form);
      }
    }
    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center px-6 py-16">
      <div className="max-w-lg w-full bg-white border border-sand p-8 sm:p-12 text-center rounded-sm shadow-sm space-y-6">
        <Logo size="md" showLink={false} />

        <div className="w-14 h-14 bg-forest-green/10 text-forest-green rounded-full flex items-center justify-center mx-auto mt-2">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal tracking-tight">
            Tusen takk for dine svar!
          </h1>
          <div className="text-sm sm:text-base text-charcoal/80 font-light leading-relaxed whitespace-pre-line text-left bg-warm-white/50 p-6 border border-sand/60 rounded-sm">
            {renderCleanText(form?.confirmation_message) || "Svarene dine er trygt mottatt. Jeg går nøye gjennom informasjonen og tar kontakt for videre oppfølging."}
          </div>
        </div>

        <div className="pt-6 border-t border-sand text-xs text-charcoal/50">
          <p>by mari &bull; Digitale løsninger, laget med omhu.</p>
          <p className="mt-1 font-mono">bymari.no</p>
        </div>
      </div>
    </div>
  );
}
