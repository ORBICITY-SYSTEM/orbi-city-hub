/**
 * OTA Sync Status Component
 * Monitor connection status for all 15 distribution channels + 4 coming soon
 * Based on Distribution-Channels-Portfolio.pdf
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

interface OTAChannel {
  id: string;
  name: string;
  nameKa: string;
  category: "ota" | "social" | "pms" | "website" | "coming_soon";
  logo: string;
  color: string;
  status: "connected" | "warning" | "error" | "syncing" | "coming_soon";
  lastSync: string;
  nextSync: string;
  syncProgress?: number;
  bookingsToday: number;
  revenue24h: number;
  listingUrl: string;
  extranetUrl: string;
  apiStatus: "healthy" | "degraded" | "down" | "unknown";
}

// ALL 15 Active Channels + 4 Coming Soon (from PDF)
const ALL_CHANNELS: OTAChannel[] = [
  // OTA CHANNELS (10 active)
  {
    id: "booking",
    name: "Booking.com",
    nameKa: "ბუქინგი",
    category: "ota",
    logo: "B",
    color: "bg-blue-600",
    status: "connected",
    lastSync: "2 min ago",
    nextSync: "in 8 min",
    bookingsToday: 5,
    revenue24h: 1250,
    listingUrl: "https://www.booking.com/hotel/ge/orbi-city-luxury-sea-view-apartm",
    extranetUrl: "https://admin.booking.com",
    apiStatus: "healthy",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    nameKa: "ეარბიენბი",
    category: "ota",
    logo: "A",
    color: "bg-pink-500",
    status: "connected",
    lastSync: "5 min ago",
    nextSync: "in 5 min",
    bookingsToday: 3,
    revenue24h: 890,
    listingUrl: "https://www.airbnb.com/rooms/1455314718960040955",
    extranetUrl: "https://www.airbnb.com/hosting",
    apiStatus: "healthy",
  },
  {
    id: "agoda",
    name: "Agoda",
    nameKa: "აგოდა",
    category: "ota",
    logo: "AG",
    color: "bg-red-500",
    status: "connected",
    lastSync: "3 min ago",
    nextSync: "in 7 min",
    bookingsToday: 1,
    revenue24h: 180,
    listingUrl: "https://www.agoda.com/batumi-orbi-sitiy-twin-tower-sea-wiev/hotel",
    extranetUrl: "https://ycs.agoda.com",
    apiStatus: "healthy",
  },
  {
    id: "expedia",
    name: "Expedia",
    nameKa: "ექსპედია",
    category: "ota",
    logo: "E",
    color: "bg-yellow-500",
    status: "warning",
    lastSync: "15 min ago",
    nextSync: "in 2 min",
    bookingsToday: 2,
    revenue24h: 420,
    listingUrl: "https://www.expedia.com/Batumi-Hotels-ORBI-CITY-Luxury-Sea-View-A",
    extranetUrl: "https://www.expediapartnercentral.com",
    apiStatus: "degraded",
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    nameKa: "ტრიპადვაიზორი",
    category: "ota",
    logo: "TA",
    color: "bg-emerald-500",
    status: "connected",
    lastSync: "8 min ago",
    nextSync: "in 2 min",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://www.tripadvisor.com/Hotel_Review-g297576-d27797353-Review",
    extranetUrl: "https://www.tripadvisor.com/Owners",
    apiStatus: "healthy",
  },
  {
    id: "ostrovok",
    name: "Ostrovok",
    nameKa: "ოსტროვოკი",
    category: "ota",
    logo: "OS",
    color: "bg-orange-500",
    status: "connected",
    lastSync: "4 min ago",
    nextSync: "in 6 min",
    bookingsToday: 1,
    revenue24h: 150,
    listingUrl: "https://ostrovok.ru/hotel/georgia/batumi/mid13345479/hotel_orbi_c",
    extranetUrl: "https://extranet.emergingtravel.com/v3/hotels/393043548/hotel/info",
    apiStatus: "healthy",
  },
  {
    id: "sutochno",
    name: "Sutochno.com",
    nameKa: "სუტოჩნო",
    category: "ota",
    logo: "S",
    color: "bg-red-600",
    status: "connected",
    lastSync: "6 min ago",
    nextSync: "in 4 min",
    bookingsToday: 2,
    revenue24h: 280,
    listingUrl: "https://sutochno.com/front/searchapp/search",
    extranetUrl: "https://extranet.sutochno.ru/cabinet/objects",
    apiStatus: "healthy",
  },
  {
    id: "bronevik",
    name: "Bronevik.com",
    nameKa: "ბრონევიკი",
    category: "ota",
    logo: "BR",
    color: "bg-green-700",
    status: "connected",
    lastSync: "7 min ago",
    nextSync: "in 3 min",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://bronevik.com/en/hotel/start?hotel_id=757157",
    extranetUrl: "https://bronevik.com/en/info/hotels",
    apiStatus: "healthy",
  },
  {
    id: "tvil",
    name: "Tvil.ru",
    nameKa: "ტვილი",
    category: "ota",
    logo: "TV",
    color: "bg-purple-600",
    status: "connected",
    lastSync: "5 min ago",
    nextSync: "in 5 min",
    bookingsToday: 1,
    revenue24h: 120,
    listingUrl: "https://tvil.ru/city/batumi/hotels/2062593",
    extranetUrl: "https://tvil.ru",
    apiStatus: "healthy",
  },
  {
    id: "hostelworld",
    name: "Hostelworld",
    nameKa: "ჰოსტელვორლდი",
    category: "ota",
    logo: "HW",
    color: "bg-orange-600",
    status: "connected",
    lastSync: "9 min ago",
    nextSync: "in 1 min",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://www.hostelworld.com/pwa/hosteldetails.php/Orbi-City-Sea-v",
    extranetUrl: "https://inbox.hostelworld.com",
    apiStatus: "healthy",
  },

  // PMS
  {
    id: "otelms",
    name: "OtelMS",
    nameKa: "ოტელმს",
    category: "pms",
    logo: "O",
    color: "bg-cyan-500",
    status: "syncing",
    lastSync: "now",
    nextSync: "—",
    syncProgress: 67,
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "",
    extranetUrl: "https://116758.otelms.com/reservation_c2/calendar",
    apiStatus: "healthy",
  },

  // SOCIAL MEDIA
  {
    id: "facebook",
    name: "Facebook",
    nameKa: "ფეისბუქი",
    category: "social",
    logo: "FB",
    color: "bg-blue-500",
    status: "connected",
    lastSync: "1 hr ago",
    nextSync: "in 1 hr",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://www.facebook.com/share/1D9xvSc6Dh/?mibextid=wwXIfr",
    extranetUrl: "https://business.facebook.com",
    apiStatus: "healthy",
  },
  {
    id: "instagram",
    name: "Instagram",
    nameKa: "ინსტაგრამი",
    category: "social",
    logo: "IG",
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    status: "connected",
    lastSync: "1 hr ago",
    nextSync: "in 1 hr",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://www.instagram.com/orbi_city_sea_view_apartment",
    extranetUrl: "https://www.instagram.com",
    apiStatus: "healthy",
  },
  {
    id: "tiktok",
    name: "TikTok",
    nameKa: "ტიკტოკი",
    category: "social",
    logo: "TT",
    color: "bg-black",
    status: "connected",
    lastSync: "2 hr ago",
    nextSync: "in 1 hr",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://www.tiktok.com/@orbi.apartments.batumi",
    extranetUrl: "https://www.tiktok.com",
    apiStatus: "healthy",
  },
  {
    id: "youtube",
    name: "YouTube",
    nameKa: "იუთუბი",
    category: "social",
    logo: "YT",
    color: "bg-red-600",
    status: "connected",
    lastSync: "3 hr ago",
    nextSync: "in 1 hr",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "https://www.youtube.com/@ORBIAPARTMENTS",
    extranetUrl: "https://studio.youtube.com",
    apiStatus: "healthy",
  },

  // WEBSITE
  {
    id: "website",
    name: "orbicitybatumi.com",
    nameKa: "ვებსაიტი",
    category: "website",
    logo: "W",
    color: "bg-emerald-500",
    status: "connected",
    lastSync: "real-time",
    nextSync: "—",
    bookingsToday: 1,
    revenue24h: 200,
    listingUrl: "https://www.orbicitybatumi.com",
    extranetUrl: "",
    apiStatus: "healthy",
  },

  // COMING SOON
  {
    id: "yandex",
    name: "Yandex Travel",
    nameKa: "იანდექს თრეველი",
    category: "coming_soon",
    logo: "Y",
    color: "bg-red-500",
    status: "coming_soon",
    lastSync: "—",
    nextSync: "—",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "",
    extranetUrl: "",
    apiStatus: "unknown",
  },
  {
    id: "hrs",
    name: "HRS",
    nameKa: "აშარეს",
    category: "coming_soon",
    logo: "HRS",
    color: "bg-red-700",
    status: "coming_soon",
    lastSync: "—",
    nextSync: "—",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "",
    extranetUrl: "",
    apiStatus: "unknown",
  },
  {
    id: "trip",
    name: "Trip.com",
    nameKa: "ტრიპ.კომ",
    category: "coming_soon",
    logo: "TR",
    color: "bg-blue-600",
    status: "coming_soon",
    lastSync: "—",
    nextSync: "—",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "",
    extranetUrl: "",
    apiStatus: "unknown",
  },
  {
    id: "cbooking",
    name: "Cbooking.ru",
    nameKa: "სიბუქინგი",
    category: "coming_soon",
    logo: "CB",
    color: "bg-teal-600",
    status: "coming_soon",
    lastSync: "—",
    nextSync: "—",
    bookingsToday: 0,
    revenue24h: 0,
    listingUrl: "",
    extranetUrl: "",
    apiStatus: "unknown",
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
  const [channels, setChannels] = useState<OTAChannel[]>(ALL_CHANNELS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ota");

  const handleSyncAll = async () => {
    setIsRefreshing(true);
    toast.info(
      language === "ka"
        ? "სინქრონიზაცია დაიწყო..."
        : "Starting sync across all channels..."
    );

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

  // Filter channels by category
  const otaChannels = channels.filter((c) => c.category === "ota");
  const socialChannels = channels.filter((c) => c.category === "social");
  const pmsChannels = channels.filter((c) => c.category === "pms");
  const websiteChannels = channels.filter((c) => c.category === "website");
  const comingSoonChannels = channels.filter((c) => c.category === "coming_soon");

  // Stats
  const activeChannels = channels.filter((c) => c.status !== "coming_soon");
  const connectedCount = activeChannels.filter((c) => c.status === "connected" || c.status === "syncing").length;
  const totalBookings = otaChannels.reduce((sum, c) => sum + c.bookingsToday, 0);
  const totalRevenue = otaChannels.reduce((sum, c) => sum + c.revenue24h, 0);

  const renderChannelCard = (channel: OTAChannel) => {
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
                className={`w-3 h-3 mr-1 ${channel.status === "syncing" ? "animate-spin" : ""}`}
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
                  disabled={channel.status === "syncing"}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {language === "ka" ? "დისტრიბუციის არხები" : "Distribution Channels"}
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
