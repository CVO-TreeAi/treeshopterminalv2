"use client";

import { ReactNode, useState, useEffect } from "react";

interface AppGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
  adaptive?: boolean; // Automatically adjust columns based on screen size
}

interface AppGridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4;
  className?: string;
  priority?: boolean; // Shows first on mobile
}

export function AppGrid({
  children,
  cols = 3,
  gap = "md",
  className = "",
  adaptive = true,
}: AppGridProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  const colClasses = adaptive ? {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  } : {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3", 
    4: "grid-cols-4",
  };

  return (
    <div
      className={`
        grid ${colClasses[cols]} ${gapClasses[gap]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </div>
  );
}

export function AppGridItem({
  children,
  span = 1,
  className = "",
  priority = false,
}: AppGridItemProps) {
  const spanClasses = {
    1: "col-span-1",
    2: "col-span-1 sm:col-span-2",
    3: "col-span-1 sm:col-span-2 lg:col-span-3",
    4: "col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4",
  };

  const priorityClass = priority ? "order-first" : "";

  return (
    <div
      className={`
        ${spanClasses[span]} ${priorityClass} ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </div>
  );
}