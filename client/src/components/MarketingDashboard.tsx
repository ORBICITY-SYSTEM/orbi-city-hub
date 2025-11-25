import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { TrendingUp, TrendingDown, Users, DollarSign, Eye, MousePointerClick } from "lucide-react";

Chart.register(...registerables);

// Mock marketing data from Distribution Channels PDF
const channelData = {
  facebook: { impressions: 45200, clicks: 3850, conversions: 127, revenue: 18500, spend: 2400 },
  instagram: { impressions: 38900, clicks: 3200, conversions: 98, revenue: 14200, spend: 1900 },
  booking: { impressions: 125000, clicks: 8900, conversions: 342, revenue: 85400, spend: 12800 },
  agoda: { impressions: 42000, clicks: 2100, conversions: 78, revenue: 12300, spend: 1850 },
  expedia: { impressions: 38500, clicks: 1950, conversions: 52, revenue: 8900, spend: 1340 },
  tiktok: { impressions: 52000, clicks: 4200, conversions: 64, revenue: 9200, spend: 1600 },
  airbnb: { impressions: 31000, clicks: 2400, conversions: 89, revenue: 13500, spend: 2025 },
  youtube: { impressions: 28000, clicks: 1800, conversions: 42, revenue: 6100, spend: 900 },
  tripadvisor: { impressions: 19500, clicks: 1200, conversions: 35, revenue: 5200, spend: 780 },
};

const monthlyPerformance = [
  { month: "Jan", revenue: 145000, bookings: 420, avgPrice: 345 },
  { month: "Feb", revenue: 138000, bookings: 395, avgPrice: 349 },
  { month: "Mar", revenue: 162000, bookings: 465, avgPrice: 348 },
  { month: "Apr", revenue: 178000, bookings: 510, avgPrice: 349 },
  { month: "May", revenue: 195000, bookings: 560, avgPrice: 348 },
  { month: "Jun", revenue: 210000, bookings: 605, avgPrice: 347 },
  { month: "Jul", revenue: 225000, bookings: 648, avgPrice: 347 },
  { month: "Aug", revenue: 218000, bookings: 625, avgPrice: 349 },
];

export function MarketingDashboard() {
  const channelChartRef = useRef<HTMLCanvasElement>(null);
  const roiChartRef = useRef<HTMLCanvasElement>(null);
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const conversionChartRef = useRef<HTMLCanvasElement>(null);

  const totalImpressions = Object.values(channelData).reduce((sum, ch) => sum + ch.impressions, 0);
  const totalClicks = Object.values(channelData).reduce((sum, ch) => sum + ch.clicks, 0);
  const totalConversions = Object.values(channelData).reduce((sum, ch) => sum + ch.conversions, 0);
  const totalRevenue = Object.values(channelData).reduce((sum, ch) => sum + ch.revenue, 0);
  const totalSpend = Object.values(channelData).reduce((sum, ch) => sum + ch.spend, 0);
  const totalROI = ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(1);
  const avgCTR = (totalClicks / totalImpressions * 100).toFixed(2);
  const avgConversionRate = (totalConversions / totalClicks * 100).toFixed(2);

  useEffect(() => {
    // Channel Performance Chart
    if (channelChartRef.current) {
      const ctx = channelChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: Object.keys(channelData).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
            datasets: [{
              label: "Revenue (₾)",
              data: Object.values(channelData).map(ch => ch.revenue),
              backgroundColor: "rgba(34, 197, 94, 0.7)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: 1
            }, {
              label: "Spend (₾)",
              data: Object.values(channelData).map(ch => ch.spend),
              backgroundColor: "rgba(239, 68, 68, 0.7)",
              borderColor: "rgba(239, 68, 68, 1)",
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "top" },
              title: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    }

    // ROI Chart
    if (roiChartRef.current) {
      const ctx = roiChartRef.current.getContext("2d");
      if (ctx) {
        const roiData = Object.entries(channelData).map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          roi: ((data.revenue - data.spend) / data.spend * 100).toFixed(1)
        })).sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));

        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: roiData.map(d => `${d.name} (${d.roi}%)`),
            datasets: [{
              data: roiData.map(d => parseFloat(d.roi)),
              backgroundColor: [
                "rgba(34, 197, 94, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(168, 85, 247, 0.8)",
                "rgba(251, 146, 60, 0.8)",
                "rgba(236, 72, 153, 0.8)",
                "rgba(14, 165, 233, 0.8)",
                "rgba(132, 204, 22, 0.8)",
                "rgba(249, 115, 22, 0.8)",
                "rgba(161, 161, 170, 0.8)",
              ],
              borderWidth: 2,
              borderColor: "#fff"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "right" },
              title: { display: false }
            }
          }
        });
      }
    }

    // Monthly Trend Chart
    if (trendChartRef.current) {
      const ctx = trendChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: monthlyPerformance.map(m => m.month),
            datasets: [{
              label: "Revenue (₾)",
              data: monthlyPerformance.map(m => m.revenue),
              borderColor: "rgba(34, 197, 94, 1)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              fill: true,
              tension: 0.4,
              yAxisID: "y"
            }, {
              label: "Bookings",
              data: monthlyPerformance.map(m => m.bookings),
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: true,
              tension: 0.4,
              yAxisID: "y1"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false
            },
            plugins: {
              legend: { display: true, position: "top" }
            },
            scales: {
              y: {
                type: "linear",
                display: true,
                position: "left",
                title: { display: true, text: "Revenue (₾)" }
              },
              y1: {
                type: "linear",
                display: true,
                position: "right",
                title: { display: true, text: "Bookings" },
                grid: { drawOnChartArea: false }
              }
            }
          }
        });
      }
    }

    // Conversion Funnel Chart
    if (conversionChartRef.current) {
      const ctx = conversionChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Impressions", "Clicks", "Conversions"],
            datasets: [{
              label: "Funnel Metrics",
              data: [totalImpressions, totalClicks, totalConversions],
              backgroundColor: [
                "rgba(59, 130, 246, 0.7)",
                "rgba(168, 85, 247, 0.7)",
                "rgba(34, 197, 94, 0.7)"
              ],
              borderColor: [
                "rgba(59, 130, 246, 1)",
                "rgba(168, 85, 247, 1)",
                "rgba(34, 197, 94, 1)"
              ],
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              x: { beginAtZero: true }
            }
          }
        });
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Marketing Dashboard</h2>
        <p className="text-sm text-gray-600">Multi-channel performance analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium">Total Impressions</div>
              <div className="text-3xl font-bold text-blue-900">{(totalImpressions / 1000).toFixed(1)}K</div>
              <div className="text-xs text-blue-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs last month
              </div>
            </div>
            <Eye className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 font-medium">Total Clicks</div>
              <div className="text-3xl font-bold text-purple-900">{(totalClicks / 1000).toFixed(1)}K</div>
              <div className="text-xs text-purple-600 mt-1">CTR: {avgCTR}%</div>
            </div>
            <MousePointerClick className="h-10 w-10 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 font-medium">Conversions</div>
              <div className="text-3xl font-bold text-green-900">{totalConversions}</div>
              <div className="text-xs text-green-600 mt-1">Rate: {avgConversionRate}%</div>
            </div>
            <Users className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-700 font-medium">ROI</div>
              <div className="text-3xl font-bold text-orange-900">{totalROI}%</div>
              <div className="text-xs text-orange-600 mt-1">₾{(totalRevenue - totalSpend).toLocaleString()} profit</div>
            </div>
            <DollarSign className="h-10 w-10 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Channel Performance</h3>
          <div style={{ height: "300px" }}>
            <canvas ref={channelChartRef}></canvas>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">ROI by Channel</h3>
          <div style={{ height: "300px" }}>
            <canvas ref={roiChartRef}></canvas>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Trend</h3>
          <div style={{ height: "300px" }}>
            <canvas ref={trendChartRef}></canvas>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Conversion Funnel</h3>
          <div style={{ height: "300px" }}>
            <canvas ref={conversionChartRef}></canvas>
          </div>
        </Card>
      </div>

      {/* Channel Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Channel Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Channel</th>
                <th className="text-right py-3 px-4">Impressions</th>
                <th className="text-right py-3 px-4">Clicks</th>
                <th className="text-right py-3 px-4">CTR</th>
                <th className="text-right py-3 px-4">Conversions</th>
                <th className="text-right py-3 px-4">Conv. Rate</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Spend</th>
                <th className="text-right py-3 px-4">ROI</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(channelData).map(([name, data]) => {
                const ctr = (data.clicks / data.impressions * 100).toFixed(2);
                const convRate = (data.conversions / data.clicks * 100).toFixed(2);
                const roi = ((data.revenue - data.spend) / data.spend * 100).toFixed(1);
                return (
                  <tr key={name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium capitalize">{name}</td>
                    <td className="text-right py-3 px-4">{data.impressions.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{data.clicks.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{ctr}%</td>
                    <td className="text-right py-3 px-4">{data.conversions}</td>
                    <td className="text-right py-3 px-4">{convRate}%</td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">₾{data.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-red-600">₾{data.spend.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold text-purple-600">{roi}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
