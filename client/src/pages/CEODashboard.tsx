import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Star, Bot, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportCEODashboardToCSV, type CEODashboardData } from "@/lib/csvExport";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function CEODashboard() {
  // Fetch real-time data from tRPC
  const { data: kpisData, isLoading: kpisLoading } = trpc.ceoDashboard.getKPIs.useQuery();
  const { data: channelData, isLoading: channelLoading } = trpc.ceoDashboard.getRevenueByChannel.useQuery();
  const { data: monthlyData, isLoading: monthlyLoading } = trpc.ceoDashboard.getMonthlyOverview.useQuery();

  const isLoading = kpisLoading || channelLoading || monthlyLoading;

  // Map KPI data to display format
  const kpis = kpisData ? [
    {
      title: "Revenue",
      value: kpisData.revenue.formatted,
      change: `${kpisData.revenue.change > 0 ? '+' : ''}${kpisData.revenue.change}%`,
      trend: kpisData.revenue.change >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Occupancy",
      value: kpisData.occupancy.formatted,
      change: `${kpisData.occupancy.change > 0 ? '+' : ''}${kpisData.occupancy.change}%`,
      trend: kpisData.occupancy.change >= 0 ? "up" : "down",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Rating",
      value: kpisData.rating.formatted,
      change: `${kpisData.rating.change > 0 ? '+' : ''}${kpisData.rating.change}`,
      trend: kpisData.rating.change >= 0 ? "up" : "down",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "AI Tasks",
      value: kpisData.aiTasks.formatted,
      change: `+${kpisData.aiTasks.change}`,
      trend: "up",
      icon: Bot,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ] : [];

  const channels = channelData || [];

  const handleExportCSV = () => {
    if (!kpisData || !channelData || !monthlyData) {
      toast.error("Data is still loading. Please wait...");
      return;
    }

    const dashboardData: CEODashboardData = {
      kpis: {
        revenue: kpisData.revenue.value,
        revenueChange: kpisData.revenue.change,
        occupancy: kpisData.occupancy.value,
        occupancyChange: kpisData.occupancy.change,
        rating: kpisData.rating.value,
        ratingChange: kpisData.rating.change,
        aiTasks: kpisData.aiTasks.value,
        aiTasksChange: kpisData.aiTasks.change,
      },
      revenueByChannel: channels.map(ch => ({
        channel: ch.channel,
        amount: ch.revenue,
        percentage: ch.percentage,
      })),
      monthlyOverview: {
        totalBookings: monthlyData.totalBookings,
        bookingsChange: monthlyData.bookingsChange,
        avgStay: monthlyData.avgStay,
        avgStayChange: monthlyData.avgStayChange,
        avgPrice: monthlyData.avgPrice,
        avgPriceChange: monthlyData.avgPriceChange,
        cancellationRate: monthlyData.cancellationRate,
        cancellationRateChange: monthlyData.cancellationRateChange,
      },
    };
    exportCEODashboardToCSV(dashboardData);
    toast.success("Dashboard data exported to CSV successfully!");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">CEO Dashboard</h1>
          <p className="text-slate-600">Real-time insights for ORBI City Batumi</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendIcon className={`w-4 h-4 ${kpi.color}`} />
                  <span className={kpi.color}>{kpi.change}</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>Distribution across booking platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channels.map((channel, idx) => {
                const colors = ["bg-blue-500", "bg-pink-500", "bg-yellow-500", "bg-green-500", "bg-gray-500"];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={channel.channel}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {channel.channel}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          {channel.revenue.toLocaleString()} ₾
                        </div>
                        <div className="text-xs text-slate-500">
                          {channel.percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: `${channel.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      Strong Performance
                    </h4>
                    <p className="text-sm text-green-700">
                      {kpisData && kpisData.revenue.change > 0 
                        ? `Revenue up ${kpisData.revenue.change}% compared to last month.`
                        : "Monitoring revenue trends for optimization opportunities."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Guest Ratings
                    </h4>
                    <p className="text-sm text-blue-700">
                      {kpisData 
                        ? `Average rating: ${kpisData.rating.value}/10. ${kpisData.rating.change >= 0 ? 'Improving' : 'Needs attention'}.`
                        : "Tracking guest satisfaction metrics."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">
                      AI Optimization Active
                    </h4>
                    <p className="text-sm text-purple-700">
                      {kpisData 
                        ? `${kpisData.aiTasks.value} automated tasks completed. ${kpisData.aiTasks.change} more than last month.`
                        : "AI systems processing operational tasks."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      {monthlyData && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Key metrics for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Bookings</div>
                <div className="text-2xl font-bold text-slate-900">{monthlyData.totalBookings}</div>
                <div className={`text-xs ${monthlyData.bookingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyData.bookingsChange > 0 ? '+' : ''}{monthlyData.bookingsChange}% from last month
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Avg. Stay</div>
                <div className="text-2xl font-bold text-slate-900">{monthlyData.avgStay} nights</div>
                <div className="text-xs text-slate-500">{monthlyData.avgStayChange}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Avg. Price</div>
                <div className="text-2xl font-bold text-slate-900">{monthlyData.avgPrice} ₾</div>
                <div className={`text-xs ${monthlyData.avgPriceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyData.avgPriceChange > 0 ? '+' : ''}{monthlyData.avgPriceChange}% from last month
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Cancellation Rate</div>
                <div className="text-2xl font-bold text-slate-900">{monthlyData.cancellationRate}%</div>
                <div className={`text-xs ${monthlyData.cancellationRateChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyData.cancellationRateChange > 0 ? '+' : ''}{monthlyData.cancellationRateChange}% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
