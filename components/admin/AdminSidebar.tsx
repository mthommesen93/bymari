"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "../brand/Logo";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Inbox, 
  Activity as ActivityIcon, 
  Settings, 
  LogOut,
  ExternalLink,
  Edit3,
  Calculator
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Oversikt", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Kunder", href: "/admin/kunder", icon: Users },
    { label: "Skjemaer", href: "/admin/skjemaer", icon: FileText },
    { label: "Svar", href: "/admin/svar", icon: Inbox },
    { label: "Priskalkulator", href: "/admin/kalkulator", icon: Calculator },
    { label: "Aktiviteter", href: "/admin/aktiviteter", icon: ActivityIcon },
    { label: "Innstillinger", href: "/admin/innstillinger", icon: Settings },
  ];

  const handleLogout = () => {
    document.cookie = "bymari_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("bymari_admin_session");
    router.push("/admin/login");
  };

  const isActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  return (
    <aside className="w-64 bg-[#F2EFE9] border-r border-sand min-h-screen flex flex-col justify-between select-none admin-sidebar">
      <div>
        {/* Logo & Admin tag */}
        <div className="p-6 border-b border-sand">
          <Logo size="sm" showLink={false} />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-forest-green font-semibold">
              Administrasjon
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="System aktivt"></span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5" aria-label="Adminmeny">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-white text-charcoal font-medium shadow-sm border border-sand/80"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-white/50 font-normal"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-forest-green" : "text-charcoal/60"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Utilities */}
      <div className="p-4 border-t border-sand space-y-2">
        <Link
          href="/?edit=true"
          target="_blank"
          className="flex items-center justify-between w-full px-3.5 py-2 text-xs text-forest-green hover:bg-forest-green/10 font-medium rounded-sm transition-colors"
          title="Åpne nettsiden i direkte visuell redigeringsmodus"
        >
          <span className="flex items-center space-x-2">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Rediger nettsidetekst</span>
          </span>
          <ExternalLink className="w-3 h-3" />
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between w-full px-3.5 py-2 text-xs text-charcoal/70 hover:text-charcoal hover:bg-white/50 rounded-sm transition-colors"
        >
          <span>Vis offentlig nettside</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3.5 py-2 text-xs text-red-700 hover:bg-red-50 rounded-sm transition-colors focus:outline-none"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logg ut</span>
        </button>
      </div>
    </aside>
  );
}
