import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, DollarSign, Percent, Target } from "lucide-react";
import Plot from "react-plotly.js";

export function PLOverview() {
  const { data, isLoading } = trpc.finance.getPLOverview.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading financial data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No financial data available</div>
      </div>
    );
  }

  const { summary, kpis } = data;

  // Prepare data for Plotly
  const months = summary.map(s => s.month);
  const revenue = summary.map(s => s.totalRevenue);
  const expenses = summary.map(s => s.totalExpenses);
  const profit = summary.map(s => s.totalProfit);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{kpis.totalAnnualRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Oct 2024 - Sep 2025
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{kpis.totalAnnualProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.revenueGrowth > 0 ? '+' : ''}{kpis.revenueGrowth}% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgProfitMargin}%</div>
            <p className="text-xs text-muted-foreground">
              Across all months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.roi}%</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Trend</CardTitle>
          <CardDescription>Revenue, Expenses, and Net Profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                x: months,
                y: revenue,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Revenue',
                line: { color: '#10b981', width: 3 },
                marker: { size: 8 },
              },
              {
                x: months,
                y: expenses,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Expenses',
                line: { color: '#ef4444', width: 3 },
                marker: { size: 8 },
              },
              {
                x: months,
                y: profit,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Net Profit',
                line: { color: '#3b82f6', width: 3 },
                marker: { size: 8 },
              },
            ]}
            layout={{
              autosize: true,
              height: 400,
              margin: { l: 60, r: 40, t: 40, b: 60 },
              xaxis: {
                title: { text: 'Month' },
                showgrid: true,
                gridcolor: '#e5e7eb',
              },
              yaxis: {
                title: { text: 'Amount (₾)' },
                showgrid: true,
                gridcolor: '#e5e7eb',
              },
              legend: {
                orientation: 'h',
                y: -0.2,
              },
              hovermode: 'x unified',
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed financial metrics by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Expenses</th>
                  <th className="text-right p-2">Profit</th>
                  <th className="text-right p-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((month) => (
                  <tr key={month.month} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="text-right p-2 text-green-600">₾{month.totalRevenue.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">₾{month.totalExpenses.toLocaleString()}</td>
                    <td className="text-right p-2 text-blue-600">₾{month.totalProfit.toLocaleString()}</td>
                    <td className="text-right p-2">{month.profitMargin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
