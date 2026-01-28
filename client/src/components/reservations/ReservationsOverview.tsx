/**
 * ReservationsOverview - Real-time booking dashboard
 * Shows live data from Supabase OTA reservations
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReservationsData } from "@/hooks/useOrbicityData";
import {
  Calendar, CalendarCheck, Users, DollarSign, TrendingUp,
  Building2, Clock, Plane, CheckCircle2, AlertCircle,
  ArrowRight, Loader2, LogIn, LogOut, CreditCard, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

// Platform colors
const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  "Booking.com": { bg: "bg-blue-600/20", text: "text-blue-400", border: "border-blue-500/30" },
  "Airbnb": { bg: "bg-pink-600/20", text: "text-pink-400", border: "border-pink-500/30" },
  "Expedia": { bg: "bg-yellow-600/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  "Agoda": { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-400/30" },
  "Direct": { bg: "bg-green-600/20", text: "text-green-400", border: "border-green-500/30" },
  "TripAdvisor": { bg: "bg-emerald-600/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  "Ostrovok": { bg: "bg-orange-600/20", text: "text-orange-400", border: "border-orange-500/30" },
  "Hostelworld": { bg: "bg-orange-700/20", text: "text-orange-300", border: "border-orange-400/30" },
};

const getPlatformStyle = (platform: string) => {
  return platformColors[platform] || { bg: "bg-slate-600/20", text: "text-slate-400", border: "border-slate-500/30" };
};

export function ReservationsOverview() {
  const { t, language } = useLanguage();
  const {
    reservations,
    upcomingBookings,
    activeBookings,
    recentBookings,
    totalBookings,
    todayArrivals,
    todayDepartures,
    activeCount,
    upcomingCount,
    platformBreakdown,
    isLoading,
  } = useReservationsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <span className="ml-3 text-lg text-white/70">
          {t("მონაცემების ჩატვირთვა...", "Loading reservations data...")}
        </span>
      </div>
    );
  }

  // Calculate total revenue from reservations
  const totalRevenue = reservations.reduce((sum, r) => sum + (parseFloat(String(r.total_amount)) || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Get top 3 platforms
  const topPlatforms = Object.entries(platformBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(language === "ka" ? "ka-GE" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `₾${(amount / 1000).toFixed(1)}K`;
    }
    return `₾${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Channel Manager Link */}
      <Link href="/channel-manager">
        <motion.div
          whileHover={{ scale: 1.01, y: -2 }}
          className="bg-gradient-to-r from-blue-600/20 via-cyan-600/15 to-blue-600/20 rounded-xl p-5 border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">Channel Manager</div>
                <div className="text-sm text-white/60">
                  {t("OTA ჯავშნები, კალენდარი, ფასები, სინქრონიზაცია", "OTA bookings, calendar, rates, sync status")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DataSourceBadge type="live" source="Supabase" size="sm" />
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30 h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-400">{activeCount}</p>
                  <p className="text-sm text-white/60 mt-1">{t("აქტიური", "Active Now")}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400/80">
                <CheckCircle2 className="h-3 w-3" />
                <span>{t("შემოსულები სტუმრობენ", "Currently hosted")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border-cyan-500/30 h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-cyan-400">{upcomingCount}</p>
                  <p className="text-sm text-white/60 mt-1">{t("მოსალოდნელი", "Upcoming")}</p>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <CalendarCheck className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400/80">
                <Clock className="h-3 w-3" />
                <span>{t("7 დღის განმავლობაში", "Within 7 days")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/30 h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-400">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-white/60 mt-1">{t("შემოსავალი", "Revenue")}</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <DollarSign className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400/80">
                <TrendingUp className="h-3 w-3" />
                <span>Avg: {formatCurrency(avgBookingValue)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/10 border-purple-500/30 h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-400">{totalBookings}</p>
                  <p className="text-sm text-white/60 mt-1">{t("სულ ჯავშნები", "Total Bookings")}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Building2 className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-400/80">
                <Star className="h-3 w-3" />
                <span>{Object.keys(platformBreakdown).length} {t("არხი", "channels")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LogIn className="h-5 w-5 text-green-400" />
                <span className="text-green-400">{t("დღეს ჩამოსვლა", "Today's Arrivals")}</span>
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                  {todayArrivals}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayArrivals === 0 ? (
                <div className="text-center py-6 text-white/50">
                  <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("დღეს ჩამოსვლები არ არის", "No arrivals today")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reservations
                    .filter(r => r.check_in === new Date().toISOString().split("T")[0])
                    .slice(0, 5)
                    .map((booking, i) => {
                      const style = getPlatformStyle(booking.platform);
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className={`flex items-center justify-between p-3 rounded-lg ${style.bg} ${style.border} border`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate max-w-[120px]">
                              {booking.guest_name || "Guest"}
                            </span>
                            <span className="text-xs text-white/50">
                              {booking.room_type || "—"}
                            </span>
                          </div>
                          <Badge className={`${style.bg} ${style.text} ${style.border}`}>
                            {booking.platform || "Direct"}
                          </Badge>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LogOut className="h-5 w-5 text-red-400" />
                <span className="text-red-400">{t("დღეს გასვლა", "Today's Check-outs")}</span>
                <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                  {todayDepartures}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayDepartures === 0 ? (
                <div className="text-center py-6 text-white/50">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("დღეს გასვლები არ არის", "No check-outs today")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reservations
                    .filter(r => r.check_out === new Date().toISOString().split("T")[0])
                    .slice(0, 5)
                    .map((booking, i) => {
                      const style = getPlatformStyle(booking.platform);
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 + i * 0.05 }}
                          className={`flex items-center justify-between p-3 rounded-lg ${style.bg} ${style.border} border`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate max-w-[120px]">
                              {booking.guest_name || "Guest"}
                            </span>
                            <span className="text-xs text-white/50">
                              {booking.room_type || "—"}
                            </span>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {t("დალაგება", "Clean")}
                          </Badge>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Platform Breakdown & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">
                {t("არხების განაწილება", "Channel Distribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPlatforms.map(([platform, count], i) => {
                  const style = getPlatformStyle(platform);
                  const percentage = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
                  return (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${style.text}`}>{platform}</span>
                        <span className="text-sm text-white/60">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${style.bg.replace('/20', '/60')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">
                  {t("ბოლო ჯავშნები", "Recent Bookings")}
                </CardTitle>
                <DataSourceBadge type="live" source="Supabase" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentBookings.slice(0, 8).map((booking, i) => {
                  const style = getPlatformStyle(booking.platform);
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/30 hover:border-green-500/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          <Badge className={`${style.bg} ${style.text} ${style.border} text-xs`}>
                            {(booking.platform || "Direct").slice(0, 3)}
                          </Badge>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">
                            {booking.guest_name || "Guest"}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {booking.room_type || "—"} • {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-medium text-green-400">
                          {booking.currency || "₾"}{parseFloat(String(booking.total_amount || 0)).toLocaleString()}
                        </span>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : booking.status === "cancelled"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }
                        >
                          {booking.status === "confirmed" ? "OK" : booking.status?.slice(0, 3) || "—"}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default ReservationsOverview;
