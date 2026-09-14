"use client";

import React from "react";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { useContent } from "@/lib/content-context";
import { EditableText } from "@/components/editor/EditableText";

export function Hero() {
  const { content, updateField } = useContent();

  return (
    <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 border-b border-sand">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="max-w-3xl">
          {/* Studio Subheading / Label */}
          <div className="inline-flex items-center space-x-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-forest-green"></span>
            <EditableText
              value={content.hero.badge}
              onSave={(val) => updateField("hero.badge", val)}
              className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-charcoal tracking-tight leading-[1.15] mb-8">
            <EditableText
              value={content.hero.heading}
              onSave={(val) => updateField("hero.heading", val)}
              as="span"
              multiline
            />
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-xl text-charcoal/80 font-light leading-relaxed max-w-2xl mb-12">
            <EditableText
              value={content.hero.subtext}
              onSave={(val) => updateField("hero.subtext", val)}
              as="span"
              multiline
            />
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
            <Link
              href="#kontakt"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-warm-white bg-forest-green hover:bg-forest-green-hover transition-colors rounded-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green"
            >
              <EditableText
                value={content.hero.primaryCta}
                onSave={(val) => updateField("hero.primaryCta", val)}
              />
            </Link>
            <Link
              href="#prosess"
              className="inline-flex items-center justify-center space-x-2 px-6 py-4 text-base font-normal text-charcoal hover:text-forest-green transition-colors rounded-sm group focus:outline-none focus-visible:underline"
            >
              <span>
                <EditableText
                  value={content.hero.secondaryCta}
                  onSave={(val) => updateField("hero.secondaryCta", val)}
                />
              </span>
              <ArrowDownRight className="w-4 h-4 text-sage group-hover:text-forest-green transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
