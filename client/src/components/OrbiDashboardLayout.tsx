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
  FolderOpen,
  LogOut,
  Loader2,
  Moon,
  Sun,
  Chrome,
  Share2,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  { name: "Files", path: "/files", icon: FolderOpen },
  { name: "Google", path: "/google", icon: Chrome },
  { name: "Social Media", path: "/social-media", icon: Share2 },
];

export default function OrbiDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-slate-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <div className="text-center mb-8">
              <img 
                src={APP_LOGO} 
                alt={APP_TITLE} 
                className="h-12 sm:h-16 mx-auto mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {APP_TITLE}
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
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
                className="w-full bg-primary hover:bg-primary/90 touch-target"
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
    <div className="min-h-screen">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-header flex items-center justify-between px-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="touch-target"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <h1 className="text-lg font-bold text-slate-900">{APP_TITLE}</h1>
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="sm"
          className="touch-target"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with Glassmorphism */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 glass-sidebar flex flex-col z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Header Spacer */}
        <div className="lg:hidden h-16" />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-target",
                  isActive
                    ? "ocean-gradient-blue text-white font-medium shadow-lg"
                    : "text-slate-700 hover:bg-white/20"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle (Desktop only - mobile has it in header) */}
        <div className="hidden lg:block px-4 pb-2">
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="w-full justify-start touch-target"
          >
            {theme === 'dark' ? (
              <><Sun className="w-4 h-4 mr-2" /> Light Mode</>
            ) : (
              <><Moon className="w-4 h-4 mr-2" /> Dark Mode</>
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold flex-shrink-0">
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
            className="w-full touch-target"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
