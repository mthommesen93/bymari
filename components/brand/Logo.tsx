import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
  showLink?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "image" | "text" | "auto";
}

export function Logo({
  className = "",
  href = "/",
  showLink = true,
  size = "lg",
  variant = "auto"
}: LogoProps) {
  const sizeClasses = {
    sm: "text-xl tracking-[0.20em]",
    md: "text-2xl sm:text-3xl tracking-[0.22em]",
    lg: "text-3xl sm:text-4xl tracking-[0.24em]",
    xl: "text-4xl sm:text-5xl tracking-[0.26em]"
  };

  const imageSizes = {
    sm: { height: 26, width: 115 },
    md: { height: 34, width: 155 },
    lg: { height: 44, width: 195 },
    xl: { height: 56, width: 250 }
  };

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      {variant === "image" || variant === "auto" ? (
        <div className="relative inline-block mix-blend-multiply">
          <Image
            src="/brand/logo.png"
            alt="by mari"
            width={imageSizes[size].width}
            height={imageSizes[size].height}
            priority
            className="h-auto object-contain mix-blend-multiply"
            style={{ maxHeight: `${imageSizes[size].height}px`, width: "auto" }}
          />
        </div>
      ) : (
        <span className={`text-charcoal lowercase font-light leading-none ${sizeClasses[size]}`}>
          by mari
        </span>
      )}
    </div>
  );

  if (!showLink) {
    return content;
  }

  return (
    <Link 
      href={href} 
      className="inline-flex items-center transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green focus-visible:ring-offset-2 rounded-sm"
      aria-label="by mari — Forside"
    >
      {content}
    </Link>
  );
}
