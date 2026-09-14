"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If on login page, skip check
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    // Check auth cookie/localStorage
    const authCookie = document.cookie.split("; ").find(row => row.startsWith("bymari_auth="));
    if (authCookie && authCookie.split("=")[1] === "active") {
      setIsAuthorized(true);
    } else {
      // By default in dev environment, allow demo login or redirect
      // Check if session exists, else redirect to login
      const session = localStorage.getItem("bymari_admin_session");
      if (session === "true" || authCookie) {
        setIsAuthorized(true);
      } else {
        router.push("/admin/login");
      }
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-forest-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-charcoal/60 font-mono">Laster administrasjon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-warm-white text-charcoal">
      <AdminSidebar />
      <main className="flex-1 min-h-screen p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
