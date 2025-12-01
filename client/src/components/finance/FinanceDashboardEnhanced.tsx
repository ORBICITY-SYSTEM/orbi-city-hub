import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { FinanceChartsEnhanced } from "./FinanceChartsEnhanced";

export const FinanceDashboardEnhanced = () => {
  const { t, language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["finance-dashboard-enhanced"],
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

      // Calculate totals
      const totalRevenue = records?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Calculate occupancy metrics
      const totalNights = records?.reduce((sum, r) => sum + (r.nights || 0), 0) || 0;
      const bookingCount = records?.filter(r => r.revenue > 0).length || 0;
      const avgNights = bookingCount > 0 ? totalNights / bookingCount : 0;
      const avgADR = totalNights > 0 ? totalRevenue / totalNights : 0;

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

      // Get current month data for comparison
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
        blockStats,
        channelStats,
        currentMonthRevenue,
        records: records || [],
        expenses: expenses || []
      };
    },
  });

  if (isLoading) {
    return (
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
      trend: "+0%",
      color: "text-primary"
    },
    {
      title: t("მთლიანი ხარჯები", "Total Expenses"),
      value: formatCurrency(data?.totalExpenses || 0),
      icon: TrendingDown,
      trend: "",
      color: "text-destructive"
    },
    {
      title: t("წმინდა მოგება", "Net Profit"),
      value: formatCurrency(data?.netProfit || 0),
      icon: TrendingUp,
      trend: `${data?.profitMargin.toFixed(1)}%`,
      color: data?.netProfit >= 0 ? "text-success" : "text-destructive"
    },
    {
      title: t("მარჟა", "Profit Margin"),
      value: `${data?.profitMargin.toFixed(1)}%`,
      icon: Percent,
      trend: "",
      color: "text-primary"
    },
    {
      title: t("მთლიანი დაჯავშნები", "Total Bookings"),
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
      title: t("საშუალო ვადა", "Average Stay"),
      value: `${data?.avgNights.toFixed(1)} ${t("ღამე", "nights")}`,
      icon: BedDouble,
      trend: "",
      color: "text-primary"
    },
    {
      title: t("ამ თვის შემოსავალი", "This Month"),
      value: formatCurrency(data?.currentMonthRevenue || 0),
      icon: Building2,
      trend: "",
      color: "text-primary"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <FinanceChartsEnhanced 
        records={data?.records || []} 
        expenses={data?.expenses || []}
        blockStats={data?.blockStats || {}}
        channelStats={data?.channelStats || {}}
      />
    </div>
  );
};
