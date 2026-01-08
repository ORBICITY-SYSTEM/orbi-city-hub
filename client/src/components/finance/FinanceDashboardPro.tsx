import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Calendar,
  Percent,
  BedDouble,
  Award
} from "lucide-react";
import { FinanceChartsPro } from "./FinanceChartsPro";
import { FinanceInsights } from "./FinanceInsights";

export const FinanceDashboardPro = () => {
  const { t, language } = useLanguage();
  const navigate = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["finance-dashboard-pro"],
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

      // Calculate monthly room counts (dynamic portfolio)
      const monthlyRoomCounts = new Map<string, Set<string>>();
      const roomFirstSeen = new Map<string, string>();
      
      records?.forEach(r => {
        const month = r.date.substring(0, 7);
        const roomNumber = r.room_number;
        
        // Track first occurrence of each room
        if (!roomFirstSeen.has(roomNumber)) {
          roomFirstSeen.set(roomNumber, r.date);
        } else if (r.date < roomFirstSeen.get(roomNumber)!) {
          roomFirstSeen.set(roomNumber, r.date);
        }
      });

      // Build monthly room counts
      records?.forEach(r => {
        const recordMonth = r.date.substring(0, 7);
        
        // Add all rooms that had their first booking before or during this month
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

      // Calculate totals
      const totalRevenue = records?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Calculate occupancy metrics with dynamic room counts
      const monthlyStats = new Map<string, any>();
      
      records?.forEach(r => {
        const month = r.date.substring(0, 7);
        if (!monthlyStats.has(month)) {
          monthlyStats.set(month, {
            revenue: 0,
            nights: 0,
            bookings: 0,
          });
        }
        const stats = monthlyStats.get(month)!;
        stats.revenue += r.revenue || 0;
        stats.nights += r.nights || 0;
        stats.bookings += 1;
      });

      // Calculate weighted average occupancy
      let totalOccupancyWeighted = 0;
      let totalDaysConsidered = 0;

      monthlyStats.forEach((stats, month) => {
        const roomCount = monthlyRoomCounts.get(month)?.size || 1;
        const [year, monthNum] = month.split('-').map(Number);
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const totalPossibleNights = roomCount * daysInMonth;
        const occupancy = totalPossibleNights > 0 ? (stats.nights / totalPossibleNights) * 100 : 0;
        
        totalOccupancyWeighted += occupancy * daysInMonth;
        totalDaysConsidered += daysInMonth;
      });

      const avgOccupancy = totalDaysConsidered > 0 ? totalOccupancyWeighted / totalDaysConsidered : 0;

      const totalNights = records?.reduce((sum, r) => sum + (r.nights || 0), 0) || 0;
      const bookingCount = records?.filter(r => r.revenue > 0).length || 0;
      const avgNights = bookingCount > 0 ? totalNights / bookingCount : 0;
      const avgADR = totalNights > 0 ? totalRevenue / totalNights : 0;
      const revPAR = avgADR * (avgOccupancy / 100);

      // Current portfolio size
      const currentRoomCount = roomFirstSeen.size;
      const initialRoomCount = monthlyRoomCounts.get(Array.from(monthlyRoomCounts.keys()).sort()[0])?.size || 1;
      const portfolioGrowth = initialRoomCount > 0 ? ((currentRoomCount - initialRoomCount) / initialRoomCount) * 100 : 0;

      // Building block analysis
      const blockStats = records?.reduce((acc: any, r) => {
        const block = r.building_block || "Unknown";
        if (!acc[block]) {
          acc[block] = { revenue: 0, bookings: 0, nights: 0 };
        }
        acc[block].revenue += r.revenue || 0;
        acc[block].bookings += 1;
        acc[block].nights += r.nights || 0;
        return acc;
      }, {});

      // Find top performing block
      const topBlock = Object.entries(blockStats || {})
        .sort(([, a]: any, [, b]: any) => (b as any).revenue - (a as any).revenue)[0];

      // Channel analysis
      const channelStats = records?.reduce((acc: any, r) => {
        const channel = r.channel || "Direct";
        if (!acc[channel]) {
          acc[channel] = { revenue: 0, bookings: 0 };
        }
        acc[channel].revenue += r.revenue || 0;
        acc[channel].bookings += 1;
        return acc;
      }, {});

      // Get current month data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const currentMonthRecords = records?.filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }) || [];

      const currentMonthRevenue = currentMonthRecords.reduce((sum, r) => sum + (r.revenue || 0), 0);

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        totalNights,
        bookingCount,
        avgNights,
        avgADR,
        avgOccupancy,
        revPAR,
        currentRoomCount,
        portfolioGrowth,
        topBlock,
        blockStats,
        channelStats,
        currentMonthRevenue,
        monthlyRoomCounts: Array.from(monthlyRoomCounts.entries()).map(([month, rooms]) => ({
          month,
          roomCount: rooms.size,
        })),
        records: records || [],
        expenses: expenses || [],
        roomFirstSeen: Array.from(roomFirstSeen.entries()).map(([room, date]) => ({
          room,
          date,
        })),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "ka" ? "ka-GE" : "en-US", {
      style: "currency",
      currency: "GEL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: t("მთლიანი შემოსავალი", "Total Revenue"),
      value: formatCurrency(data?.totalRevenue || 0),
      icon: DollarSign,
      trend: "",
      color: "text-primary"
    },
    {
      title: t("საშუალო Occupancy", "Average Occupancy"),
      value: `${data?.avgOccupancy.toFixed(1)}%`,
      icon: Percent,
      trend: t("დინამიური", "Dynamic"),
      color: data?.avgOccupancy >= 70 ? "text-success" : data?.avgOccupancy >= 60 ? "text-warning" : "text-destructive"
    },
    {
      title: t("სულ ჯავშნები", "Total Bookings"),
      value: data?.bookingCount.toString() || "0",
      icon: Calendar,
      trend: t(`${data?.totalNights} ღამე`, `${data?.totalNights} nights`),
      color: "text-primary"
    },
    {
      title: t("საშუალო ADR", "Average ADR"),
      value: formatCurrency(data?.avgADR || 0),
      icon: Award,
      trend: t("ღამეზე", "per night"),
      color: "text-success"
    },
    {
      title: t("სულ ღამეები", "Total Nights"),
      value: data?.totalNights.toString() || "0",
      icon: BedDouble,
      trend: t(`${data?.avgNights.toFixed(1)} ღამე სა.`, `${data?.avgNights.toFixed(1)} avg`),
      color: "text-primary"
    },
    {
      title: t("RevPAR", "RevPAR"),
      value: formatCurrency(data?.revPAR || 0),
      icon: TrendingUp,
      trend: "ADR × Occupancy",
      color: "text-success"
    },
    {
      title: t("პორტფოლიოს ზრდა", "Portfolio Growth"),
      value: `+${data?.portfolioGrowth.toFixed(0)}%`,
      icon: Building2,
      trend: t(`${data?.currentRoomCount} სტუდიო`, `${data?.currentRoomCount} studios`),
      color: "text-primary"
    },
    {
      title: t("საუკეთესო ბლოკი", "Best Block"),
      value: data?.topBlock?.[0] || "N/A",
      icon: Award,
      trend: formatCurrency((data?.topBlock?.[1] as any)?.revenue || 0),
      color: "text-success"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Smart Insights */}
      <FinanceInsights 
        data={data}
        formatCurrency={formatCurrency}
      />

      {/* Executive Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const isRevenueCard = index === 0; // First card is Total Revenue
          
          return (
            <Card 
              key={index} 
              className={cn(
                "overflow-hidden border-primary/20",
                isRevenueCard && "cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              )}
              onClick={isRevenueCard ? () => navigate('/finance/reports') : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                {stat.trend && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.trend}
                  </p>
                )}
                {isRevenueCard && (
                  <p className="text-xs text-primary mt-2 font-medium">
                    {t('დაკლიკებით სრული რეპორტი →', 'Click for full report →')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <FinanceChartsPro 
        records={data?.records || []} 
        expenses={data?.expenses || []}
        blockStats={data?.blockStats || {}}
        channelStats={data?.channelStats || {}}
        monthlyRoomCounts={data?.monthlyRoomCounts || []}
      />
    </div>
  );
};
