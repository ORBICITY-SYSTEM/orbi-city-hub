import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
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
  Bot
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SubMenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ModuleItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subItems: SubMenuItem[];
}

const modules: ModuleItem[] = [
  {
    name: "Finance",
    icon: DollarSign,
    color: "text-blue-500",
    subItems: [
      { name: "Dashboard", path: "/finance", icon: LayoutDashboard },
      { name: "Analytics", path: "/finance/analytics", icon: TrendingUp },
      { name: "Monthly Reports", path: "/finance/reports", icon: FileText },
      { name: "OTELMS", path: "/finance/otelms", icon: Database },
      { name: "Dev Expenses", path: "/finance/expenses", icon: BarChart3 },
    ]
  },
  {
    name: "Marketing",
    icon: Megaphone,
    color: "text-green-500",
    subItems: [
      { name: "Dashboard", path: "/marketing", icon: LayoutDashboard },
      { name: "OTA Channels", path: "/marketing/ota", icon: Globe },
      { name: "Website Leads", path: "/marketing/leads", icon: Users },
    ]
  },
  {
    name: "Reservations",
    icon: Calendar,
    color: "text-purple-500",
    subItems: [
      { name: "Dashboard", path: "/reservations", icon: LayoutDashboard },
      { name: "AI Responses", path: "/reservations/ai-responses", icon: Sparkles },
      { name: "Butler AI", path: "/reservations/automations", icon: Bot },
      { name: "Email Inbox", path: "/reservations/email", icon: Mail },
      { name: "Guest Communication", path: "/reservations/guests", icon: Users },
      { name: "OTA Dashboard", path: "/reservations/ota", icon: Globe },
    ]
  },
  {
    name: "Logistics",
    icon: Truck,
    color: "text-orange-500",
    subItems: [
      { name: "Dashboard", path: "/logistics", icon: LayoutDashboard },
      { name: "Housekeeping", path: "/logistics/housekeeping", icon: Package },
      { name: "Maintenance", path: "/logistics/maintenance", icon: Wrench },
    ]
  },
  {
    name: "WhatsApp Bot",
    icon: MessageCircle,
    color: "text-pink-500",
    subItems: [
      { name: "Quick Start", path: "/whatsapp/quick-start", icon: Rocket },
      { name: "Implementation", path: "/whatsapp/implementation", icon: Code },
      { name: "Code Examples", path: "/whatsapp/code-examples", icon: FileText },
      { name: "System Prompt", path: "/whatsapp/system-prompt", icon: MessageCircle },
      { name: "Testing", path: "/whatsapp/testing", icon: TestTube },
      { name: "Resources", path: "/whatsapp/resources", icon: BookOpen },
      { name: "Deployment", path: "/whatsapp/deployment", icon: Rocket },
    ]
  }
];

export default function ModularLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(["Finance", "Marketing", "Reservations", "Logistics", "WhatsApp Bot"]);

  // Auto-expand module based on current route
  useEffect(() => {
    const currentModule = modules.find(m => 
      m.subItems.some(item => location.startsWith(item.path))
    );
    if (currentModule && !expandedModules.includes(currentModule.name)) {
      setExpandedModules(prev => [...prev, currentModule.name]);
    }
  }, [location]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(name => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  // Authentication disabled - public access
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-black">
  //       <div className="text-center">
  //         <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
  //         <p className="text-gray-400">Loading ORBI City Hub...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-black px-4">
  //       <div className="max-w-md w-full">
  //         <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
  //           <div className="text-center mb-8">
  //             <img 
  //               src={APP_LOGO} 
  //               alt={APP_TITLE} 
  //               className="h-16 mx-auto mb-4"
  //             />
  //             <h1 className="text-3xl font-bold text-white mb-2">
  //               {APP_TITLE}
  //             </h1>
  //             <p className="text-gray-400">
  //               Enterprise Management Platform
  //             </p>
  //           </div>
  //           
  //           <div className="space-y-4">
  //             <div className="bg-green-950 rounded-lg p-4 border border-green-800">
  //               <h3 className="font-semibold text-green-400 mb-2">4 Core Modules:</h3>
  //               <ul className="text-sm text-green-300 space-y-1">
  //                 <li>• Finance & Analytics</li>
  //                 <li>• Marketing & OTA</li>
  //                 <li>• Reservations & Guests</li>
  //                 <li>• Logistics & Operations</li>
  //               </ul>
  //             </div>
  //             
  //             <Button 
  //               onClick={() => window.location.href = getLoginUrl()}
  //               className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
  //             >
  //               Sign In with Manus
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link href="/">
              <a className="flex items-center gap-3">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />
                <span className="font-bold text-lg hidden sm:inline">{APP_TITLE}</span>
              </a>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden sm:block">
              {user?.name || user?.email}
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto z-40 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <nav className="p-4 space-y-2">
          {/* Home */}
          <Link href="/">
            <a className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location === "/" 
                ? "bg-green-600 text-white" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </a>
          </Link>

          <div className="h-px bg-gray-800 my-4" />

          {/* Modules */}
          {modules.map((module) => {
            const isExpanded = expandedModules.includes(module.name);
            const isActive = module.subItems.some(item => location.startsWith(item.path));
            
            return (
              <div key={module.name} className="space-y-1">
                <button
                  onClick={() => toggleModule(module.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <module.icon className={cn("w-5 h-5", module.color)} />
                    <span className="font-medium">{module.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-4 pl-4 border-l border-gray-800 space-y-1">
                    {module.subItems.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <a className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                          location === item.path
                            ? "bg-gray-800 text-white"
                            : "text-gray-500 hover:bg-gray-800 hover:text-white"
                        )}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
