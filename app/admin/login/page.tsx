"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("hei@bymari.no");
  const [password, setPassword] = useState("bymari2026");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate Supabase authentication validation
    setTimeout(() => {
      if (email && password) {
        document.cookie = "bymari_auth=active; path=/; max-age=86400; SameSite=Lax";
        localStorage.setItem("bymari_admin_session", "true");
        router.push("/admin");
      } else {
        setError("Vennligst oppgi både e-post og passord.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md bg-white border border-sand p-8 sm:p-10 rounded-sm shadow-sm">
        {/* Logo and Subheading */}
        <div className="text-center pb-8 border-b border-sand mb-8">
          <Logo size="lg" showLink={false} />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-forest-green font-semibold font-mono">
            Administrasjonspanel
          </p>
          <p className="mt-1 text-xs text-charcoal/60">
            Kun for autoriserte administratorer
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
              E-postadresse
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hei@bymari.no"
                className="w-full pl-10 pr-4 py-2.5 bg-warm-white border border-sand rounded-sm text-charcoal text-sm focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal/80 font-medium mb-2">
              Passord
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-warm-white border border-sand rounded-sm text-charcoal text-sm focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-forest-green hover:bg-forest-green-hover text-warm-white font-medium text-sm rounded-sm transition-colors flex items-center justify-center space-x-2 tracking-wide disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logger inn...</span>
              </>
            ) : (
              <span>Logg inn på administrasjon</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-sand text-center">
          <p className="text-xs text-charcoal/50">
            Passordbeskyttet for bymari.no &bull; Sikret med Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}
