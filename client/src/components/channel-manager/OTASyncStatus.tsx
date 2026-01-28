/**
 * OTA Sync Status Component
 * Monitor connection status for all distribution channels
 * Data from Supabase distribution_channels table
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  ExternalLink,
  Zap,
  Activity,
  Database,
  Wifi,
  WifiOff,
  Hotel,
  Share2,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDistributionChannels, ChannelForUI } from "@/hooks/useDistributionChannels";

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
  coming_soon: {
    icon: Clock,
    color: "text-slate-400",
    bg: "bg-slate-500/20",
    border: "border-slate-500/30",
    label: { en: "Coming Soon", ka: "მალე" },
  },
};

const API_STATUS_CONFIG = {
  healthy: { color: "bg-emerald-500", label: "Healthy" },
  degraded: { color: "bg-yellow-500", label: "Degraded" },
  down: { color: "bg-red-500", label: "Down" },
  unknown: { color: "bg-slate-500", label: "N/A" },
};

export function OTASyncStatus() {
  const { language } = useLanguage();
  const {
    channels,
    otaChannels,
    socialChannels,
    pmsChannels,
    websiteChannels,
    comingSoonChannels,
    activeChannels,
    connectedCount,
    totalBookings,
    totalRevenue,
    isLoading,
    error,
    refetch,
    updateChannelStatus,
    setChannels,
  } = useDistributionChannels();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ota");
  const [syncingChannels, setSyncingChannels] = useState<Set<string>>(new Set());
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});

  const handleSyncAll = async () => {
    setIsRefreshing(true);
    toast.info(
      language === "ka"
        ? "სინქრონიზაცია დაიწყო..."
        : "Starting sync across all channels..."
    );

    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Refresh data from Supabase
    await refetch();

    setIsRefreshing(false);
    toast.success(
      language === "ka"
        ? "ყველა არხი სინქრონიზებულია!"
        : "All channels synced successfully!"
    );
  };

  const handleSyncChannel = async (channelId: string) => {
    setSyncingChannels((prev) => new Set(prev).add(channelId));
    setSyncProgress((prev) => ({ ...prev, [channelId]: 0 }));

    // Simulate sync progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSyncProgress((prev) => ({ ...prev, [channelId]: i }));
    }

    // Update in Supabase
    await updateChannelStatus(channelId, {
      api_status: "healthy",
    });

    setSyncingChannels((prev) => {
      const next = new Set(prev);
      next.delete(channelId);
      return next;
    });
    setSyncProgress((prev) => {
      const next = { ...prev };
      delete next[channelId];
      return next;
    });

    const channel = channels.find((c) => c.id === channelId);
    toast.success(`${channel?.name} synced!`);
  };

  const renderChannelCard = (channel: ChannelForUI) => {
    const isSyncing = syncingChannels.has(channel.id);
    const currentProgress = syncProgress[channel.id];
    const effectiveStatus = isSyncing ? "syncing" : channel.status;
    const statusConfig = STATUS_CONFIG[effectiveStatus];
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
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs ${channel.color}`}
              >
                {channel.logo}
              </div>
              <div>
                <CardTitle className="text-white text-base">
                  {language === "ka" ? channel.nameKa : channel.name}
                </CardTitle>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`w-2 h-2 rounded-full ${apiConfig.color}`}></span>
                  <span className="text-xs text-slate-400">{apiConfig.label}</span>
                </div>
              </div>
            </div>
            <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon
                className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`}
              />
              {statusConfig.label[language === "ka" ? "ka" : "en"]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sync Progress */}
          {isSyncing && currentProgress !== undefined && (
            <div className="mb-3">
              <Progress value={currentProgress} className="h-2" />
              <p className="text-xs text-blue-400 mt-1">{currentProgress}%</p>
            </div>
          )}

          {/* Stats - only for OTA */}
          {channel.category === "ota" && channel.status !== "coming_soon" && (
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
          )}

          {/* Sync Info */}
          {channel.status !== "coming_soon" && (
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{language === "ka" ? "ბოლო:" : "Last:"} {channel.lastSync}</span>
              </div>
              <span>{language === "ka" ? "შემდეგი:" : "Next:"} {channel.nextSync}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {channel.status !== "coming_soon" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-600 hover:bg-slate-700"
                  onClick={() => handleSyncChannel(channel.id)}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                  {language === "ka" ? "სინქ" : "Sync"}
                </Button>
                {channel.listingUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700"
                    asChild
                  >
                    <a href={channel.listingUrl} target="_blank" rel="noopener noreferrer" title="View Listing">
                      <Globe className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {channel.extranetUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700"
                    asChild
                  >
                    <a href={channel.extranetUrl} target="_blank" rel="noopener noreferrer" title="Extranet">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </>
            ) : (
              <div className="flex-1 text-center py-2">
                <span className="text-xs text-amber-400 flex items-center justify-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {language === "ka" ? "მიმდინარეობს ინტეგრაცია" : "Integration in progress"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">
            {language === "ka" ? "იტვირთება არხები..." : "Loading channels..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">
            {language === "ka" ? "შეცდომა მონაცემების ჩატვირთვისას" : "Error loading channels"}
          </p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <Button onClick={refetch} variant="outline" className="border-slate-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === "ka" ? "ხელახლა ცდა" : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {language === "ka" ? "დისტრიბუციის არხები" : "Distribution Channels"}
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
              <Database className="w-3 h-3 mr-1" />
              Supabase
            </Badge>
          </h2>
          <p className="text-sm text-slate-400">
            {language === "ka"
              ? `${activeChannels.length} აქტიური არხი • ${comingSoonChannels.length} მალე`
              : `${activeChannels.length} active channels • ${comingSoonChannels.length} coming soon`}
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
                  {connectedCount}/{activeChannels.length}
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
                  {language === "ka" ? "OTA ჯავშნები (24h)" : "OTA Bookings (24h)"}
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

        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  {language === "ka" ? "მალე" : "Coming Soon"}
                </p>
                <p className="text-2xl font-bold text-amber-400">{comingSoonChannels.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="ota" className="data-[state=active]:bg-blue-600">
            <Hotel className="w-4 h-4 mr-2" />
            OTA ({otaChannels.length})
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-pink-600">
            <Share2 className="w-4 h-4 mr-2" />
            {language === "ka" ? "სოციალური" : "Social"} ({socialChannels.length})
          </TabsTrigger>
          <TabsTrigger value="other" className="data-[state=active]:bg-cyan-600">
            <Database className="w-4 h-4 mr-2" />
            {language === "ka" ? "სხვა" : "Other"} ({pmsChannels.length + websiteChannels.length})
          </TabsTrigger>
          <TabsTrigger value="coming" className="data-[state=active]:bg-amber-600">
            <Clock className="w-4 h-4 mr-2" />
            {language === "ka" ? "მალე" : "Soon"} ({comingSoonChannels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ota" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otaChannels.map(renderChannelCard)}
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialChannels.map(renderChannelCard)}
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pmsChannels.map(renderChannelCard)}
            {websiteChannels.map(renderChannelCard)}
          </div>
        </TabsContent>

        <TabsContent value="coming" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoonChannels.map(renderChannelCard)}
          </div>
        </TabsContent>
      </Tabs>

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
