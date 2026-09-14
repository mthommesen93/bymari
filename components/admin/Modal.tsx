"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "md" }: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full ${maxWidthClasses[maxWidth]} bg-warm-white border border-sand rounded-sm shadow-xl overflow-hidden max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-sand flex items-center justify-between bg-white">
          <h2 className="text-lg font-medium text-charcoal">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-charcoal/60 hover:text-charcoal rounded-sm focus:outline-none"
            aria-label="Lukk dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
