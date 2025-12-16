import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Building2, Users2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import { useMemo } from "react";

export const ProfitROIModule = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["monthly-reports-profit"],
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

    const totals = reports.reduce((acc: any, r: any) => ({
      totalProfit: acc.totalProfit + (r.total_profit || 0),
      companyProfit: acc.companyProfit + (r.company_profit || 0),
      ownersProfit: acc.ownersProfit + (r.studio_owners_profit || 0),
      revenue: acc.revenue + (r.total_revenue || 0),
      expenses: acc.expenses + (r.total_expenses || 0),
    }), { totalProfit: 0, companyProfit: 0, ownersProfit: 0, revenue: 0, expenses: 0 });

    const profitMargin = totals.revenue > 0 ? (totals.totalProfit / totals.revenue) * 100 : 0;
    const avgStudioCount = reports.reduce((sum: number, r: any) => sum + (r.studio_count || 0), 0) / reports.length;
    const avgProfitPerStudio = totals.totalProfit / (avgStudioCount * reports.length);

    return {
      totalProfit: totals.totalProfit,
      companyProfit: totals.companyProfit,
      ownersProfit: totals.ownersProfit,
      profitMargin,
      avgProfitPerStudio,
    };
  }, [reports]);

  const chartData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    return reports.map((report: any) => ({
      month: format(new Date(report.month), 'MMM'),
      totalProfit: report.total_profit || 0,
      companyProfit: report.company_profit || 0,
      ownersProfit: report.studio_owners_profit || 0,
      revenue: report.total_revenue || 0,
      expenses: report.total_expenses || 0,
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
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₾{metrics.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Oct 2024 - Sep 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Profit</CardTitle>
            <Building2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₾{metrics.companyProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((metrics.companyProfit / metrics.totalProfit) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owners Profit</CardTitle>
            <Users2 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₾{metrics.ownersProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((metrics.ownersProfit / metrics.totalProfit) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit Distribution</CardTitle>
            <CardDescription>Company vs Studio Owners profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => `₾${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="companyProfit" fill="hsl(142, 76%, 36%)" name="Company Profit" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ownersProfit" fill="hsl(48, 96%, 53%)" name="Owners Profit" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit Trend</CardTitle>
            <CardDescription>Monthly profit performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => `₾${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalProfit" 
                  stroke="hsl(262, 83%, 58%)" 
                  strokeWidth={3}
                  name="Total Profit"
                  dot={{ fill: "hsl(262, 83%, 58%)", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Profit Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Profit Analysis</CardTitle>
          <CardDescription>Compare revenue, expenses, and profit trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => `₾${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
              <Area type="monotone" dataKey="totalProfit" stroke="hsl(262, 83%, 58%)" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit Details</CardTitle>
          <CardDescription>Complete profit breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Month</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">Expenses</th>
                  <th className="text-right py-3 px-4 font-semibold">Total Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">Company</th>
                  <th className="text-right py-3 px-4 font-semibold">Owners</th>
                </tr>
              </thead>
              <tbody>
                {reports?.map((report: any) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">
                      {format(new Date(report.month), 'MMMM yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right text-success">
                      ₾{(report.total_revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-destructive">
                      ₾{(report.total_expenses || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">
                      ₾{(report.total_profit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-success">
                      ₾{(report.company_profit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-warning">
                      ₾{(report.studio_owners_profit || 0).toLocaleString()}
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
