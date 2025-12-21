import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  DollarSign, 
  Megaphone, 
  Calendar,
  Truck,
  LogOut,
  Loader2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  FileText,
  Database,
  BarChart3,
  Globe,
  Mail,
  Users,
  Package,
  Wrench,
  MessageCircle,
  Code,
  TestTube,
  BookOpen,
  Rocket,
  Sparkles,
  Bot,
  Send
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SubMenuItem {
  nameKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ModuleItem {
  nameKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subItems: SubMenuItem[];
}

const modules: ModuleItem[] = [
  {
    nameKey: "nav.finance",
    icon: DollarSign,
    color: "text-cyan-400",
    subItems: [
      { nameKey: "submenu.financeDashboard", path: "/finance", icon: LayoutDashboard },
      { nameKey: "submenu.analytics", path: "/finance/analytics", icon: TrendingUp },
      { nameKey: "submenu.reports", path: "/finance/reports", icon: FileText },
      { nameKey: "submenu.otelms", path: "/finance/otelms", icon: Database },
      { nameKey: "submenu.devExpenses", path: "/finance/expenses", icon: BarChart3 },
    ]
  },
  {
    nameKey: "nav.marketing",
    icon: Megaphone,
    color: "text-cyan-400",
    subItems: [
      { nameKey: "submenu.marketingDashboard", path: "/marketing", icon: LayoutDashboard },
      { nameKey: "submenu.otaChannels", path: "/marketing/ota", icon: Globe },
      { nameKey: "submenu.webLeads", path: "/marketing/leads", icon: Users },
      { nameKey: "submenu.liveChat", path: "/marketing/live-chat", icon: MessageCircle },
    ]
  },
  {
    nameKey: "nav.reservations",
    icon: Calendar,
    color: "text-cyan-400",
    subItems: [
      { nameKey: "submenu.otaDashboard", path: "/reservations", icon: LayoutDashboard },
      { nameKey: "submenu.aiResponses", path: "/reservations/ai-responses", icon: Sparkles },
      { nameKey: "submenu.butlerAI", path: "/reservations/automations", icon: Bot },
      { nameKey: "submenu.email", path: "/reservations/email", icon: Mail },
      { nameKey: "submenu.reviews", path: "/reservations/guests", icon: Users },
      { nameKey: "submenu.otaCommand", path: "/reservations/ota", icon: Globe },
      { nameKey: "submenu.whatsappBot", path: "/whatsapp", icon: MessageCircle },
      { nameKey: "submenu.telegramBot", path: "/reservations/telegram-bot", icon: Send },
    ]
  },
  // HIDDEN: Logistics module - uncomment to re-enable
  // {
  //   nameKey: "nav.logistics",
  //   icon: Truck,
  //   color: "text-cyan-400",
  //   subItems: [
  //     { nameKey: "submenu.logisticsDashboard", path: "/logistics", icon: LayoutDashboard },
  //     { nameKey: "submenu.housekeeping", path: "/logistics/housekeeping", icon: Package },
  //     { nameKey: "submenu.maintenance", path: "/logistics/maintenance", icon: Wrench },
  //   ]
  // },

];

export default function ModularLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(["nav.finance", "nav.marketing", "nav.reservations"]);

  // Auto-expand module based on current route
  useEffect(() => {
    const currentModule = modules.find(m => 
      m.subItems.some(item => location.startsWith(item.path))
    );
    if (currentModule && !expandedModules.includes(currentModule.nameKey)) {
      setExpandedModules(prev => [...prev, currentModule.nameKey]);
    }
  }, [location]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleModule = (moduleNameKey: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleNameKey) 
        ? prev.filter(name => name !== moduleNameKey)
        : [...prev, moduleNameKey]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
            <span className="font-bold text-white">{APP_TITLE}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-r border-cyan-500/20 transition-transform duration-300",
        "w-64 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-4 border-b border-cyan-500/20">
          <Link href="/" className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10" />
            <span className="font-bold text-xl text-white">{APP_TITLE}</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)] lg:h-[calc(100vh-72px)] mt-16 lg:mt-0">
          {/* Home */}
          <Link href="/">
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer",
              location === "/" 
                ? "bg-cyan-500/20 text-cyan-400" 
                : "text-white/70 hover:bg-slate-800/50 hover:text-white"
            )}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">{t("nav.home")}</span>
            </div>
          </Link>

          {/* Modules */}
          {modules.map((module) => (
            <div key={module.nameKey}>
              <button
                onClick={() => toggleModule(module.nameKey)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all",
                  module.subItems.some(item => location.startsWith(item.path))
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-white/70 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <module.icon className={cn("w-5 h-5", module.color)} />
                  <span className="font-medium">{t(module.nameKey)}</span>
                </div>
                {expandedModules.includes(module.nameKey) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedModules.includes(module.nameKey) && (
                <div className="ml-4 mt-1 space-y-1 border-l border-cyan-500/20 pl-4">
                  {module.subItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                        location === item.path
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "text-white/60 hover:bg-slate-800/50 hover:text-white"
                      )}>
                        <item.icon className="w-4 h-4" />
                        <span>{t(item.nameKey)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-end gap-4 px-6 py-4 border-b border-cyan-500/20 bg-slate-900/50">
          {user && (
            <span className="text-sm text-white/70">{user.name || user.email}</span>
          )}
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-white/70 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("logout")}
          </Button>
        </header>

        {/* Page Content */}
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
