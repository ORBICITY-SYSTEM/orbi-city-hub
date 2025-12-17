import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, TrendingDown, Calendar, DollarSign, Building2, Activity, BarChart3, Search, Filter, ChevronLeft, ChevronRight, User, MapPin, Clock, Download, Brain, Sparkles, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, ComposedChart } from "recharts";

// Channel first booking dates and colors
const channelInfo: Record<string, { firstDate: string; color: string }> = {
  'Booking.com': { firstDate: '2024-12-17', color: '#003580' },
  'Expedia': { firstDate: '2024-12-23', color: '#FFCC00' },
  'Agoda': { firstDate: '2025-07-04', color: '#5C2D91' },
  'Ostrovok': { firstDate: '2025-06-08', color: '#FF6B35' },
  'Airbnb': { firstDate: '2025-05-13', color: '#FF5A5F' },
  'Sutochno': { firstDate: '2025-08-13', color: '#00A86B' },
  'Hostelworld': { firstDate: '2025-07-13', color: '#F47B20' },
  'Tvil.ru': { firstDate: '2025-10-23', color: '#1E90FF' }
};

const MONTHS = [
  { value: '2024-12', label: 'დეკემბერი 2024' },
  { value: '2025-01', label: 'იანვარი 2025' },
  { value: '2025-02', label: 'თებერვალი 2025' },
  { value: '2025-03', label: 'მარტი 2025' },
  { value: '2025-04', label: 'აპრილი 2025' },
  { value: '2025-05', label: 'მაისი 2025' },
  { value: '2025-06', label: 'ივნისი 2025' },
  { value: '2025-07', label: 'ივლისი 2025' },
  { value: '2025-08', label: 'აგვისტო 2025' },
  { value: '2025-09', label: 'სექტემბერი 2025' },
  { value: '2025-10', label: 'ოქტომბერი 2025' },
  { value: '2025-11', label: 'ნოემბერი 2025' },
  { value: '2025-12', label: 'დეკემბერი 2025' },
];

// EUR to GEL conversion rate (approximate)
const EUR_TO_GEL = 2.95;

export default function OTADashboard() {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsChannel, setBookingsChannel] = useState('all');
  const [bookingsStatus, setBookingsStatus] = useState('all');
  const [bookingsPage, setBookingsPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'channels' | 'ai'>('overview');

  // Fetch OTA data
  const { data: channelsData, isLoading: channelsLoading, refetch } = trpc.ota.getChannels.useQuery();
  const { data: monthlyData, isLoading: monthlyLoading } = trpc.ota.getMonthlyStats.useQuery();
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.ota.getBookings.useQuery({
    search: bookingsSearch,
    channel: bookingsChannel,
    status: bookingsStatus,
    page: bookingsPage,
    limit: 15
  });

  // Convert EUR to GEL
  const toGEL = (eur: number) => eur * EUR_TO_GEL;

  // Filter data by selected months
  const filteredMonthlyData = useMemo(() => {
    if (!monthlyData?.stats) return [];
    if (selectedMonths.length === 0) return monthlyData.stats;
    return monthlyData.stats.filter((s: any) => selectedMonths.includes(s.month));
  }, [monthlyData, selectedMonths]);

  // Calculate totals based on filtered data
  const totals = useMemo(() => {
    if (filteredMonthlyData.length === 0 && channelsData?.channels) {
      // Use all data if no filter
      const channels = channelsData.channels;
      return {
        bookings: channels.reduce((sum: number, c: any) => sum + c.bookings, 0),
        revenue: toGEL(channels.reduce((sum: number, c: any) => sum + c.revenue, 0)),
        nights: channels.reduce((sum: number, c: any) => sum + c.nights, 0),
        activeChannels: channels.length
      };
    }
    return {
      bookings: filteredMonthlyData.reduce((sum: number, s: any) => sum + s.bookings, 0),
      revenue: toGEL(filteredMonthlyData.reduce((sum: number, s: any) => sum + Number(s.revenue), 0)),
      nights: filteredMonthlyData.reduce((sum: number, s: any) => sum + s.nights, 0),
      activeChannels: new Set(filteredMonthlyData.map((s: any) => s.channel)).size
    };
  }, [filteredMonthlyData, channelsData]);

  // Chart data by channel (filtered)
  const chartData = useMemo(() => {
    if (filteredMonthlyData.length === 0 && channelsData?.channels) {
      return channelsData.channels.map((c: any) => ({
        name: c.channel,
        bookings: c.bookings,
        revenue: toGEL(c.revenue),
        nights: c.nights,
        avgRevenue: toGEL(c.bookings > 0 ? c.revenue / c.bookings : 0),
        avgPerNight: toGEL(c.nights > 0 ? c.revenue / c.nights : 0),
        color: channelInfo[c.channel]?.color || '#666'
      }));
    }
    
    const grouped: Record<string, any> = {};
    filteredMonthlyData.forEach((s: any) => {
      if (!grouped[s.channel]) {
        grouped[s.channel] = { bookings: 0, revenue: 0, nights: 0 };
      }
      grouped[s.channel].bookings += s.bookings;
      grouped[s.channel].revenue += Number(s.revenue);
      grouped[s.channel].nights += s.nights;
    });
    
    return Object.entries(grouped).map(([channel, data]: [string, any]) => ({
      name: channel,
      bookings: data.bookings,
      revenue: toGEL(data.revenue),
      nights: data.nights,
      avgRevenue: toGEL(data.bookings > 0 ? data.revenue / data.bookings : 0),
      avgPerNight: toGEL(data.nights > 0 ? data.revenue / data.nights : 0),
      color: channelInfo[channel]?.color || '#666'
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredMonthlyData, channelsData]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    if (!monthlyData?.stats) return [];
    
    const grouped: Record<string, any> = {};
    monthlyData.stats.forEach((s: any) => {
      if (!grouped[s.month]) {
        grouped[s.month] = { month: s.month, bookings: 0, revenue: 0, nights: 0 };
      }
      grouped[s.month].bookings += s.bookings;
      grouped[s.month].revenue += Number(s.revenue);
      grouped[s.month].nights += s.nights;
    });
    
    return Object.values(grouped)
      .map((d: any) => ({
        ...d,
        revenue: toGEL(d.revenue),
        avgPerNight: toGEL(d.nights > 0 ? d.revenue / d.nights : 0),
        label: MONTHS.find(m => m.value === d.month)?.label.split(' ')[0] || d.month
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlyData]);

  // Channel monthly breakdown for comparison
  const channelMonthlyData = useMemo(() => {
    if (!monthlyData?.stats) return [];
    return monthlyData.stats.map((s: any) => ({
      ...s,
      revenue: toGEL(Number(s.revenue)),
      avgPerNight: toGEL(s.nights > 0 ? Number(s.revenue) / s.nights : 0)
    }));
  }, [monthlyData]);

  // AI Analysis for each channel
  const generateAIAnalysis = (channel: string) => {
    const info = channelInfo[channel];
    if (!info) return null;
    
    const channelData = chartData.find(c => c.name === channel);
    const monthlyChannelData = channelMonthlyData.filter(m => m.channel === channel);
    
    if (!channelData || monthlyChannelData.length === 0) return null;
    
    const firstDate = new Date(info.firstDate);
    const today = new Date();
    const daysActive = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsActive = Math.ceil(daysActive / 30);
    
    // Calculate growth
    const sortedMonths = [...monthlyChannelData].sort((a, b) => a.month.localeCompare(b.month));
    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const revenueGrowth = firstMonth && lastMonth && firstMonth.revenue > 0 
      ? ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue * 100).toFixed(0)
      : 'N/A';
    
    // Best performing month
    const bestMonth = [...monthlyChannelData].sort((a, b) => b.revenue - a.revenue)[0];
    const bestMonthLabel = MONTHS.find(m => m.value === bestMonth?.month)?.label || bestMonth?.month;
    
    // Average metrics
    const avgBookingsPerMonth = (channelData.bookings / monthsActive).toFixed(1);
    const avgRevenuePerMonth = (channelData.revenue / monthsActive).toFixed(0);
    
    return {
      channel,
      firstDate: info.firstDate,
      daysActive,
      monthsActive,
      totalBookings: channelData.bookings,
      totalRevenue: channelData.revenue,
      totalNights: channelData.nights,
      avgPerBooking: channelData.avgRevenue,
      avgPerNight: channelData.avgPerNight,
      revenueGrowth,
      bestMonth: bestMonthLabel,
      bestMonthRevenue: bestMonth?.revenue || 0,
      avgBookingsPerMonth,
      avgRevenuePerMonth,
      color: info.color
    };
  };

  const aiAnalyses = useMemo(() => {
    return Object.keys(channelInfo)
      .map(channel => generateAIAnalysis(channel))
      .filter(Boolean)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  }, [chartData, channelMonthlyData]);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await refetch();
    setSyncing(false);
    toast.success('სინქრონიზაცია დასრულდა', { description: 'ყველა OTA არხი განახლდა' });
  };

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const clearFilters = () => setSelectedMonths([]);

  const totalRevenue = totals.revenue;
  const avgRevenue = totals.bookings > 0 ? totals.revenue / totals.bookings : 0;

  if (channelsLoading || monthlyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Orbi OTA Command Center
            </h1>
            <p className="text-muted-foreground mt-1">რეალური ჯავშნების ანალიტიკა ყველა არხზე</p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'სინქრონიზაცია...' : 'სინქრონიზაცია'}
          </Button>
        </div>

        {/* Month Filters */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-400" />
                თვეების ფილტრი
              </CardTitle>
              {selectedMonths.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-cyan-400">
                  გასუფთავება ({selectedMonths.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MONTHS.map(month => (
                <Button
                  key={month.value}
                  variant={selectedMonths.includes(month.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMonth(month.value)}
                  className={selectedMonths.includes(month.value) 
                    ? "bg-cyan-500 hover:bg-cyan-600" 
                    : "border-slate-700 hover:border-cyan-500"}
                >
                  {month.label}
                </Button>
              ))}
            </div>
            {selectedMonths.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                არჩეულია: {selectedMonths.map(m => MONTHS.find(x => x.value === m)?.label).join(', ')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">სულ ჯავშნები</p>
                  <p className="text-3xl font-bold text-white">{totals.bookings.toLocaleString()}</p>
                </div>
                <Calendar className="h-10 w-10 text-cyan-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">სულ შემოსავალი</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    ₾{totals.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">საშ: ₾{avgRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-emerald-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">სულ ღამეები</p>
                  <p className="text-3xl font-bold text-purple-400">{totals.nights.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">საშ: ₾{(totals.revenue / totals.nights).toFixed(0)}/ღამე</p>
                </div>
                <Building2 className="h-10 w-10 text-purple-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">აქტიური არხები</p>
                  <p className="text-3xl font-bold text-orange-400">{totals.activeChannels}</p>
                  <p className="text-xs text-muted-foreground">OTA პლატფორმა</p>
                </div>
                <Activity className="h-10 w-10 text-orange-400 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          {[
            { id: 'overview', label: 'მიმოხილვა', icon: BarChart3 },
            { id: 'monthly', label: 'თვიური ანალიზი', icon: Calendar },
            { id: 'channels', label: 'არხების შედარება', icon: TrendingUp },
            { id: 'ai', label: 'AI ანალიზი', icon: Brain }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? "bg-cyan-500" : ""}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Channel */}
              <Card className="border-cyan-500/30 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    შემოსავალი არხების მიხედვით
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} />
                      <Tooltip 
                        formatter={(value: number) => [`₾${value.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`, 'შემოსავალი']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      />
                      <Bar dataKey="revenue" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Distribution Pie */}
              <Card className="border-cyan-500/30 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    შემოსავლის განაწილება
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`₾${value.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`, 'შემოსავალი']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Channel Statistics */}
            <Card className="border-cyan-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle>დეტალური არხების სტატისტიკა</CardTitle>
                <CardDescription>სრული ანალიზი ყველა OTA არხზე</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cyan-500/30">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">არხი</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">ჯავშნები</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">შემოსავალი</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">ღამეები</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">საშ/ჯავშანი</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">საშ/ღამე</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">წილი</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((channel) => (
                        <tr key={channel.name} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                              <span className="font-medium text-white">{channel.name}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">{channel.bookings.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-emerald-400 font-semibold">
                            ₾{channel.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="text-right py-3 px-4">{channel.nights.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">₾{channel.avgRevenue.toFixed(0)}</td>
                          <td className="text-right py-3 px-4">₾{channel.avgPerNight.toFixed(0)}</td>
                          <td className="text-right py-3 px-4">
                            {totalRevenue > 0 ? ((channel.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-cyan-500/50 bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">სულ</td>
                        <td className="text-right py-3 px-4 font-bold">{totals.bookings.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-bold text-emerald-400">
                          ₾{totalRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4 font-bold">{totals.nights.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-bold">₾{avgRevenue.toFixed(0)}</td>
                        <td className="text-right py-3 px-4 font-bold">₾{(totalRevenue / totals.nights).toFixed(0)}</td>
                        <td className="text-right py-3 px-4 font-bold">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Additional Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Price per Night by Channel */}
              <Card className="border-cyan-500/30 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                    საშუალო ფასი ღამეში (არხების მიხედვით)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.sort((a, b) => b.avgPerNight - a.avgPerNight)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${v}`} />
                      <Tooltip 
                        formatter={(value: number) => [`₾${value.toFixed(0)}`, 'საშ/ღამე']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      />
                      <Bar dataKey="avgPerNight" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bookings vs Revenue Comparison */}
              <Card className="border-cyan-500/30 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    ჯავშნები vs შემოსავალი
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" stroke="#94a3b8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Bar yAxisId="left" dataKey="bookings" fill="#8b5cf6" name="ჯავშნები" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} name="შემოსავალი" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Monthly Tab */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            {/* Monthly Revenue Trend */}
            <Card className="border-cyan-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  თვიური შემოსავლის ტრენდი
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `₾${value.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`,
                        name === 'revenue' ? 'შემოსავალი' : name
                      ]}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#22d3ee" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Bookings & Nights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-cyan-500/30 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>თვიური ჯავშნები</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="bookings" fill="#8b5cf6" name="ჯავშნები" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/30 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>საშუალო ფასი ღამეში (თვეების მიხედვით)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${v}`} />
                      <Tooltip 
                        formatter={(value: number) => [`₾${value.toFixed(0)}`, 'საშ/ღამე']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      />
                      <Line type="monotone" dataKey="avgPerNight" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Breakdown Table */}
            <Card className="border-cyan-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle>თვიური დეტალური ცხრილი</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cyan-500/30">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">თვე</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">ჯავშნები</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">შემოსავალი</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">ღამეები</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">საშ/ღამე</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">ცვლილება</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyTrendData.map((month, idx) => {
                        const prevMonth = monthlyTrendData[idx - 1];
                        const change = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
                        return (
                          <tr key={month.month} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                            <td className="py-3 px-4 font-medium text-white">
                              {MONTHS.find(m => m.value === month.month)?.label || month.month}
                            </td>
                            <td className="text-right py-3 px-4">{month.bookings.toLocaleString()}</td>
                            <td className="text-right py-3 px-4 text-emerald-400 font-semibold">
                              ₾{month.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="text-right py-3 px-4">{month.nights.toLocaleString()}</td>
                            <td className="text-right py-3 px-4">₾{month.avgPerNight.toFixed(0)}</td>
                            <td className="text-right py-3 px-4">
                              {idx > 0 && (
                                <span className={`flex items-center justify-end gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                  {Math.abs(change).toFixed(0)}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Channels Comparison Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* Channel Performance Over Time */}
            <Card className="border-cyan-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  არხების შედარება დროში
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8"
                      tickFormatter={(v) => MONTHS.find(m => m.value === v)?.label.split(' ')[0] || v}
                      allowDuplicatedCategory={false}
                    />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`₾${value.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`, '']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                    <Legend />
                    {Object.keys(channelInfo).map(channel => {
                      const data = channelMonthlyData
                        .filter(m => m.channel === channel)
                        .sort((a, b) => a.month.localeCompare(b.month));
                      if (data.length === 0) return null;
                      return (
                        <Line
                          key={channel}
                          data={data}
                          type="monotone"
                          dataKey="revenue"
                          name={channel}
                          stroke={channelInfo[channel].color}
                          strokeWidth={2}
                          dot={{ fill: channelInfo[channel].color }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {chartData.map(channel => (
                <Card key={channel.name} className="border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: channel.color }} />
                      <span className="font-semibold text-white">{channel.name}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">შემოსავალი:</span>
                        <span className="text-emerald-400 font-semibold">₾{channel.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ჯავშნები:</span>
                        <span>{channel.bookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">საშ/ჯავშანი:</span>
                        <span>₾{channel.avgRevenue.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">საშ/ღამე:</span>
                        <span>₾{channel.avgPerNight.toFixed(0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  AI ანალიზი - OTA არხების ისტორია
                </CardTitle>
                <CardDescription>
                  თითოეული არხის პირველი ჯავშნიდან დღემდე დეტალური ანალიზი
                </CardDescription>
              </CardHeader>
            </Card>

            {aiAnalyses.map((analysis: any) => (
              <Card key={analysis.channel} className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: analysis.color }} />
                      <CardTitle className="text-xl">{analysis.channel}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        აქტიური {analysis.daysActive} დღე
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">
                        ₾{analysis.totalRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground">სულ შემოსავალი</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">პირველი ჯავშანი</p>
                      <p className="text-lg font-semibold text-white">{analysis.firstDate}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">სულ ჯავშნები</p>
                      <p className="text-lg font-semibold text-white">{analysis.totalBookings}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">საშ. თვეში</p>
                      <p className="text-lg font-semibold text-cyan-400">₾{analysis.avgRevenuePerMonth}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">საუკეთესო თვე</p>
                      <p className="text-lg font-semibold text-emerald-400">{analysis.bestMonth}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-purple-300 mb-1">AI ინსაითი</p>
                        <p className="text-sm text-muted-foreground">
                          {analysis.channel} არხი აქტიურია <strong>{analysis.daysActive}</strong> დღის განმავლობაში 
                          ({analysis.monthsActive} თვე). საშუალოდ თვეში მოაქვს <strong>₾{analysis.avgRevenuePerMonth}</strong> და 
                          <strong> {analysis.avgBookingsPerMonth}</strong> ჯავშანი. 
                          საშუალო შემოსავალი ჯავშანზე: <strong>₾{analysis.avgPerBooking.toFixed(0)}</strong>, 
                          ღამეზე: <strong>₾{analysis.avgPerNight.toFixed(0)}</strong>. 
                          საუკეთესო თვე იყო <strong>{analysis.bestMonth}</strong> 
                          (₾{analysis.bestMonthRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}).
                          {analysis.revenueGrowth !== 'N/A' && Number(analysis.revenueGrowth) > 0 && (
                            <span className="text-emerald-400"> ზრდა პირველი თვიდან: +{analysis.revenueGrowth}%</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Individual Bookings Table */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  ბოლო ჯავშნები
                </CardTitle>
                <CardDescription>ინდივიდუალური ჯავშნების დეტალები</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    const dataToExport = (bookingsData?.bookings || []).map((b: any) => ({
                      'ჯავშნის #': b.booking_number,
                      'სტუმარი': b.guest_name,
                      'ოთახი': b.room_number,
                      'არხი': b.channel,
                      'Check-in': b.check_in,
                      'Check-out': b.check_out,
                      'ღამეები': b.nights,
                      'თანხა (₾)': (b.amount * EUR_TO_GEL).toFixed(0),
                      'სტატუსი': b.status
                    }));
                    const ws = XLSX.utils.json_to_sheet(dataToExport);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'ჯავშნები');
                    const filterInfo = `${bookingsChannel !== 'all' ? bookingsChannel : 'ყველა'}_${bookingsStatus !== 'all' ? bookingsStatus : 'ყველა'}`;
                    XLSX.writeFile(wb, `OTA_ჯავშნები_${filterInfo}_${new Date().toISOString().split('T')[0]}.xlsx`);
                    toast.success('ექსპორტი დასრულდა', { description: `${dataToExport.length} ჯავშანი ექსპორტირებულია` });
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-cyan-500/50 hover:bg-cyan-500/10"
                >
                  <Download className="h-4 w-4" />
                  Excel ექსპორტი
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ძიება..."
                    value={bookingsSearch}
                    onChange={(e) => { setBookingsSearch(e.target.value); setBookingsPage(1); }}
                    className="pl-9 w-[200px] bg-slate-800 border-slate-700"
                  />
                </div>
                <Select value={bookingsChannel} onValueChange={(v) => { setBookingsChannel(v); setBookingsPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                    <SelectValue placeholder="არხი" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა არხი</SelectItem>
                    {Object.keys(channelInfo).map(ch => (
                      <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={bookingsStatus} onValueChange={(v) => { setBookingsStatus(v); setBookingsPage(1); }}>
                  <SelectTrigger className="w-[130px] bg-slate-800 border-slate-700">
                    <SelectValue placeholder="სტატუსი" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა</SelectItem>
                    <SelectItem value="confirmed">დადასტურებული</SelectItem>
                    <SelectItem value="completed">დასრულებული</SelectItem>
                    <SelectItem value="cancelled">გაუქმებული</SelectItem>
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
                        <TableHead className="text-muted-foreground">ჯავშნის #</TableHead>
                        <TableHead className="text-muted-foreground">სტუმარი</TableHead>
                        <TableHead className="text-muted-foreground">ოთახი</TableHead>
                        <TableHead className="text-muted-foreground">არხი</TableHead>
                        <TableHead className="text-muted-foreground">Check-in</TableHead>
                        <TableHead className="text-muted-foreground">Check-out</TableHead>
                        <TableHead className="text-muted-foreground">ღამეები</TableHead>
                        <TableHead className="text-right text-muted-foreground">თანხა</TableHead>
                        <TableHead className="text-muted-foreground">სტატუსი</TableHead>
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
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: channelInfo[booking.channel]?.color || '#666' }}
                              />
                              {booking.channel}
                            </div>
                          </TableCell>
                          <TableCell>{booking.check_in}</TableCell>
                          <TableCell>{booking.check_out}</TableCell>
                          <TableCell>{booking.nights}</TableCell>
                          <TableCell className="text-right text-emerald-400 font-semibold">
                            ₾{(booking.amount * EUR_TO_GEL).toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'completed' ? 'secondary' : 'destructive'
                            }>
                              {booking.status === 'confirmed' ? 'დადასტურებული' :
                               booking.status === 'completed' ? 'დასრულებული' : 'გაუქმებული'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {bookingsData && bookingsData.total > 15 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      ნაჩვენებია {((bookingsPage - 1) * 15) + 1}-{Math.min(bookingsPage * 15, bookingsData.total)} / {bookingsData.total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                        disabled={bookingsPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingsPage(p => p + 1)}
                        disabled={bookingsPage * 15 >= bookingsData.total}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
