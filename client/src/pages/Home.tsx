import { Link } from "wouter";
import { DollarSign, Megaphone, Calendar, Truck, TrendingUp, Users, Package } from "lucide-react";
import { MainAIAgent } from "@/components/MainAIAgent";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const modules = [
    {
      key: "finance",
      icon: DollarSign,
      color: "bg-cyan-500",
      path: "/finance",
    },
    {
      key: "marketing",
      icon: Megaphone,
      color: "bg-cyan-600",
      path: "/marketing",
    },
    {
      key: "reservations",
      icon: Calendar,
      color: "bg-cyan-700",
      path: "/reservations",
    },
    {
      key: "logistics",
      icon: Truck,
      color: "bg-cyan-800",
      path: "/logistics",
    }
  ];

  const quickStats = [
    { key: "totalRevenue", value: "₾999,543", change: "+297%", icon: TrendingUp, positive: true },
    { key: "totalProfit", value: "₾778,732", change: "+358%", icon: DollarSign, positive: true },
    { key: "studios", value: "75", change: "+41", icon: Users, positive: true },
    { key: "avgOccupancy", value: "74%", change: "+14%", icon: Package, positive: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Ocean Wave */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="relative z-10 px-8 pt-8 pb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-tight mb-2">
            {t("home.title")}
          </h1>
          <p className="text-lg text-white/90 font-medium">
            {t("home.subtitle")}
          </p>
        </div>
        {/* Ocean Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#0f3460]" style={{ zIndex: -1 }} />
      </div>

      {/* Main AI Agent */}
      <div className="px-6">
        <MainAIAgent />
      </div>

      {/* Quick Stats */}
      <div className="px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <div key={stat.key} className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${stat.positive ? 'text-cyan-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
                <stat.icon className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/60">{t(`home.${stat.key}`)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Cards */}
      <div className="px-6 pb-8">
        <h2 className="text-xl font-semibold text-white mb-4">{t("home.mainModules")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module) => (
            <Link key={module.key} href={module.path}>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/50 transition-all cursor-pointer group">
                <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {t(`modules.${module.key}.title`)}
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  {t(`modules.${module.key}.description`)}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/40">{t(`modules.${module.key}.metric`)}</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {module.key === "finance" && "₾999,543"}
                      {module.key === "marketing" && "74%"}
                      {module.key === "reservations" && "75"}
                      {module.key === "logistics" && "12"}
                    </div>
                  </div>
                  <span className="text-cyan-400 text-sm group-hover:translate-x-1 transition-transform">
                    {t("home.view")} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
