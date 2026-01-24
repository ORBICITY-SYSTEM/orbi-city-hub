/**
 * ModularLayout - Simple wrapper without sidebar
 * Navigation happens through Home page module buttons
 * Each module has its own internal tab navigation
 * Features 5D Holographic Background on all pages
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE } from "@/const";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { HolographicBackground } from "@/components/HolographicBackground";

export default function ModularLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();

  // Home page and command center are fullscreen without header
  const isFullscreenPage = location === "/" || location === "/command-center";

  // Get current module name for back button
  const getModuleName = () => {
    if (location.startsWith("/marketing")) return t("nav.marketing", "Marketing");
    if (location.startsWith("/reservations")) return t("nav.reservations", "Reservations");
    if (location.startsWith("/finance")) return t("nav.finance", "Finance");
    if (location.startsWith("/logistics")) return t("nav.logistics", "Logistics");
    if (location.startsWith("/settings")) return t("nav.settings", "Settings");
    if (location.startsWith("/integrations")) return t("nav.integrations", "Integrations");
    if (location.startsWith("/data")) return t("nav.data", "Data Hub");
    return "";
  };

  return (
    <div className="min-h-screen relative">
      {/* 5D Holographic Background - All pages */}
      <HolographicBackground />

      {/* Compact Header - Only shown on module pages */}
      {!isFullscreenPage && (
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-cyan-500/30"
          style={{
            background: 'linear-gradient(180deg, rgba(5,10,20,0.95) 0%, rgba(5,10,20,0.85) 100%)',
            boxShadow: '0 4px 30px rgba(6,182,212,0.1), 0 1px 0 rgba(6,182,212,0.2)',
          }}
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            {/* Left: Back to Home + Module Name */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 gap-2 border border-transparent hover:border-cyan-500/30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              {getModuleName() && (
                <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
                  style={{ textShadow: '0 0 20px rgba(6,182,212,0.5)' }}
                >
                  {getModuleName()}
                </span>
              )}
            </div>

            {/* Right: User info, Language, Logout */}
            <div className="flex items-center gap-2 md:gap-4">
              {user && (
                <span className="hidden md:inline text-sm text-cyan-300/70">
                  {user.name || user.email}
                </span>
              )}
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-purple-400/80 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2">{t("logout", "Logout")}</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Full width with relative z-index */}
      <main className="min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
