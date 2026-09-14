"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "../brand/Logo";
import { useContent } from "@/lib/content-context";
import { EditableText } from "@/components/editor/EditableText";
import { Lock, Shield } from "lucide-react";


export function Footer() {
  const currentYear = new Date().getFullYear();
  const { content, updateField, isAdmin } = useContent();

  return (
    <footer className="border-t border-sand bg-warm-white py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-sand">
          {/* Col 1: Brand & message */}
          <div className="md:col-span-6 space-y-4">
            <Logo size="lg" />
            <p className="text-base text-charcoal/80 font-light max-w-sm pt-2">
              <EditableText
                value={content.footer.motto}
                onSave={(val) => updateField("footer.motto", val)}
                as="span"
              />
            </p>
            <p className="text-xs text-charcoal/60">
              <EditableText
                value={content.footer.subtext}
                onSave={(val) => updateField("footer.subtext", val)}
                as="span"
              />
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs uppercase tracking-wider text-sage-dark font-mono font-medium">Navigasjon</p>
            <ul className="space-y-2.5 text-sm text-charcoal/80 font-light">
              <li><Link href="#tjenester" className="hover:text-forest-green transition-colors">Tjenester</Link></li>
              <li><Link href="#prosess" className="hover:text-forest-green transition-colors">Prosess</Link></li>
              <li><Link href="#kontakt" className="hover:text-forest-green transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact & Legal */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs uppercase tracking-wider text-sage-dark font-mono font-medium">Kontakt</p>
            <div className="space-y-1.5 text-sm text-charcoal/80 font-light">
              <p>
                <a href={`mailto:${content.contact.email}`} className="hover:text-forest-green transition-colors">
                  {content.contact.email}
                </a>
              </p>
              <p>{content.contact.location}</p>
              <p className="pt-2"><Link href="/personvern" className="text-xs underline hover:text-forest-green">Personvernerklæring</Link></p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal/60 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p>© {currentYear} by mari. Alle rettigheter reservert.</p>
            <span className="text-sand-dark">•</span>
            {isAdmin ? (
              <Link 
                href="/admin" 
                className="inline-flex items-center space-x-1 text-forest-green hover:underline font-medium"
              >
                <Shield className="w-3 h-3" />
                <span>Adminpanel</span>
              </Link>
            ) : (
              <Link 
                href="/admin/login" 
                className="inline-flex items-center space-x-1 text-charcoal/40 hover:text-charcoal transition-colors"
                title="Logg inn som administrator"
              >
                <Lock className="w-3 h-3" />
                <span>Admin innlogging</span>
              </Link>
            )}
          </div>
          <p className="tracking-wide-editorial font-mono">bymari.no</p>
        </div>
      </div>
    </footer>
  );
}

