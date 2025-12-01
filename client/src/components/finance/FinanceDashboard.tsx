import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { FinanceCharts } from "./FinanceCharts";
import { Skeleton } from "@/components/ui/skeleton";

export const FinanceDashboard = () => {
  const { t } = useLanguage();

  const { data: financeData, isLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: records } = await supabase
        .from('finance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      const { data: expenses } = await supabase
        .from('expense_records')
        .select('*')
        .eq('user_id', user.id);

      const totalRevenue = records?.reduce((sum, r) => sum + parseFloat(r.revenue as any || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount as any || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const avgOccupancy = records?.length ? 
        records.reduce((sum, r) => sum + parseFloat(r.occupancy as any || 0), 0) / records.length : 0;
      const avgADR = records?.length ?
        records.reduce((sum, r) => sum + parseFloat(r.adr as any || 0), 0) / records.length : 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        avgOccupancy,
        avgADR,
        records: records || [],
        expenses: expenses || []
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t("შემოსავალი", "Revenue"),
      value: `€${financeData?.totalRevenue.toFixed(2) || 0}`,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: t("ხარჯები", "Expenses"),
      value: `€${financeData?.totalExpenses.toFixed(2) || 0}`,
      icon: TrendingDown,
      color: "text-destructive"
    },
    {
      title: t("მოგება", "Profit"),
      value: `€${financeData?.netProfit.toFixed(2) || 0}`,
      icon: TrendingUp,
      color: financeData && financeData.netProfit > 0 ? "text-success" : "text-destructive"
    },
    {
      title: t("მარჟა", "Margin"),
      value: `${financeData?.profitMargin.toFixed(1) || 0}%`,
      icon: Percent,
      color: "text-primary"
    }
  ];

  return (
    <div id="finance-dashboard" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t("ოკუპაცია", "Occupancy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ocean">
              {financeData?.avgOccupancy.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t("საშუალო დღიური ტარიფი", "Average Daily Rate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              €{financeData?.avgADR.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {financeData && financeData.records.length > 0 && (
        <FinanceCharts records={financeData.records} expenses={financeData.expenses} />
      )}
    </div>
  );
};
