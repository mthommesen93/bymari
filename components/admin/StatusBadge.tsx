import React from "react";
import { ClientStatus, FormStatus, ResponseStatus, DistributionStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ClientStatus | FormStatus | ResponseStatus | DistributionStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const getBadgeStyle = (statusVal: string) => {
    switch (statusVal) {
      // Client Statuses
      case "Ny":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Kontaktet":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Møte avtalt":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Tilbud sendt":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Aktiv kunde":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Avsluttet":
        return "bg-stone-100 text-stone-600 border-stone-200";

      // Form Statuses
      case "draft":
        return "bg-stone-100 text-stone-600 border-stone-200";
      case "published":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "archived":
        return "bg-red-50 text-red-700 border-red-200";

      // Response Statuses
      case "new":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "read":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";

      // Distribution Statuses
      case "created":
        return "bg-stone-100 text-stone-600 border-stone-200";
      case "sent":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "opened":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "started":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "submitted":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "expired":
        return "bg-stone-100 text-stone-500 border-stone-200";
      case "revoked":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getLabel = (statusVal: string) => {
    switch (statusVal) {
      case "draft": return "Kladd";
      case "published": return "Publisert";
      case "archived": return "Arkivert";
      case "new": return "Nytt";
      case "read": return "Lest";
      case "in_progress": return "Under behandling";
      case "completed": return "Ferdig";
      case "created": return "Opprettet";
      case "sent": return "Sendt";
      case "opened": return "Åpnet";
      case "started": return "Påbegynt";
      case "submitted": return "Besvart";
      case "expired": return "Utløpt";
      case "revoked": return "Tilbakekalt";
      default: return statusVal;
    }
  };

  const sizeClass = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`inline-flex items-center font-medium border rounded-sm tracking-wide ${sizeClass} ${getBadgeStyle(status)}`}>
      {getLabel(status)}
    </span>
  );
}
