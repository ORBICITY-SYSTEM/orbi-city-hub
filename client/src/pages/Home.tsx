import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Megaphone,
  Calendar,
  Truck,
  Bot,
  X,
  Star,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Puzzle,
  MessageCircle,
  Brain,
  Zap,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { MainAIAgent } from "@/components/MainAIAgent";
import { IntegrationsShowcase } from "@/components/IntegrationsShowcase";
import AIDirectorsShowcase from "@/components/AIDirectorsShowcase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ParticleBackground } from "@/components/command-center/ParticleBackground";
import { HolographicCard } from "@/components/command-center/HolographicCard";

// Animated counter component
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

// Metric card with glow effect
function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
  color,
  delay = 0,
}: {
  icon: any;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  color: "cyan" | "emerald" | "purple" | "amber" | "blue" | "pink";
  delay?: number;
}) {
  const colorMap = {
    cyan: { bg: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/30", text: "text-cyan-400" },
    emerald: { bg: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    purple: { bg: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", text: "text-purple-400" },
    amber: { bg: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30", text: "text-amber-400" },
    blue: { bg: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", text: "text-blue-400" },
    pink: { bg: "from-pink-500/20 to-pink-600/10", border: "border-pink-500/30", text: "text-pink-400" },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -3 }}
      className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border ${colors.border}
                  rounded-xl p-4 backdrop-blur-sm cursor-pointer group`}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <span className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {change}
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          </span>
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-white/60">{label}</div>
      </div>
    </motion.div>
  );
}

// Module card with futuristic design
function ModuleCard({
  icon: Icon,
  title,
  description,
  metrics,
  color,
  path,
  delay = 0,
}: {
  icon: any;
  title: string;
  description: string;
  metrics: { label: string; value: string; trend: string }[];
  color: string;
  path: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={path}>
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700/50
                      rounded-2xl p-5 cursor-pointer group hover:border-cyan-500/30 transition-all duration-300">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-white/50">{description}</p>
                </div>
              </div>
              <motion.div
                className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <ArrowUpRight className="w-5 h-5" />
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.1 + idx * 0.1 }}
                  className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30"
                >
                  <div className="text-xs text-white/50 mb-1 truncate">{metric.label}</div>
                  <div className="text-lg font-bold text-white">{metric.value}</div>
                  <div className="text-xs text-cyan-400">{metric.trend}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  // Fetch real-time CEO Dashboard data
  const { data: todayOverview, isLoading: overviewLoading } = trpc.ceoDashboard.getTodayOverview.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const { data: moduleSummaries, isLoading: summariesLoading } = trpc.ceoDashboard.getModuleSummaries.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const { data: liveChatStats } = trpc.tawkto.getStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₾${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₾${(value / 1000).toFixed(0)}K`;
    return `₾${value.toLocaleString()}`;
  };

  const ceoMetrics = {
    todayRevenue: {
      value: todayOverview ? formatCurrency(todayOverview.todayRevenue.value) : "₾0",
      change: todayOverview?.todayRevenue.changePercent || "+0%",
      positive: (todayOverview?.todayRevenue.change || 0) >= 0,
    },
    activeBookings: {
      value: todayOverview?.activeBookings.value.toString() || "0",
      change: `${(todayOverview?.activeBookings.change || 0) >= 0 ? '+' : ''}${todayOverview?.activeBookings.change || 0}`,
      positive: (todayOverview?.activeBookings.change || 0) >= 0,
    },
    pendingReviews: {
      value: todayOverview?.pendingReviews.value.toString() || "0",
      change: todayOverview?.pendingReviews.change ? `+${todayOverview.pendingReviews.change}` : "+0",
      positive: true,
    },
    todayTasks: {
      value: todayOverview?.todayTasks.value.toString() || "0",
      change: `${todayOverview?.todayTasks.completed || 0} done`,
      positive: true,
    },
  };

  const moduleData = [
    {
      key: "finance",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      path: "/finance",
      metrics: [
        { label: language === 'ka' ? "წლიური შემოსავალი" : "Annual Revenue", value: moduleSummaries ? formatCurrency(moduleSummaries.finance.annualRevenue) : "₾0", trend: "+297%" },
        { label: language === 'ka' ? "წლიური მოგება" : "Annual Profit", value: moduleSummaries ? formatCurrency(moduleSummaries.finance.annualProfit) : "₾0", trend: "+358%" },
        { label: language === 'ka' ? "მოგების მარჟა" : "Profit Margin", value: `${moduleSummaries?.finance.profitMargin || 0}%`, trend: "+12%" },
      ],
    },
    {
      key: "marketing",
      icon: Megaphone,
      color: "from-blue-500 to-blue-600",
      path: "/marketing",
      metrics: [
        { label: language === 'ka' ? "საშ. დატვირთვა" : "Avg. Occupancy", value: `${moduleSummaries?.marketing.avgOccupancy || 74}%`, trend: "+14%" },
        { label: language === 'ka' ? "ვებ ლიდები" : "Web Leads", value: (moduleSummaries?.marketing.webLeads || 156).toString(), trend: "+23%" },
        { label: language === 'ka' ? "კონვერსია" : "Conversion", value: `${moduleSummaries?.marketing.conversion || 12}%`, trend: "+3%" },
      ],
    },
    {
      key: "reservations",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      path: "/reservations",
      metrics: [
        { label: language === 'ka' ? "აქტიური სტუდიოები" : "Active Studios", value: (moduleSummaries?.reservations.activeStudios || 75).toString(), trend: "+41" },
        { label: language === 'ka' ? "ჯავშნები დღეს" : "Bookings Today", value: (moduleSummaries?.reservations.todayBookings || 0).toString(), trend: "+3" },
        { label: language === 'ka' ? "საშ. რეიტინგი" : "Avg. Rating", value: moduleSummaries?.reservations.avgRating?.toString() || "4.8", trend: "★" },
      ],
    },
    {
      key: "logistics",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      path: "/logistics",
      metrics: [
        { label: language === 'ka' ? "დღევანდელი ამოცანები" : "Today's Tasks", value: (moduleSummaries?.logistics.todayTasks || 12).toString(), trend: "8 done" },
        { label: language === 'ka' ? "დალაგება" : "Housekeeping", value: (moduleSummaries?.logistics.housekeeping || 6).toString(), trend: "4 done" },
        { label: language === 'ka' ? "მოვლა" : "Maintenance", value: (moduleSummaries?.logistics.maintenance || 3).toString(), trend: "1 urgent" },
      ],
    },
  ];

  const isLoading = overviewLoading || summariesLoading;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {/* Animated Logo */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(0, 245, 255, 0.3)",
                      "0 0 40px rgba(0, 245, 255, 0.5)",
                      "0 0 20px rgba(0, 245, 255, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-7 h-7 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0f]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                    ORBI CITY
                  </span>{" "}
                  <span className="text-white/80">HUB</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-sm text-gray-400">
                    {language === 'ka' ? "AI ოპერაციული სისტემა" : "AI Operating System"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {/* Command Center Link */}
              <Link href="/command-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20
                           border border-pink-500/30 text-pink-400 flex items-center gap-2
                           hover:from-pink-500/30 hover:to-purple-500/30 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span className="font-medium text-sm">Command Center</span>
                </motion.button>
              </Link>

              {/* Integrations Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowIntegrations(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20
                         border border-purple-500/30 text-purple-400 flex items-center gap-2
                         hover:from-purple-500/30 hover:to-violet-500/30 transition-all"
              >
                <Puzzle className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {language === 'ka' ? "ინტეგრაციები" : "Integrations"}
                </span>
              </motion.button>

              {/* AI Agent Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIAgent(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500
                         text-white flex items-center gap-2 shadow-lg shadow-cyan-500/25
                         hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">
                  {language === 'ka' ? "AI აგენტი" : "AI Agent"}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-8">
          {/* Today's Overview */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">
                {language === 'ka' ? "დღევანდელი მიმოხილვა" : "Today's Overview"}
              </h2>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MetricCard
                icon={({ className }: { className?: string }) => <span className={`${className} font-bold text-lg`}>₾</span>}
                label={language === 'ka' ? "დღევანდელი შემოსავალი" : "Today's Revenue"}
                value={ceoMetrics.todayRevenue.value}
                change={ceoMetrics.todayRevenue.change}
                positive={ceoMetrics.todayRevenue.positive}
                color="emerald"
                delay={0}
              />
              <MetricCard
                icon={Calendar}
                label={language === 'ka' ? "აქტიური ჯავშნები" : "Active Bookings"}
                value={ceoMetrics.activeBookings.value}
                change={ceoMetrics.activeBookings.change}
                positive={ceoMetrics.activeBookings.positive}
                color="blue"
                delay={0.1}
              />
              <MetricCard
                icon={Star}
                label={language === 'ka' ? "მოლოდინში მიმოხილვები" : "Pending Reviews"}
                value={ceoMetrics.pendingReviews.value}
                change={ceoMetrics.pendingReviews.change}
                positive={ceoMetrics.pendingReviews.positive}
                color="amber"
                delay={0.2}
              />
              <MetricCard
                icon={CheckCircle2}
                label={language === 'ka' ? "დღევანდელი ამოცანები" : "Today's Tasks"}
                value={ceoMetrics.todayTasks.value}
                change={ceoMetrics.todayTasks.change}
                positive={ceoMetrics.todayTasks.positive}
                color="purple"
                delay={0.3}
              />
              <Link href="/live-chat">
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-cyan-600/10
                           border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                      {liveChatStats?.unread || 0} new
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">{liveChatStats?.todayCount || 0}</div>
                  <div className="text-sm text-white/60">
                    {language === 'ka' ? "ლაივ ჩატი" : "Live Chat"}
                  </div>
                </motion.div>
              </Link>
            </div>
          </section>

          {/* AI Directors */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <Bot className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                {language === 'ka' ? "AI დირექტორები" : "AI Directors"}
              </h2>
            </motion.div>
            <AIDirectorsShowcase />
          </section>

          {/* Module Overview */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-4"
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">
                {language === 'ka' ? "მოდულების მიმოხილვა" : "Module Overview"}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleData.map((module, idx) => (
                <ModuleCard
                  key={module.key}
                  icon={module.icon}
                  title={t(`modules.${module.key}.title`)}
                  description={t(`modules.${module.key}.description`)}
                  metrics={module.metrics}
                  color={module.color}
                  path={module.path}
                  delay={0.4 + idx * 0.1}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* AI Agent Modal */}
      <AnimatePresence>
        {showAIAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAIAgent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center"
                    animate={{
                      boxShadow: ["0 0 0px #00f5ff", "0 0 20px #00f5ff", "0 0 0px #00f5ff"],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {language === 'ka' ? "მთავარი AI აგენტი" : "Main AI Agent"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {language === 'ka' ? "ინტელექტუალური მონაცემების განაწილება" : "Intelligent Data Distribution"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIAgent(false)}
                  className="text-gray-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <MainAIAgent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integrations Modal */}
      <IntegrationsShowcase open={showIntegrations} onOpenChange={setShowIntegrations} />
    </div>
  );
}
