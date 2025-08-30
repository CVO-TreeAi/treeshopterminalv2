"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "selected" | "alert" | "elevated" | "flat";
  interactive?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
  padding = "md",
  variant = "default",
  interactive = false,
}: CardProps) {
  const baseClasses = `
    card-modern transition-all duration-300 ease-out
    bg-[var(--card)] border border-[var(--medium-gray)]
  `.replace(/\s+/g, ' ').trim();
  
  const variantClasses = {
    default: "",
    selected: "!bg-[var(--accent-green)] !text-[var(--font-on-accent)] !border-[var(--amber)] shadow-lg shadow-[var(--accent-green)]/20",
    alert: "!bg-[var(--hot-red)] !text-[var(--accent-white)] !border-[var(--soft-pink)] shadow-lg shadow-[var(--hot-red)]/20",
    elevated: "shadow-xl shadow-black/20 border-[var(--accent-green)]/30",
    flat: "!border-transparent shadow-none",
  };
  
  const interactiveClasses = (hover || interactive || onClick) ? `
    cursor-pointer 
    hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--accent-green)]/10
    hover:border-[var(--accent-green)] hover:-translate-y-1
    active:scale-[0.99] active:translate-y-0
  `.replace(/\s+/g, ' ').trim() : "";
  
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6", 
    lg: "p-8",
  };
  
  // Mobile-first responsive padding
  const responsivePadding = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };
  
  return (
    <div
      className={`
        ${baseClasses} 
        ${variantClasses[variant]}
        ${interactiveClasses}
        ${responsivePadding[padding]} 
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}