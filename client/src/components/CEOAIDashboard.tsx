/**
 * CEO AI Dashboard - Central Control Center
 * Shows data distribution, AI insights, and task management
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Brain, Database, TrendingUp, AlertCircle, CheckCircle2,
  Truck, DollarSign, Calendar, BarChart3, Sparkles, RefreshCw,
  ArrowRight, Eye, Target, Zap, Home, Package, Users, Wrench
} from "lucide-react";
import { Link } from "wouter";

interface ModuleStats {
  logistics: { rooms: number; housekeeping: number; maintenance: number; inventory: number };
  finance: { records: number; reports: number; uploads: number };
  reservations: { bookings: number; reviews: number };
  ai: { conversations: number; tasks: number };
}

interface AIInsight {
  type: "success" | "warning" | "info";
  titleKa: string;
  titleEn: string;
  descKa: string;
  descEn: string;
  module: string;
}

export function CEOAIDashboard() {
  const { language, t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch module stats
  const { data: stats, refetch: refetchStats, isLoading } = useQuery({
    queryKey: ["ceo-ai-stats"],
    queryFn: async (): Promise<ModuleStats> => {
      const [
        roomsCount,
        housekeepingCount,
        maintenanceCount,
        inventoryCount,
        financeCount,
        reportsCount,
        uploadsCount,
        bookingsCount,
        reviewsCount,
        aiConversationsCount,
        aiTasksCount
      ] = await Promise.all([
        supabase.from("rooms").select("*", { count: "exact", head: true }),
        supabase.from("housekeeping_schedules").select("*", { count: "exact", head: true }),
        supabase.from("maintenance_schedules").select("*", { count: "exact", head: true }),
        supabase.from("room_inventory_items").select("*", { count: "exact", head: true }),
        supabase.from("finance_records" as any).select("*", { count: "exact", head: true }),
        supabase.from("monthly_reports" as any).select("*", { count: "exact", head: true }),
        supabase.from("file_uploads" as any).select("*", { count: "exact", head: true }),
        supabase.from("bookings" as any).select("*", { count: "exact", head: true }),
        supabase.from("guest_reviews" as any).select("*", { count: "exact", head: true }),
        supabase.from("ai_director_conversations" as any).select("*", { count: "exact", head: true }),
        supabase.from("ai_director_tasks" as any).select("*", { count: "exact", head: true }),
      ]);

      return {
        logistics: {
          rooms: roomsCount.count || 0,
          housekeeping: housekeepingCount.count || 0,
          maintenance: maintenanceCount.count || 0,
          inventory: inventoryCount.count || 0,
        },
        finance: {
          records: financeCount.count || 0,
          reports: reportsCount.count || 0,
          uploads: uploadsCount.count || 0,
        },
        reservations: {
          bookings: bookingsCount.count || 0,
          reviews: reviewsCount.count || 0,
        },
        ai: {
          conversations: aiConversationsCount.count || 0,
          tasks: aiTasksCount.count || 0,
        },
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ["ceo-ai-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("logistics_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  // Generate AI insights based on data
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    if (stats) {
      // Logistics insights
      if (stats.logistics.maintenance > 0) {
        insights.push({
          type: "warning",
          titleKa: "ტექნიკური საკითხები",
          titleEn: "Maintenance Issues",
          descKa: `${stats.logistics.maintenance} აქტიური ტექნიკური ჩანაწერი`,
          descEn: `${stats.logistics.maintenance} active maintenance records`,
          module: "logistics",
        });
      }

      if (stats.logistics.rooms > 50) {
        insights.push({
          type: "success",
          titleKa: "აპარტამენტების რაოდენობა",
          titleEn: "Apartment Count",
          descKa: `${stats.logistics.rooms} აპარტამენტი მართვაში`,
          descEn: `${stats.logistics.rooms} apartments under management`,
          module: "logistics",
        });
      }

      // Finance insights
      if (stats.finance.records > 0 || stats.finance.reports > 0) {
        insights.push({
          type: "info",
          titleKa: "ფინანსური მონაცემები",
          titleEn: "Financial Data",
          descKa: `${stats.finance.records} ჩანაწერი, ${stats.finance.reports} ანგარიში`,
          descEn: `${stats.finance.records} records, ${stats.finance.reports} reports`,
          module: "finance",
        });
      }

      // Reservations insights
      if (stats.reservations.reviews > 0) {
        insights.push({
          type: "info",
          titleKa: "სტუმრების შეფასებები",
          titleEn: "Guest Reviews",
          descKa: `${stats.reservations.reviews} შეფასება`,
          descEn: `${stats.reservations.reviews} reviews available`,
          module: "reservations",
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const moduleCards = [
    {
      id: "logistics",
      nameKa: "ლოჯისტიკა",
      nameEn: "Logistics",
      icon: Truck,
      color: "from-purple-500 to-purple-700",
      link: "/logistics",
      stats: stats?.logistics
        ? `${stats.logistics.rooms} ${language === 'ka' ? 'ოთახი' : 'rooms'}`
        : "...",
    },
    {
      id: "finance",
      nameKa: "ფინანსები",
      nameEn: "Finance",
      icon: DollarSign,
      color: "from-cyan-500 to-cyan-700",
      link: "/finance",
      stats: stats?.finance
        ? `${stats.finance.records + stats.finance.reports} ${language === 'ka' ? 'ჩანაწერი' : 'records'}`
        : "...",
    },
    {
      id: "reservations",
      nameKa: "რეზერვაციები",
      nameEn: "Reservations",
      icon: Calendar,
      color: "from-green-500 to-green-700",
      link: "/reservations",
      stats: stats?.reservations
        ? `${stats.reservations.bookings} ${language === 'ka' ? 'რეზერვაცია' : 'bookings'}`
        : "...",
    },
    {
      id: "marketing",
      nameKa: "მარკეტინგი",
      nameEn: "Marketing",
      icon: TrendingUp,
      color: "from-pink-500 to-pink-700",
      link: "/marketing",
      stats: language === 'ka' ? 'აქტიური' : 'Active',
    },
  ];

  return (
    <Card className="bg-slate-800/50 border-cyan-500/30 overflow-hidden">
      <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                CEO AI
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {language === 'ka' ? 'აქტიური' : 'Active'}
                </Badge>
              </CardTitle>
              <p className="text-sm text-white/60">
                {language === 'ka' ? 'მონაცემთა კონტროლი და ავტომატიზაცია' : 'Data Control & Automation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-white/70 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/data">
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              >
                <Database className="w-4 h-4 mr-2" />
                Data Hub
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Module Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moduleCards.map((module) => (
            <Link key={module.id} href={module.link}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${module.color} cursor-pointer transition-all hover:shadow-lg hover:shadow-${module.color.split('-')[1]}-500/25`}
              >
                <module.icon className="w-6 h-6 text-white/80 mb-2" />
                <p className="text-sm font-medium text-white/90">
                  {language === 'ka' ? module.nameKa : module.nameEn}
                </p>
                <p className="text-lg font-bold text-white">{module.stats}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              {language === 'ka' ? 'AI ინსაითები' : 'AI Insights'}
            </h3>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    insight.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : insight.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  {insight.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : insight.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {language === 'ka' ? insight.titleKa : insight.titleEn}
                    </p>
                    <p className="text-xs text-white/60">
                      {language === 'ka' ? insight.descKa : insight.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              {language === 'ka' ? 'ბოლო აქტივობა' : 'Recent Activity'}
            </h3>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.action}
                      </Badge>
                      <span className="text-sm text-white/80">{activity.entity_name}</span>
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50">
              {language === 'ka'
                ? 'CEO AI მონიტორინგს უწევს ყველა მონაცემს და ავტომატურად ანაწილებს მოდულებში'
                : 'CEO AI monitors all data and automatically distributes to modules'}
            </p>
            <Link href="/data">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                {language === 'ka' ? 'სრული მონაცემები' : 'Full Data'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
