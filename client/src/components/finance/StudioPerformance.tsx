import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, TrendingUp, DollarSign } from "lucide-react";
import Plot from "react-plotly.js";

export function StudioPerformance() {
  const { data, isLoading } = trpc.finance.getStudioPerformance.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading studio data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No studio data available</div>
      </div>
    );
  }

  const { studioGrowth, revenuePerStudio } = data;

  // Calculate metrics
  const firstMonth = studioGrowth[0];
  const lastMonth = studioGrowth[studioGrowth.length - 1];
  const totalGrowth = lastMonth.studioCount - firstMonth.studioCount;
  const growthPercent = ((totalGrowth / firstMonth.studioCount) * 100).toFixed(1);
  
  const avgOccupancy = (
    studioGrowth.reduce((sum, s) => sum + s.occupancyRate, 0) / studioGrowth.length
  ).toFixed(1);
  
  const avgRevenuePerStudio = Math.round(
    revenuePerStudio.reduce((sum, r) => sum + r.revenuePerStudio, 0) / revenuePerStudio.length
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Studios</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastMonth.studioCount}</div>
            <p className="text-xs text-muted-foreground">
              +{totalGrowth} studios ({growthPercent}% growth)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOccupancy}%</div>
            <p className="text-xs text-muted-foreground">
              Across all months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue per Studio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₾{avgRevenuePerStudio.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Studio Growth Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Count Growth</CardTitle>
          <CardDescription>Number of active studios per month</CardDescription>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                x: studioGrowth.map(s => s.month),
                y: studioGrowth.map(s => s.studioCount),
                type: 'bar',
                marker: {
                  color: studioGrowth.map(s => s.studioCount),
                  colorscale: [
                    [0, '#10b981'],
                    [1, '#059669'],
                  ],
                },
                text: studioGrowth.map(s => s.studioCount.toString()),
                textposition: 'outside',
                hovertemplate: '<b>%{x}</b><br>Studios: %{y}<extra></extra>',
              },
            ]}
            layout={{
              autosize: true,
              height: 400,
              margin: { l: 60, r: 40, t: 40, b: 60 },
              xaxis: {
                title: { text: 'Month' },
              },
              yaxis: {
                title: { text: 'Number of Studios' },
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Occupancy Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate Trend</CardTitle>
            <CardDescription>Monthly occupancy percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <Plot
              data={[
                {
                  x: studioGrowth.map(s => s.month),
                  y: studioGrowth.map(s => s.occupancyRate),
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#3b82f6', width: 3 },
                  marker: { size: 8 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(59, 130, 246, 0.1)',
                  hovertemplate: '<b>%{x}</b><br>Occupancy: %{y:.1f}%<extra></extra>',
                },
              ]}
              layout={{
                autosize: true,
                height: 300,
                margin: { l: 60, r: 40, t: 20, b: 60 },
                xaxis: {
                  title: { text: 'Month' },
                },
                yaxis: {
                  title: { text: 'Occupancy (%)' },
                  range: [0, 100],
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

        {/* Revenue per Studio */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue per Studio</CardTitle>
            <CardDescription>Average revenue generated per studio</CardDescription>
          </CardHeader>
          <CardContent>
            <Plot
              data={[
                {
                  x: revenuePerStudio.map(r => r.month),
                  y: revenuePerStudio.map(r => r.revenuePerStudio),
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#10b981', width: 3 },
                  marker: { size: 8 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(16, 185, 129, 0.1)',
                  hovertemplate: '<b>%{x}</b><br>₾%{y:,.0f}<extra></extra>',
                },
              ]}
              layout={{
                autosize: true,
                height: 300,
                margin: { l: 60, r: 40, t: 20, b: 60 },
                xaxis: {
                  title: { text: 'Month' },
                },
                yaxis: {
                  title: { text: 'Revenue (₾)' },
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
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Performance Details</CardTitle>
          <CardDescription>Monthly metrics breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Studios</th>
                  <th className="text-right p-2">Growth</th>
                  <th className="text-right p-2">Occupancy</th>
                  <th className="text-right p-2">Revenue/Studio</th>
                  <th className="text-right p-2">Profit/Studio</th>
                </tr>
              </thead>
              <tbody>
                {studioGrowth.map((studio, index) => {
                  const revenue = revenuePerStudio[index];
                  return (
                    <tr key={studio.month} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{studio.month}</td>
                      <td className="text-right p-2">{studio.studioCount}</td>
                      <td className="text-right p-2 text-green-600">
                        {studio.growthPercent > 0 ? '+' : ''}{studio.growthPercent}%
                      </td>
                      <td className="text-right p-2">{studio.occupancyRate}%</td>
                      <td className="text-right p-2">₾{revenue.revenuePerStudio.toLocaleString()}</td>
                      <td className="text-right p-2">₾{revenue.profitPerStudio.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
