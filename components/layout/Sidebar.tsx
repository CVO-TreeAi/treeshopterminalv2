"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TREESHOP_BUSINESS_DATA } from "@/lib/treeShopData";
import Badge from "../ui/Badge";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
}

export default function Sidebar({ user, isExpanded: externalIsExpanded, setIsExpanded: externalSetIsExpanded }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use external state if provided, otherwise use local state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : localIsExpanded;
  const setIsExpanded = externalSetIsExpanded || setLocalIsExpanded;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when screen size changes from desktop to mobile
      if (mobile && !isMobile && isExpanded) {
        setIsExpanded(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, isExpanded, setIsExpanded]);

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "🏠",
      path: "/",
      description: "System Overview",
      badge: null,
    },
    {
      id: "dashboard",
      label: "Business Dashboard",
      icon: "📊",
      path: "/dashboard",
      description: "Complete Business Metrics",
      badge: "new",
    },
    {
      id: "leads",
      label: "Leads",
      icon: "🎯",
      path: "/leads",
      description: "Lead Management",
      badge: "new", // Can show count of new leads
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: "📄",
      path: "/proposals",
      description: "Proposal Pipeline",
      badge: null,
    },
    {
      id: "customers",
      label: "Customers",
      icon: "👥",
      path: "/customers",
      description: "Customer Database",
      badge: null,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "📅",
      path: "/calendar",
      description: "Schedule & Jobs",
      badge: null,
    },
    {
      id: "crew",
      label: "Crew App",
      icon: "🚛",
      path: "/crew",
      description: "Mobile Crew Portal",
      badge: "mobile",
    },
    {
      id: "time-tracking",
      label: "Time Tracking",
      icon: "⏱️",
      path: "/crew/time-tracking",
      description: "Activity Logging",
      badge: null,
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📈",
      path: "/reports",
      description: "Analytics & Insights",
      badge: null,
    },
  ];

  const bottomItems = [
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      path: "/profile",
      description: "Your Account",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      path: "/settings",
      description: "System Config",
    },
    {
      id: "help",
      label: "Help",
      icon: "❓",
      path: "/help",
      description: "Support & Docs",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("authTime");
    router.push("/");
  };

  return (
    <>
      {/* Sidebar Toggle Button (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed right-4 top-4 z-50 p-3 bg-[var(--accent-green)] hover:bg-[var(--muted-green)] text-[var(--font-on-accent)] rounded-xl transition-all shadow-lg btn-modern"
        aria-label="Toggle menu"
      >
        <span className="text-lg font-medium">{isExpanded ? "✕" : "☰"}</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full bg-[var(--card)] border-l border-[var(--medium-gray)] transition-all duration-300 z-50 shadow-2xl ${
          isExpanded 
            ? isMobile 
              ? "w-full max-w-sm" 
              : "w-80" // Wider on desktop for better UX
            : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--medium-gray)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent-green)] rounded-xl flex items-center justify-center text-[var(--font-on-accent)] font-bold">
                T
              </div>
              <div>
                <h2 className="text-[var(--accent-green)] font-bold">TreeShop Terminal</h2>
                <p className="text-xs text-[var(--font-secondary)]">Master Control</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-[var(--medium-gray)]">
            <div className="text-sm">
              <p className="text-[var(--font-primary)] font-medium">
                {user?.name || "TreeShop Operations"}
              </p>
              <p className="text-[var(--font-secondary)] text-xs">
                {user?.email || TREESHOP_BUSINESS_DATA.company.adminEmail}
              </p>
              <p className="text-[var(--accent-green)] text-xs font-medium">
                {TREESHOP_BUSINESS_DATA.company.location}
              </p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left ${isMobile ? "p-4" : "p-3"} rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? "bg-[var(--accent-green)]/20 border border-[var(--accent-green)]/30 text-[var(--accent-green)]"
                        : "hover:bg-[var(--soft-gray)] text-[var(--font-secondary)] hover:text-[var(--font-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isMobile ? "text-2xl" : "text-xl"}>{item.icon}</span>
                      <div>
                        <p className={`font-medium ${isMobile ? "text-lg" : ""}`}>{item.label}</p>
                        <p className="text-xs opacity-60">{item.description}</p>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge variant="warning" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Separator */}
            <div className="my-4 border-t border-[var(--medium-gray)]"></div>

            {/* Bottom Navigation */}
            <div className="space-y-1">
              {bottomItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left ${isMobile ? "p-4" : "p-3"} rounded-xl transition-all flex items-center gap-3 group ${
                      isActive
                        ? "bg-[var(--accent-green)]/20 border border-[var(--accent-green)]/30 text-[var(--accent-green)]"
                        : "hover:bg-[var(--soft-gray)] text-[var(--font-secondary)] hover:text-[var(--font-primary)]"
                    }`}
                  >
                    <span className={isMobile ? "text-2xl" : "text-xl"}>{item.icon}</span>
                    <div>
                      <p className={`font-medium ${isMobile ? "text-lg" : ""}`}>{item.label}</p>
                      <p className="text-xs opacity-60">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--medium-gray)]">
            <button
              onClick={handleLogout}
              className="btn-modern w-full bg-[var(--soft-gray)] hover:bg-[var(--medium-gray)] text-[var(--font-secondary)] hover:text-[var(--font-primary)] rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-[var(--medium-gray)] bg-[var(--soft-gray)]">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-[var(--accent-green)]">
                  {TREESHOP_BUSINESS_DATA.kpis.activeProjects}
                </p>
                <p className="text-xs text-[var(--font-secondary)]">Active Projects</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--amber)]">
                  {TREESHOP_BUSINESS_DATA.kpis.activeCrew}
                </p>
                <p className="text-xs text-[var(--font-secondary)]">Active Crew</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 text-center mt-3 pt-3 border-t border-[var(--medium-gray)]">
              <div>
                <p className="text-lg font-bold text-[var(--soft-blue)]">
                  ${(TREESHOP_BUSINESS_DATA.kpis.monthlyRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-[var(--font-secondary)]">Monthly Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile ONLY */}
      {isExpanded && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}