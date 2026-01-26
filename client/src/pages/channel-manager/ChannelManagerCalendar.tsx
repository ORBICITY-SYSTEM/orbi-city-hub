import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, Calendar, User, Home, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalendarBookings, useTodayOperations } from "@/hooks/useOtelmsData";
import { toast } from "sonner";

export default function ChannelManagerCalendar() {
  const { language } = useLanguage();
  const otelmsApiUrl = import.meta.env.VITE_OTELMS_API_URL;

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useCalendarBookings();
  const { data: todayOps, isLoading: todayLoading, refetch: refetchToday } = useTodayOperations();

  const handleSync = () => {
    refetchBookings();
    refetchToday();
    toast.success(language === "ka" ? "კალენდარი განახლდა!" : "Calendar synced!");
  };

  const isLoading = bookingsLoading || todayLoading;

  const t = {
    title: language === "ka" ? "არხების მენეჯერი - კალენდარი" : "Channel Manager - Calendar",
    subtitle: language === "ka" ? "Supabase-დან ლაივ კალენდარი" : "Live calendar from Supabase",
    sync: language === "ka" ? "სინქრონიზაცია" : "Sync Calendar",
    arrivals: language === "ka" ? "დღევანდელი ჩამოსვლები" : "Today's Arrivals",
    departures: language === "ka" ? "დღევანდელი გასვლები" : "Today's Departures",
    upcoming: language === "ka" ? "მომავალი ჯავშნები" : "Upcoming Bookings",
    noData: language === "ka" ? "მონაცემები არ არის" : "No data",
  };

  // Get platform badge color
  const getPlatformColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("booking")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (s.includes("airbnb")) return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    if (s.includes("expedia")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <p className="text-slate-400">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t.sync}
          </Button>
          {otelmsApiUrl && (
            <Button variant="outline" asChild className="border-slate-700">
              <a href={otelmsApiUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                OtelMS API
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Today's Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arrivals */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              {t.arrivals} ({todayOps?.arrivals?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(todayOps?.arrivals || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{item.text}</span>
                  </div>
                  <Badge variant="outline" className="border-slate-600">
                    <Home className="w-3 h-3 mr-1" />
                    {item.room}
                  </Badge>
                </div>
              ))}
              {(!todayOps?.arrivals || todayOps.arrivals.length === 0) && (
                <p className="text-slate-500 text-center py-4">{t.noData}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Departures */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 rotate-180" />
              {t.departures} ({todayOps?.departures?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(todayOps?.departures || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{item.text}</span>
                  </div>
                  <Badge variant="outline" className="border-slate-600">
                    <Home className="w-3 h-3 mr-1" />
                    {item.room}
                  </Badge>
                </div>
              ))}
              {(!todayOps?.departures || todayOps.departures.length === 0) && (
                <p className="text-slate-500 text-center py-4">{t.noData}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings Calendar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.upcoming}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">{language === "ka" ? "სტუმარი" : "Guest"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">{language === "ka" ? "ოთახი" : "Room"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">{language === "ka" ? "წყარო" : "Source"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">{language === "ka" ? "ჩექინი" : "Check-in"}</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">{language === "ka" ? "ჩექაუთი" : "Check-out"}</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">{language === "ka" ? "თანხა" : "Amount"}</th>
                </tr>
              </thead>
              <tbody>
                {(bookings || []).slice(0, 15).map((booking, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-white">{booking.guestName}</td>
                    <td className="py-2 px-3 text-slate-300">{booking.room}</td>
                    <td className="py-2 px-3">
                      <Badge className={getPlatformColor(booking.source)}>{booking.source}</Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{booking.checkIn}</td>
                    <td className="py-2 px-3 text-slate-300">{booking.checkOut}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">₾{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!bookings || bookings.length === 0) && (
              <p className="text-slate-500 text-center py-8">{t.noData}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
