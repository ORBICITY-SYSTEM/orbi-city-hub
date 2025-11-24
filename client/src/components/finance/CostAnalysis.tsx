import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp } from "lucide-react";
import Plot from "react-plotly.js";

export function CostAnalysis() {
  const { data, isLoading } = trpc.finance.getCostAnalysis.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading cost data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No cost data available</div>
      </div>
    );
  }

  const { totalByCategory, fastestGrowing, costBreakdown } = data;

  // Prepare data for donut chart
  const categories = ['Cleaning/Tech', 'Marketing', 'Salaries', 'Utilities'];
  const values = [
    totalByCategory.cleaning,
    totalByCategory.marketing,
    totalByCategory.salaries,
    totalByCategory.utilities,
  ];
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Calculate month-over-month trends
  const latestMonth = costBreakdown[costBreakdown.length - 1];
  const previousMonth = costBreakdown[costBreakdown.length - 2];

  return (
    <div className="space-y-6">
      {/* Insight Card */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <CardTitle>AI Insight: Fastest Growing Expense</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{fastestGrowing.category}</p>
            <p className="text-sm text-muted-foreground">{fastestGrowing.insight}</p>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">
                {fastestGrowing.growthPercent > 0 ? '+' : ''}{fastestGrowing.growthPercent}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Total expenses by category (Oct 2024 - Sep 2025)</CardDescription>
          </CardHeader>
          <CardContent>
            <Plot
              data={[
                {
                  values: values,
                  labels: categories,
                  type: 'pie',
                  hole: 0.4,
                  marker: {
                    colors: colors,
                  },
                  textinfo: 'label+percent',
                  textposition: 'outside',
                  hovertemplate: '<b>%{label}</b><br>₾%{value:,.0f}<br>%{percent}<extra></extra>',
                },
              ]}
              layout={{
                autosize: true,
                height: 400,
                margin: { l: 20, r: 20, t: 20, b: 20 },
                showlegend: false,
              }}
              config={{
                displayModeBar: false,
                responsive: true,
              }}
              style={{ width: '100%' }}
            />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Total spend by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category, index) => {
                const value = values[index];
                const total = values.reduce((sum, v) => sum + v, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index] }}
                        />
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      <span className="text-sm font-bold">₾{value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors[index],
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Trend</CardTitle>
          <CardDescription>Expense breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                x: costBreakdown.map(m => m.month),
                y: costBreakdown.map(m => m.cleaning),
                type: 'bar',
                name: 'Cleaning/Tech',
                marker: { color: colors[0] },
              },
              {
                x: costBreakdown.map(m => m.month),
                y: costBreakdown.map(m => m.marketing),
                type: 'bar',
                name: 'Marketing',
                marker: { color: colors[1] },
              },
              {
                x: costBreakdown.map(m => m.month),
                y: costBreakdown.map(m => m.salaries),
                type: 'bar',
                name: 'Salaries',
                marker: { color: colors[2] },
              },
              {
                x: costBreakdown.map(m => m.month),
                y: costBreakdown.map(m => m.utilities),
                type: 'bar',
                name: 'Utilities',
                marker: { color: colors[3] },
              },
            ]}
            layout={{
              autosize: true,
              height: 400,
              margin: { l: 60, r: 40, t: 40, b: 60 },
              barmode: 'stack',
              xaxis: {
                title: { text: 'Month' },
              },
              yaxis: {
                title: { text: 'Amount (₾)' },
              },
              legend: {
                orientation: 'h',
                y: -0.2,
              },
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Latest Month Comparison */}
      {previousMonth && latestMonth && (
        <Card>
          <CardHeader>
            <CardTitle>Month-over-Month Comparison</CardTitle>
            <CardDescription>
              {previousMonth.month} vs {latestMonth.month}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: 'Cleaning/Tech', prev: previousMonth.cleaning, curr: latestMonth.cleaning },
                { label: 'Marketing', prev: previousMonth.marketing, curr: latestMonth.marketing },
                { label: 'Salaries', prev: previousMonth.salaries, curr: latestMonth.salaries },
                { label: 'Utilities', prev: previousMonth.utilities, curr: latestMonth.utilities },
              ].map((item) => {
                const change = ((item.curr - item.prev) / item.prev) * 100;
                const isIncrease = change > 0;
                
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-2xl font-bold">₾{item.curr.toLocaleString()}</div>
                    <div className={`text-sm flex items-center gap-1 ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                      <TrendingUp className={`h-4 w-4 ${isIncrease ? '' : 'rotate-180'}`} />
                      {isIncrease ? '+' : ''}{change.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
