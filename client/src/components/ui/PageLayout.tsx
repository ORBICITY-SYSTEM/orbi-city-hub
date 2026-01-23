/**
 * Standardized Page Layout Component
 * Provides consistent page structure and background across all modules
 */

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface PageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Show loading state */
  isLoading?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Additional class names for the container */
  className?: string;
  /** Content padding variant */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "px-4 py-4 sm:px-6 sm:py-6",
  md: "px-4 py-6 sm:px-6 sm:py-8",
  lg: "px-6 py-8 sm:px-8 sm:py-10",
};

export function PageLayout({
  children,
  isLoading = false,
  loadingMessage,
  className = "",
  padding = "md",
}: PageLayoutProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          {loadingMessage && (
            <p className="text-white/60 text-sm">{loadingMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ${className}`}
    >
      <main className={`container mx-auto ${paddingClasses[padding]}`}>
        {children}
      </main>
    </div>
  );
}

/**
 * Full page layout including header slot
 */
interface FullPageLayoutProps extends Omit<PageLayoutProps, "children"> {
  /** Header component (PageHeader) */
  header: ReactNode;
  /** Page content */
  children: ReactNode;
}

export function FullPageLayout({
  header,
  children,
  isLoading = false,
  loadingMessage,
  className = "",
  padding = "md",
}: FullPageLayoutProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          {loadingMessage && (
            <p className="text-white/60 text-sm">{loadingMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ${className}`}
    >
      {header}
      <main className={`container mx-auto ${paddingClasses[padding]}`}>
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
