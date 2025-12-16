import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp, Calendar, Euro, Building2, Activity } from "lucide-react";
import { format } from "date-fns";

const OTADashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["ota-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("email_received_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch sync logs
  const { data: syncLogs = [] } = useQuery({
    queryKey: ["sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-ota-bookings");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "✓ Sync Complete",
        description: `${data.new_bookings} new bookings imported`,
      });
      queryClient.invalidateQueries({ queryKey: ["ota-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
      setSyncing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setSyncing(false);
    },
  });

  const handleSync = () => {
    setSyncing(true);
    syncMutation.mutate();
  };

  // Calculate KPIs
  const activeBookings = bookings.filter(b => !b.cancelled);
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalNights = activeBookings.reduce((sum, b) => sum + (b.nights || 0), 0);
  const avgBookingValue = activeBookings.length > 0 ? totalRevenue / activeBookings.length : 0;

  // Channel breakdown
  const channelStats = activeBookings.reduce((acc, booking) => {
    const channel = booking.channel;
    if (!acc[channel]) {
      acc[channel] = { count: 0, revenue: 0 };
    }
    acc[channel].count++;
    acc[channel].revenue += booking.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const lastSync = syncLogs[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Orbi OTA Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time booking analytics across all channels
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            size="lg"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        {/* Sync Status */}
        {lastSync && (
          <Card className="border-primary/20">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm">
                  Last sync: {format(new Date(lastSync.started_at), "MMM dd, HH:mm")}
                </span>
                <Badge variant={lastSync.status === 'completed' ? 'default' : 'destructive'}>
                  {lastSync.status}
                </Badge>
              </div>
              {lastSync.new_bookings > 0 && (
                <span className="text-sm text-muted-foreground">
                  +{lastSync.new_bookings} new bookings
                </span>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{activeBookings.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {bookings.filter(b => b.cancelled).length} cancelled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">
                  {totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg: €{avgBookingValue.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Nights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{totalNights}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">
                  {Object.keys(channelStats).length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                OTA platforms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Revenue and booking count by OTA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(channelStats)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([channel, stats]) => (
                  <Card key={channel} className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{channel}</h3>
                        <Badge>{stats.count}</Badge>
                      </div>
                      <p className="text-2xl font-bold">
                        €{stats.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: €{(stats.revenue / stats.count).toFixed(0)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest reservations from all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                {Object.keys(channelStats).map(channel => (
                  <TabsTrigger key={channel} value={channel}>
                    {channel}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-3">
                  {bookings.slice(0, 20).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline">{booking.channel}</Badge>
                          <span className="font-medium">{booking.guest_name || "Guest"}</span>
                          {booking.cancelled && (
                            <Badge variant="destructive">Cancelled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.subject}
                        </p>
                        {booking.checkin && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(booking.checkin), "MMM dd")} → 
                            {booking.checkout && ` ${format(new Date(booking.checkout), "MMM dd")}`}
                            {booking.nights && ` (${booking.nights} nights)`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {booking.amount ? `€${booking.amount.toFixed(0)}` : "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.email_received_at), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {Object.keys(channelStats).map(channel => (
                <TabsContent key={channel} value={channel}>
                  <div className="space-y-3">
                    {bookings
                      .filter(b => b.channel === channel)
                      .slice(0, 20)
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium">{booking.guest_name || "Guest"}</span>
                              {booking.cancelled && (
                                <Badge variant="destructive">Cancelled</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.subject}
                            </p>
                            {booking.checkin && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(booking.checkin), "MMM dd")} → 
                                {booking.checkout && ` ${format(new Date(booking.checkout), "MMM dd")}`}
                                {booking.nights && ` (${booking.nights} nights)`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {booking.amount ? `€${booking.amount.toFixed(0)}` : "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(booking.email_received_at), "MMM dd, HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTADashboard;
