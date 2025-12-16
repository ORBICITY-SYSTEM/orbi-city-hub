import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, Calendar, Euro, Building2, Activity, BarChart3, Search, Filter, ChevronLeft, ChevronRight, User, MapPin, Clock, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const OTADashboard = () => {
  const [syncing, setSyncing] = useState(false);

  // Fetch OTA channel data from database
  const { data: channels = [], isLoading: channelsLoading, refetch: refetchChannels } = trpc.ota.getChannels.useQuery();
  const { data: totals, isLoading: totalsLoading } = trpc.ota.getTotals.useQuery();
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsSearch, setBookingsSearch] = useState("");
  const [bookingsChannel, setBookingsChannel] = useState("all");
  const [bookingsStatus, setBookingsStatus] = useState("all");
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.ota.getBookings.useQuery({
    page: bookingsPage,
    limit: 15,
    search: bookingsSearch,
    channel: bookingsChannel === "all" ? undefined : bookingsChannel,
    status: bookingsStatus === "all" ? undefined : bookingsStatus
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      await refetchChannels();
      toast.success("სინქრონიზაცია დასრულდა", {
        description: "OTA არხების მონაცემები განახლდა"
      });
    } catch (error) {
      toast.error("სინქრონიზაცია ვერ მოხერხდა");
    } finally {
      setSyncing(false);
    }
  };

  // Prepare chart data
  const chartData = (channels as any[]).map((ch: any) => ({
    name: ch.name,
    bookings: ch.total_bookings,
    revenue: parseFloat(ch.total_revenue) || 0,
    nights: ch.total_nights,
    avgRevenue: parseFloat(ch.avg_revenue) || 0
  }));

  const pieData = chartData.map((ch, idx) => ({
    name: ch.name,
    value: ch.revenue,
    color: COLORS[idx % COLORS.length]
  }));

  const totalBookings = totals?.total_bookings || 0;
  const totalRevenue = parseFloat(totals?.total_revenue as string) || 0;
  const totalNights = totals?.total_nights || 0;
  const activeChannels = totals?.active_channels || 0;
  const avgRevenue = totalBookings > 0 ? totalRevenue / Number(totalBookings) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
            className="gap-2 bg-cyan-600 hover:bg-cyan-700"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">{Number(totalBookings).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                0 cancelled
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">
                  €{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg: €{avgRevenue.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Nights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">{Number(totalNights).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all bookings
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">
                  {Number(activeChannels)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                OTA platforms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Channel Bar Chart */}
          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                Revenue by Channel
              </CardTitle>
              <CardDescription>Total revenue from each OTA platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2' }}
                    />
                    <Bar dataKey="revenue" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Distribution Pie Chart */}
          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Revenue Distribution
              </CardTitle>
              <CardDescription>Share of revenue by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance Table */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Revenue and booking count by OTA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {chartData
                .sort((a, b) => b.revenue - a.revenue)
                .map((channel, idx) => (
                  <Card key={channel.name} className="border-cyan-500/20 bg-slate-800/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{channel.name}</h3>
                        <Badge className="bg-cyan-600">{channel.bookings}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-cyan-400">
                        €{channel.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{channel.nights} nights</span>
                        <span>Avg: €{channel.avgRevenue.toFixed(0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel Details Table */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Detailed Channel Statistics</CardTitle>
            <CardDescription>Complete breakdown of all OTA channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Channel</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Bookings</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Nights</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Avg/Booking</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((channel) => (
                      <tr key={channel.name} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium text-white">{channel.name}</td>
                        <td className="text-right py-3 px-4">{channel.bookings.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-cyan-400 font-semibold">
                          €{channel.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4">{channel.nights.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">€{channel.avgRevenue.toFixed(0)}</td>
                        <td className="text-right py-3 px-4">
                          {totalRevenue > 0 ? ((channel.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-cyan-500/50 bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white">TOTAL</td>
                    <td className="text-right py-3 px-4 font-bold">{Number(totalBookings).toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold text-cyan-400">
                      €{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right py-3 px-4 font-bold">{Number(totalNights).toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold">€{avgRevenue.toFixed(0)}</td>
                    <td className="text-right py-3 px-4 font-bold">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Individual Bookings Table */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Individual booking details with guest information</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    const dataToExport = (bookingsData?.bookings || []).map((b: any) => ({
                      'Booking #': b.booking_number,
                      'Guest Name': b.guest_name,
                      'Room': b.room_number,
                      'Channel': b.channel,
                      'Check-in': b.check_in,
                      'Check-out': b.check_out,
                      'Nights': b.nights,
                      'Amount (€)': b.amount,
                      'Status': b.status
                    }));
                    const ws = XLSX.utils.json_to_sheet(dataToExport);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
                    const filterInfo = `${bookingsChannel !== 'all' ? bookingsChannel : 'All'}_${bookingsStatus !== 'all' ? bookingsStatus : 'All'}`;
                    XLSX.writeFile(wb, `OTA_Bookings_${filterInfo}_${new Date().toISOString().split('T')[0]}.xlsx`);
                    toast.success('ექსპორტი დასრულდა', { description: `${dataToExport.length} ჯავშანი ექსპორტირებულია` });
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-cyan-500/50 hover:bg-cyan-500/10"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guest, booking #..."
                    value={bookingsSearch}
                    onChange={(e) => { setBookingsSearch(e.target.value); setBookingsPage(1); }}
                    className="pl-9 w-[200px] bg-slate-800 border-slate-700"
                  />
                </div>
                <Select value={bookingsChannel} onValueChange={(v) => { setBookingsChannel(v); setBookingsPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="Booking.com">Booking.com</SelectItem>
                    <SelectItem value="Expedia">Expedia</SelectItem>
                    <SelectItem value="Agoda">Agoda</SelectItem>
                    <SelectItem value="Airbnb">Airbnb</SelectItem>
                    <SelectItem value="Ostrovok">Ostrovok</SelectItem>
                    <SelectItem value="Sutochno">Sutochno</SelectItem>
                    <SelectItem value="Hostelworld">Hostelworld</SelectItem>
                    <SelectItem value="Tvil.ru">Tvil.ru</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bookingsStatus} onValueChange={(v) => { setBookingsStatus(v); setBookingsPage(1); }}>
                  <SelectTrigger className="w-[130px] bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-cyan-500/30">
                        <TableHead className="text-muted-foreground">Booking #</TableHead>
                        <TableHead className="text-muted-foreground">Guest</TableHead>
                        <TableHead className="text-muted-foreground">Room</TableHead>
                        <TableHead className="text-muted-foreground">Channel</TableHead>
                        <TableHead className="text-muted-foreground">Check-in</TableHead>
                        <TableHead className="text-muted-foreground">Check-out</TableHead>
                        <TableHead className="text-muted-foreground">Nights</TableHead>
                        <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(bookingsData?.bookings || []).map((booking: any) => (
                        <TableRow key={booking.id} className="border-slate-700/50 hover:bg-slate-800/50">
                          <TableCell className="font-mono text-cyan-400">{booking.booking_number}</TableCell>
                          <TableCell className="font-medium text-white">{booking.guest_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {booking.room_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-cyan-500/50">{booking.channel}</Badge>
                          </TableCell>
                          <TableCell>{new Date(booking.check_in).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(booking.check_out).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {booking.nights}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-cyan-400">€{Number(booking.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={booking.status === 'completed' ? 'bg-green-600' : booking.status === 'confirmed' ? 'bg-blue-600' : 'bg-red-600'}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-muted-foreground">
                    Showing {((bookingsPage - 1) * 15) + 1} - {Math.min(bookingsPage * 15, bookingsData?.total || 0)} of {bookingsData?.total || 0} bookings
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                      disabled={bookingsPage === 1}
                      className="border-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      Page {bookingsPage} of {bookingsData?.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBookingsPage(p => Math.min(bookingsData?.totalPages || 1, p + 1))}
                      disabled={bookingsPage >= (bookingsData?.totalPages || 1)}
                      className="border-slate-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTADashboard;
