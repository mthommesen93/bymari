"use client";

import React from "react";
import { useContent } from "@/lib/content-context";
import { EditableText } from "@/components/editor/EditableText";

export function Process() {
  const { content, updateField } = useContent();

  return (
    <section id="prosess" className="py-24 md:py-36 border-b border-sand scroll-mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-20">
          <EditableText
            value={content.process.badge}
            onSave={(val) => updateField("process.badge", val)}
            className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium block mb-4"
          />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-tight leading-snug">
            <EditableText
              value={content.process.heading}
              onSave={(val) => updateField("process.heading", val)}
              as="span"
              multiline
            />
          </h2>
          <p className="mt-4 text-base text-charcoal/70 font-light">
            <EditableText
              value={content.process.subtext}
              onSave={(val) => updateField("process.subtext", val)}
              as="span"
              multiline
            />
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {content.process.steps.map((item, idx) => (
            <div key={item.step || idx} className="border-t border-sand pt-8 flex flex-col justify-between">
              <div>
                <span className="text-sm font-mono text-sage-dark tracking-widest block mb-4">
                  {item.step}
                </span>
                <h3 className="text-2xl font-light text-charcoal mb-3">
                  <EditableText
                    value={item.title}
                    onSave={(val) => updateField(`process.steps.${idx}.title`, val)}
                    as="span"
                  />
                </h3>
                <p className="text-base text-charcoal font-medium leading-snug mb-3">
                  <EditableText
                    value={item.text}
                    onSave={(val) => updateField(`process.steps.${idx}.text`, val)}
                    as="span"
                    multiline
                  />
                </p>
                <p className="text-sm text-charcoal/70 font-light leading-relaxed">
                  <EditableText
                    value={item.detail}
                    onSave={(val) => updateField(`process.steps.${idx}.detail`, val)}
                    as="span"
                    multiline
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
