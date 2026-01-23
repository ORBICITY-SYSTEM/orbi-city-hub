/**
 * Standardized Page Header Component
 * Used across all module pages for consistent UI
 */

import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Georgian title (if different) */
  titleKa?: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Georgian subtitle (if different) */
  subtitleKa?: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Icon gradient color class (e.g., "from-cyan-500 to-cyan-600") */
  iconGradient?: string;
  /** Data source badge type */
  dataSource?: {
    type: "demo" | "live" | "loading" | "error";
    source?: string;
  };
  /** Show back button (defaults to true when authenticated) */
  showBackButton?: boolean;
  /** Custom back URL (defaults to "/") */
  backUrl?: string;
  /** Additional actions to render on the right side */
  actions?: React.ReactNode;
  /** Whether to use sticky positioning */
  sticky?: boolean;
}

export function PageHeader({
  title,
  titleKa,
  subtitle,
  subtitleKa,
  icon: Icon,
  iconGradient = "from-cyan-500 to-cyan-600",
  dataSource,
  showBackButton,
  backUrl = "/",
  actions,
  sticky = true,
}: PageHeaderProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const displayTitle = titleKa ? t(titleKa, title) : title;
  const displaySubtitle = subtitle && subtitleKa ? t(subtitleKa, subtitle) : subtitle;
  const showBack = showBackButton ?? isAuthenticated;

  return (
    <header
      className={`border-b border-white/10 bg-slate-900/80 backdrop-blur-md ${
        sticky ? "sticky top-0 z-50" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Left side: Back button + Icon + Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(backUrl)}
                className="text-white/70 hover:text-white hover:bg-white/10 shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("უკან", "Back")}</span>
              </Button>
            )}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg shrink-0`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                  {displayTitle}
                </h1>
                {displaySubtitle && (
                  <p className="text-xs sm:text-sm text-white/60 truncate">
                    {displaySubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Actions + DataSourceBadge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}
            {dataSource && (
              <DataSourceBadge
                type={dataSource.type}
                source={dataSource.source}
                size="md"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
