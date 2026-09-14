import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: LucideIcon;
  href?: string;
}

export function StatCard({ label, value, sublabel, icon: Icon, href }: StatCardProps) {
  const content = (
    <div className="bg-white border border-sand p-6 rounded-sm transition-all hover:border-forest-green/40">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-charcoal/70 font-medium">
          {label}
        </span>
        <div className="w-8 h-8 rounded-sm bg-sand/30 flex items-center justify-center text-charcoal/70">
          <Icon className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>
      <div className="text-3xl font-light text-charcoal tracking-tight">
        {value}
      </div>
      {sublabel && (
        <p className="mt-2 text-xs text-charcoal/60">
          {sublabel}
        </p>
      )}
    </div>
  );

  if (href) {
    return <a href={href} className="block focus:outline-none">{content}</a>;
  }

  return content;
}
