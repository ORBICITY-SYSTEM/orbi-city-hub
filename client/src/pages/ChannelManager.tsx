/**
 * Channel Manager Module - Unified Dashboard with Tabs
 * OTA bookings, calendar, status, and AI-powered guest communication
 */

import { Suspense, lazy } from "react";
import {
  Link as LinkIcon,
  Calendar,
  BarChart3,
  FileText,
  RefreshCw,
  Loader2,
  MessageSquare,
  Bot,
  CheckCircle,
  AlertCircle,
  Home,
  User,
  ArrowRight,
  DollarSign,
  Database,
  Star,
  TrendingUp,
  Brain,
} from "lucide-react";
import { ModulePageLayout, SubModule } from "@/components/ModulePageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalendarBookings, useTodayOperations, useOtelmsConnection } from "@/hooks/useOtelmsData";
import { toast } from "sonner";

// Lazy load components
const GuestCommunicationHub = lazy(() => import("@/components/telegram/GuestCommunicationHub"));
const OTAReviewAutoResponder = lazy(() => import("@/components/reviews/OTAReviewAutoResponder"));
const OTADashboard = lazy(() => import("@/pages/reservations/OTADashboard"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
  </div>
);

// Overview Tab - Quick Stats and Summary
const OverviewTab = () => {
  const { language } = useLanguage();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useCalendarBookings();
  const { data: todayOps, isLoading: todayLoading, refetch: refetchToday } = useTodayOperations();
  const { data: connectionStatus } = useOtelmsConnection();

  const handleSync = () => {
    refetchBookings();
    refetchToday();
    toast.success(language === "ka" ? "მონაცემები განახლდა!" : "Data synced!");
  };

  const isLoading = bookingsLoading || todayLoading;

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayArrivals = todayOps?.arrivals?.length || 0;
  const todayDepartures = todayOps?.departures?.length || 0;
  const totalRevenue = (bookings || []).reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalBookings = bookings?.length || 0;

  // Get platform badge color
  const getPlatformColor = (source: string) => {
    const s = source?.toLowerCase() || "";
    if (s.includes("booking")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (s.includes("airbnb")) return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    if (s.includes("expedia")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Sync Button */}
      <div className="flex justify-end">
        <Button onClick={handleSync} disabled={isLoading} variant="outline" className="border-slate-700">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {language === "ka" ? "სინქრონიზაცია" : "Sync Data"}
        </Button>
      </div>

      {/* Connection Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Database className="w-5 h-5 text-blue-400" />
            {connectionStatus?.connected ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                {language === "ka" ? "Supabase დაკავშირებულია" : "Supabase Connected"}
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                {language === "ka" ? "კავშირი არ არის" : "Not Connected"}
              </Badge>
            )}
            <span className="text-sm text-slate-400">
              {connectionStatus?.tablesConfigured?.join(", ") || "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{language === "ka" ? "ჯავშნები" : "Bookings"}</p>
                <p className="text-2xl font-bold text-blue-400">{totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{language === "ka" ? "ჩამოსვლები" : "Arrivals"}</p>
                <p className="text-2xl font-bold text-green-400">{todayArrivals}</p>
              </div>
              <ArrowRight className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{language === "ka" ? "გასვლები" : "Departures"}</p>
                <p className="text-2xl font-bold text-orange-400">{todayDepartures}</p>
              </div>
              <ArrowRight className="w-8 h-8 text-orange-400 opacity-50 rotate-180" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{language === "ka" ? "შემოსავალი" : "Revenue"}</p>
                <p className="text-2xl font-bold text-emerald-400">₾{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arrivals */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 flex items-center gap-2 text-lg">
              <ArrowRight className="w-5 h-5" />
              {language === "ka" ? "დღევანდელი ჩამოსვლები" : "Today's Arrivals"} ({todayArrivals})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {(todayOps?.arrivals || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white text-sm">{item.text}</span>
                  </div>
                  <Badge variant="outline" className="border-slate-600">
                    <Home className="w-3 h-3 mr-1" />
                    {item.room}
                  </Badge>
                </div>
              ))}
              {todayArrivals === 0 && (
                <p className="text-slate-500 text-center py-4 text-sm">
                  {language === "ka" ? "ჩამოსვლები არ არის" : "No arrivals today"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Departures */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-400 flex items-center gap-2 text-lg">
              <ArrowRight className="w-5 h-5 rotate-180" />
              {language === "ka" ? "დღევანდელი გასვლები" : "Today's Departures"} ({todayDepartures})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {(todayOps?.departures || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white text-sm">{item.text}</span>
                  </div>
                  <Badge variant="outline" className="border-slate-600">
                    <Home className="w-3 h-3 mr-1" />
                    {item.room}
                  </Badge>
                </div>
              ))}
              {todayDepartures === 0 && (
                <p className="text-slate-500 text-center py-4 text-sm">
                  {language === "ka" ? "გასვლები არ არის" : "No departures today"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {language === "ka" ? "ბოლო ჯავშნები" : "Recent Bookings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-sm">{language === "ka" ? "სტუმარი" : "Guest"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-sm">{language === "ka" ? "ოთახი" : "Room"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-sm">{language === "ka" ? "წყარო" : "Source"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-sm">{language === "ka" ? "ჩექინი" : "Check-in"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-sm">{language === "ka" ? "ჩექაუთი" : "Check-out"}</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium text-sm">{language === "ka" ? "თანხა" : "Amount"}</th>
                </tr>
              </thead>
              <tbody>
                {(bookings || []).slice(0, 10).map((booking, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-700/30">
                    <td className="py-2 px-3 text-white text-sm">{booking.guestName}</td>
                    <td className="py-2 px-3 text-slate-300 text-sm">{booking.room}</td>
                    <td className="py-2 px-3">
                      <Badge className={`text-xs ${getPlatformColor(booking.source)}`}>{booking.source}</Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-300 text-sm">{booking.checkIn}</td>
                    <td className="py-2 px-3 text-slate-300 text-sm">{booking.checkOut}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 text-sm">₾{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!bookings || bookings.length === 0) && (
              <p className="text-slate-500 text-center py-8">
                {language === "ka" ? "ჯავშნები არ მოიძებნა" : "No bookings found"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Calendar Tab - Full Calendar View
const CalendarTab = () => {
  const { language } = useLanguage();
  const { data: bookings, isLoading, refetch } = useCalendarBookings();

  const getPlatformColor = (source: string) => {
    const s = source?.toLowerCase() || "";
    if (s.includes("booking")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (s.includes("airbnb")) return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    if (s.includes("expedia")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {language === "ka" ? "ჯავშნების კალენდარი" : "Bookings Calendar"}
        </h2>
        <Button onClick={() => refetch()} disabled={isLoading} variant="outline" className="border-slate-700">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {language === "ka" ? "განახლება" : "Refresh"}
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "სტუმარი" : "Guest"}</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "ოთახი" : "Room"}</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "წყარო" : "Source"}</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "ჩექინი" : "Check-in"}</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "ჩექაუთი" : "Check-out"}</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "ღამეები" : "Nights"}</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">{language === "ka" ? "თანხა" : "Amount"}</th>
                </tr>
              </thead>
              <tbody>
                {(bookings || []).map((booking, idx) => {
                  const checkIn = new Date(booking.checkIn);
                  const checkOut = new Date(booking.checkOut);
                  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-white">{booking.guestName}</td>
                      <td className="py-3 px-4 text-slate-300">{booking.room}</td>
                      <td className="py-3 px-4">
                        <Badge className={getPlatformColor(booking.source)}>{booking.source}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{booking.checkIn}</td>
                      <td className="py-3 px-4 text-slate-300">{booking.checkOut}</td>
                      <td className="py-3 px-4 text-slate-300">{nights > 0 ? nights : "-"}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">₾{booking.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!bookings || bookings.length === 0) && (
              <p className="text-slate-500 text-center py-8">
                {language === "ka" ? "ჯავშნები არ მოიძებნა" : "No bookings found"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Reports Tab - Analytics & Reports
const ReportsTab = () => {
  const { language } = useLanguage();
  const { data: bookings } = useCalendarBookings();

  // Calculate stats
  const totalBookings = bookings?.length || 0;
  const totalRevenue = (bookings || []).reduce((sum, b) => sum + (b.amount || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Source breakdown
  const sourceStats = (bookings || []).reduce((acc, b) => {
    const source = b.source || "Unknown";
    if (!acc[source]) acc[source] = { count: 0, revenue: 0 };
    acc[source].count++;
    acc[source].revenue += b.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">
        {language === "ka" ? "ანალიტიკა და რეპორტები" : "Analytics & Reports"}
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-400">{language === "ka" ? "სულ ჯავშნები" : "Total Bookings"}</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{totalBookings}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-400">{language === "ka" ? "სულ შემოსავალი" : "Total Revenue"}</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">₾{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-400">{language === "ka" ? "საშუალო ჯავშანი" : "Avg Booking Value"}</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">₾{avgBookingValue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {language === "ka" ? "წყაროების მიხედვით" : "By Source"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(sourceStats).map(([source, stats]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={
                    source.toLowerCase().includes("booking") ? "bg-blue-500/20 text-blue-400" :
                    source.toLowerCase().includes("airbnb") ? "bg-pink-500/20 text-pink-400" :
                    source.toLowerCase().includes("expedia") ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-slate-500/20 text-slate-400"
                  }>
                    {source}
                  </Badge>
                  <span className="text-slate-400 text-sm">{stats.count} {language === "ka" ? "ჯავშანი" : "bookings"}</span>
                </div>
                <span className="text-emerald-400 font-medium">₾{stats.revenue.toLocaleString()}</span>
              </div>
            ))}
            {Object.keys(sourceStats).length === 0 && (
              <p className="text-slate-500 text-center py-4">
                {language === "ka" ? "მონაცემები არ არის" : "No data available"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Guest Communication Tab
const CommunicationTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <GuestCommunicationHub />
  </Suspense>
);

// Review Auto-Responder Tab
const ReviewsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <OTAReviewAutoResponder />
  </Suspense>
);

// OTA Analytics Tab (from Reservations module)
const OTAAnalyticsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <OTADashboard />
  </Suspense>
);

const ChannelManager = () => {
  const subModules: SubModule[] = [
    {
      id: "overview",
      nameKey: "channel.overview",
      nameFallback: "Overview",
      icon: BarChart3,
      component: <OverviewTab />,
    },
    {
      id: "calendar",
      nameKey: "channel.calendar",
      nameFallback: "Calendar",
      icon: Calendar,
      component: <CalendarTab />,
    },
    {
      id: "reports",
      nameKey: "channel.reports",
      nameFallback: "Reports",
      icon: FileText,
      component: <ReportsTab />,
    },
    {
      id: "communication",
      nameKey: "channel.communication",
      nameFallback: "Guest Chat",
      icon: MessageSquare,
      component: <CommunicationTab />,
    },
    {
      id: "reviews",
      nameKey: "channel.reviews",
      nameFallback: "AI Reviews",
      icon: Star,
      component: <ReviewsTab />,
    },
    {
      id: "ota-analytics",
      nameKey: "channel.otaAnalytics",
      nameFallback: "OTA Analytics",
      icon: TrendingUp,
      component: <OTAAnalyticsTab />,
    },
  ];

  return (
    <ModulePageLayout
      moduleTitle="Channel Manager"
      moduleTitleKa="არხების მენეჯერი"
      moduleSubtitle="OTA bookings, calendar, and guest communications"
      moduleSubtitleKa="OTA ჯავშნები, კალენდარი და სტუმრებთან კომუნიკაცია"
      moduleIcon={LinkIcon}
      moduleColor="blue"
      subModules={subModules}
      defaultTab="overview"
    />
  );
};

export default ChannelManager;
