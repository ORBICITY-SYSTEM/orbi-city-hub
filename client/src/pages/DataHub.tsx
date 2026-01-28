/**
 * Data Hub - Raw Materials Center
 * Password protected admin access to all Supabase data
 * CEO AI will use this data to distribute across modules
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database, Lock, Unlock, Table2, RefreshCw, Download,
  Home, Users, Calendar, DollarSign, Package, Wrench,
  ClipboardList, BarChart3, Eye, AlertCircle, CheckCircle2,
  Loader2, ArrowLeft, Brain, Sparkles, ChevronLeft, ChevronRight,
  TrendingUp, Zap, Activity, Globe, Building2
} from "lucide-react";
import { AISQLCopilot } from "@/components/ai/AISQLCopilot";
import { Link } from "wouter";
import { toast } from "sonner";

const DATA_PASSWORD = "SHAKOniniamasho1!";

// Table definitions for Supabase - ALL TABLES
const SUPABASE_TABLES = [
  // === LOGISTICS / ROOMS ===
  { name: "rooms", icon: Home, color: "purple", category: "logistics", description: "Apartment/room records" },
  { name: "room_inventory_items", icon: Package, color: "blue", category: "logistics", description: "Inventory per room" },
  { name: "standard_inventory_items", icon: Package, color: "pink", category: "logistics", description: "Standard inventory catalog" },
  { name: "room_inventory_descriptions", icon: Package, color: "indigo", category: "logistics", description: "Inventory change history" },
  { name: "housekeeping_schedules", icon: ClipboardList, color: "green", category: "logistics", description: "Cleaning schedules" },
  { name: "maintenance_schedules", icon: Wrench, color: "amber", category: "logistics", description: "Maintenance records" },
  { name: "logistics_activity_log", icon: BarChart3, color: "orange", category: "logistics", description: "Activity tracking" },

  // === FINANCE ===
  { name: "finance_records", icon: DollarSign, color: "cyan", category: "finance", description: "Financial records" },
  { name: "monthly_reports", icon: DollarSign, color: "emerald", category: "finance", description: "Monthly reports" },
  { name: "expense_records", icon: DollarSign, color: "red", category: "finance", description: "Expense records" },
  { name: "monthly_summaries", icon: DollarSign, color: "teal", category: "finance", description: "Monthly summaries" },
  { name: "report_field_definitions", icon: DollarSign, color: "lime", category: "finance", description: "Custom report fields" },
  { name: "finance_activity_log", icon: BarChart3, color: "sky", category: "finance", description: "Finance activity" },
  { name: "file_uploads", icon: DollarSign, color: "violet", category: "finance", description: "Uploaded files" },
  { name: "monthly_module_uploads", icon: DollarSign, color: "fuchsia", category: "finance", description: "Module uploads" },
  { name: "monthly_analysis_uploads", icon: DollarSign, color: "rose", category: "finance", description: "Analysis uploads" },
  { name: "excel_analysis_results", icon: DollarSign, color: "slate", category: "finance", description: "Excel analysis" },

  // === RESERVATIONS / BOOKINGS ===
  { name: "bookings", icon: Calendar, color: "cyan", category: "reservations", description: "Reservation data" },
  { name: "guest_reviews", icon: Users, color: "yellow", category: "reservations", description: "Guest reviews" },
  { name: "ota_reservations", icon: Calendar, color: "emerald", category: "reservations", description: "OTA channel bookings" },
  { name: "ota_reviews", icon: Users, color: "orange", category: "reservations", description: "OTA platform reviews" },

  // === OTELMS DATA ===
  { name: "otelms_revenue", icon: DollarSign, color: "green", category: "finance", description: "OtelMS revenue data" },
  { name: "otelms_sources", icon: BarChart3, color: "blue", category: "finance", description: "OtelMS booking sources" },
  { name: "otelms_occupancy", icon: BarChart3, color: "purple", category: "finance", description: "OtelMS occupancy rates" },
  { name: "otelms_adr", icon: DollarSign, color: "cyan", category: "finance", description: "Average Daily Rate" },
  { name: "otelms_revpar", icon: DollarSign, color: "amber", category: "finance", description: "Revenue Per Available Room" },
  { name: "otelms_change_history", icon: BarChart3, color: "slate", category: "finance", description: "OtelMS change tracking" },

  // === SOCIAL MEDIA / MARKETING ===
  { name: "social_media_metrics", icon: BarChart3, color: "pink", category: "marketing", description: "Social media metrics" },
  { name: "distribution_channels", icon: Globe, color: "blue", category: "marketing", description: "OTA & distribution channels" },

  // === AI / SYSTEM ===
  { name: "ai_director_conversations", icon: BarChart3, color: "purple", category: "ai", description: "AI chat history" },
  { name: "ai_director_tasks", icon: BarChart3, color: "indigo", category: "ai", description: "AI task management" },

  // === API / INTEGRATIONS ===
  { name: "api_integrations", icon: BarChart3, color: "blue", category: "system", description: "API integrations" },
  { name: "api_keys", icon: BarChart3, color: "gray", category: "system", description: "API keys" },
  { name: "api_request_logs", icon: BarChart3, color: "zinc", category: "system", description: "API request logs" },
  { name: "webhooks", icon: BarChart3, color: "neutral", category: "system", description: "Webhooks" },
  { name: "webhook_deliveries", icon: BarChart3, color: "stone", category: "system", description: "Webhook deliveries" },
  { name: "google_tokens", icon: BarChart3, color: "red", category: "system", description: "Google OAuth tokens" },
  { name: "module_customizations", icon: BarChart3, color: "orange", category: "system", description: "Module customizations" },
  { name: "user_roles", icon: Users, color: "amber", category: "system", description: "User roles" },
];

// Password gate component
const PasswordGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DATA_PASSWORD) {
      localStorage.setItem("datahub_unlocked", "true");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              {language === 'ka' ? 'Data Hub' : 'Data Hub'}
            </CardTitle>
            <p className="text-white/60 mt-2">
              {language === 'ka'
                ? 'შეიყვანეთ ადმინისტრატორის პაროლი'
                : 'Enter administrator password'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'ka' ? 'პაროლი...' : 'Password...'}
                  className={`bg-slate-700/50 border-slate-600 text-white text-center text-lg tracking-widest ${
                    error ? 'border-red-500 animate-shake' : ''
                  }`}
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm text-center mt-2">
                    {language === 'ka' ? 'არასწორი პაროლი' : 'Incorrect password'}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
              >
                <Unlock className="w-4 h-4 mr-2" />
                {language === 'ka' ? 'შესვლა' : 'Unlock'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ka' ? 'მთავარზე დაბრუნება' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// Table viewer component
const TableViewer = ({ tableName, icon: Icon, color }: { tableName: string; icon: any; color: string }) => {
  const { language } = useLanguage();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["datahub", tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .limit(100)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const colorClasses: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    green: "text-green-400 bg-green-500/20",
    amber: "text-amber-400 bg-amber-500/20",
    cyan: "text-cyan-400 bg-cyan-500/20",
    pink: "text-pink-400 bg-pink-500/20",
    orange: "text-orange-400 bg-orange-500/20",
    indigo: "text-indigo-400 bg-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/20",
    red: "text-red-400 bg-red-500/20",
    teal: "text-teal-400 bg-teal-500/20",
    lime: "text-lime-400 bg-lime-500/20",
    sky: "text-sky-400 bg-sky-500/20",
    violet: "text-violet-400 bg-violet-500/20",
    fuchsia: "text-fuchsia-400 bg-fuchsia-500/20",
    rose: "text-rose-400 bg-rose-500/20",
    slate: "text-slate-400 bg-slate-500/20",
    yellow: "text-yellow-400 bg-yellow-500/20",
    gray: "text-gray-400 bg-gray-500/20",
    zinc: "text-zinc-400 bg-zinc-500/20",
    neutral: "text-neutral-400 bg-neutral-500/20",
    stone: "text-stone-400 bg-stone-500/20",
  };

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success(language === 'ka' ? 'ფაილი ჩამოიტვირთა' : 'File downloaded');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-400">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{language === 'ka' ? 'შეცდომა მონაცემების ჩატვირთვისას' : 'Error loading data'}</p>
        <Button variant="ghost" onClick={() => refetch()} className="mt-2">
          <RefreshCw className="w-4 h-4 mr-2" />
          {language === 'ka' ? 'თავიდან ცდა' : 'Retry'}
        </Button>
      </div>
    );
  }

  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{tableName}</h3>
            <p className="text-sm text-white/60">{data?.length || 0} records</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadJSON}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {data && data.length > 0 ? (
        <ScrollArea className="h-[500px] rounded-lg border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/80 sticky top-0">
                <tr>
                  {columns.slice(0, 8).map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-white/70 font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  {columns.length > 8 && (
                    <th className="px-4 py-3 text-left text-white/40 font-medium">
                      +{columns.length - 8} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    {columns.slice(0, 8).map((col) => (
                      <td key={col} className="px-4 py-3 text-white/80 whitespace-nowrap max-w-[200px] truncate">
                        {typeof row[col] === 'object'
                          ? JSON.stringify(row[col]).slice(0, 50) + '...'
                          : String(row[col] ?? '-').slice(0, 50)}
                      </td>
                    ))}
                    {columns.length > 8 && (
                      <td className="px-4 py-3 text-white/40">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12 text-white/40">
          {language === 'ka' ? 'მონაცემები არ არის' : 'No data'}
        </div>
      )}
    </div>
  );
};

// Category definitions
const CATEGORIES = [
  { id: "all", name: "All", nameKa: "ყველა", color: "white" },
  { id: "logistics", name: "Logistics", nameKa: "ლოჯისტიკა", color: "purple" },
  { id: "finance", name: "Finance", nameKa: "ფინანსები", color: "cyan" },
  { id: "reservations", name: "Reservations", nameKa: "რეზერვაციები", color: "green" },
  { id: "marketing", name: "Marketing", nameKa: "მარკეტინგი", color: "pink" },
  { id: "ai", name: "AI", nameKa: "AI", color: "indigo" },
  { id: "system", name: "System", nameKa: "სისტემა", color: "orange" },
];

// Main Data Hub Component
const DataHubContent = () => {
  const { language } = useLanguage();
  const [activeTable, setActiveTable] = useState("rooms");
  const [activeCategory, setActiveCategory] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Filter tables by category
  const filteredTables = activeCategory === "all"
    ? SUPABASE_TABLES
    : SUPABASE_TABLES.filter(t => t.category === activeCategory);

  // Stats query - PARALLEL LOADING for speed
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["datahub-stats"],
    queryFn: async () => {
      // Run all count queries in parallel for speed
      const countPromises = SUPABASE_TABLES.map(async (table) => {
        try {
          const { count, error } = await supabase
            .from(table.name as any)
            .select("*", { count: "exact", head: true });
          if (error) {
            console.warn(`Error counting ${table.name}:`, error);
            return { name: table.name, count: 0 };
          }
          return { name: table.name, count: count || 0 };
        } catch (e) {
          console.warn(`Exception counting ${table.name}:`, e);
          return { name: table.name, count: 0 };
        }
      });

      const results = await Promise.all(countPromises);
      return results.reduce((acc, { name, count }) => {
        acc[name] = count;
        return acc;
      }, {} as Record<string, number>);
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate total records
  const totalRecords = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Data Hub</h1>
                <p className="text-sm text-white/60">
                  {language === 'ka' ? 'ნედლი მასალები' : 'Raw Materials'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Supabase Connected
            </Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              <Database className="w-3 h-3 mr-1" />
              {SUPABASE_TABLES.length} {language === 'ka' ? 'ტაბულა' : 'Tables'}
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              {statsLoading ? '...' : totalRecords.toLocaleString()} {language === 'ka' ? 'ჩანაწერი' : 'Records'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveCategory(cat.id);
                if (cat.id !== "all" && !filteredTables.some(t => t.name === activeTable)) {
                  const firstInCategory = SUPABASE_TABLES.find(t => t.category === cat.id);
                  if (firstInCategory) setActiveTable(firstInCategory.name);
                }
              }}
              className={activeCategory === cat.id
                ? "bg-gradient-to-r from-cyan-600 to-purple-600"
                : "border-white/20 text-white/70 hover:text-white"
              }
            >
              {language === 'ka' ? cat.nameKa : cat.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {cat.id === "all"
                  ? SUPABASE_TABLES.length
                  : SUPABASE_TABLES.filter(t => t.category === cat.id).length
                }
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview with Navigation Buttons */}
      <div className="px-6 py-4">
        <div className="relative">
          {/* Left Navigation Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 shadow-lg rounded-full h-10 w-10"
          >
            <ChevronLeft className="w-6 h-6 text-cyan-400" />
          </Button>

          {/* Right Navigation Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 shadow-lg rounded-full h-10 w-10"
          >
            <ChevronRight className="w-6 h-6 text-cyan-400" />
          </Button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide px-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredTables.map((table) => {
              const Icon = table.icon;
              const colorGradients: Record<string, string> = {
                purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
                blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
                green: "from-green-500/20 to-green-600/20 border-green-500/30",
                amber: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
                cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
                pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
                orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
                indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30",
                emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
                red: "from-red-500/20 to-red-600/20 border-red-500/30",
                teal: "from-teal-500/20 to-teal-600/20 border-teal-500/30",
                lime: "from-lime-500/20 to-lime-600/20 border-lime-500/30",
                sky: "from-sky-500/20 to-sky-600/20 border-sky-500/30",
                violet: "from-violet-500/20 to-violet-600/20 border-violet-500/30",
                fuchsia: "from-fuchsia-500/20 to-fuchsia-600/20 border-fuchsia-500/30",
                rose: "from-rose-500/20 to-rose-600/20 border-rose-500/30",
                slate: "from-slate-500/20 to-slate-600/20 border-slate-500/30",
                yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
                gray: "from-gray-500/20 to-gray-600/20 border-gray-500/30",
                zinc: "from-zinc-500/20 to-zinc-600/20 border-zinc-500/30",
                neutral: "from-neutral-500/20 to-neutral-600/20 border-neutral-500/30",
                stone: "from-stone-500/20 to-stone-600/20 border-stone-500/30",
              };
              const recordCount = stats?.[table.name] ?? 0;
              const hasData = recordCount > 0;
              return (
                <motion.button
                  key={table.name}
                  onClick={() => setActiveTable(table.name)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-shrink-0 p-4 rounded-xl border bg-gradient-to-br transition-all min-w-[140px] ${
                    colorGradients[table.color] || colorGradients.purple
                  } ${activeTable === table.name ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-white/70" />
                    {hasData && (
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-white/60 truncate text-left">{table.name}</p>
                  <p className="text-xl font-bold text-white text-left">
                    {statsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                    ) : (
                      recordCount.toLocaleString()
                    )}
                  </p>
                  <p className="text-[10px] text-white/40 text-left mt-1">{table.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="px-6 pb-6">
        <Card className="bg-slate-800/30 border-white/10">
          <CardContent className="p-6">
            {SUPABASE_TABLES.map((table) => (
              <div key={table.name} className={activeTable === table.name ? '' : 'hidden'}>
                <TableViewer
                  tableName={table.name}
                  icon={table.icon}
                  color={table.color}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI SQL Copilot */}
      <div className="px-6 pb-6">
        <AISQLCopilot />
      </div>

      {/* CEO AI Data Command Center - INTELLIGENT DISTRIBUTION HUB */}
      <div className="px-6 pb-6">
        <Card className="bg-gradient-to-r from-cyan-900/30 via-purple-900/20 to-pink-900/30 border-cyan-500/30 overflow-hidden">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  🤖 CEO AI - {language === 'ka' ? 'მონაცემთა სარდლობა' : 'Data Command Center'}
                  <Badge className="bg-green-500/30 text-green-300 border-green-500/50 text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                </h3>
                <p className="text-white/60 text-sm">
                  {language === 'ka'
                    ? 'ჭკვიანი მონაცემთა განაწილება - ვხედავ ყველაფერს, ვანაწილებ სწორ მოდულებში'
                    : 'Intelligent data distribution - I see everything, I distribute to right modules'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStats()}
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </div>

            {/* Data Flow Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Source: Supabase */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">
                    {language === 'ka' ? 'წყარო: Supabase' : 'Source: Supabase'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{language === 'ka' ? 'ტაბულები' : 'Tables'}</span>
                    <span className="text-green-400 font-bold">{SUPABASE_TABLES.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{language === 'ka' ? 'ჩანაწერები' : 'Records'}</span>
                    <span className="text-green-400 font-bold">{totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{language === 'ka' ? 'სტატუსი' : 'Status'}</span>
                    <span className="text-green-400">● Connected</span>
                  </div>
                </div>
              </div>

              {/* Processing: CEO AI */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-purple-500/30 relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-purple-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">CEO AI Brain</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    {language === 'ka' ? 'ანალიზი & კატეგორიზაცია' : 'Analyze & Categorize'}
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <TrendingUp className="w-3 h-3 text-cyan-400" />
                    {language === 'ka' ? 'ტრენდების აღმოჩენა' : 'Detect Trends'}
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    {language === 'ka' ? 'ჭკვიანი განაწილება' : 'Smart Distribution'}
                  </div>
                </div>
              </div>

              {/* Destination: Modules */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-cyan-500/30 relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-white">
                    {language === 'ka' ? 'მოდულები' : 'Modules'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-purple-500/20 text-purple-300">Logistics</div>
                  <div className="p-2 rounded bg-cyan-500/20 text-cyan-300">Finance</div>
                  <div className="p-2 rounded bg-green-500/20 text-green-300">Reservations</div>
                  <div className="p-2 rounded bg-pink-500/20 text-pink-300">Marketing</div>
                </div>
              </div>
            </div>

            {/* Data Distribution Matrix */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white/80 mb-3">
                {language === 'ka' ? '📊 მონაცემთა განაწილების მატრიცა' : '📊 Data Distribution Matrix'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Logistics Distribution */}
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Logistics</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {((stats?.['rooms'] || 0) + (stats?.['housekeeping_schedules'] || 0) + (stats?.['maintenance_schedules'] || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/50">rooms, schedules, inventory</p>
                </div>

                {/* Finance Distribution */}
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Finance</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {((stats?.['otelms_revenue'] || 0) + (stats?.['otelms_adr'] || 0) + (stats?.['otelms_revpar'] || 0) + (stats?.['finance_records'] || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/50">revenue, ADR, RevPAR</p>
                </div>

                {/* Reservations Distribution */}
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Reservations</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {((stats?.['bookings'] || 0) + (stats?.['ota_reservations'] || 0) + (stats?.['guest_reviews'] || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/50">bookings, reviews, guests</p>
                </div>

                {/* Marketing Distribution */}
                <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-white">Marketing</span>
                  </div>
                  <p className="text-2xl font-bold text-pink-400">
                    {((stats?.['social_media_metrics'] || 0) + (stats?.['distribution_channels'] || 0) + (stats?.['ota_reviews'] || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/50">social, channels, reviews</p>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {language === 'ka' ? 'სინქრონიზებულია' : 'Synced'}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Brain className="w-3 h-3 mr-1" />
                {language === 'ka' ? 'AI აქტიურია' : 'AI Active'}
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Eye className="w-3 h-3 mr-1" />
                {language === 'ka' ? 'რეალ-ტაიმ' : 'Real-time'}
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Zap className="w-3 h-3 mr-1" />
                {language === 'ka' ? 'ავტო-განაწილება' : 'Auto-distribute'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main export with password gate
export default function DataHub() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Check if already unlocked in this session
    const unlocked = localStorage.getItem("datahub_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return <DataHubContent />;
}
