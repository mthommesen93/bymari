import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: React.ReactNode;
}

export function AdminHeader({ title, description, action, children }: AdminHeaderProps) {
  return (
    <div className="pb-8 mb-8 border-b border-sand flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-charcoal tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-charcoal/70 font-light">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {children}
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-forest-green hover:bg-forest-green-hover text-warm-white text-sm font-medium rounded-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green"
            >
              <Plus className="w-4 h-4" />
              <span>{action.label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-forest-green hover:bg-forest-green-hover text-warm-white text-sm font-medium rounded-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green"
            >
              <Plus className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
