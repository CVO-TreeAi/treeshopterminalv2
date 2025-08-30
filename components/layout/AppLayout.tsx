"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  headerActions?: ReactNode;
  bottomActions?: ReactNode;
  fullScreen?: boolean;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  headerActions,
  bottomActions,
  fullScreen = false,
}: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBack = () => {
    if (pathname.includes('/crew/') && pathname !== '/crew') {
      router.push('/crew');
    } else {
      router.back();
    }
  };

  return (
    <div className="app-container min-h-screen bg-[var(--background)] text-[var(--font-primary)]">
      {/* App Header */}
      <header className="app-header sticky top-0 z-30 bg-[var(--card)] border-b border-[var(--medium-gray)]">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="btn-modern !min-h-[40px] !px-3 !py-2 flex items-center gap-2 text-[var(--font-secondary)] hover:text-[var(--accent-green)]"
              >
                <span className="text-lg">←</span>
                {!isMobile && <span>Back</span>}
              </button>
            )}
            
            <div>
              <h1 className={`font-bold text-[var(--font-primary)] ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-[var(--font-secondary)] text-sm mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* App Content */}
      <main className={`app-content flex-1 ${fullScreen ? '' : 'p-4 max-w-7xl mx-auto'}`}>
        {children}
      </main>

      {/* Bottom Actions for Mobile */}
      {bottomActions && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="bg-[var(--card)] border-t border-[var(--medium-gray)] p-4 safe-area-inset-bottom">
            <div className="flex gap-2">
              {bottomActions}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}