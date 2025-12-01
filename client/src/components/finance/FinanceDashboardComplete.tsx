import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFinanceAnalysis } from "@/contexts/FinanceAnalysisContext";
import { DateRange } from "react-day-picker";
import { FinanceDateRange } from "./FinanceDateRange";
import { FinanceExport } from "./FinanceExport";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { 
  TrendingUp, 
  DollarSign, 
  TrendingDown,
  Percent,
  Building2,
  BedDouble,
  Calendar,
  Award,
  Info,
  Filter
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardAnalysisSummary } from "./DashboardAnalysisSummary";

export const FinanceDashboardComplete = () => {
  const { t } = useLanguage();
  const { analysisResult } = useFinanceAnalysis();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1), // January 1, 2025
    to: new Date(2025, 8, 30)    // September 30, 2025
  });
  const [searchRoom, setSearchRoom] = useState("");
  const [sortBy, setSortBy] = useState<"revenue" | "nights" | "adr">("revenue");
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  // Export to Excel with Channel Analysis
  const exportDatabaseToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      ['ORBI CITY - ფინანსური ანალიზი'],
      [''],
      ['სულ შემოსავალი', `₾${metrics.totalRevenue.toLocaleString()}`],
      ['სულ ხარჯები', `₾${metrics.totalExpenses.toLocaleString()}`],
      ['წმინდა მოგება', `₾${metrics.netProfit.toLocaleString()}`],
      ['სულ ბრონები', metrics.totalBookings.toLocaleString()],
      ['სულ ღამეები', metrics.totalNights.toLocaleString()],
      ['უნიკალური ოთახები', metrics.uniqueRooms],
      ['საშუალო ADR', `₾${metrics.avgADR.toLocaleString()}`],
      ['დატვირთვა %', `${metrics.occupancyRate.toFixed(1)}%`],
      ['RevPAR', `₾${metrics.revPAR.toLocaleString()}`],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "მიმოხილვა");

    // Sheet 2: Channel Distribution
    if (channelData.length > 0) {
      const channelSheetData = channelData.map(ch => ({
        'არხი': ch.name,
        'შემოსავალი': ch.value,
        'პროცენტი': parseFloat(ch.percentage.toFixed(1)),
      }));
      
      channelSheetData.push({
        'არხი': 'ჯამი',
        'შემოსავალი': channelData.reduce((sum, ch) => sum + ch.value, 0),
        'პროცენტი': 100,
      });

      const ws2 = XLSX.utils.json_to_sheet(channelSheetData);
      XLSX.utils.book_append_sheet(wb, ws2, "არხების ანალიზი");
    }

    // Sheet 3: Monthly Trend
    const monthlySheetData = monthlyTrend.map(m => ({
      'თვე': m.month,
      'შემოსავალი': m.revenue,
      'ხარჯები': m.expenses,
      'მოგება': m.profit,
    }));
    const ws3 = XLSX.utils.json_to_sheet(monthlySheetData);
    XLSX.utils.book_append_sheet(wb, ws3, "თვიური ტრენდი");

    // Sheet 4: Building Performance
    const buildingSheetData = buildingData.map(b => ({
      'ბლოკი': b.block,
      'შემოსავალი': b.revenue,
      'ღამეები': b.nights,
      'ბრონები': b.bookings,
      'საშ. ADR': b.adr,
    }));
    const ws4 = XLSX.utils.json_to_sheet(buildingSheetData);
    XLSX.utils.book_append_sheet(wb, ws4, "ბლოკების შესრულება");

    // Sheet 5: Top Rooms
    const topRooms = roomPerformance.slice(0, 50);
    const roomSheetData = topRooms.map(r => ({
      'ოთახი': r.room,
      'შემოსავალი': r.revenue,
      'ღამეები': r.nights,
      'ბრონები': r.bookings,
      'საშ. ADR': r.adr,
    }));
    const ws5 = XLSX.utils.json_to_sheet(roomSheetData);
    XLSX.utils.book_append_sheet(wb, ws5, "TOP 50 ოთახი");

    const fileName = `Orbi_City_Analytics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["finance-dashboard-complete"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: records, error: recordsError } = await supabase
        .from("finance_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (recordsError) throw recordsError;

      const { data: expenses, error: expensesError } = await supabase
        .from("expense_records")
        .select("*")
        .eq("user_id", user.id);

      if (expensesError) throw expensesError;

      return { records: records || [], expenses: expenses || [] };
    }
  });

  // Get all available channels for filter UI
  const availableChannels = useMemo(() => {
    if (analysisResult) {
      return [...new Set(analysisResult.channelStats.map(c => c.channel))];
    }
    if (!data) return [];
    return [...new Set(data.records.map(r => r.channel || 'Unknown'))];
  }, [data, analysisResult]);

  // Filter data by date range and selected channels
  const filteredData = useMemo(() => {
    if (!data) return { records: [], expenses: [] };
    
    let filteredRecords = data.records;
    let filteredExpenses = data.expenses;

    // Date filtering
    if (dateRange?.from) {
      const fromDate = dateRange.from.toISOString().split('T')[0];
      filteredRecords = filteredRecords.filter(r => r.date >= fromDate);
      filteredExpenses = filteredExpenses.filter(e => e.date >= fromDate);
    }

    if (dateRange?.to) {
      const toDate = dateRange.to.toISOString().split('T')[0];
      filteredRecords = filteredRecords.filter(r => r.date <= toDate);
      filteredExpenses = filteredExpenses.filter(e => e.date <= toDate);
    }

    // Channel filtering (only if channels are selected)
    if (selectedChannels.size > 0) {
      filteredRecords = filteredRecords.filter(r => selectedChannels.has(r.channel || 'Unknown'));
    }

    return { records: filteredRecords, expenses: filteredExpenses };
  }, [data, dateRange, selectedChannels]);

  // Calculate all metrics - use Excel analysis if available, filter by channels if selected
  const metrics = useMemo(() => {
    if (analysisResult) {
      // Filter by channels if selected
      let channelStats = analysisResult.channelStats;
      let roomStats = analysisResult.roomStats;
      
      if (selectedChannels.size > 0) {
        // Filter to only selected channels
        channelStats = channelStats.filter(c => selectedChannels.has(c.channel));
        
        // Recalculate room stats based on selected channels
        // This is a simplified approach - ideally we'd recalculate from raw data
        const totalRevenue = channelStats.reduce((sum, c) => sum + c.revenue, 0);
        const totalNights = channelStats.reduce((sum, c) => sum + c.nights, 0);
        const totalBookings = channelStats.reduce((sum, c) => sum + c.bookings, 0);
        
        return {
          totalRevenue: Math.round(totalRevenue),
          totalExpenses: 0,
          netProfit: Math.round(totalRevenue),
          totalBookings: Math.round(totalBookings),
          totalNights: Math.round(totalNights),
          uniqueRooms: roomStats.length,
          avgADR: totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0,
          occupancyRate: analysisResult.overallStats.occupancyRate,
          revPAR: analysisResult.overallStats.revPAR,
        };
      }
      
      // Use full Excel analysis data
      const stats = analysisResult.overallStats;
      return {
        totalRevenue: Math.round(stats.totalRevenue),
        totalExpenses: 0, // Excel doesn't have expenses
        netProfit: Math.round(stats.totalRevenue),
        totalBookings: Math.round(stats.totalBookings),
        totalNights: Math.round(stats.totalNights),
        uniqueRooms: stats.uniqueRooms,
        avgADR: Math.round(stats.avgADR),
        occupancyRate: stats.occupancyRate,
        revPAR: Math.round(stats.revPAR),
      };
    }

    // Fallback to database records
    const { records, expenses } = filteredData;

    const totalRevenue = Math.round(records.reduce((sum, r) => sum + (r.revenue || 0), 0));
    const totalExpenses = Math.round(expenses.reduce((sum, e) => sum + (e.amount || 0), 0));
    const netProfit = totalRevenue - totalExpenses;
    const totalBookings = records.length;
    const totalNights = Math.round(records.reduce((sum, r) => sum + (r.nights || 0), 0));
    const uniqueRooms = new Set(records.map(r => r.room_number)).size;
    const avgADR = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

    // Calculate occupancy rate
    const monthlyRoomCounts = new Map<string, Set<string>>();
    const roomFirstSeen = new Map<string, string>();
    
    records.forEach(r => {
      const roomNumber = r.room_number;
      if (!roomFirstSeen.has(roomNumber)) {
        roomFirstSeen.set(roomNumber, r.date);
      } else if (r.date < roomFirstSeen.get(roomNumber)!) {
        roomFirstSeen.set(roomNumber, r.date);
      }
    });

    records.forEach(r => {
      const recordMonth = r.date.substring(0, 7);
      roomFirstSeen.forEach((firstDate, roomNumber) => {
        const firstMonth = firstDate.substring(0, 7);
        if (firstMonth <= recordMonth) {
          if (!monthlyRoomCounts.has(recordMonth)) {
            monthlyRoomCounts.set(recordMonth, new Set());
          }
          monthlyRoomCounts.get(recordMonth)!.add(roomNumber);
        }
      });
    });

    let totalAvailableNights = 0;
    monthlyRoomCounts.forEach((rooms, month) => {
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      totalAvailableNights += rooms.size * daysInMonth;
    });

    const occupancyRate = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0;
    const revPAR = totalAvailableNights > 0 ? Math.round(totalRevenue / totalAvailableNights) : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalBookings,
      totalNights,
      uniqueRooms,
      avgADR,
      occupancyRate,
      revPAR,
    };
  }, [filteredData, analysisResult, selectedChannels]);

  // Monthly trend data - use Excel analysis if available
  const monthlyTrend = useMemo(() => {
    if (analysisResult) {
      return analysisResult.monthlyStats.map(m => ({
        month: m.month,
        revenue: Math.round(m.totalRevenue),
        expenses: 0,
        profit: Math.round(m.totalRevenue),
        nights: Math.round(m.totalNights),
        bookings: Math.round(m.totalBookings),
        adr: Math.round(m.avgADR),
        occupancy: m.occupancyRate,
      }));
    }

    // Fallback to database records
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
    
    filteredData.records.forEach(r => {
      const month = r.date.substring(0, 7);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { revenue: 0, expenses: 0 });
      }
      monthlyMap.get(month)!.revenue += r.revenue || 0;
    });

    filteredData.expenses.forEach(e => {
      const month = e.date.substring(0, 7);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { revenue: 0, expenses: 0 });
      }
      monthlyMap.get(month)!.expenses += e.amount || 0;
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue),
        expenses: Math.round(data.expenses),
        profit: Math.round(data.revenue - data.expenses),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData, analysisResult]);

  // Channel breakdown - use Excel analysis if available
  const channelData = useMemo(() => {
    if (analysisResult) {
      const totalRevenue = analysisResult.channelStats.reduce((sum, c) => sum + c.revenue, 0);
      return analysisResult.channelStats.map(c => ({
        name: c.channel,
        value: Math.round(c.revenue),
        percentage: totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0,
      })).sort((a, b) => b.value - a.value);
    }

    // Fallback to database records
    const channelMap = new Map<string, number>();
    filteredData.records.forEach(r => {
      const channel = r.channel || 'Unknown';
      channelMap.set(channel, (channelMap.get(channel) || 0) + (r.revenue || 0));
    });

    const totalRevenue = Array.from(channelMap.values()).reduce((sum, val) => sum + val, 0);
    return Array.from(channelMap.entries())
      .map(([name, value]) => ({ 
        name, 
        value: Math.round(value),
        percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, analysisResult]);

  // Monthly channel trends - aggregate revenue by month and channel
  const monthlyChannelTrends = useMemo(() => {
    if (analysisResult) {
      // For Excel data, we need to process the raw data to get monthly channel breakdown
      // We'll use a Map to store month -> channel -> revenue
      const monthlyMap = new Map<string, Map<string, number>>();
      
      // We don't have direct access to monthly channel breakdown in analysisResult
      // So we'll aggregate from the overall stats
      // This is a simplified version - ideally the Excel analyzer would provide this
      return [];
    }

    // Fallback to database records
    const monthlyMap = new Map<string, Map<string, number>>();
    
    filteredData.records.forEach(r => {
      const month = r.date.substring(0, 7); // YYYY-MM format
      const channel = r.channel || 'Unknown';
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, new Map());
      }
      
      const channelMap = monthlyMap.get(month)!;
      channelMap.set(channel, (channelMap.get(channel) || 0) + (r.revenue || 0));
    });
    
    // Convert to array format for chart
    return Array.from(monthlyMap.entries())
      .map(([month, channelMap]) => {
        const monthData: any = { month };
        channelMap.forEach((revenue, channel) => {
          monthData[channel] = Math.round(revenue);
        });
        return monthData;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData, analysisResult]);

  // Building block breakdown - use Excel analysis if available
  const buildingData = useMemo(() => {
    if (analysisResult) {
      return analysisResult.buildingStats.map(b => ({
        block: b.building,
        revenue: Math.round(b.revenue),
        nights: Math.round(b.nights),
        bookings: Math.round(b.bookings),
        adr: Math.round(b.adr),
      }));
    }

    // Fallback to database records
    const buildingMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
    filteredData.records.forEach(r => {
      const block = r.building_block || 'Unknown';
      if (!buildingMap.has(block)) {
        buildingMap.set(block, { revenue: 0, nights: 0, bookings: 0 });
      }
      const data = buildingMap.get(block)!;
      data.revenue += r.revenue || 0;
      data.nights += r.nights || 0;
      data.bookings += 1;
    });

    return Array.from(buildingMap.entries())
      .map(([block, data]) => ({
        block,
        revenue: Math.round(data.revenue),
        nights: Math.round(data.nights),
        bookings: data.bookings,
        adr: data.nights > 0 ? Math.round(data.revenue / data.nights) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredData, analysisResult]);

  // Room performance table - use Excel analysis if available
  const roomPerformance = useMemo(() => {
    if (analysisResult) {
      let rooms = analysisResult.roomStats.map(r => ({
        room: r.room,
        revenue: Math.round(r.revenue),
        nights: Math.round(r.nights),
        bookings: Math.round(r.bookings),
        adr: Math.round(r.adr),
      }));

      // Filter by search
      if (searchRoom) {
        rooms = rooms.filter(r => r.room.toLowerCase().includes(searchRoom.toLowerCase()));
      }

      // Sort
      rooms.sort((a, b) => b[sortBy] - a[sortBy]);

      return rooms;
    }

    // Fallback to database records
    const roomMap = new Map<string, { revenue: number; nights: number; bookings: number }>();
    filteredData.records.forEach(r => {
      const room = r.room_number || 'Unknown';
      if (!roomMap.has(room)) {
        roomMap.set(room, { revenue: 0, nights: 0, bookings: 0 });
      }
      const data = roomMap.get(room)!;
      data.revenue += r.revenue || 0;
      data.nights += r.nights || 0;
      data.bookings += 1;
    });

    let rooms = Array.from(roomMap.entries())
      .map(([room, data]) => ({
        room,
        revenue: Math.round(data.revenue),
        nights: Math.round(data.nights),
        bookings: data.bookings,
        adr: data.nights > 0 ? Math.round(data.revenue / data.nights) : 0,
      }));

    // Filter by search
    if (searchRoom) {
      rooms = rooms.filter(r => r.room.toLowerCase().includes(searchRoom.toLowerCase()));
    }

    // Sort
    rooms.sort((a, b) => b[sortBy] - a[sortBy]);

    return rooms;
  }, [filteredData, searchRoom, sortBy, analysisResult]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--emerald))', 'hsl(var(--gold))', 'hsl(var(--info))', 'hsl(var(--accent))'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      {analysisResult && (
        <div className="flex justify-end">
          <FinanceExport analysisResult={analysisResult} />
        </div>
      )}

      {/* Excel Analysis Summary */}
      <DashboardAnalysisSummary />
      
      {/* Header with Date Range and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("ფინანსური დეტალები", "Financial Details")}</h2>
          <p className="text-muted-foreground">
            {t("შემოსავლებისა და ხარჯების ანალიზი", "Revenue and expense analysis")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FinanceDateRange dateRange={dateRange} onDateRangeChange={setDateRange} />
          {!analysisResult && (
            <Button onClick={exportDatabaseToExcel} variant="default" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {t("Excel Export", "Excel Export")}
            </Button>
          )}
        </div>
      </div>

      {/* Channel Filter */}
      {availableChannels.length > 0 && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              {t("არხების ფილტრი", "Channel Filter")}
            </CardTitle>
            <CardDescription>
              {selectedChannels.size === 0 
                ? t("აირჩიეთ არხები ფილტრაციისთვის, ან დატოვეთ ყველა არჩეული ყველა არხის სანახავად", "Select channels to filter, or leave all selected to view all channels")
                : t(`არჩეულია ${selectedChannels.size} არხი`, `${selectedChannels.size} channel(s) selected`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedChannels.size === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChannels(new Set())}
                className="gap-1"
              >
                {t("ყველა", "All")}
                {selectedChannels.size === 0 && " ✓"}
              </Button>
              {availableChannels.map(channel => (
                <Button
                  key={channel}
                  variant={selectedChannels.has(channel) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newSet = new Set(selectedChannels);
                    if (newSet.has(channel)) {
                      newSet.delete(channel);
                    } else {
                      newSet.add(channel);
                    }
                    setSelectedChannels(newSet);
                  }}
                  className="gap-1"
                >
                  {channel}
                  {selectedChannels.has(channel) && " ✓"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("შემოსავალი", "Revenue")}
          value={`₾${metrics.totalRevenue}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={metrics.totalRevenue > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title={t("ხარჯები", "Expenses")}
          value={`₾${metrics.totalExpenses}`}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title={t("წმინდა მოგება", "Net Profit")}
          value={`₾${metrics.netProfit}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={metrics.netProfit > 0 ? "up" : "down"}
        />
        <MetricCard
          title={t("ბრონირებები", "Bookings")}
          value={metrics.totalBookings.toString()}
          icon={<Calendar className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title={t("ღამეები", "Nights")}
          value={metrics.totalNights.toString()}
          icon={<BedDouble className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title={t("სტუდიები", "Studios")}
          value={metrics.uniqueRooms.toString()}
          icon={<Building2 className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title="ADR"
          value={`₾${metrics.avgADR}`}
          icon={<Award className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title={t("დაკავება", "Occupancy")}
          value={`${Math.round(metrics.occupancyRate)}%`}
          icon={<Percent className="h-5 w-5" />}
          trend={metrics.occupancyRate > 50 ? "up" : "down"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t("შემოსავალი vs ხარჯები", "Revenue vs Expenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>{t("შემოსავალი არხების მიხედვით", "Revenue by Channel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Channel Trends - Full Width */}
      {monthlyChannelTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("არხების თვიური ტრენდები", "Monthly Channel Trends")}</CardTitle>
            <CardDescription>
              {t("თითოეული არხის შემოსავლის ტრენდები თვეების მიხედვით", "Revenue trends for each channel by month")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyChannelTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₾${value.toLocaleString()}`} />
                <Legend />
                {availableChannels.map((channel, index) => (
                  <Line
                    key={channel}
                    type="monotone"
                    dataKey={channel}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Building Block Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("შესრულება ბლოკების მიხედვით", "Performance by Building Block")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                <Bar dataKey="nights" fill="hsl(var(--emerald))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t("დაკავების ტენდენცია", "Occupancy Trend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Channel Distribution with Enhanced Visuals */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              {t("არხების მიხედვით ანალიზი", "Channel Distribution Analysis")}
            </CardTitle>
            <CardDescription>
              {t("შემოსავლის განაწილება სხვადასხვა არხებში", "Revenue distribution across different channels")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Channel Bars with Percentages */}
              <div className="space-y-3">
                {channelData.map((channel, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{channel.name}</span>
                      <div className="text-right">
                        <span className="font-bold">₾{channel.value.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-2">({channel.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div 
                        className={`h-full flex items-center px-3 text-xs font-medium text-white transition-all ${
                          idx % 5 === 0 ? 'bg-blue-500' :
                          idx % 5 === 1 ? 'bg-emerald-500' :
                          idx % 5 === 2 ? 'bg-purple-500' :
                          idx % 5 === 3 ? 'bg-orange-500' :
                          'bg-pink-500'
                        }`}
                        style={{ width: `${channel.percentage}%` }}
                      >
                        {channel.percentage > 10 && `${channel.percentage.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              {channelData.length > 0 && (
                <>
                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("წამყვანი არხი", "Top Channel")}
                      </div>
                      <div className="text-lg font-bold">{channelData[0]?.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">
                        {channelData[0]?.percentage.toFixed(1)}% {t("შემოსავლიდან", "of revenue")}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("არხების რაოდენობა", "Total Channels")}
                      </div>
                      <div className="text-lg font-bold">{channelData.length}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("აქტიური", "Active channels")}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("სულ შემოსავალი", "Total Revenue")}
                      </div>
                      <div className="text-lg font-bold">
                        ₾{channelData.reduce((sum, ch) => sum + ch.value, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("ყველა არხიდან", "From all channels")}
                      </div>
                    </div>
                  </div>

                  {/* Key Insight */}
                  <Alert className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                    <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <AlertDescription className="text-sm">
                      <strong>{t("💡 ინსაითი:", "💡 Insight:")}</strong>{' '}
                      {(() => {
                        const top3 = channelData.slice(0, 3);
                        const top3Percentage = top3.reduce((sum, ch) => sum + ch.percentage, 0);
                        return t(
                          `პირველი 3 არხი (${top3.map(ch => ch.name).join(', ')}) იძლევა ${top3Percentage.toFixed(1)}% შემოსავლისა. არხების დივერსიფიკაცია აუმჯობესებს რისკების მართვას.`,
                          `Top 3 channels (${top3.map(ch => ch.name).join(', ')}) generate ${top3Percentage.toFixed(1)}% of revenue. Channel diversification improves risk management.`
                        );
                      })()}
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Building Block Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("ბლოკების დეტალები", "Building Block Details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ბლოკი", "Block")}</TableHead>
                  <TableHead className="text-right">{t("შემოსავალი", "Revenue")}</TableHead>
                  <TableHead className="text-right">ADR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildingData.map((building) => (
                  <TableRow key={building.block}>
                    <TableCell>{building.block}</TableCell>
                    <TableCell className="text-right">₾{building.revenue}</TableCell>
                    <TableCell className="text-right">₾{building.adr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Room Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ოთახების შესრულება", "Room Performance")}</CardTitle>
          <CardDescription>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder={t("ძებნა ოთახის მიხედვით", "Search by room")}
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="max-w-xs"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded px-2"
              >
                <option value="revenue">{t("შემოსავალი", "Revenue")}</option>
                <option value="nights">{t("ღამეები", "Nights")}</option>
                <option value="adr">ADR</option>
              </select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ოთახი", "Room")}</TableHead>
                  <TableHead className="text-right">{t("შემოსავალი", "Revenue")}</TableHead>
                  <TableHead className="text-right">{t("ღამეები", "Nights")}</TableHead>
                  <TableHead className="text-right">{t("ბრონები", "Bookings")}</TableHead>
                  <TableHead className="text-right">ADR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomPerformance.map((room) => (
                  <TableRow key={room.room}>
                    <TableCell className="font-medium">{room.room}</TableCell>
                    <TableCell className="text-right">₾{room.revenue}</TableCell>
                    <TableCell className="text-right">{room.nights}</TableCell>
                    <TableCell className="text-right">{room.bookings}</TableCell>
                    <TableCell className="text-right">₾{room.adr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Metric Card Component
function MetricCard({ title, value, icon, trend }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
