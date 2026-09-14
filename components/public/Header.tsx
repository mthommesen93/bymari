"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "../brand/Logo";
import { useContent } from "@/lib/content-context";
import { Menu, X, Shield } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useContent();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Tjenester", href: "#tjenester" },
    { label: "Prosess", href: "#prosess" },
    { label: "Kontakt", href: "#kontakt" },
  ];

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-warm-white/95 backdrop-blur-md border-b border-sand shadow-xs py-5" 
          : "bg-warm-white py-7 sm:py-8"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Logo - slightly larger */}
        <Logo size="lg" />

        {/* Desktop Navigation - slightly larger with comfortable spacing */}
        <nav className="hidden md:flex items-center space-x-12" aria-label="Hovedmeny">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-base font-normal text-charcoal/80 hover:text-charcoal transition-colors tracking-wide-editorial focus:outline-none focus-visible:underline"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-forest-green hover:text-forest-green-hover transition-colors flex items-center space-x-1 bg-forest-green/10 px-3 py-1 rounded-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Adminpanel</span>
            </Link>
          )}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="#kontakt"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-warm-white bg-forest-green hover:bg-forest-green-hover transition-colors rounded-sm tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green focus-visible:ring-offset-2"
          >
            Fortell om prosjektet
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal hover:opacity-75 focus:outline-none"
          aria-label={mobileMenuOpen ? "Lukk meny" : "Åpne meny"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-7 h-7 stroke-[1.5]" /> : <Menu className="w-7 h-7 stroke-[1.5]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-warm-white border-b border-sand px-6 py-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-normal text-charcoal py-1 hover:text-forest-green transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-sand">
            <Link
              href="#kontakt"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-6 py-3.5 text-base font-medium text-warm-white bg-forest-green hover:bg-forest-green-hover transition-colors rounded-sm"
            >
              Fortell om prosjektet
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
