import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  Megaphone, 
  Truck,
  FileText,
  LogOut,
  Loader2,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "CEO Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Reservations", path: "/reservations", icon: Calendar },
  { name: "Finance", path: "/finance", icon: DollarSign },
  { name: "Marketing", path: "/marketing", icon: Megaphone },
  { name: "Logistics", path: "/logistics", icon: Truck },
  { name: "Reports & Analytics", path: "/reports", icon: FileText },
];

export default function OrbiDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading ORBI City Hub...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-slate-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <img 
                src={APP_LOGO} 
                alt={APP_TITLE} 
                className="h-16 mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {APP_TITLE}
              </h1>
              <p className="text-slate-600">
                AI-Powered Aparthotel Management
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="font-semibold text-green-900 mb-2">Features:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Real-time KPIs & Analytics</li>
                  <li>• Gmail Integration</li>
                  <li>• AI-Powered Insights</li>
                  <li>• 15 Distribution Channels</li>
                  <li>• Inventory Management</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Sign In to Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <img 
            src={APP_LOGO} 
            alt={APP_TITLE} 
            className="h-12 mb-2"
          />
          <h2 className="text-lg font-bold text-slate-900">{APP_TITLE}</h2>
          <p className="text-xs text-slate-500">Powered by Manus AI</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 pb-2">
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            {theme === 'dark' ? (
              <><Sun className="w-4 h-4 mr-2" /> Light Mode</>
            ) : (
              <><Moon className="w-4 h-4 mr-2" /> Dark Mode</>
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <Button
            onClick={() => logout()}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
