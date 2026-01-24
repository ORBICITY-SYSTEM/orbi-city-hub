/**
 * ModulePageLayout - Unified layout for all module pages
 * Includes header with module info and tab navigation for sub-modules
 * Features glassmorphism design that works with 5D holographic background
 */

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
  moduleColor: string; // Tailwind color like "cyan", "green", "amber", "purple"
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

  // Enhanced color system with glow effects
  const colorConfig: Record<string, { hex: string; glow: string }> = {
    cyan: { hex: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
    green: { hex: '#22c55e', glow: 'rgba(34,197,94,0.5)' },
    amber: { hex: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
    purple: { hex: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
    pink: { hex: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
  };

  const colorClasses = {
    cyan: {
      gradient: "from-cyan-500 to-cyan-600",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      active: "data-[state=active]:bg-cyan-600/80",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      active: "data-[state=active]:bg-green-600/80",
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      active: "data-[state=active]:bg-amber-600/80",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      active: "data-[state=active]:bg-purple-600/80",
    },
    pink: {
      gradient: "from-pink-500 to-pink-600",
      bg: "bg-pink-500/10",
      border: "border-pink-500/30",
      text: "text-pink-400",
      active: "data-[state=active]:bg-pink-600/80",
    },
  };

  const colors = colorClasses[moduleColor as keyof typeof colorClasses] || colorClasses.cyan;
  const colorHex = colorConfig[moduleColor]?.hex || '#06b6d4';
  const colorGlow = colorConfig[moduleColor]?.glow || 'rgba(6,182,212,0.5)';

  return (
    <div className="min-h-screen relative">
      {/* Module Header - Glassmorphism */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-6 md:px-8 pt-6 md:pt-8 pb-8 md:pb-10"
        >
          <div className="flex items-center gap-4">
            {/* Icon with Glow */}
            <motion.div
              className={cn(
                "flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br",
                colors.gradient
              )}
              style={{
                boxShadow: `0 0 30px ${colorGlow}, 0 10px 40px rgba(0,0,0,0.3)`,
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${colorGlow}, 0 10px 40px rgba(0,0,0,0.3)`,
                  `0 0 40px ${colorGlow}, 0 10px 40px rgba(0,0,0,0.3)`,
                  `0 0 20px ${colorGlow}, 0 10px 40px rgba(0,0,0,0.3)`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ModuleIcon className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </motion.div>
            <div>
              <h1
                className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
                style={{
                  color: colorHex,
                  textShadow: `0 0 30px ${colorGlow}`,
                }}
              >
                {language === 'ka' ? moduleTitleKa : moduleTitle}
              </h1>
              <p className="text-sm md:text-base text-white/60 mt-1">
                {language === 'ka' ? moduleSubtitleKa : moduleSubtitle}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Neon Border Line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colorHex} 20%, ${colorHex} 80%, transparent 100%)`,
            boxShadow: `0 0 20px ${colorGlow}, 0 0 40px ${colorGlow}`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Tab Navigation & Content */}
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Tabs defaultValue={defaultTab || subModules[0]?.id} className="w-full">
          {/* Scrollable Tabs - Glassmorphism */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList
              className="inline-flex md:flex md:flex-wrap gap-1 md:gap-2 mb-6 md:mb-8 p-1.5 rounded-xl min-w-max md:min-w-0 backdrop-blur-xl"
              style={{
                background: 'rgba(5,15,30,0.7)',
                border: `1px solid ${colorHex}30`,
                boxShadow: `0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {subModules.map((sub) => (
                <TabsTrigger
                  key={sub.id}
                  value={sub.id}
                  className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all",
                    "text-white/60 hover:text-white hover:bg-white/5",
                    colors.active,
                    "data-[state=active]:text-white data-[state=active]:shadow-lg"
                  )}
                  style={{
                    // Active state glow handled by Tailwind class
                  }}
                >
                  <sub.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="whitespace-nowrap">
                    {t(sub.nameKey, sub.nameFallback)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          {subModules.map((sub) => (
            <TabsContent key={sub.id} value={sub.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {sub.component}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
