import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Building2, Database, RefreshCw,
  Calendar, Users, DollarSign, TrendingUp,
  Plane, LogIn, LogOut, AlertCircle, CheckCircle2
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

const FinanceOtelMS = () => {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("today");

  // ROWS.COM connection check
  const connectionQuery = trpc.rows.checkConnection.useQuery();

  // OtelMS data from ROWS.COM
  const calendarQuery = trpc.rows.getCalendarBookings.useQuery(undefined, {
    enabled: connectionQuery.data?.connected === true,
  });

  const todayOpsQuery = trpc.rows.getTodayOperations.useQuery(undefined, {
    enabled: connectionQuery.data?.connected === true,
  });

  const rlistQuery = trpc.rows.getRListBookings.useQuery(
    { sortType: "checkin" },
    { enabled: connectionQuery.data?.connected === true }
  );

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
      <header className="border-b border-white/10 bg-blue-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/finance")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("უკან", "Back")}
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    OtelMS + ROWS.COM
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {t("რეალურ დროში მონაცემები", "Real-time Data")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DataSourceBadge
                type={connectionQuery.data?.connected ? "live" : "error"}
                source="ROWS.COM"
                size="md"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={calendarQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${calendarQuery.isFetching ? 'animate-spin' : ''}`} />
                {t("განახლება", "Refresh")}
              </Button>
            </div>
          </div>
        </div>
      </header>

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
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="today">
              {t("დღევანდელი", "Today")}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              {t("კალენდარი", "Calendar")}
            </TabsTrigger>
            <TabsTrigger value="rlist">
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
                ROWS.COM {t("კონფიგურაცია", "Configuration")}
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
                  <p className="text-sm text-muted-foreground">Spreadsheet ID</p>
                  <p className="font-mono text-xs">{connectionQuery.data.spreadsheetId || '-'}</p>
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
