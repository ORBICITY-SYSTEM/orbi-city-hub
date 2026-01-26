import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database, RefreshCw,
  Calendar, Users, TrendingUp,
  LogIn, LogOut
} from "lucide-react";
import {
  useOtelmsConnection,
  useCalendarBookings,
  useTodayOperations,
  useRListBookings,
} from "@/hooks/useOtelmsData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/PageHeader";

const FinanceOtelMS = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("today");

  // Supabase connection check
  const connectionQuery = useOtelmsConnection();

  // OtelMS data from Supabase
  const calendarQuery = useCalendarBookings();
  const todayOpsQuery = useTodayOperations();
  const rlistQuery = useRListBookings("checkin");

  const handleRefresh = () => {
    connectionQuery.refetch();
    calendarQuery.refetch();
    todayOpsQuery.refetch();
    rlistQuery.refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      'Booking.com': 'bg-blue-500',
      'Airbnb': 'bg-red-500',
      'Direct': 'bg-green-500',
      'Expedia': 'bg-yellow-500',
    };
    return (
      <Badge className={`${colors[source] || 'bg-gray-500'} text-white`}>
        {source}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="OtelMS Integration"
        titleKa="OtelMS ინტეგრაცია"
        subtitle="Supabase financial data integration"
        subtitleKa="Supabase ფინანსური მონაცემების ინტეგრაცია"
        icon={TrendingUp}
        iconGradient="from-blue-500 to-indigo-600"
        dataSource={{
          type: connectionQuery.data?.connected ? "live" : "error",
          source: "Supabase"
        }}
        backUrl="/finance"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={calendarQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${calendarQuery.isFetching ? 'animate-spin' : ''}`} />
            {t("განახლება", "Refresh")}
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <LogIn className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("დღევანდელი შემოსვლები", "Today's Arrivals")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {todayOpsQuery.data?.arrivals?.length ?? '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/20">
                  <LogOut className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("დღევანდელი გასვლები", "Today's Departures")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {todayOpsQuery.data?.departures?.length ?? '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ჯავშნები", "Bookings")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {calendarQuery.data?.length ?? '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Database className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("კონფიგურირებული ტაბულები", "Tables Configured")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {connectionQuery.data?.tablesConfigured?.length ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-white/10">
            <TabsTrigger value="today" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {t("დღევანდელი", "Today")}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {t("კალენდარი", "Calendar")}
            </TabsTrigger>
            <TabsTrigger value="rlist" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {t("RList", "RList")}
            </TabsTrigger>
          </TabsList>

          {/* Today's Operations */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Arrivals */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <LogIn className="h-5 w-5" />
                    {t("შემოსვლები", "Arrivals")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayOpsQuery.isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : todayOpsQuery.data?.arrivals?.length ? (
                    <div className="space-y-3">
                      {todayOpsQuery.data.arrivals.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.text}</p>
                            <p className="text-sm text-muted-foreground">{t("ოთახი", "Room")}: {item.room}</p>
                          </div>
                          <Badge variant="outline">{item.bookingId}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {t("დღეს შემოსვლები არ არის", "No arrivals today")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Departures */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <LogOut className="h-5 w-5" />
                    {t("გასვლები", "Departures")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayOpsQuery.isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : todayOpsQuery.data?.departures?.length ? (
                    <div className="space-y-3">
                      {todayOpsQuery.data.departures.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.text}</p>
                            <p className="text-sm text-muted-foreground">{t("ოთახი", "Room")}: {item.room}</p>
                          </div>
                          <Badge variant="outline">{item.bookingId}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {t("დღეს გასვლები არ არის", "No departures today")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Bookings */}
          <TabsContent value="calendar">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t("კალენდარის ჯავშნები", "Calendar Bookings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calendarQuery.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : calendarQuery.data?.length ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("ID", "ID")}</TableHead>
                          <TableHead>{t("სტუმარი", "Guest")}</TableHead>
                          <TableHead>{t("ოთახი", "Room")}</TableHead>
                          <TableHead>{t("წყარო", "Source")}</TableHead>
                          <TableHead>{t("შესვლა", "Check-in")}</TableHead>
                          <TableHead>{t("გასვლა", "Check-out")}</TableHead>
                          <TableHead>{t("ბალანსი", "Balance")}</TableHead>
                          <TableHead>{t("სტატუსი", "Status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calendarQuery.data.slice(0, 20).map((booking, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{booking.bookingId}</TableCell>
                            <TableCell>{booking.guestName}</TableCell>
                            <TableCell>{booking.room}</TableCell>
                            <TableCell>{getSourceBadge(booking.source)}</TableCell>
                            <TableCell>{booking.checkIn}</TableCell>
                            <TableCell>{booking.checkOut}</TableCell>
                            <TableCell className={booking.balance > 0 ? 'text-red-400' : 'text-green-400'}>
                              {formatCurrency(booking.balance)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t("მონაცემები არ მოიძებნა", "No data found")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RList Bookings */}
          <TabsContent value="rlist">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("RList ჯავშნები", "RList Bookings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rlistQuery.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : rlistQuery.data?.length ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("ოთახი", "Room")}</TableHead>
                          <TableHead>{t("სტუმარი", "Guest")}</TableHead>
                          <TableHead>{t("წყარო", "Source")}</TableHead>
                          <TableHead>{t("შესვლა", "Check-in")}</TableHead>
                          <TableHead>{t("ღამეები", "Nights")}</TableHead>
                          <TableHead>{t("თანხა", "Amount")}</TableHead>
                          <TableHead>{t("გადახდილი", "Paid")}</TableHead>
                          <TableHead>{t("ბალანსი", "Balance")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rlistQuery.data.slice(0, 20).map((booking, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{booking.room}</TableCell>
                            <TableCell>{booking.guest}</TableCell>
                            <TableCell>{getSourceBadge(booking.source)}</TableCell>
                            <TableCell>{booking.checkIn}</TableCell>
                            <TableCell>{booking.nights}</TableCell>
                            <TableCell>{formatCurrency(booking.amount)}</TableCell>
                            <TableCell className="text-green-400">{formatCurrency(booking.paid)}</TableCell>
                            <TableCell className={booking.balance > 0 ? 'text-red-400' : 'text-green-400'}>
                              {formatCurrency(booking.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t("მონაცემები არ მოიძებნა", "No data found")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Connection Info */}
        {connectionQuery.data && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase {t("კონფიგურაცია", "Configuration")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("სტატუსი", "Status")}</p>
                  <p className="font-medium">
                    {connectionQuery.data.connected ? (
                      <span className="text-green-400">{t("დაკავშირებული", "Connected")}</span>
                    ) : (
                      <span className="text-red-400">{connectionQuery.data.error}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("მონაცემთა წყარო", "Data Source")}</p>
                  <p className="font-mono text-xs">{connectionQuery.data.spreadsheetId || 'Supabase'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("ტაბულები", "Tables")}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {connectionQuery.data.tablesConfigured?.map((table) => (
                      <Badge key={table} variant="outline" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FinanceOtelMS;
