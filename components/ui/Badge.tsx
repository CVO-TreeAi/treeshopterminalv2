"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "default" | "purple";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantClasses = {
    success: "bg-green-500 text-black",
    warning: "bg-yellow-400 text-black",
    error: "bg-red-500 text-white",
    info: "bg-cyan-400 text-black",
    purple: "bg-purple-500 text-white",
    default: "bg-gray-700 text-gray-200",
  };
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };
  
  return (
    <span
      className={`inline-flex items-center font-medium rounded ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}