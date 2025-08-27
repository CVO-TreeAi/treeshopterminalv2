"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
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
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98]";
  
  const variantClasses = {
    primary: "bg-green-500 hover:bg-green-400 active:bg-green-600 text-black focus:ring-green-500",
    secondary: "bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white border border-gray-700 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-400 active:bg-red-600 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-gray-800 text-white border border-gray-700 focus:ring-gray-500",
    success: "bg-green-500 hover:bg-green-400 active:bg-green-600 text-black focus:ring-green-500",
  };
  
  const sizeClasses = {
    sm: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm",
    md: "px-3 sm:px-4 py-2 text-sm sm:text-base",
    lg: "px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg",
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}