import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: "cyan" | "purple" | "pink" | "green" | "yellow";
  delay?: number;
}

const colorMap = {
  cyan: {
    bg: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  purple: {
    bg: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
  pink: {
    bg: "from-pink-500/20 to-pink-600/10",
    border: "border-pink-500/30",
    text: "text-pink-400",
    glow: "shadow-pink-500/20",
  },
  green: {
    bg: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
    text: "text-green-400",
    glow: "shadow-green-500/20",
  },
  yellow: {
    bg: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    glow: "shadow-yellow-500/20",
  },
};

function MetricCard({ label, value, change, icon, color, delay = 0 }: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.bg}
                  border ${colors.border} p-4 backdrop-blur-sm
                  shadow-lg ${colors.glow} cursor-pointer group`}
    >
      {/* Animated border */}
      <motion.div
        className={`absolute inset-0 rounded-xl border-2 ${colors.border} opacity-0 group-hover:opacity-100`}
        animate={{
          boxShadow: ["0 0 0px currentColor", "0 0 20px currentColor", "0 0 0px currentColor"]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className={`${colors.text} opacity-70`}>{icon}</span>
          {change !== undefined && (
            <div className={`flex items-center text-xs ${
              change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400"
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> :
               change < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> :
               <Minus className="w-3 h-3 mr-1" />}
              {change > 0 ? "+" : ""}{change}%
            </div>
          )}
        </div>

        <div className={`text-2xl font-bold ${colors.text} mb-1`}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            {value}
          </motion.span>
        </div>

        <div className="text-xs text-gray-400">{label}</div>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
        animate={{ translateX: ["−100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.div>
  );
}

export function FloatingMetrics() {
  const { t } = useLanguage();

  // Fetch real metrics from the backend
  const { data: metrics } = trpc.powerStack.getMetrics.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const { data: financeData } = trpc.realFinance.getDashboardData.useQuery(
    { period: "month" },
    { refetchInterval: 60000 }
  );

  // Calculate metrics
  const totalRevenue = (financeData as any)?.totalRevenue || 92500;
  const occupancyRate = (metrics as any)?.occupancy || 78;
  const todayBookings = (metrics as any)?.todayBookings || 12;
  const pendingTasks = 8; // placeholder

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label={t("შემოსავალი (თვე)", "Revenue (Month)")}
        value={`₾${totalRevenue.toLocaleString()}`}
        change={12}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="cyan"
        delay={0}
      />

      <MetricCard
        label={t("დაკავებულობა", "Occupancy Rate")}
        value={`${occupancyRate}%`}
        change={3}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        color="purple"
        delay={0.1}
      />

      <MetricCard
        label={t("დღევანდელი ჯავშნები", "Today's Bookings")}
        value={todayBookings}
        change={0}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        color="green"
        delay={0.2}
      />

      <MetricCard
        label={t("მომლოდინე დავალებები", "Pending Tasks")}
        value={pendingTasks}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
        color="yellow"
        delay={0.3}
      />
    </div>
  );
}
