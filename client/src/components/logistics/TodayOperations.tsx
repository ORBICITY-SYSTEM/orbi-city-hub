/**
 * TodayOperations - Real-time arrivals/departures from Supabase
 * Shows today's check-ins, check-outs, and cleaning schedule
 */

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLogisticsOperations } from "@/hooks/useOrbicityData";
import {
  LogIn, LogOut, Sparkles, Calendar, Clock, User, Building2,
  Phone, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

// Platform colors
const platformColors: Record<string, string> = {
  "Booking.com": "bg-blue-600",
  "Airbnb": "bg-pink-500",
  "Expedia": "bg-yellow-500",
  "Agoda": "bg-blue-400",
  "Direct": "bg-green-500",
  "TripAdvisor": "bg-emerald-500",
  "Ostrovok": "bg-orange-500",
  "Hostelworld": "bg-orange-600",
};

export function TodayOperations() {
  const { t, language } = useLanguage();
  const {
    todayArrivals,
    todayDepartures,
    tomorrowArrivals,
    cleaningRequired,
    arrivalsCount,
    departuresCount,
    tomorrowCount,
    cleaningCount,
    isLoading,
  } = useLogisticsOperations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="ml-3 text-white/70">
          {t("მონაცემების ჩატვირთვა...", "Loading operations data...")}
        </span>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(language === "ka" ? "ka-GE" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <LogIn className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{arrivalsCount}</p>
                  <p className="text-xs text-white/60">{t("დღეს ჩამოსვლა", "Today Arrivals")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <LogOut className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{departuresCount}</p>
                  <p className="text-xs text-white/60">{t("დღეს გასვლა", "Today Check-outs")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">{cleaningCount}</p>
                  <p className="text-xs text-white/60">{t("დასალაგებელი", "Need Cleaning")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{tomorrowCount}</p>
                  <p className="text-xs text-white/60">{t("ხვალ ჩამოსვლა", "Tomorrow Arrivals")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Arrivals */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <LogIn className="h-5 w-5" />
              {t("დღევანდელი ჩამოსვლები", "Today's Arrivals")}
              <Badge variant="secondary" className="ml-2">{arrivalsCount}</Badge>
            </CardTitle>
            <DataSourceBadge type="live" source="Supabase" size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          {todayArrivals.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500/50" />
              <p>{t("დღეს ჩამოსვლები არ არის", "No arrivals today")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayArrivals.map((arrival, i) => (
                <motion.div
                  key={arrival.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-green-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <User className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{arrival.guest_name || "Guest"}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Building2 className="h-3 w-3" />
                        <span>{arrival.room_type || arrival.room_number || "—"}</span>
                        <span className="text-white/30">|</span>
                        <span>{arrival.nights || 1} {t("ღამე", "nights")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${platformColors[arrival.platform] || "bg-slate-600"} text-white text-xs`}>
                      {arrival.platform || "Direct"}
                    </Badge>
                    {arrival.total_amount > 0 && (
                      <span className="text-sm font-medium text-green-400">
                        {arrival.currency || "₾"}{parseFloat(String(arrival.total_amount)).toLocaleString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Departures / Check-outs */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <LogOut className="h-5 w-5" />
              {t("დღევანდელი გასვლები", "Today's Check-outs")}
              <Badge variant="secondary" className="ml-2">{departuresCount}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {todayDepartures.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-red-500/50" />
              <p>{t("დღეს გასვლები არ არის", "No check-outs today")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayDepartures.map((departure, i) => (
                <motion.div
                  key={departure.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <User className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{departure.guest_name || "Guest"}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Building2 className="h-3 w-3" />
                        <span>{departure.room_type || departure.room_number || "—"}</span>
                        <span className="text-white/30">|</span>
                        <Clock className="h-3 w-3" />
                        <span>{t("დასალაგებელი", "Needs cleaning")}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t("დალაგება", "Clean")}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleaning Required List */}
      {cleaningRequired.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Sparkles className="h-5 w-5" />
              {t("დასალაგებელი ოთახები", "Rooms Requiring Cleaning")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cleaningRequired.map((room, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1">
                    {room}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TodayOperations;
