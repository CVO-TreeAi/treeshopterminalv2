"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
  padding = "md",
}: CardProps) {
  const baseClasses = "bg-gray-800 border border-gray-700 rounded-lg";
  const hoverClasses = hover ? "hover:bg-gray-700 hover:border-gray-600 transition-all cursor-pointer" : "";
  
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}