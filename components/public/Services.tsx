"use client";

import React from "react";
import { useContent } from "@/lib/content-context";
import { EditableText } from "@/components/editor/EditableText";

export function Services() {
  const { content, updateField, updateServiceDetail } = useContent();

  return (
    <section id="tjenester" className="py-24 md:py-36 border-b border-sand scroll-mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-20">
          <EditableText
            value={content.services.badge}
            onSave={(val) => updateField("services.badge", val)}
            className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium block mb-4"
          />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-tight leading-snug">
            <EditableText
              value={content.services.heading}
              onSave={(val) => updateField("services.heading", val)}
              as="span"
              multiline
            />
          </h2>
        </div>

        {/* Services List - Restrained Scandinavian layout with dividing lines */}
        <div className="divide-y divide-sand border-t border-b border-sand">
          {content.services.items.map((service, serviceIdx) => (
            <div 
              key={service.number || serviceIdx} 
              className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-baseline group"
            >
              <div className="md:col-span-2">
                <span className="text-sm font-mono text-sage-dark tracking-widest">
                  {service.number}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-2xl sm:text-3xl font-light text-charcoal mb-2">
                  <EditableText
                    value={service.title}
                    onSave={(val) => updateField(`services.items.${serviceIdx}.title`, val)}
                    as="span"
                  />
                </h3>
              </div>
              <div className="md:col-span-6 space-y-4">
                <p className="text-base sm:text-lg text-charcoal/85 font-light leading-relaxed">
                  <EditableText
                    value={service.description}
                    onSave={(val) => updateField(`services.items.${serviceIdx}.description`, val)}
                    as="span"
                    multiline
                  />
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs sm:text-sm text-charcoal/70">
                  {service.details.map((item, detailIdx) => (
                    <li key={detailIdx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-sage rounded-full shrink-0"></span>
                      <span>
                        <EditableText
                          value={item}
                          onSave={(val) => updateServiceDetail(serviceIdx, detailIdx, val)}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
