import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, TrendingDown, Calendar, Building2, Activity, BarChart3, Search, Filter, ChevronLeft, ChevronRight, User, MapPin, Clock, Download, Brain, Sparkles, ArrowUpRight, ArrowDownRight, Minus, Banknote, X, Check, ChevronsUpDown } from "lucide-react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, ComposedChart } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

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

// Data is already in GEL - NO CONVERSION NEEDED
// Excel files contain GEL amounts directly

export default function OTADashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsChannel, setBookingsChannel] = useState('all');
  const [bookingsStatus, setBookingsStatus] = useState('all');
  const [bookingsPage, setBookingsPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'channels' | 'ai'>('overview');
  const [monthFilterOpen, setMonthFilterOpen] = useState(false);
  const { t, language } = useLanguage();

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

  // Filter data by selected month (single selection)
  const filteredMonthlyData = useMemo(() => {
    if (!monthlyData?.stats) return [];
    if (selectedMonth === 'all') return monthlyData.stats;
    return monthlyData.stats.filter((s: any) => s.month === selectedMonth);
  }, [monthlyData, selectedMonth]);

  // Calculate totals based on filtered data - NO CONVERSION, data is in GEL
  const totals = useMemo(() => {
    if (filteredMonthlyData.length === 0 && channelsData?.channels) {
      const channels = channelsData.channels;
      return {
        bookings: channels.reduce((sum: number, c: any) => sum + Number(c.bookings), 0),
        revenue: channels.reduce((sum: number, c: any) => sum + Number(c.revenue), 0),
        nights: channels.reduce((sum: number, c: any) => sum + Number(c.nights), 0),
        activeChannels: channels.length
      };
    }
    return {
      bookings: filteredMonthlyData.reduce((sum: number, s: any) => sum + Number(s.bookings), 0),
      revenue: filteredMonthlyData.reduce((sum: number, s: any) => sum + Number(s.revenue), 0),
      nights: filteredMonthlyData.reduce((sum: number, s: any) => sum + Number(s.nights), 0),
      activeChannels: new Set(filteredMonthlyData.map((s: any) => s.channel)).size
    };
  }, [filteredMonthlyData, channelsData]);

  // Chart data by channel (filtered) - NO CONVERSION
  const chartData = useMemo(() => {
    if (filteredMonthlyData.length === 0 && channelsData?.channels) {
      return channelsData.channels.map((c: any) => ({
        name: c.channel,
        bookings: Number(c.bookings),
        revenue: Number(c.revenue),
        nights: Number(c.nights),
        avgRevenue: c.bookings > 0 ? Number(c.revenue) / Number(c.bookings) : 0,
        avgPerNight: c.nights > 0 ? Number(c.revenue) / Number(c.nights) : 0,
        color: channelInfo[c.channel]?.color || '#666'
      }));
    }
    
    const grouped: Record<string, any> = {};
    filteredMonthlyData.forEach((s: any) => {
      if (!grouped[s.channel]) {
        grouped[s.channel] = { bookings: 0, revenue: 0, nights: 0 };
      }
      grouped[s.channel].bookings += Number(s.bookings);
      grouped[s.channel].revenue += Number(s.revenue);
      grouped[s.channel].nights += Number(s.nights);
    });
    
    return Object.entries(grouped).map(([channel, data]: [string, any]) => ({
      name: channel,
      bookings: data.bookings,
      revenue: data.revenue,
      nights: data.nights,
      avgRevenue: data.bookings > 0 ? data.revenue / data.bookings : 0,
      avgPerNight: data.nights > 0 ? data.revenue / data.nights : 0,
      color: channelInfo[channel]?.color || '#666'
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredMonthlyData, channelsData]);

  // Monthly trend data - NO CONVERSION
  const monthlyTrendData = useMemo(() => {
    if (!monthlyData?.stats) return [];
    
    const grouped: Record<string, any> = {};
    monthlyData.stats.forEach((s: any) => {
      if (!grouped[s.month]) {
        grouped[s.month] = { month: s.month, bookings: 0, revenue: 0, nights: 0 };
      }
      grouped[s.month].bookings += Number(s.bookings);
      grouped[s.month].revenue += Number(s.revenue);
      grouped[s.month].nights += Number(s.nights);
    });
    
    return Object.values(grouped)
      .map((d: any) => ({
        ...d,
        avgPerNight: d.nights > 0 ? d.revenue / d.nights : 0,
        label: MONTHS.find(m => m.value === d.month)?.label.split(' ')[0] || d.month
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlyData]);

  // Channel monthly breakdown - NO CONVERSION
  const channelMonthlyData = useMemo(() => {
    if (!monthlyData?.stats) return [];
    return monthlyData.stats.map((s: any) => ({
      ...s,
      revenue: Number(s.revenue),
      avgPerNight: s.nights > 0 ? Number(s.revenue) / Number(s.nights) : 0
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
    
    const sortedMonths = [...monthlyChannelData].sort((a, b) => a.month.localeCompare(b.month));
    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const revenueGrowth = firstMonth && lastMonth && firstMonth.revenue > 0 
      ? ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue * 100).toFixed(0)
      : 'N/A';
    
    const bestMonth = [...monthlyChannelData].sort((a, b) => b.revenue - a.revenue)[0];
    const bestMonthLabel = MONTHS.find(m => m.value === bestMonth?.month)?.label || bestMonth?.month;
    
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
    toast.success(t('toast.syncComplete'), { description: t('ota.syncSuccess') });
  };

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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Ocean Wave */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative z-10 px-8 pt-8 pb-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                  {t('ota.title')}
                </h1>
                <p className="text-lg text-white/90 mt-2 font-medium">{t('ota.subtitle')}</p>
              </div>
              <Button 
                onClick={handleSync} 
                disabled={syncing}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? t('ota.syncing') : t('ota.sync')}
              </Button>
            </div>
          </div>
          {/* Ocean Wave SVG */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
            </svg>
          </div>
          {/* Background */}
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
        </div>

        {/* Month Filter - Professional Dropdown */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-medium text-slate-300">{t('ota.monthFilter')}:</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[280px] bg-slate-800 border-slate-700 focus:border-cyan-500">
                  <SelectValue placeholder={t('ota.selectMonth')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="focus:bg-cyan-500/20">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      ყველა თვე
                    </span>
                  </SelectItem>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value} className="focus:bg-cyan-500/20">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMonth !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedMonth('all')}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('ota.clear')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('ota.totalBookings')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('ota.totalRevenue')}</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    ₾{totals.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">საშ: ₾{avgRevenue.toFixed(0)}</p>
                </div>
                <Banknote className="h-10 w-10 text-emerald-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('ota.totalNights')}</p>
                  <p className="text-3xl font-bold text-purple-400">{totals.nights.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">საშ: ₾{totals.nights > 0 ? (totals.revenue / totals.nights).toFixed(0) : 0}/ღამე</p>
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
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'overview', label: 'მიმოხილვა', icon: BarChart3 },
            { id: 'monthly', label: 'თვიური ანალიზი', icon: Calendar },
            { id: 'channels', label: 'არხების შედარება', icon: TrendingUp },
            { id: 'ai', label: 'AI ანალიზი', icon: Brain }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id 
                ? "bg-cyan-500 hover:bg-cyan-600" 
                : "border-slate-700 hover:border-cyan-500"}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Revenue by Channel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">შემოსავალი არხების მიხედვით</CardTitle>
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
                      <Bar dataKey="revenue" fill="#22d3ee">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">შემოსავლის განაწილება</CardTitle>
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

            {/* Channel Statistics Table */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg">დეტალური არხების სტატისტიკა</CardTitle>
                <CardDescription>სრული ანალიზი ყველა OTA არხზე</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead>არხი</TableHead>
                      <TableHead className="text-right">ჯავშნები</TableHead>
                      <TableHead className="text-right">შემოსავალი</TableHead>
                      <TableHead className="text-right">ღამეები</TableHead>
                      <TableHead className="text-right">საშ/ჯავშანი</TableHead>
                      <TableHead className="text-right">საშ/ღამე</TableHead>
                      <TableHead className="text-right">წილი</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((channel) => (
                      <TableRow key={channel.name} className="border-slate-700">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                            {channel.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{channel.bookings}</TableCell>
                        <TableCell className="text-right text-emerald-400">₾{channel.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">{channel.nights}</TableCell>
                        <TableCell className="text-right">₾{channel.avgRevenue.toFixed(0)}</TableCell>
                        <TableCell className="text-right">₾{channel.avgPerNight.toFixed(0)}</TableCell>
                        <TableCell className="text-right">{((channel.revenue / totalRevenue) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-slate-700 font-bold bg-slate-800/50">
                      <TableCell>სულ</TableCell>
                      <TableCell className="text-right">{totals.bookings.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-emerald-400">₾{totals.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">{totals.nights.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₾{avgRevenue.toFixed(0)}</TableCell>
                      <TableCell className="text-right">₾{totals.nights > 0 ? (totals.revenue / totals.nights).toFixed(0) : 0}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">საშუალო ფასი ღამეში (არხების მიხედვით)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${v}`} />
                      <Tooltip 
                        formatter={(value: number) => [`₾${value.toFixed(0)}`, 'საშ/ღამე']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      />
                      <Bar dataKey="avgPerNight" fill="#a855f7">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">ჯავშნები vs შემოსავალი</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" stroke="#94a3b8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="bookings" name="ჯავშნები" fill="#22d3ee" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="შემოსავალი" stroke="#10b981" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="space-y-6">
            {/* Monthly Revenue Trend */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  თვიური შემოსავლის ტრენდი
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrendData}>
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
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Bookings */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">თვიური ჯავშნები</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="bookings" fill="#a855f7" name="ჯავშნები" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Average Price per Night */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">საშუალო ფასი ღამეში (თვეების მიხედვით)</CardTitle>
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
                      <Line type="monotone" dataKey="avgPerNight" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Details Table */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg">თვიური დეტალური ცხრილი</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead>თვე</TableHead>
                      <TableHead className="text-right">ჯავშნები</TableHead>
                      <TableHead className="text-right">შემოსავალი</TableHead>
                      <TableHead className="text-right">ღამეები</TableHead>
                      <TableHead className="text-right">საშ/ღამე</TableHead>
                      <TableHead className="text-right">ცვლილება</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyTrendData.map((month, idx) => {
                      const prevMonth = monthlyTrendData[idx - 1];
                      const change = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
                      return (
                        <TableRow key={month.month} className="border-slate-700">
                          <TableCell>{MONTHS.find(m => m.value === month.month)?.label || month.month}</TableCell>
                          <TableCell className="text-right">{month.bookings}</TableCell>
                          <TableCell className="text-right text-emerald-400">₾{month.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}</TableCell>
                          <TableCell className="text-right">{month.nights}</TableCell>
                          <TableCell className="text-right">₾{month.avgPerNight.toFixed(0)}</TableCell>
                          <TableCell className="text-right">
                            {idx > 0 && (
                              <span className={`flex items-center justify-end gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                {Math.abs(change).toFixed(0)}%
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* Channel Performance Over Time */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg">არხების შემოსავალი დროში</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#94a3b8"
                    />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`₾${value.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`, '']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="შემოსავალი" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {chartData.map(channel => (
                <Card key={channel.name} className="border-slate-700 bg-slate-900/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                      <CardTitle className="text-sm">{channel.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-emerald-400">₾{channel.revenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{channel.bookings} ჯავშანი</span>
                      <span>₾{channel.avgPerNight.toFixed(0)}/ღამე</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <Card className="border-cyan-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  AI ანალიზი - OTA არხების ისტორია
                </CardTitle>
                <CardDescription>თითოეული არხის პირველი ჯავშნიდან დღემდე დეტალური ანალიზი</CardDescription>
              </CardHeader>
            </Card>

            {aiAnalyses.map((analysis: any) => (
              <Card key={analysis.channel} className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: analysis.color }} />
                      <CardTitle className="text-xl">{analysis.channel}</CardTitle>
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                        აქტიური {analysis.daysActive} დღე
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">₾{analysis.totalRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}</p>
                      <p className="text-sm text-muted-foreground">{t('ota.totalRevenue')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">პირველი ჯავშანი</p>
                      <p className="text-lg font-semibold">{analysis.firstDate}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">სულ ჯავშნები</p>
                      <p className="text-lg font-semibold">{analysis.totalBookings}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">საშ. თვეში</p>
                      <p className="text-lg font-semibold text-emerald-400">₾{analysis.avgRevenuePerMonth}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">საუკეთესო თვე</p>
                      <p className="text-lg font-semibold text-cyan-400">{analysis.bestMonth}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 p-4 rounded-lg border border-cyan-500/20">
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-cyan-400">AI ინსაითი</p>
                        <p className="text-sm text-slate-300 mt-1">
                          {analysis.channel} არხი აქტიურია {analysis.daysActive} დღის განმავლობაში ({analysis.monthsActive} თვე). 
                          საშუალოდ თვეში მოაქვს ₾{analysis.avgRevenuePerMonth} და {analysis.avgBookingsPerMonth} ჯავშანი. 
                          საშუალო შემოსავალი ჯავშანზე: ₾{analysis.avgPerBooking.toFixed(0)}, ღამეზე: ₾{analysis.avgPerNight.toFixed(0)}. 
                          საუკეთესო თვე იყო {analysis.bestMonth}(₾{analysis.bestMonthRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}).
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

        {/* Recent Bookings */}
        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">ბოლო ჯავშნები</CardTitle>
                <CardDescription>ინდივიდუალური ჯავშნების დეტალები</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => {
                  const dataToExport = bookingsData?.bookings || [];
                  if (dataToExport.length === 0) {
                    toast.error('ექსპორტისთვის მონაცემები არ არის');
                    return;
                  }
                  const ws = XLSX.utils.json_to_sheet(dataToExport.map((b: any) => ({
                    'ჯავშნის #': b.booking_number,
                    'სტუმარი': b.guest_name,
                    'ოთახი': b.room_number,
                    'არხი': b.channel,
                    'Check-in': b.check_in,
                    'Check-out': b.check_out,
                    'ღამეები': b.nights,
                    'თანხა (₾)': b.amount,
                    'სტატუსი': b.status
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'ჯავშნები');
                  const filterInfo = `${bookingsChannel !== 'all' ? bookingsChannel : 'ყველა'}_${bookingsStatus !== 'all' ? bookingsStatus : 'ყველა'}`;
                  XLSX.writeFile(wb, `OTA_ჯავშნები_${filterInfo}_${new Date().toISOString().split('T')[0]}.xlsx`);
                  toast.success('ექსპორტი დასრულდა', { description: `${dataToExport.length} ჯავშანი ექსპორტირებულია` });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel ექსპორტი
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="ძებნა..."
                  value={bookingsSearch}
                  onChange={(e) => setBookingsSearch(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <Select value={bookingsChannel} onValueChange={setBookingsChannel}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="არხი" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">ყველა არხი</SelectItem>
                  {chartData.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={bookingsStatus} onValueChange={setBookingsStatus}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="სტატუსი" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">ყველა</SelectItem>
                  <SelectItem value="confirmed">დადასტურებული</SelectItem>
                  <SelectItem value="completed">დასრულებული</SelectItem>
                  <SelectItem value="cancelled">გაუქმებული</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead>ჯავშნის #</TableHead>
                  <TableHead>სტუმარი</TableHead>
                  <TableHead>ოთახი</TableHead>
                  <TableHead>არხი</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className="text-right">ღამეები</TableHead>
                  <TableHead className="text-right">თანხა</TableHead>
                  <TableHead>სტატუსი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsData?.bookings?.map((booking: any) => (
                  <TableRow key={booking.id} className="border-slate-700">
                    <TableCell className="font-mono text-cyan-400">{booking.booking_number}</TableCell>
                    <TableCell>{booking.guest_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600">
                        {booking.room_number}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        style={{ 
                          backgroundColor: `${channelInfo[booking.channel]?.color}20`,
                          borderColor: channelInfo[booking.channel]?.color,
                          color: channelInfo[booking.channel]?.color
                        }}
                        variant="outline"
                      >
                        {booking.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.check_in}</TableCell>
                    <TableCell>{booking.check_out}</TableCell>
                    <TableCell className="text-right">{booking.nights}</TableCell>
                    <TableCell className="text-right text-emerald-400 font-semibold">
                      ₾{Number(booking.amount).toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : booking.status === 'completed' ? 'secondary' : 'destructive'}
                        className={
                          booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                          booking.status === 'completed' ? 'bg-slate-500/20 text-slate-400 border-slate-500/50' :
                          'bg-red-500/20 text-red-400 border-red-500/50'
                        }
                      >
                        {booking.status === 'confirmed' ? 'დადასტურებული' : 
                         booking.status === 'completed' ? 'დასრულებული' : 'გაუქმებული'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {bookingsData && bookingsData.totalPages > 1 && (
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
                    className="border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingsPage(p => Math.min(bookingsData.totalPages, p + 1))}
                    disabled={bookingsPage === bookingsData.totalPages}
                    className="border-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
