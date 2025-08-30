"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "default" | "purple" | "mobile" | "hot" | "new";
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  pulse = false,
}: BadgeProps) {
  const baseClasses = `
    inline-flex items-center font-medium rounded-full 
    transition-all duration-200 border
  `.replace(/\s+/g, ' ').trim();
  
  const variantClasses = {
    success: "bg-[var(--muted-green)] text-[var(--font-on-accent)] border-[var(--muted-green)]",
    warning: "bg-[var(--light-orange)] text-[var(--font-on-accent)] border-[var(--light-orange)]",
    error: "bg-[var(--hot-red)] text-[var(--accent-white)] border-[var(--hot-red)]",
    info: "bg-[var(--soft-blue)] text-[var(--font-on-accent)] border-[var(--soft-blue)]",
    purple: "bg-purple-500 text-[var(--accent-white)] border-purple-500",
    default: "bg-[var(--soft-gray)] text-[var(--font-secondary)] border-[var(--medium-gray)]",
    mobile: "bg-[var(--accent-green)] text-[var(--font-on-accent)] border-[var(--accent-green)] font-semibold",
    hot: "bg-[var(--hot-red)] text-[var(--accent-white)] border-[var(--soft-pink)] font-semibold",
    new: "bg-[var(--amber)] text-[var(--font-on-accent)] border-[var(--amber)] font-semibold",
  };
  
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs font-medium",
    md: "px-3 py-1.5 text-sm font-medium",
    lg: "px-4 py-2 text-base font-semibold",
  };
  
  const pulseClasses = pulse ? "animate-pulse" : "";
  
  return (
    <span
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${pulseClasses}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </span>
  );
}