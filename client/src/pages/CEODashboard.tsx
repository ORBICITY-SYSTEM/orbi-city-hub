import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Star, Bot } from "lucide-react";
import { FileUploadManager } from "@/components/FileUploadManager";
import { FileHistory } from "@/components/FileHistory";
import { useState } from "react";

export default function CEODashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Mock data - will be replaced with real tRPC queries
  const kpis = [
    {
      title: "Revenue",
      value: "45,230 ₾",
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Occupancy",
      value: "85%",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Rating",
      value: "9.2/10",
      change: "+0.3",
      trend: "up",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "AI Tasks",
      value: "247",
      change: "+89",
      trend: "up",
      icon: Bot,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const channels = [
    { name: "Booking.com", revenue: 18900, percentage: 42, color: "bg-blue-500" },
    { name: "Airbnb", revenue: 13570, percentage: 30, color: "bg-pink-500" },
    { name: "Expedia", revenue: 6785, percentage: 15, color: "bg-yellow-500" },
    { name: "Agoda", revenue: 4523, percentage: 10, color: "bg-green-500" },
    { name: "Others", revenue: 1452, percentage: 3, color: "bg-gray-500" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">CEO Dashboard</h1>
        <p className="text-slate-600">Real-time insights for ORBI City Batumi</p>
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
              {channels.map((channel) => (
                <div key={channel.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {channel.name}
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
                      className={`${channel.color} h-2 rounded-full transition-all`}
                      style={{ width: `${channel.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
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
                      Strong October Performance
                    </h4>
                    <p className="text-sm text-green-700">
                      Revenue up 28% compared to September. Booking.com leading with 42% share.
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
                      Excellent Guest Ratings
                    </h4>
                    <p className="text-sm text-blue-700">
                      Average rating improved to 9.2/10. Sea view and location most praised.
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
                      247 automated tasks completed this month. 89 more than last month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">📁 ფაილების მართვა</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <FileUploadManager
              module="CEO"
              onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </div>
          <div>
            <FileHistory module="CEO" refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Key metrics for November 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">Total Bookings</div>
              <div className="text-2xl font-bold text-slate-900">127</div>
              <div className="text-xs text-green-600">+12% from Oct</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Avg. Stay</div>
              <div className="text-2xl font-bold text-slate-900">3.2 nights</div>
              <div className="text-xs text-slate-500">Same as Oct</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Avg. Price</div>
              <div className="text-2xl font-bold text-slate-900">356 ₾</div>
              <div className="text-xs text-green-600">+8% from Oct</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Cancellation Rate</div>
              <div className="text-2xl font-bold text-slate-900">2.1%</div>
              <div className="text-xs text-green-600">-0.5% from Oct</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
