/**
 * Data Hub - Raw Materials Center
 * Password protected admin access to all Supabase data
 * CEO AI will use this data to distribute across modules
 */

import { useState, useEffect } from "react";
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
  Loader2, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const DATA_PASSWORD = "SHAKOniniamasho1!";

// Table definitions for Supabase
const SUPABASE_TABLES = [
  { name: "rooms", icon: Home, color: "purple", description: "Apartment/room records" },
  { name: "room_inventory_items", icon: Package, color: "blue", description: "Inventory per room" },
  { name: "housekeeping_schedules", icon: ClipboardList, color: "green", description: "Cleaning schedules" },
  { name: "maintenance_schedules", icon: Wrench, color: "amber", description: "Maintenance records" },
  { name: "bookings", icon: Calendar, color: "cyan", description: "Reservation data" },
  { name: "standard_inventory_items", icon: Package, color: "pink", description: "Standard inventory catalog" },
  { name: "logistics_activity_log", icon: BarChart3, color: "orange", description: "Activity tracking" },
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

// Main Data Hub Component
const DataHubContent = () => {
  const { language } = useLanguage();
  const [activeTable, setActiveTable] = useState("rooms");

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ["datahub-stats"],
    queryFn: async () => {
      const results: Record<string, number> = {};
      for (const table of SUPABASE_TABLES) {
        const { count } = await supabase
          .from(table.name as any)
          .select("*", { count: "exact", head: true });
        results[table.name] = count || 0;
      }
      return results;
    },
  });

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
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Supabase Connected
          </Badge>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {SUPABASE_TABLES.map((table) => {
            const Icon = table.icon;
            const colorClasses: Record<string, string> = {
              purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
              blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
              green: "from-green-500/20 to-green-600/20 border-green-500/30",
              amber: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
              cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
              pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
              orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
            };
            return (
              <motion.button
                key={table.name}
                onClick={() => setActiveTable(table.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-xl border bg-gradient-to-br transition-all ${
                  colorClasses[table.color]
                } ${activeTable === table.name ? 'ring-2 ring-cyan-400' : ''}`}
              >
                <Icon className="w-5 h-5 text-white/70 mb-2" />
                <p className="text-xs text-white/60 truncate">{table.name}</p>
                <p className="text-lg font-bold text-white">{stats?.[table.name] ?? '...'}</p>
              </motion.button>
            );
          })}
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

      {/* CEO AI Info */}
      <div className="px-6 pb-6">
        <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {language === 'ka' ? 'CEO AI - მონაცემთა განაწილება' : 'CEO AI - Data Distribution'}
                </h3>
                <p className="text-white/70 text-sm">
                  {language === 'ka'
                    ? 'ეს მონაცემები ავტომატურად განაწილდება მოდულებში CEO AI-ის მიერ. Claude Code-ს აქვს უფლება შექმნას ახალი widgets, charts და analytics ამ მონაცემებზე დაყრდნობით.'
                    : 'This data will be automatically distributed across modules by CEO AI. Claude Code has authority to create new widgets, charts, and analytics based on this data.'}
                </p>
              </div>
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
