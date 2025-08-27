"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile when screen size changes
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      path: "/",
      description: "KPIs & Overview",
      badge: null,
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
        className="fixed right-4 top-4 z-50 p-2 md:p-3 bg-green-500 hover:bg-green-400 text-black rounded-lg transition-all shadow-lg"
        aria-label="Toggle menu"
      >
        <span className="text-lg md:text-base">{isExpanded ? "✕" : "☰"}</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full bg-black border-l border-gray-700 transition-all duration-300 z-40 ${
          isExpanded ? (isMobile ? "w-full max-w-sm" : "w-64") : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold">
                T
              </div>
              <div>
                <h2 className="text-green-500 font-bold">TreeShop Terminal</h2>
                <p className="text-xs text-gray-400">Master Control</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="text-sm">
              <p className="text-white font-medium">
                {user?.name || "Office Manager"}
              </p>
              <p className="text-gray-400 text-xs">
                {user?.email || "office@fltreeshop.com"}
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
                    className={`w-full text-left ${isMobile ? "p-4" : "p-3"} rounded-lg transition-all flex items-center justify-between group ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30 text-green-500"
                        : "hover:bg-gray-800 text-gray-300 hover:text-white"
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
            <div className="my-4 border-t border-gray-700"></div>

            {/* Bottom Navigation */}
            <div className="space-y-1">
              {bottomItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left ${isMobile ? "p-4" : "p-3"} rounded-lg transition-all flex items-center gap-3 group ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30 text-green-500"
                        : "hover:bg-gray-800 text-gray-300 hover:text-white"
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
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">4</p>
                <p className="text-xs text-gray-400">Active Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">2</p>
                <p className="text-xs text-gray-400">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}