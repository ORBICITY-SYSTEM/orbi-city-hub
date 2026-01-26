/**
 * OTA Sync Status Component
 * Monitor connection status for all OTA channels
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Link as LinkIcon,
  ExternalLink,
  Zap,
  Activity,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

interface OTAChannel {
  id: string;
  name: string;
  logo: string;
  status: "connected" | "warning" | "error" | "syncing";
  lastSync: string;
  nextSync: string;
  syncProgress?: number;
  bookingsToday: number;
  revenue24h: number;
  url: string;
  apiStatus: "healthy" | "degraded" | "down";
}

// Demo OTA channels data
const OTA_CHANNELS: OTAChannel[] = [
  {
    id: "booking",
    name: "Booking.com",
    logo: "B",
    status: "connected",
    lastSync: "2 min ago",
    nextSync: "in 8 min",
    bookingsToday: 5,
    revenue24h: 1250,
    url: "https://admin.booking.com",
    apiStatus: "healthy",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "A",
    status: "connected",
    lastSync: "5 min ago",
    nextSync: "in 5 min",
    bookingsToday: 3,
    revenue24h: 890,
    url: "https://www.airbnb.com/hosting",
    apiStatus: "healthy",
  },
  {
    id: "expedia",
    name: "Expedia",
    logo: "E",
    status: "warning",
    lastSync: "15 min ago",
    nextSync: "in 2 min",
    bookingsToday: 2,
    revenue24h: 420,
    url: "https://www.expediapartnercentral.com",
    apiStatus: "degraded",
  },
  {
    id: "agoda",
    name: "Agoda",
    logo: "AG",
    status: "connected",
    lastSync: "3 min ago",
    nextSync: "in 7 min",
    bookingsToday: 1,
    revenue24h: 180,
    url: "https://ycs.agoda.com",
    apiStatus: "healthy",
  },
  {
    id: "otelms",
    name: "OtelMS",
    logo: "O",
    status: "syncing",
    lastSync: "now",
    nextSync: "—",
    syncProgress: 67,
    bookingsToday: 0,
    revenue24h: 0,
    url: "https://116758.otelms.com",
    apiStatus: "healthy",
  },
  {
    id: "ostrovok",
    name: "Ostrovok",
    logo: "OS",
    status: "error",
    lastSync: "2 hours ago",
    nextSync: "retry in 5 min",
    bookingsToday: 0,
    revenue24h: 0,
    url: "https://extranet.emergingtravel.com",
    apiStatus: "down",
  },
];

const STATUS_CONFIG = {
  connected: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    label: { en: "Connected", ka: "დაკავშირებული" },
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    label: { en: "Warning", ka: "გაფრთხილება" },
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    label: { en: "Error", ka: "შეცდომა" },
  },
  syncing: {
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    label: { en: "Syncing", ka: "სინქრონიზაცია" },
  },
};

const API_STATUS_CONFIG = {
  healthy: { color: "bg-emerald-500", label: "Healthy" },
  degraded: { color: "bg-yellow-500", label: "Degraded" },
  down: { color: "bg-red-500", label: "Down" },
};

export function OTASyncStatus() {
  const { language } = useLanguage();
  const [channels, setChannels] = useState<OTAChannel[]>(OTA_CHANNELS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSyncAll = async () => {
    setIsRefreshing(true);
    toast.info(
      language === "ka"
        ? "სინქრონიზაცია დაიწყო..."
        : "Starting sync across all channels..."
    );

    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsRefreshing(false);
    toast.success(
      language === "ka"
        ? "ყველა არხი სინქრონიზებულია!"
        : "All channels synced successfully!"
    );
  };

  const handleSyncChannel = async (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, status: "syncing", syncProgress: 0 } : c
      )
    );

    // Simulate progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channelId ? { ...c, syncProgress: i } : c
        )
      );
    }

    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? { ...c, status: "connected", lastSync: "just now", syncProgress: undefined }
          : c
      )
    );

    toast.success(`${channels.find((c) => c.id === channelId)?.name} synced!`);
  };

  const connectedCount = channels.filter((c) => c.status === "connected").length;
  const totalBookings = channels.reduce((sum, c) => sum + c.bookingsToday, 0);
  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue24h, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {language === "ka" ? "OTA სინქრონიზაცია" : "OTA Sync Status"}
          </h2>
          <p className="text-sm text-slate-400">
            {language === "ka"
              ? "მონიტორინგი და კონტროლი ყველა არხისთვის"
              : "Monitor and control all channel connections"}
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={isRefreshing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {language === "ka" ? "სინქ ყველა" : "Sync All"}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  {language === "ka" ? "დაკავშირებული" : "Connected"}
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {connectedCount}/{channels.length}
                </p>
              </div>
              <Wifi className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  {language === "ka" ? "ჯავშნები (24h)" : "Bookings (24h)"}
                </p>
                <p className="text-2xl font-bold text-blue-400">{totalBookings}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  {language === "ka" ? "შემოსავალი (24h)" : "Revenue (24h)"}
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  ₾{totalRevenue.toLocaleString()}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  {language === "ka" ? "API სტატუსი" : "API Health"}
                </p>
                <p className="text-2xl font-bold text-orange-400">
                  {channels.filter((c) => c.apiStatus === "healthy").length}/{channels.length}
                </p>
              </div>
              <Database className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => {
          const statusConfig = STATUS_CONFIG[channel.status];
          const StatusIcon = statusConfig.icon;
          const apiConfig = API_STATUS_CONFIG[channel.apiStatus];

          return (
            <Card
              key={channel.id}
              className={`bg-slate-800/50 ${statusConfig.border} transition-all hover:shadow-lg`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Logo placeholder */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                        channel.id === "booking"
                          ? "bg-blue-600"
                          : channel.id === "airbnb"
                          ? "bg-pink-500"
                          : channel.id === "expedia"
                          ? "bg-yellow-500"
                          : channel.id === "agoda"
                          ? "bg-red-500"
                          : channel.id === "otelms"
                          ? "bg-cyan-500"
                          : "bg-slate-600"
                      }`}
                    >
                      {channel.logo}
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{channel.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${apiConfig.color}`}></span>
                        <span className="text-xs text-slate-400">{apiConfig.label}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                    <StatusIcon
                      className={`w-3 h-3 mr-1 ${
                        channel.status === "syncing" ? "animate-spin" : ""
                      }`}
                    />
                    {statusConfig.label[language === "ka" ? "ka" : "en"]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Sync Progress */}
                {channel.status === "syncing" && channel.syncProgress !== undefined && (
                  <div className="mb-3">
                    <Progress value={channel.syncProgress} className="h-2" />
                    <p className="text-xs text-blue-400 mt-1">{channel.syncProgress}%</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-xs text-slate-400">
                      {language === "ka" ? "ჯავშნები" : "Bookings"}
                    </p>
                    <p className="text-lg font-semibold text-white">{channel.bookingsToday}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-xs text-slate-400">
                      {language === "ka" ? "შემოსავალი" : "Revenue"}
                    </p>
                    <p className="text-lg font-semibold text-emerald-400">
                      ₾{channel.revenue24h}
                    </p>
                  </div>
                </div>

                {/* Sync Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{language === "ka" ? "ბოლო:" : "Last:"} {channel.lastSync}</span>
                  </div>
                  <span>{language === "ka" ? "შემდეგი:" : "Next:"} {channel.nextSync}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-600 hover:bg-slate-700"
                    onClick={() => handleSyncChannel(channel.id)}
                    disabled={channel.status === "syncing"}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {language === "ka" ? "სინქ" : "Sync"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700"
                    asChild
                  >
                    <a href={channel.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connection Issues */}
      {channels.some((c) => c.status === "error" || c.status === "warning") && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-300 flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              {language === "ka" ? "კავშირის პრობლემები" : "Connection Issues"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {channels
                .filter((c) => c.status === "error" || c.status === "warning")
                .map((channel) => (
                  <li
                    key={channel.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-300">{channel.name}</span>
                    <Badge
                      className={
                        channel.status === "error"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }
                    >
                      {channel.status === "error"
                        ? language === "ka"
                          ? "API შეცდომა"
                          : "API Error"
                        : language === "ka"
                        ? "შეფერხება"
                        : "Degraded"}
                    </Badge>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OTASyncStatus;
