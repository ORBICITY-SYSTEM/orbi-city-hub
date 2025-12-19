import { Link } from "wouter";
import { 
  DollarSign, 
  Megaphone, 
  Calendar, 
  Truck, 
  TrendingUp, 
  Users, 
  Package,
  Bot,
  X,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Puzzle,
  MessageCircle
} from "lucide-react";
import { MainAIAgent } from "@/components/MainAIAgent";
import { IntegrationsShowcase } from "@/components/IntegrationsShowcase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { t, language } = useLanguage();
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  // Fetch real-time CEO Dashboard data
  const { data: todayOverview, isLoading: overviewLoading } = trpc.ceoDashboard.getTodayOverview.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: moduleSummaries, isLoading: summariesLoading } = trpc.ceoDashboard.getModuleSummaries.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Fetch Live Chat stats
  const { data: liveChatStats } = trpc.tawkto.getStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₾${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₾${(value / 1000).toFixed(0)}K`;
    return `₾${value.toLocaleString()}`;
  };

  // CEO Dashboard KPIs - Real-time metrics
  const ceoMetrics = {
    todayRevenue: { 
      value: todayOverview ? formatCurrency(todayOverview.todayRevenue.value) : "₾0", 
      change: todayOverview?.todayRevenue.changePercent || "+0%", 
      positive: (todayOverview?.todayRevenue.change || 0) >= 0 
    },
    activeBookings: { 
      value: todayOverview?.activeBookings.value.toString() || "0", 
      change: `${(todayOverview?.activeBookings.change || 0) >= 0 ? '+' : ''}${todayOverview?.activeBookings.change || 0}`, 
      positive: (todayOverview?.activeBookings.change || 0) >= 0 
    },
    pendingReviews: { 
      value: todayOverview?.pendingReviews.value.toString() || "0", 
      change: todayOverview?.pendingReviews.change ? `+${todayOverview.pendingReviews.change} new` : "0 new", 
      positive: true 
    },
    todayTasks: { 
      value: todayOverview?.todayTasks.value.toString() || "0", 
      change: `${todayOverview?.todayTasks.completed || 0} done`, 
      positive: true 
    },
  };

  // Module summaries for CEO overview
  const moduleData = [
    {
      key: "finance",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-500/30",
      path: "/finance",
      metrics: [
        { 
          label: language === 'ka' ? "წლიური შემოსავალი" : "Annual Revenue", 
          value: moduleSummaries ? formatCurrency(moduleSummaries.finance.annualRevenue) : "₾0", 
          trend: "+297%" 
        },
        { 
          label: language === 'ka' ? "წლიური მოგება" : "Annual Profit", 
          value: moduleSummaries ? formatCurrency(moduleSummaries.finance.annualProfit) : "₾0", 
          trend: "+358%" 
        },
        { 
          label: language === 'ka' ? "მოგების მარჟა" : "Profit Margin", 
          value: `${moduleSummaries?.finance.profitMargin || 0}%`, 
          trend: "+12%" 
        },
      ]
    },
    {
      key: "marketing",
      icon: Megaphone,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500/30",
      path: "/marketing",
      metrics: [
        { 
          label: language === 'ka' ? "საშ. დატვირთვა" : "Avg. Occupancy", 
          value: `${moduleSummaries?.marketing.avgOccupancy || 74}%`, 
          trend: "+14%" 
        },
        { 
          label: language === 'ka' ? "ვებ ლიდები" : "Web Leads", 
          value: (moduleSummaries?.marketing.webLeads || 156).toString(), 
          trend: "+23%" 
        },
        { 
          label: language === 'ka' ? "კონვერსია" : "Conversion", 
          value: `${moduleSummaries?.marketing.conversion || 12}%`, 
          trend: "+3%" 
        },
      ]
    },
    {
      key: "reservations",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500/30",
      path: "/reservations",
      metrics: [
        { 
          label: language === 'ka' ? "აქტიური სტუდიოები" : "Active Studios", 
          value: (moduleSummaries?.reservations.activeStudios || 75).toString(), 
          trend: "+41" 
        },
        { 
          label: language === 'ka' ? "ჯავშნები დღეს" : "Bookings Today", 
          value: (moduleSummaries?.reservations.todayBookings || 0).toString(), 
          trend: "+3" 
        },
        { 
          label: language === 'ka' ? "საშ. რეიტინგი" : "Avg. Rating", 
          value: moduleSummaries?.reservations.avgRating?.toString() || "4.8", 
          trend: "★" 
        },
      ]
    },
    {
      key: "logistics",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      borderColor: "border-orange-500/30",
      path: "/logistics",
      metrics: [
        { 
          label: language === 'ka' ? "დღევანდელი ამოცანები" : "Today's Tasks", 
          value: (moduleSummaries?.logistics.todayTasks || 12).toString(), 
          trend: "8 done" 
        },
        { 
          label: language === 'ka' ? "დალაგება" : "Housekeeping", 
          value: (moduleSummaries?.logistics.housekeeping || 6).toString(), 
          trend: "4 done" 
        },
        { 
          label: language === 'ka' ? "მოვლა" : "Maintenance", 
          value: (moduleSummaries?.logistics.maintenance || 3).toString(), 
          trend: "1 urgent" 
        },
      ]
    }
  ];

  const isLoading = overviewLoading || summariesLoading;

  return (
    <div className="space-y-6">
      {/* Header with Ocean Wave */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="relative z-10 px-8 pt-8 pb-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-tight mb-2">
                {language === 'ka' ? "CEO Dashboard" : "CEO Dashboard"}
              </h1>
              <p className="text-lg text-white/90 font-medium">
                {language === 'ka' ? "ORBI City Sea View / რეალ-ტაიმ მენეჯმენტი" : "ORBI City Sea View / Real-time Management"}
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Integrations Button */}
              <Button
                onClick={() => setShowIntegrations(true)}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <Puzzle className="w-5 h-5" />
                <span className="font-medium">
                  {language === 'ka' ? "ინტეგრაციები" : "Integrations"}
                </span>
              </Button>
              {/* AI Agent Button */}
              <Button
                onClick={() => setShowAIAgent(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">
                  {language === 'ka' ? "AI აგენტი" : "AI Agent"}
                </span>
              </Button>
            </div>
          </div>
        </div>
        {/* Ocean Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px]" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#0f3460]" style={{ zIndex: -1 }} />
      </div>

      {/* CEO Quick Metrics - Today's Overview */}
      <div className="px-6">
        <h2 className="text-lg font-semibold text-white/80 mb-3 flex items-center gap-2">
          {language === 'ka' ? "📊 დღევანდელი მიმოხილვა" : "📊 Today's Overview"}
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className={`text-xs font-medium flex items-center gap-1 ${ceoMetrics.todayRevenue.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {ceoMetrics.todayRevenue.change}
                {ceoMetrics.todayRevenue.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{ceoMetrics.todayRevenue.value}</div>
            <div className="text-sm text-white/60">
              {language === 'ka' ? "დღევანდელი შემოსავალი" : "Today's Revenue"}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className={`text-xs font-medium flex items-center gap-1 ${ceoMetrics.activeBookings.positive ? 'text-blue-400' : 'text-red-400'}`}>
                {ceoMetrics.activeBookings.change}
                {ceoMetrics.activeBookings.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{ceoMetrics.activeBookings.value}</div>
            <div className="text-sm text-white/60">
              {language === 'ka' ? "აქტიური ჯავშნები" : "Active Bookings"}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                {ceoMetrics.pendingReviews.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{ceoMetrics.pendingReviews.value}</div>
            <div className="text-sm text-white/60">
              {language === 'ka' ? "მოლოდინში მიმოხილვები" : "Pending Reviews"}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">
                {ceoMetrics.todayTasks.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{ceoMetrics.todayTasks.value}</div>
            <div className="text-sm text-white/60">
              {language === 'ka' ? "დღევანდელი ამოცანები" : "Today's Tasks"}
            </div>
          </div>

          {/* Live Chat Card */}
          <Link href="/marketing/live-chat">
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:bg-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                  {liveChatStats?.unread || 0} {language === 'ka' ? 'ახალი' : 'new'}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{liveChatStats?.todayCount || 0}</div>
              <div className="text-sm text-white/60">
                {language === 'ka' ? "ლაივ ჩატი დღეს" : "Live Chat Today"}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Module Summary Cards */}
      <div className="px-6 pb-8">
        <h2 className="text-lg font-semibold text-white/80 mb-3">
          {language === 'ka' ? "🏢 მოდულების მიმოხილვა" : "🏢 Module Overview"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleData.map((module) => (
            <Link key={module.key} href={module.path}>
              <div className={`bg-slate-800/50 border ${module.borderColor} rounded-xl p-5 hover:bg-slate-800/70 transition-all cursor-pointer group`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center`}>
                      <module.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {t(`modules.${module.key}.title`)}
                      </h3>
                      <p className="text-xs text-white/50">
                        {t(`modules.${module.key}.description`)}
                      </p>
                    </div>
                  </div>
                  <span className="text-cyan-400 text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {language === 'ka' ? "ნახვა" : "View"}
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {module.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-xs text-white/50 mb-1 truncate">{metric.label}</div>
                      <div className="text-lg font-bold text-white">{metric.value}</div>
                      <div className="text-xs text-cyan-400">{metric.trend}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Agent Modal */}
      {showAIAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {language === 'ka' ? "მთავარი AI აგენტი" : "Main AI Agent"}
                  </h2>
                  <p className="text-sm text-white/60">
                    {language === 'ka' ? "ინტელექტუალური მონაცემების განაწილება" : "Intelligent Data Distribution"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAIAgent(false)}
                className="text-white/60 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <MainAIAgent />
            </div>
          </div>
        </div>
      )}

      {/* Integrations Showcase Modal */}
      <IntegrationsShowcase 
        open={showIntegrations} 
        onOpenChange={setShowIntegrations} 
      />
    </div>
  );
}
