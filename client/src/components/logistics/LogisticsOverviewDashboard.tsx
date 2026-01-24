/**
 * Logistics Overview Dashboard - Professional KPI Dashboard
 * Modern design matching Finance and Marketing style
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Package, CheckCircle, AlertTriangle, Wrench, ClipboardList,
  RefreshCw, Building2, Calendar, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Banknote, Users, Activity,
  ChevronRight, Sparkles, Brain, History
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ['#22d3ee', '#10b981', '#a855f7', '#f59e0b', '#ef4444'];

export function LogisticsOverviewDashboard() {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Real-time subscriptions
  useEffect(() => {
    const roomsChannel = supabase
      .channel('logistics-overview-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        queryClient.invalidateQueries({ queryKey: ["logistics-rooms"] });
      })
      .subscribe();

    const hkChannel = supabase
      .channel('logistics-overview-hk')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'housekeeping_schedules' }, () => {
        queryClient.invalidateQueries({ queryKey: ["logistics-housekeeping"] });
      })
      .subscribe();

    const mtChannel = supabase
      .channel('logistics-overview-mt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_schedules' }, () => {
        queryClient.invalidateQueries({ queryKey: ["logistics-maintenance"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(hkChannel);
      supabase.removeChannel(mtChannel);
    };
  }, [queryClient]);

  // Fetch data
  const { data: rooms = [], isLoading: loadingRooms, refetch: refetchRooms } = useQuery({
    queryKey: ["logistics-rooms"],
    queryFn: async () => {
      const { data } = await supabase.from("rooms").select("*");
      return data || [];
    },
  });

  const { data: housekeeping = [], isLoading: loadingHK, refetch: refetchHK } = useQuery({
    queryKey: ["logistics-housekeeping"],
    queryFn: async () => {
      const { data } = await supabase.from("housekeeping_schedules").select("*");
      return data || [];
    },
  });

  const { data: maintenance = [], isLoading: loadingMT, refetch: refetchMT } = useQuery({
    queryKey: ["logistics-maintenance"],
    queryFn: async () => {
      const { data } = await supabase.from("maintenance_schedules").select("*");
      return data || [];
    },
  });

  const { data: standardItems = [] } = useQuery({
    queryKey: ["logistics-standard-items"],
    queryFn: async () => {
      const { data } = await supabase.from("standard_inventory_items").select("*");
      return data || [];
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRooms(), refetchHK(), refetchMT()]);
    setRefreshing(false);
  };

  const isLoading = loadingRooms || loadingHK || loadingMT;

  // Calculate stats
  const totalRooms = rooms.length;
  const totalHK = housekeeping.length;
  const completedHK = housekeeping.filter((h: any) => h.status === 'completed').length;
  const pendingHK = totalHK - completedHK;
  const totalMT = maintenance.length;
  const completedMT = maintenance.filter((m: any) => m.status === 'completed').length;
  const pendingMT = totalMT - completedMT;
  const totalCost = maintenance.reduce((sum: number, m: any) => sum + (Number(m.cost) || 0), 0);

  // Buildings breakdown
  const buildingStats = rooms.reduce((acc: Record<string, number>, room: any) => {
    acc[room.building] = (acc[room.building] || 0) + 1;
    return acc;
  }, {});

  const buildingChartData = Object.entries(buildingStats).map(([building, count], index) => ({
    name: `${language === 'ka' ? 'კორპუსი' : 'Building'} ${building}`,
    value: count as number,
    color: COLORS[index % COLORS.length],
  }));

  // Weekly housekeeping trend (mock data for visualization)
  const weeklyTrend = [
    { day: language === 'ka' ? 'ორშ' : 'Mon', tasks: 8, completed: 7 },
    { day: language === 'ka' ? 'სამ' : 'Tue', tasks: 6, completed: 6 },
    { day: language === 'ka' ? 'ოთხ' : 'Wed', tasks: 10, completed: 8 },
    { day: language === 'ka' ? 'ხუთ' : 'Thu', tasks: 7, completed: 7 },
    { day: language === 'ka' ? 'პარ' : 'Fri', tasks: 12, completed: 10 },
    { day: language === 'ka' ? 'შაბ' : 'Sat', tasks: 15, completed: 12 },
    { day: language === 'ka' ? 'კვი' : 'Sun', tasks: 14, completed: 11 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {language === 'ka' ? 'ლოჯისტიკის მიმოხილვა' : 'Logistics Overview'}
          </h2>
          <p className="text-white/60">
            {language === 'ka' ? 'ოპერაციული სტატუსი რეალურ დროში' : 'Real-time operational status'}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {language === 'ka' ? 'განახლება' : 'Refresh'}
        </Button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300/80">
                  {language === 'ka' ? 'სულ ოთახები' : 'Total Rooms'}
                </p>
                <p className="text-3xl font-bold text-purple-400">{totalRooms}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="h-4 w-4 text-purple-400/60" />
                  <span className="text-xs text-white/50">
                    {Object.keys(buildingStats).length} {language === 'ka' ? 'კორპუსი' : 'buildings'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Package className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Housekeeping */}
        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300/80">
                  {language === 'ka' ? 'დასუფთავება' : 'Housekeeping'}
                </p>
                <p className="text-3xl font-bold text-cyan-400">{completedHK}/{totalHK}</p>
                <div className="flex items-center gap-1 mt-1">
                  {pendingHK > 0 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400">{pendingHK} {language === 'ka' ? 'მიმდინარე' : 'pending'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-green-400">{language === 'ka' ? 'ყველა დასრულებული' : 'All complete'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <ClipboardList className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300/80">
                  {language === 'ka' ? 'ტექნიკური' : 'Maintenance'}
                </p>
                <p className="text-3xl font-bold text-orange-400">{completedMT}/{totalMT}</p>
                <div className="flex items-center gap-1 mt-1">
                  {pendingMT > 0 ? (
                    <>
                      <Wrench className="h-4 w-4 text-orange-400/60" />
                      <span className="text-xs text-orange-400">{pendingMT} {language === 'ka' ? 'აქტიური' : 'active'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-green-400">{language === 'ka' ? 'ყველა გასწორებული' : 'All fixed'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Wrench className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300/80">
                  {language === 'ka' ? 'სულ ხარჯი' : 'Total Cost'}
                </p>
                <p className="text-3xl font-bold text-green-400">
                  ₾{totalCost.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">-8% {language === 'ka' ? 'წინა თვესთან' : 'vs last'}</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Banknote className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Package className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">
                  {language === 'ka' ? 'ინვენტარის ნივთები' : 'Inventory Items'}
                </p>
                <p className="text-lg font-bold text-white">{standardItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">
                  {language === 'ka' ? 'მთავარი დამლაგებელი' : 'Main Cleaner'}
                </p>
                <p className="text-lg font-bold text-white">ნანა</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">
                  {language === 'ka' ? 'დასრულების %' : 'Completion Rate'}
                </p>
                <p className="text-lg font-bold text-white">
                  {totalHK > 0 ? Math.round((completedHK / totalHK) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">
                  {language === 'ka' ? 'საშ. ხარჯი' : 'Avg Cost'}
                </p>
                <p className="text-lg font-bold text-white">
                  ₾{totalMT > 0 ? Math.round(totalCost / totalMT) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buildings Distribution */}
        <Card className="bg-slate-800/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-400" />
              {language === 'ka' ? 'ოთახები კორპუსების მიხედვით' : 'Rooms by Building'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={buildingChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {buildingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Housekeeping Trend */}
        <Card className="bg-slate-800/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-400" />
              {language === 'ka' ? 'კვირის დასუფთავების ტრენდი' : 'Weekly Housekeeping Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="tasks" name={language === 'ka' ? 'დაგეგმილი' : 'Planned'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name={language === 'ka' ? 'შესრულებული' : 'Completed'} fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'inventory', title: language === 'ka' ? 'ინვენტარი' : 'Inventory', icon: Package, color: 'purple', tab: 'inventory' },
          { id: 'housekeeping', title: language === 'ka' ? 'დასუფთავება' : 'Housekeeping', icon: ClipboardList, color: 'cyan', tab: 'housekeeping' },
          { id: 'maintenance', title: language === 'ka' ? 'ტექნიკური' : 'Maintenance', icon: Wrench, color: 'orange', tab: 'maintenance' },
          { id: 'activity', title: language === 'ka' ? 'ისტორია' : 'Activity', icon: History, color: 'green', tab: 'activity' },
        ].map((module) => {
          const Icon = module.icon;
          const colorClasses: Record<string, string> = {
            purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50 text-purple-400',
            cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400',
            orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50 text-orange-400',
            green: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50 text-green-400',
          };
          return (
            <Card
              key={module.id}
              className={`bg-gradient-to-br ${colorClasses[module.color]} cursor-pointer transition-all hover:scale-[1.02]`}
              onClick={() => {
                const tabButtons = document.querySelectorAll('[role="tab"]');
                tabButtons.forEach((btn) => {
                  if (btn.textContent?.toLowerCase().includes(module.id)) {
                    (btn as HTMLElement).click();
                  }
                });
              }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{module.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insight */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-orange-500/10 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-white">
                  {language === 'ka' ? 'AI ოპერაციული ინსაითი' : 'AI Operational Insight'}
                </h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === 'ka' ? 'ახალი' : 'New'}
                </Badge>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {language === 'ka'
                  ? `${totalRooms} ოთახიდან ${pendingHK} საჭიროებს დასუფთავებას, ${pendingMT} ტექნიკურ მომსახურებას. ამ თვეში ტექნიკურ ხარჯებზე დახარჯულია ₾${totalCost}. რეკომენდაცია: შეამოწმეთ C კორპუსის კონდიციონერები - ხშირი შეკეთებებია.`
                  : `Out of ${totalRooms} rooms, ${pendingHK} need housekeeping, ${pendingMT} need maintenance. This month's maintenance cost is ₾${totalCost}. Recommendation: Check Building C air conditioners - frequent repairs detected.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
