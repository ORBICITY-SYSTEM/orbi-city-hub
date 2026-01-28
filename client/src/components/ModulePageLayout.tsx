/**
 * ModulePageLayout - Unified layout for all module pages
 * Professional admin panel design with responsive navigation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronDown, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface SubModule {
  id: string;
  nameKey: string;
  nameFallback: string;
  icon: LucideIcon;
  component: React.ReactNode;
}

interface ModulePageLayoutProps {
  moduleTitle: string;
  moduleTitleKa: string;
  moduleSubtitle: string;
  moduleSubtitleKa: string;
  moduleIcon: LucideIcon;
  moduleColor: string;
  subModules: SubModule[];
  defaultTab?: string;
}

export function ModulePageLayout({
  moduleTitle,
  moduleTitleKa,
  moduleSubtitle,
  moduleSubtitleKa,
  moduleIcon: ModuleIcon,
  moduleColor,
  subModules,
  defaultTab,
}: ModulePageLayoutProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState(defaultTab || subModules[0]?.id);

  const colorConfig: Record<string, { hex: string; glow: string }> = {
    cyan: { hex: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
    green: { hex: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
    amber: { hex: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
    purple: { hex: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    pink: { hex: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
    blue: { hex: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
    red: { hex: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
  };

  const colorHex = colorConfig[moduleColor]?.hex || '#06b6d4';
  const colorGlow = colorConfig[moduleColor]?.glow || 'rgba(6,182,212,0.4)';

  const activeModule = subModules.find((m) => m.id === activeTab);
  const ActiveIcon = activeModule?.icon;

  return (
    <div className="min-h-screen">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Module Title */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${colorHex}, ${colorHex}99)`,
                  boxShadow: `0 0 20px ${colorGlow}`,
                }}
              >
                <ModuleIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1
                  className="text-lg md:text-xl font-bold"
                  style={{ color: colorHex }}
                >
                  {language === 'ka' ? moduleTitleKa : moduleTitle}
                </h1>
                <p className="text-xs text-white/50">
                  {language === 'ka' ? moduleSubtitleKa : moduleSubtitle}
                </p>
              </div>
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-slate-800/50 border-slate-700 text-white"
                  >
                    {ActiveIcon && <ActiveIcon className="h-4 w-4" />}
                    <span className="max-w-[120px] truncate">
                      {t(activeModule?.nameKey || '', activeModule?.nameFallback || '')}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-slate-900 border-slate-700"
                >
                  {subModules.map((sub) => (
                    <DropdownMenuItem
                      key={sub.id}
                      onClick={() => setActiveTab(sub.id)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        activeTab === sub.id
                          ? "bg-slate-800 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <sub.icon className="h-4 w-4" />
                      {t(sub.nameKey, sub.nameFallback)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Navigation - Compact Pills */}
          <div className="hidden md:block mt-4">
            <nav className="flex flex-wrap gap-1.5">
              {subModules.map((sub) => {
                const isActive = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${colorHex}cc, ${colorHex}99)`,
                            boxShadow: `0 2px 10px ${colorGlow}`,
                          }
                        : undefined
                    }
                  >
                    <sub.icon className="h-3.5 w-3.5" />
                    <span>{t(sub.nameKey, sub.nameFallback)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Accent Line */}
        <div
          className="h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${colorHex}, transparent)`,
          }}
        />
      </div>

      {/* Content Area */}
      <main className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeModule?.component}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
