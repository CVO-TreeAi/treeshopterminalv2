"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("authenticated");
    const authTime = localStorage.getItem("authTime");
    
    if (auth === "true" && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setAuthenticated(true);
      } else {
        localStorage.removeItem("authenticated");
        localStorage.removeItem("authTime");
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content Area (with dynamic padding based on sidebar state) */}
      <div className={`transition-all duration-300 ${
        sidebarExpanded && !isMobile ? "md:pr-64" : "pr-0"
      }`}>
        <div className="min-h-screen">
          {children}
        </div>
      </div>
      
      {/* Right-side Sidebar */}
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded} 
      />
    </div>
  );
}