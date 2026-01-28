/**
 * OtelMS-Style Finance Dashboard
 * Revenue, ADR, RevPAR, Occupancy with charts
 * Designed to match the OtelMS hotel management system UI
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useOtelmsRevenue,
  useOtelmsSources,
  useOtelmsOccupancy,
  useOtelmsADR,
  useOtelmsRevPAR,
} from "@/hooks/useOrbicityData";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Home,
  BarChart3,
  Loader2,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Colors for charts
const COLORS = {
  revenue: "#22c55e",
  adr: "#3b82f6",
  revpar: "#8b5cf6",
  occupancy: "#f59e0b",
  primary: "#10b981",
  secondary: "#6366f1",
};

// Source colors
const SOURCE_COLORS: Record<string, string> = {
  "Booking.com": "#003580",
  "Booking": "#003580",
  "Airbnb": "#FF5A5F",
  "Expedia": "#FFCC00",
  "Agoda": "#5B9BD5",
  "Direct": "#22c55e",
  "პირდაპირი": "#22c55e",
  "Hostelworld": "#F47920",
  "Ostrovok": "#FF6B35",
  "Other": "#6b7280",
};

const getSourceColor = (source: string): string => {
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (source.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return SOURCE_COLORS.Other;
};

// Format currency
const formatCurrency = (value: number, compact = false): string => {
  if (compact && value >= 1000) {
    return `₾${(value / 1000).toFixed(1)}K`;
  }
  return `₾${Math.round(value).toLocaleString()}`;
};

// Format percentage
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export function OtelmsFinanceDashboard() {
  const { t, language } = useLanguage();

  const { data: revenue = [], isLoading: revenueLoading, refetch: refetchRevenue } = useOtelmsRevenue();
  const { data: sources = [], isLoading: sourcesLoading } = useOtelmsSources();
  const { data: occupancy = [], isLoading: occupancyLoading } = useOtelmsOccupancy();
  const { data: adr = [], isLoading: adrLoading } = useOtelmsADR();
  const { data: revpar = [], isLoading: revparLoading } = useOtelmsRevPAR();

  const isLoading = revenueLoading || sourcesLoading || occupancyLoading || adrLoading || revparLoading;

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = revenue.reduce((sum, r) => sum + (parseFloat(String(r.revenue)) || 0), 0);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthRevenue = revenue
      .filter(r => r.period?.includes(currentMonth) || r.extracted_at?.startsWith(currentMonth))
      .reduce((sum, r) => sum + (parseFloat(String(r.revenue)) || 0), 0);

    const latestOccupancy = occupancy.length > 0
      ? parseFloat(String(occupancy[0]?.occupancy_rate)) || 0
      : 0;
    const avgOccupancy = occupancy.length > 0
      ? occupancy.reduce((sum, o) => sum + (parseFloat(String(o.occupancy_rate)) || 0), 0) / occupancy.length
      : 0;

    const latestADR = adr.length > 0 ? parseFloat(String(adr[0]?.adr)) || 0 : 0;
    const latestRevPAR = revpar.length > 0 ? parseFloat(String(revpar[0]?.revpar)) || 0 : 0;

    return {
      totalRevenue,
      monthRevenue,
      latestOccupancy,
      avgOccupancy,
      latestADR,
      latestRevPAR,
      revenueChange: 12.5, // TODO: Calculate from data
      occupancyChange: 5.2,
      adrChange: adr[0]?.change_percentage || 0,
      revparChange: revpar[0]?.change_percentage || 0,
    };
  }, [revenue, occupancy, adr, revpar]);

  // Prepare chart data
  const occupancyChartData = useMemo(() => {
    return occupancy
      .slice(0, 30)
      .reverse()
      .map((o) => ({
        date: new Date(o.date).toLocaleDateString(language === "ka" ? "ka-GE" : "en-US", {
          month: "short",
          day: "numeric",
        }),
        occupancy: parseFloat(String(o.occupancy_rate)) || 0,
        rooms: o.rooms_occupied || 0,
      }));
  }, [occupancy, language]);

  const revenueChartData = useMemo(() => {
    // Group revenue by category
    const categoryTotals: Record<string, number> = {};
    revenue.forEach((r) => {
      const category = r.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + (parseFloat(String(r.revenue)) || 0);
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [revenue]);

  const sourcesChartData = useMemo(() => {
    return sources
      .slice(0, 8)
      .map((s) => ({
        name: s.source || "Unknown",
        revenue: parseFloat(String(s.revenue)) || 0,
        percentage: parseFloat(String(s.percentage)) || 0,
        bookings: s.booking_count || 0,
        color: getSourceColor(s.source || ""),
      }));
  }, [sources]);

  const adrRevparChartData = useMemo(() => {
    // Combine ADR and RevPAR data by date
    const dataMap = new Map<string, { date: string; adr: number; revpar: number }>();

    adr.slice(0, 14).forEach((a) => {
      const date = a.period || a.date || "";
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, adr: 0, revpar: 0 });
      }
      dataMap.get(date)!.adr = parseFloat(String(a.adr)) || 0;
    });

    revpar.slice(0, 14).forEach((r) => {
      const date = r.period || r.date || "";
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, adr: 0, revpar: 0 });
      }
      dataMap.get(date)!.revpar = parseFloat(String(r.revpar)) || 0;
    });

    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        date: d.date.slice(-5), // Show only MM-DD
      }));
  }, [adr, revpar]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <span className="ml-3 text-lg text-white/70">
          {t("ფინანსური მონაცემების ჩატვირთვა...", "Loading finance data...")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t("ფინანსური დეშბორდი", "Finance Dashboard")}
          </h2>
          <p className="text-slate-400 text-sm">
            {t("OtelMS მონაცემები - რეალურ დროში", "OtelMS data - Real-time")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchRevenue()}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          {t("განახლება", "Refresh")}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{t("თვის შემოსავალი", "Month Revenue")}</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {formatCurrency(kpis.monthRevenue, true)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {kpis.revenueChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">+{kpis.revenueChange}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{kpis.revenueChange}%</span>
                  </>
                )}
                <span className="text-slate-500 ml-1">{t("წინა თვესთან", "vs last month")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{t("დატვირთვა", "Occupancy")}</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {formatPercent(kpis.latestOccupancy)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Percent className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span className="text-slate-500">{t("საშუალო:", "Avg:")} </span>
                <span className="text-amber-400">{formatPercent(kpis.avgOccupancy)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ADR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">ADR</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {formatCurrency(kpis.latestADR)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {kpis.adrChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">+{kpis.adrChange}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{kpis.adrChange}%</span>
                  </>
                )}
                <span className="text-slate-500 ml-1">YoY</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* RevPAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/10 border-purple-500/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">RevPAR</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">
                    {formatCurrency(kpis.latestRevPAR)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {kpis.revparChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">+{kpis.revparChange}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{kpis.revparChange}%</span>
                  </>
                )}
                <span className="text-slate-500 ml-1">YoY</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Occupancy Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-amber-400" />
                {t("დატვირთვის ტრენდი", "Occupancy Trend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {occupancyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={occupancyChartData}>
                    <defs>
                      <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.occupancy} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.occupancy} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="occupancy"
                      stroke={COLORS.occupancy}
                      strokeWidth={2}
                      fill="url(#occupancyGradient)"
                      name={language === "ka" ? "დატვირთვა %" : "Occupancy %"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  {t("მონაცემები არ არის", "No data available")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ADR vs RevPAR */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                ADR vs RevPAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adrRevparChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={adrRevparChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="adr"
                      stroke={COLORS.adr}
                      strokeWidth={2}
                      dot={{ fill: COLORS.adr, r: 4 }}
                      name="ADR"
                    />
                    <Line
                      type="monotone"
                      dataKey="revpar"
                      stroke={COLORS.revpar}
                      strokeWidth={2}
                      dot={{ fill: COLORS.revpar, r: 4 }}
                      name="RevPAR"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  {t("მონაცემები არ არის", "No data available")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                {t("შემოსავალი კატეგორიებით", "Revenue by Category")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill={COLORS.revenue} radius={[0, 4, 4, 0]} name={language === "ka" ? "შემოსავალი" : "Revenue"} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  {t("მონაცემები არ არის", "No data available")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sources Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-cyan-400" />
                {t("წყაროების განაწილება", "Sources Distribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sourcesChartData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={sourcesChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="revenue"
                      >
                        {sourcesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {sourcesChartData.slice(0, 5).map((source, idx) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="text-sm text-white truncate max-w-[100px]">
                            {source.name}
                          </span>
                        </div>
                        <span className="text-sm text-slate-400">
                          {formatCurrency(source.revenue, true)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  {t("მონაცემები არ არის", "No data available")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Data Source Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Supabase + OtelMS Scraper
        </Badge>
        <span>{t("მონაცემები განახლდება ყოველდღე ავტომატურად", "Data updates daily automatically")}</span>
      </div>
    </div>
  );
}

export default OtelmsFinanceDashboard;
