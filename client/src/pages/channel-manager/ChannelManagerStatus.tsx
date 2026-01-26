import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Database, Calendar, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOtelmsConnection, useCalendarBookings } from "@/hooks/useOtelmsData";
import { toast } from "sonner";

export default function ChannelManagerStatus() {
  const { language } = useLanguage();

  const { data: connectionStatus, isLoading: connectionLoading, refetch: refetchConnection } = useOtelmsConnection();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useCalendarBookings();

  const handleSync = () => {
    refetchConnection();
    refetchBookings();
    toast.success(language === "ka" ? "სინქრონიზაცია დასრულდა!" : "Sync completed!");
  };

  const t = {
    title: language === "ka" ? "არხების მენეჯერი - სტატუსი" : "Channel Manager - Status",
    subtitle: language === "ka" ? "Supabase-დან ლაივ მონაცემები" : "Live data from Supabase",
    sync: language === "ka" ? "სინქრონიზაცია" : "Sync Status",
    connected: language === "ka" ? "დაკავშირებულია" : "Connected",
    disconnected: language === "ka" ? "გაწყვეტილია" : "Disconnected",
    tables: language === "ka" ? "ცხრილები" : "Tables",
    bookings: language === "ka" ? "ჯავშნები" : "Bookings",
    today: language === "ka" ? "დღეს" : "Today",
  };

  const isLoading = connectionLoading || bookingsLoading;

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayArrivals = (bookings || []).filter(b => b.checkIn === today).length;
  const todayDepartures = (bookings || []).filter(b => b.checkOut === today).length;
  const totalRevenue = (bookings || []).reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <p className="text-slate-400">{t.subtitle}</p>
        </div>
        <Button onClick={handleSync} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t.sync}
        </Button>
      </div>

      {/* Connection Status */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Supabase {t.connected}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {connectionStatus?.connected ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t.connected}
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t.disconnected}
              </Badge>
            )}
            <span className="text-sm text-slate-400">
              {t.tables}: {connectionStatus?.tablesConfigured?.join(", ") || "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t.bookings}</p>
                <p className="text-3xl font-bold text-white">{bookings?.length || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t.today} (In/Out)</p>
                <p className="text-3xl font-bold text-white">{todayArrivals}/{todayDepartures}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{language === "ka" ? "შემოსავალი" : "Revenue"}</p>
                <p className="text-3xl font-bold text-white">₾{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">{language === "ka" ? "ბოლო ჯავშნები" : "Recent Bookings"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(bookings || []).slice(0, 5).map((booking, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-white">{booking.guestName}</p>
                  <p className="text-sm text-slate-400">{booking.room} • {booking.source}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{booking.checkIn} → {booking.checkOut}</p>
                  <p className="text-sm text-emerald-400">₾{booking.amount}</p>
                </div>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <p className="text-slate-500 text-center py-4">
                {language === "ka" ? "ჯავშნები არ მოიძებნა" : "No bookings found"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
