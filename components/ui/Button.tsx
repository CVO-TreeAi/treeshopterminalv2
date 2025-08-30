"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "warning" | "info" | "error";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses = `
    btn-modern inline-flex items-center justify-center gap-2 font-medium 
    transition-all duration-200 focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-offset-[var(--background)] 
    active:scale-[0.96] disabled:scale-100 disabled:cursor-not-allowed
    disabled:bg-[var(--button-disabled-bg)] disabled:text-[var(--button-disabled-text)]
    disabled:border-transparent disabled:opacity-60
  `.replace(/\s+/g, ' ').trim();
  
  const variantClasses = {
    primary: `
      bg-[var(--accent-green)] text-[var(--font-on-accent)] 
      border-[var(--accent-green)] font-semibold
      hover:bg-[var(--muted-green)] hover:border-[var(--muted-green)]
      active:bg-[var(--amber)] active:border-[var(--amber)]
      focus:ring-[var(--accent-green)]/30
    `,
    secondary: `
      bg-[var(--card)] text-[var(--font-primary)] 
      border-[var(--medium-gray)]
      hover:bg-[var(--medium-gray)] hover:text-[var(--accent-green)] 
      hover:border-[var(--accent-green)]
      active:bg-[var(--accent-green)] active:text-[var(--font-on-accent)]
      focus:ring-[var(--accent-green)]/30
    `,
    danger: `
      bg-[var(--hot-red)] text-[var(--accent-white)] 
      border-[var(--hot-red)]
      hover:bg-[var(--soft-pink)] hover:border-[var(--soft-pink)]
      active:bg-[var(--hot-red)] active:border-[var(--hot-red)]
      focus:ring-[var(--hot-red)]/30
    `,
    error: `
      bg-[var(--hot-red)] text-[var(--accent-white)] 
      border-[var(--hot-red)]
      hover:bg-[var(--soft-pink)] hover:border-[var(--soft-pink)]
      focus:ring-[var(--hot-red)]/30
    `,
    ghost: `
      bg-transparent text-[var(--font-primary)] 
      border-[var(--medium-gray)]
      hover:bg-[var(--soft-gray)] hover:text-[var(--accent-green)]
      hover:border-[var(--accent-green)]
      active:bg-[var(--accent-green)] active:text-[var(--font-on-accent)]
      focus:ring-[var(--accent-green)]/30
    `,
    success: `
      bg-[var(--muted-green)] text-[var(--font-on-accent)] 
      border-[var(--muted-green)] font-medium
      hover:bg-[var(--accent-green)] hover:border-[var(--accent-green)]
      focus:ring-[var(--muted-green)]/30
    `,
    warning: `
      bg-[var(--light-orange)] text-[var(--font-on-accent)] 
      border-[var(--light-orange)] font-medium
      hover:bg-[var(--amber)] hover:border-[var(--amber)]
      focus:ring-[var(--amber)]/30
    `,
    info: `
      bg-[var(--soft-blue)] text-[var(--font-on-accent)] 
      border-[var(--soft-blue)] font-medium
      hover:opacity-90
      focus:ring-[var(--soft-blue)]/30
    `,
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg min-h-[36px]",
    md: "px-6 py-3 text-base rounded-xl min-h-[44px]",
    lg: "px-8 py-4 text-lg rounded-xl min-h-[52px] font-semibold",
  };
  
  // Mobile-first responsive adjustments
  const mobileClasses = `
    ${size === 'sm' ? 'sm:px-4 sm:py-2.5 sm:min-h-[40px]' : ''}
    ${size === 'md' ? 'sm:px-6 sm:py-3 sm:min-h-[48px] md:px-8' : ''}
    ${size === 'lg' ? 'sm:px-10 sm:py-5 sm:min-h-[56px] md:px-12' : ''}
  `;
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`
        ${baseClasses} 
        ${variantClasses[variant]?.replace(/\s+/g, ' ').trim()} 
        ${sizeClasses[size]} 
        ${mobileClasses}
        ${widthClass} 
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}