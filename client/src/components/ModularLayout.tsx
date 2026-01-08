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
  Send,
  Star,
  List,
  CalendarDays,
  AlertTriangle,
  Settings,
  Plug,
  Inbox,
  Archive,
  LineChart,
  Target,
  Zap,
  Building2,
  Brain,
  Instagram,
  Facebook,
  Youtube,
  Hotel,
  PieChart,
  Receipt
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface NavItem {
  nameKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { nameKey: string; path: string; icon?: React.ComponentType<{ className?: string }> }[];
}

// Main modules (orb-city-harmony style)
const mainModules: NavItem[] = [
  {
    nameKey: "nav.mainDashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    nameKey: "nav.marketing",
    path: "/marketing",
    icon: Megaphone,
    children: [
      { nameKey: "submenu.aiMarketingDirector", path: "/marketing/ai-director", icon: Brain },
      { nameKey: "submenu.instagram", path: "/marketing/instagram", icon: Instagram },
      { nameKey: "submenu.facebook", path: "/marketing/facebook", icon: Facebook },
      { nameKey: "submenu.tiktok", path: "/marketing/tiktok", icon: Sparkles },
      { nameKey: "submenu.website", path: "/marketing/website", icon: Globe },
      { nameKey: "submenu.youtube", path: "/marketing/youtube", icon: Youtube },
      { nameKey: "submenu.googleAds", path: "/marketing/google", icon: TrendingUp },
      { nameKey: "submenu.otaChannels", path: "/marketing/ota", icon: Hotel },
      { nameKey: "submenu.leadGeneration", path: "/marketing/leads", icon: Users },
    ],
  },
  {
    nameKey: "nav.reservations",
    path: "/reservations",
    icon: Calendar,
    children: [
      { nameKey: "submenu.reservationsDashboard", path: "/reservations", icon: PieChart },
      { nameKey: "submenu.aiReservationsDirector", path: "/reservations/ai-director", icon: Bot },
      { nameKey: "submenu.reservationsList", path: "/reservations/list", icon: Calendar },
      { nameKey: "submenu.reservationsCalendar", path: "/reservations/calendar", icon: CalendarDays },
      { nameKey: "submenu.otaChannels", path: "/reservations/ota-channels", icon: Hotel },
      { nameKey: "submenu.guests", path: "/reservations/guests", icon: Users },
      { nameKey: "submenu.reviewsHub", path: "/reservations/reviews", icon: Star },
      { nameKey: "submenu.messages", path: "/reservations/messages", icon: MessageCircle },
    ],
  },
  {
    nameKey: "nav.finance",
    path: "/finance",
    icon: DollarSign,
    children: [
      { nameKey: "submenu.financeDashboard", path: "/finance", icon: PieChart },
      { nameKey: "submenu.aiFinanceDirector", path: "/finance/ai-director", icon: Bot },
      { nameKey: "submenu.revenue", path: "/finance/revenue", icon: TrendingUp },
      { nameKey: "submenu.devExpenses", path: "/finance/expenses", icon: Receipt },
      { nameKey: "submenu.reports", path: "/finance/reports", icon: FileText },
    ],
  },
  {
    nameKey: "nav.logistics",
    path: "/logistics",
    icon: Truck,
    children: [
      { nameKey: "submenu.logisticsDashboard", path: "/logistics", icon: PieChart },
      { nameKey: "submenu.aiLogisticsDirector", path: "/logistics/ai-director", icon: Bot },
      { nameKey: "submenu.housekeeping", path: "/logistics/housekeeping", icon: Sparkles },
      { nameKey: "submenu.inventory", path: "/logistics/inventory", icon: Package },
      { nameKey: "submenu.maintenance", path: "/logistics/maintenance", icon: Wrench },
    ],
  },
];

// System modules (bottom)
const systemModules: NavItem[] = [
  {
    nameKey: "nav.integrations",
    path: "/integrations",
    icon: Plug,
  },
  {
    nameKey: "nav.settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function ModularLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand item based on current route
  useEffect(() => {
    [...mainModules, ...systemModules].forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => location.startsWith(child.path));
        if (hasActiveChild && !expandedItems.includes(item.path)) {
          setExpandedItems(prev => [...prev, item.path]);
        }
      }
    });
  }, [location]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleItem = (itemPath: string) => {
    setExpandedItems(prev => 
      prev.includes(itemPath) 
        ? prev.filter(path => path !== itemPath)
        : [...prev, itemPath]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.path === "/") return location === "/";
    if (item.children) {
      return item.children.some(child => location.startsWith(child.path));
    }
    return location.startsWith(item.path);
  };

  const renderMenuItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.path);

    return (
      <div key={item.path}>
        {item.children ? (
          <>
            <button
              onClick={() => toggleItem(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-white/70 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{t(item.nameKey)}</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
            </button>
            
            {isExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-cyan-500/20 pl-4">
                {item.children.map((child) => (
                  <Link key={child.path} href={child.path}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                      location === child.path || location.startsWith(child.path + "/")
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:bg-slate-800/50 hover:text-white"
                    )}>
                      {child.icon && <child.icon className="w-3.5 h-3.5" />}
                      <span>{t(child.nameKey)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link href={item.path}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer",
              isActive
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-white/70 hover:bg-slate-800/50 hover:text-white"
            )}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{t(item.nameKey)}</span>
            </div>
          </Link>
        )}
      </div>
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white">ORBI City</span>
              <span className="text-xs text-muted-foreground">Hub</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)] lg:h-[calc(100vh-72px)] mt-16 lg:mt-0">
          {/* Main Modules */}
          <div className="mb-6">
            <div className="px-3 py-2 mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t("navGroup.modules") || "Modules"}
              </h3>
            </div>
            <div className="space-y-1">
              {mainModules.map(renderMenuItem)}
            </div>
          </div>

          {/* System Modules */}
          <div className="mt-auto pt-6 border-t border-cyan-500/20">
            <div className="px-3 py-2 mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t("navGroup.system") || "System"}
              </h3>
            </div>
            <div className="space-y-1">
              {systemModules.map(renderMenuItem)}
            </div>
          </div>
        </nav>

        {/* Footer - System Online */}
        <div className="hidden lg:flex items-center gap-2 px-6 py-4 border-t border-cyan-500/20 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>
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
