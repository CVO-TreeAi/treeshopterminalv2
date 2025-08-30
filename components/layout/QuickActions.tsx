"use client";

import { ReactNode, useState, useEffect } from "react";
import Button from "../ui/Button";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  badge?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  layout?: "horizontal" | "vertical" | "grid";
  className?: string;
}

export default function QuickActions({
  actions,
  layout = "horizontal",
  className = "",
}: QuickActionsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const layoutClasses = {
    horizontal: "flex gap-2 overflow-x-auto pb-2",
    vertical: "flex flex-col gap-2",
    grid: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3",
  };

  const mobileLayout = isMobile ? "horizontal" : layout;

  return (
    <div className={`${layoutClasses[mobileLayout]} ${className}`}>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "secondary"}
          size={isMobile ? "md" : "sm"}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`
            ${mobileLayout === "horizontal" ? "whitespace-nowrap flex-shrink-0" : ""}
            ${mobileLayout === "grid" ? "aspect-square flex-col gap-1" : ""}
            relative
          `}
        >
          <span className={mobileLayout === "grid" ? "text-2xl" : "text-lg"}>
            {action.icon}
          </span>
          <span className={mobileLayout === "grid" && isMobile ? "text-xs" : ""}>
            {action.label}
          </span>
          
          {action.badge && (
            <span className="absolute -top-1 -right-1 bg-[var(--hot-red)] text-[var(--accent-white)] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {action.badge}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}