import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ParticleBackground } from "@/components/command-center/ParticleBackground";
import { AICEOAvatar } from "@/components/command-center/AICEOAvatar";
import { FloatingMetrics } from "@/components/command-center/FloatingMetrics";
import { HolographicCard } from "@/components/command-center/HolographicCard";
import {
  Brain,
  BarChart3,
  Calendar,
  DollarSign,
  Package,
  Settings,
  Activity,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

// Lazy load the 3D globe for performance
const Globe3D = lazy(() =>
  import("@/components/command-center/Globe3D").then((m) => ({ default: m.Globe3D }))
);

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  delay: number;
}

function QuickAction({ icon, label, href, color, delay }: QuickActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={href}>
        <div
          className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50
                      hover:border-${color}-500/50 transition-all cursor-pointer group`}
        >
          <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
            {label}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CommandCenter() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 flex items-center justify-between border-b border-slate-800/50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 245, 255, 0.3)",
                    "0 0 40px rgba(0, 245, 255, 0.5)",
                    "0 0 20px rgba(0, 245, 255, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                  ORBI CITY
                </span>{" "}
                <span className="text-white/80">COMMAND CENTER</span>
              </h1>
              <p className="text-sm text-gray-500">
                {t("AI ოპერაციული სისტემა", "AI Operating System")}
              </p>
            </div>
          </motion.div>

          {/* Status indicators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-green-400">{t("სისტემა აქტიურია", "System Online")}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400">AI CEO</span>
            </div>
          </motion.div>
        </header>

        {/* Main Grid */}
        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI CEO & Globe */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI CEO Avatar */}
            <AICEOAvatar />

            {/* Metrics */}
            <FloatingMetrics />

            {/* 3D Globe */}
            <HolographicCard className="h-[400px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                }
              >
                <Globe3D />
              </Suspense>
            </HolographicCard>
          </div>

          {/* Right Column - Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <HolographicCard glowColor="purple">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  {t("სწრაფი წვდომა", "Quick Actions")}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction
                    icon={<BarChart3 className="w-5 h-5" />}
                    label={t("მარკეტინგი", "Marketing")}
                    href="/marketing"
                    color="cyan"
                    delay={0.1}
                  />
                  <QuickAction
                    icon={<Calendar className="w-5 h-5" />}
                    label={t("ჯავშნები", "Reservations")}
                    href="/reservations"
                    color="purple"
                    delay={0.2}
                  />
                  <QuickAction
                    icon={<DollarSign className="w-5 h-5" />}
                    label={t("ფინანსები", "Finance")}
                    href="/finance"
                    color="green"
                    delay={0.3}
                  />
                  <QuickAction
                    icon={<Package className="w-5 h-5" />}
                    label={t("ლოჯისტიკა", "Logistics")}
                    href="/logistics"
                    color="yellow"
                    delay={0.4}
                  />
                </div>
              </div>
            </HolographicCard>

            {/* Live Activity Feed */}
            <HolographicCard glowColor="pink">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-400" />
                  {t("ბოლო აქტივობა", "Live Activity")}
                </h2>
                <div className="space-y-3">
                  {[
                    { text: t("ახალი ჯავშანი: A-1821", "New booking: A-1821"), time: "2 წუთის წინ", color: "green" },
                    { text: t("დასუფთავება დასრულდა: C-2936", "Cleaning complete: C-2936"), time: "15 წუთის წინ", color: "cyan" },
                    { text: t("შემოსავალი: ₾450", "Revenue: ₾450"), time: "1 საათის წინ", color: "purple" },
                    { text: t("AI რეკომენდაცია მზადაა", "AI recommendation ready"), time: "2 საათის წინ", color: "pink" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{item.text}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </HolographicCard>

            {/* System Status */}
            <HolographicCard>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                  {t("სისტემის სტატუსი", "System Status")}
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "AI CEO", status: "active", value: "Claude Sonnet" },
                    { label: "Database", status: "active", value: "Supabase" },
                    { label: "Integrations", status: "active", value: "n8n" },
                    { label: "Cache", status: "inactive", value: "Redis" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.value}</span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "active" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HolographicCard>
          </div>
        </main>
      </div>
    </div>
  );
}
