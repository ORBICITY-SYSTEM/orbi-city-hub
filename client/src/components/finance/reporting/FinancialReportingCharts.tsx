import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { useMemo } from "react";

interface FinancialReportingChartsProps {
  reports: any[];
}

const COLORS = {
  revenue: 'hsl(221, 83%, 53%)', // blue
  expenses: 'hsl(0, 84%, 60%)', // red
  profit: 'hsl(262, 83%, 58%)', // purple
  companyProfit: 'hsl(142, 76%, 36%)', // green
  ownersProfit: 'hsl(48, 96%, 53%)', // yellow
  occupancy: 'hsl(280, 70%, 50%)', // violet
};

export const FinancialReportingCharts = ({ reports }: FinancialReportingChartsProps) => {
  const chartData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    return [...reports]
      .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .map((report: any) => ({
        month: format(new Date(report.month), 'MMM'),
        revenue: report.total_revenue || 0,
        expenses: report.total_expenses || 0,
        profit: report.total_profit || 0,
        companyProfit: report.company_profit || 0,
        ownersProfit: report.studio_owners_profit || 0,
        occupancy: report.occupancy || 0,
        studios: report.studio_count || 0,
      }));
  }, [reports]);

  const studioGrowth = useMemo(() => {
    if (!reports || reports.length === 0) return { from: 0, to: 0, growth: 0 };
    
    const sortedReports = [...reports].sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    
    const firstMonth = sortedReports[0];
    const lastMonth = sortedReports[sortedReports.length - 1];
    const fromStudios = firstMonth.studio_count || 0;
    const toStudios = lastMonth.studio_count || 0;
    const growthPercent = fromStudios > 0 ? ((toStudios - fromStudios) / fromStudios) * 100 : 0;
    
    return {
      from: fromStudios,
      to: toStudios,
      growth: Math.round(growthPercent * 10) / 10,
    };
  }, [reports]);

  const profitDistribution = useMemo(() => {
    const totalCompany = reports.reduce((sum: number, r: any) => sum + (r.company_profit || 0), 0);
    const totalOwners = reports.reduce((sum: number, r: any) => sum + (r.studio_owners_profit || 0), 0);
    
    return [
      { name: 'Company Profit', value: totalCompany, color: COLORS.companyProfit },
      { name: 'Studio Owners Profit', value: totalOwners, color: COLORS.ownersProfit },
    ];
  }, [reports]);

  const expenseBreakdown = useMemo(() => {
    const totals = reports.reduce((acc: any, r: any) => ({
      cleaning: (acc.cleaning || 0) + (r.cleaning_technical || 0),
      marketing: (acc.marketing || 0) + (r.marketing || 0),
      salaries: (acc.salaries || 0) + (r.salaries || 0),
      utilities: (acc.utilities || 0) + (r.utilities || 0),
    }), {});

    return [
      { name: 'Cleaning/Technical', value: totals.cleaning, color: 'hsl(210, 100%, 50%)' },
      { name: 'Marketing', value: totals.marketing, color: 'hsl(340, 82%, 52%)' },
      { name: 'Salaries', value: totals.salaries, color: 'hsl(160, 60%, 45%)' },
      { name: 'Utilities', value: totals.utilities, color: 'hsl(30, 100%, 50%)' },
    ];
  }, [reports]);

  if (!reports || reports.length === 0) return null;

  // YoY Growth Analysis Data
  const yoyData = useMemo(() => {
    if (reports.length < 2) return null;
    const sorted = [...reports].sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    return {
      studios: {
        start: first.studio_count || 0,
        end: last.studio_count || 0,
        growth: ((last.studio_count - first.studio_count) / first.studio_count * 100).toFixed(1),
      },
      occupancy: {
        start: first.occupancy || 0,
        end: last.occupancy || 0,
        growth: (((last.occupancy - first.occupancy) / first.occupancy) * 100).toFixed(1),
      },
      avgPrice: {
        start: first.average_price || 0,
        end: last.average_price || 0,
        growth: (((last.average_price - first.average_price) / first.average_price) * 100).toFixed(1),
      },
      revenue: {
        start: first.total_revenue || 0,
        end: last.total_revenue || 0,
        growth: (((last.total_revenue - first.total_revenue) / first.total_revenue) * 100).toFixed(1),
      },
    };
  }, [reports]);

  // ROI & Efficiency Data
  const roiData = useMemo(() => {
    return reports.map((r: any) => ({
      month: format(new Date(r.month), 'MMM yyyy'),
      profitMargin: r.total_revenue > 0 ? ((r.total_profit / r.total_revenue) * 100).toFixed(1) : '0',
      revenuePerStudio: r.studio_count > 0 ? (r.total_revenue / r.studio_count).toFixed(0) : '0',
      profitPerStudio: r.studio_count > 0 ? (r.total_profit / r.studio_count).toFixed(0) : '0',
      efficiency: ((r.occupancy / 100) * (r.average_price / 100) * 10).toFixed(1),
    }));
  }, [reports]);

  // Seasonal Performance Data  
  const seasonalData = useMemo(() => {
    return [...reports]
      .map((r: any) => ({
        month: format(new Date(r.month), 'MMM yyyy'),
        revenue: r.total_revenue || 0,
        occupancy: r.occupancy || 0,
        score: (r.total_revenue || 0) * (r.occupancy || 0) / 100,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        performance: index < 3 ? '🔥 Top' : index > reports.length - 4 ? '⚠️ Low' : '→ Average',
      }));
  }, [reports]);

  // Cost Optimization Data
  const costData = useMemo(() => {
    const totals = reports.reduce((acc: any, r: any) => ({
      cleaning: (acc.cleaning || 0) + (r.cleaning_technical || 0),
      marketing: (acc.marketing || 0) + (r.marketing || 0),
      salaries: (acc.salaries || 0) + (r.salaries || 0),
      utilities: (acc.utilities || 0) + (r.utilities || 0),
      revenue: (acc.revenue || 0) + (r.total_revenue || 0),
    }), {});
    
    const totalExpenses = totals.cleaning + totals.marketing + totals.salaries + totals.utilities;
    
    return {
      categories: [
        { name: 'Cleaning/Technical', amount: totals.cleaning, percent: ((totals.cleaning / totalExpenses) * 100).toFixed(1) },
        { name: 'Marketing', amount: totals.marketing, percent: ((totals.marketing / totalExpenses) * 100).toFixed(1) },
        { name: 'Salaries', amount: totals.salaries, percent: ((totals.salaries / totalExpenses) * 100).toFixed(1) },
        { name: 'Utilities', amount: totals.utilities, percent: ((totals.utilities / totalExpenses) * 100).toFixed(1) },
      ],
      expenseRatio: ((totalExpenses / totals.revenue) * 100).toFixed(1),
    };
  }, [reports]);

  if (!reports || reports.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Revenue vs Expenses Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expenses} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.expenses} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `₾${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.revenue} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke={COLORS.expenses} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `₾${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="profit" fill={COLORS.profit} name="Total Profit" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profitDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {profitDistribution.map((entry, index) => (
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
      </div>

      {/* Occupancy and Studios */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `${value}%`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke={COLORS.occupancy} 
                  strokeWidth={3}
                  name="Occupancy %" 
                  dot={{ fill: COLORS.occupancy, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Studio Count Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="studios" fill="hsl(200, 70%, 50%)" name="Studios" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
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

      {/* Company vs Owners Profit Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Company vs Owners Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `₾${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar dataKey="companyProfit" fill={COLORS.companyProfit} name="Company Profit" radius={[8, 8, 0, 0]} />
              <Bar dataKey="ownersProfit" fill={COLORS.ownersProfit} name="Owners Profit" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Studio Growth Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Growth Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">
              October 2024 to September 2025 Period
            </p>
            <p className="text-3xl font-bold">
              <span className="text-muted-foreground">{studioGrowth.from} apartments</span>
              {' → '}
              <span className="text-primary">{studioGrowth.to} apartments</span>
            </p>
            <p className="text-4xl font-bold text-success">
              +{studioGrowth.growth}% Growth
            </p>
          </div>
        </CardContent>
      </Card>

      {/* YoY Growth Analysis */}
      {yoyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Year-over-Year Growth Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-sm font-medium text-muted-foreground">Studios</div>
                <div className="text-2xl font-bold">{yoyData.studios.start} → {yoyData.studios.end}</div>
                <div className="text-sm font-semibold text-success">+{yoyData.studios.growth}% 🔥</div>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="text-sm font-medium text-muted-foreground">Occupancy</div>
                <div className="text-2xl font-bold">{yoyData.occupancy.start}% → {yoyData.occupancy.end}%</div>
                <div className="text-sm font-semibold text-blue-600">+{yoyData.occupancy.growth}% ↑</div>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="text-sm font-medium text-muted-foreground">Avg Price</div>
                <div className="text-2xl font-bold">₾{yoyData.avgPrice.start} → ₾{yoyData.avgPrice.end}</div>
                <div className="text-sm font-semibold text-purple-600">+{yoyData.avgPrice.growth}% 📈</div>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                <div className="text-sm font-medium text-muted-foreground">Revenue</div>
                <div className="text-2xl font-bold">₾{(yoyData.revenue.start / 1000).toFixed(0)}k → ₾{(yoyData.revenue.end / 1000).toFixed(0)}k</div>
                <div className="text-sm font-semibold text-success">+{yoyData.revenue.growth}% 🚀</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI & Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            ROI & Efficiency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Month</th>
                  <th className="text-right p-2 font-semibold">Profit Margin %</th>
                  <th className="text-right p-2 font-semibold">Revenue/Studio</th>
                  <th className="text-right p-2 font-semibold">Profit/Studio</th>
                  <th className="text-right p-2 font-semibold">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {roiData.map((row: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{row.month}</td>
                    <td className="text-right p-2 text-purple-600 font-semibold">{row.profitMargin}%</td>
                    <td className="text-right p-2">₾{Number(row.revenuePerStudio).toLocaleString()}</td>
                    <td className="text-right p-2">₾{Number(row.profitPerStudio).toLocaleString()}</td>
                    <td className="text-right p-2 text-success font-semibold">{row.efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">Period Averages</div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <div className="text-xs text-muted-foreground">Avg Profit Margin</div>
                <div className="text-lg font-bold text-purple-600">
                  {(roiData.reduce((sum: number, r: any) => sum + Number(r.profitMargin), 0) / roiData.length).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Target (Industry)</div>
                <div className="text-lg font-bold">35-40%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="text-lg font-bold text-success">
                  {Number(roiData[0].profitMargin) > 35 ? '🔥 Above Target' : '⚠️ Below Target'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🌡️</span>
            Seasonal Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Rank</th>
                  <th className="text-left p-2 font-semibold">Month</th>
                  <th className="text-right p-2 font-semibold">Revenue</th>
                  <th className="text-right p-2 font-semibold">Occupancy</th>
                  <th className="text-left p-2 font-semibold">Performance</th>
                </tr>
              </thead>
              <tbody>
                {seasonalData.map((row: any) => (
                  <tr key={row.month} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-bold text-primary">#{row.rank}</td>
                    <td className="p-2 font-medium">{row.month}</td>
                    <td className="text-right p-2">₾{row.revenue.toLocaleString()}</td>
                    <td className="text-right p-2">{row.occupancy.toFixed(1)}%</td>
                    <td className="p-2 font-semibold">{row.performance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="text-xs font-medium text-muted-foreground">Best Month</div>
              <div className="text-sm font-bold text-success">{seasonalData[0]?.month}</div>
              <div className="text-xs text-muted-foreground">₾{seasonalData[0]?.revenue.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xs font-medium text-muted-foreground">Highest Occupancy</div>
              <div className="text-sm font-bold text-primary">
                {[...seasonalData].sort((a, b) => b.occupancy - a.occupancy)[0]?.month}
              </div>
              <div className="text-xs text-muted-foreground">
                {[...seasonalData].sort((a, b) => b.occupancy - a.occupancy)[0]?.occupancy.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="text-xs font-medium text-muted-foreground">Needs Attention</div>
              <div className="text-sm font-bold text-amber-600">
                {seasonalData[seasonalData.length - 1]?.month}
              </div>
              <div className="text-xs text-muted-foreground">Improve performance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            Cost Optimization Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {costData.categories.map((cat: any) => (
                <div key={cat.name} className="p-4 rounded-lg border bg-gradient-to-br from-background to-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-muted-foreground">{cat.name}</div>
                    <div className="text-lg font-bold text-primary">{cat.percent}%</div>
                  </div>
                  <div className="text-2xl font-bold">₾{cat.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Overall Expense Ratio</div>
                  <div className="text-xs text-muted-foreground">Total expenses as % of revenue</div>
                </div>
                <div className="text-3xl font-bold text-purple-600">{costData.expenseRatio}%</div>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-semibold">
                  {Number(costData.expenseRatio) < 30 ? '🔥 Efficient' : Number(costData.expenseRatio) > 40 ? '⚠️ High' : '→ Normal'}
                </span>
                {' - '}
                {Number(costData.expenseRatio) < 30 
                  ? 'Excellent cost management'
                  : Number(costData.expenseRatio) > 40 
                  ? 'Consider optimization opportunities'
                  : 'Balanced expense structure'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
