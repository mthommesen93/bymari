"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useContent } from "@/lib/content-context";
import { 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  LayoutDashboard, 
  Eye, 
  X,
  Sparkles
} from "lucide-react";

export function VisualEditorToolbar() {
  const { isEditing, setIsEditing, saveContent, resetContent, hasUnsavedChanges, isAdmin, logout } = useContent();
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Strictly hide from all non-authenticated visitors
  if (!isAdmin) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    await saveContent();
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <>
      {/* Floating Admin Dock (when editing is inactive) */}
      {!isEditing && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-charcoal text-warm-white p-1.5 rounded-full shadow-2xl border border-sand/40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-full transition-colors"
            title="Aktiver direkte tekstredigering på nettsiden"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Rediger tekst</span>
          </button>

          <Link
            href="/admin"
            className="flex items-center space-x-1.5 px-3 py-2 text-warm-white/80 hover:text-white hover:bg-white/10 text-xs font-medium rounded-full transition-colors"
            title="Gå til administrasjonspanelet"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-sage" />
            <span className="hidden sm:inline">Adminpanel</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="p-2 text-warm-white/60 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
            title="Logg ut som admin"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Full Editor Toolbar (when editing is active) */}
      {isEditing && (
        <aside 
          aria-label="Verktøylinje for direkte tekstredigering"
          className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-[#20211F] text-warm-white border border-sand/30 shadow-2xl rounded-sm p-3 sm:px-6 sm:py-3 flex flex-wrap items-center justify-between gap-4 max-w-3xl w-full pointer-events-auto">
            {/* Left status */}
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <p className="text-xs font-medium text-warm-white flex items-center gap-1.5">
                  <span>Direkte redigeringsmodus</span>
                  <span className="text-[10px] bg-forest-green/80 px-1.5 py-0.5 rounded text-warm-white font-mono">Admin</span>
                </p>
                <p className="text-[11px] text-warm-white/60">
                  Klikk på hvilken som helst tekst for å endre den
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-2.5">
              {showSavedToast && (
                <span className="text-xs text-emerald-400 font-medium inline-flex items-center space-x-1 animate-in fade-in mr-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Endringer lagret!</span>
                </span>
              )}

              <button
                type="button"
                onClick={resetContent}
                className="px-3 py-1.5 text-xs text-warm-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-colors flex items-center space-x-1.5"
                title="Tilbakestill til standardtekst"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Nullstill</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-forest-green hover:bg-forest-green-hover text-warm-white text-xs font-medium rounded-sm transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Lagrer..." : hasUnsavedChanges ? "Lagre endringer *" : "Lagret"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-warm-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
                title="Lukk redigeringsmodus"
              >
                Ferdig
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

