import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Wrench, Megaphone, Users, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Pie, PieChart, Cell } from "recharts";
import { useMemo } from "react";

const EXPENSE_COLORS = {
  cleaning: 'hsl(210, 100%, 50%)',
  marketing: 'hsl(340, 82%, 52%)',
  salaries: 'hsl(160, 60%, 45%)',
  utilities: 'hsl(30, 100%, 50%)',
};

export const ExpensesModule = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["monthly-reports-expenses"],
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
      total: acc.total + (r.total_expenses || 0),
      cleaning: acc.cleaning + (r.cleaning_technical || 0),
      marketing: acc.marketing + (r.marketing || 0),
      salaries: acc.salaries + (r.salaries || 0),
      utilities: acc.utilities + (r.utilities || 0),
    }), { total: 0, cleaning: 0, marketing: 0, salaries: 0, utilities: 0 });

    return {
      total: totals.total,
      average: totals.total / reports.length,
      breakdown: [
        { name: 'Cleaning/Technical', value: totals.cleaning, color: EXPENSE_COLORS.cleaning },
        { name: 'Marketing', value: totals.marketing, color: EXPENSE_COLORS.marketing },
        { name: 'Salaries', value: totals.salaries, color: EXPENSE_COLORS.salaries },
        { name: 'Utilities', value: totals.utilities, color: EXPENSE_COLORS.utilities },
      ],
    };
  }, [reports]);

  const chartData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    return reports.map((report: any) => ({
      month: format(new Date(report.month), 'MMM'),
      cleaning: report.cleaning_technical || 0,
      marketing: report.marketing || 0,
      salaries: report.salaries || 0,
      utilities: report.utilities || 0,
      total: report.total_expenses || 0,
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₾{metrics.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Oct 2024 - Sep 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cleaning/Tech</CardTitle>
            <Wrench className="h-4 w-4" style={{ color: EXPENSE_COLORS.cleaning }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{metrics.breakdown[0].value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((metrics.breakdown[0].value / metrics.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
            <Megaphone className="h-4 w-4" style={{ color: EXPENSE_COLORS.marketing }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{metrics.breakdown[1].value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((metrics.breakdown[1].value / metrics.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salaries</CardTitle>
            <Users className="h-4 w-4" style={{ color: EXPENSE_COLORS.salaries }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{metrics.breakdown[2].value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((metrics.breakdown[2].value / metrics.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilities</CardTitle>
            <Zap className="h-4 w-4" style={{ color: EXPENSE_COLORS.utilities }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{metrics.breakdown[3].value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((metrics.breakdown[3].value / metrics.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Total expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₾${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Expense trends by category</CardDescription>
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
                <Bar dataKey="cleaning" fill={EXPENSE_COLORS.cleaning} name="Cleaning" stackId="a" />
                <Bar dataKey="marketing" fill={EXPENSE_COLORS.marketing} name="Marketing" stackId="a" />
                <Bar dataKey="salaries" fill={EXPENSE_COLORS.salaries} name="Salaries" stackId="a" />
                <Bar dataKey="utilities" fill={EXPENSE_COLORS.utilities} name="Utilities" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Details</CardTitle>
          <CardDescription>Complete breakdown by month and category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Month</th>
                  <th className="text-right py-3 px-4 font-semibold">Cleaning/Tech</th>
                  <th className="text-right py-3 px-4 font-semibold">Marketing</th>
                  <th className="text-right py-3 px-4 font-semibold">Salaries</th>
                  <th className="text-right py-3 px-4 font-semibold">Utilities</th>
                  <th className="text-right py-3 px-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {reports?.map((report: any) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">
                      {format(new Date(report.month), 'MMMM yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₾{(report.cleaning_technical || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₾{(report.marketing || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₾{(report.salaries || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₾{(report.utilities || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-destructive">
                      ₾{(report.total_expenses || 0).toLocaleString()}
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
