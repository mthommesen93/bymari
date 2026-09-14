"use client";

import React, { useState, useEffect, useRef } from "react";
import { useContent } from "@/lib/content-context";
import { Pencil } from "lucide-react";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  multiline?: boolean;
}

export function EditableText({
  value,
  onSave,
  className = "",
  as: Component = "span",
  multiline = false
}: EditableTextProps) {
  const { isEditing } = useContent();
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  if (!isEditing) {
    return <Component className={className}>{value}</Component>;
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsFocused(false);
    const newText = e.currentTarget.innerText || "";
    if (newText !== value) {
      onSave(newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  return (
    <Component
      ref={elementRef as any}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      title="Klikk for å redigere teksten direkte"
      className={`${className} outline-none cursor-text transition-all duration-150 rounded-xs ${
        isFocused
          ? "ring-2 ring-forest-green bg-white/80 px-1 -mx-1 shadow-xs"
          : "hover:ring-1 hover:ring-forest-green/50 hover:bg-forest-green/5"
      }`}
    >
      {value}
    </Component>
  );
}
