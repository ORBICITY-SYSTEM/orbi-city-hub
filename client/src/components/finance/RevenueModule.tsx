import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo } from "react";

export const RevenueModule = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["monthly-reports-revenue"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("monthly_reports" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const metrics = useMemo(() => {
    if (!reports || reports.length === 0) return null;

    const totalRevenue = reports.reduce((sum: number, r: any) => sum + (r.total_revenue || 0), 0);
    const avgRevenue = totalRevenue / reports.length;
    const highestMonth = reports.reduce((max: any, r: any) => 
      (r.total_revenue || 0) > (max?.total_revenue || 0) ? r : max, reports[0]);
    const avgOccupancy = reports.reduce((sum: number, r: any) => sum + (r.occupancy || 0), 0) / reports.length;

    return {
      total: totalRevenue,
      average: avgRevenue,
      highest: highestMonth,
      avgOccupancy,
    };
  }, [reports]);

  const chartData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    return reports.map((report: any) => ({
      month: format(new Date(report.month), 'MMM yyyy'),
      revenue: report.total_revenue || 0,
    }));
  }, [reports]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card>
          <CardHeader className="h-32 bg-muted" />
          <CardContent className="h-64 bg-muted/50" />
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₾{metrics.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Oct 2024 - Sep 2025
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{metrics.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per month average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Month</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{(metrics.highest.total_revenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(metrics.highest.month), 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Building2 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all periods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => `₾${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed revenue by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Month</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">Occupancy</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {reports?.map((report: any) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">
                      {format(new Date(report.month), 'MMMM yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-success">
                      ₾{(report.total_revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(report.occupancy || 0).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₾{(report.average_price || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
