import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Star, Bot, ArrowUpRight, Download } from "lucide-react";
import { FileUploadManager } from "@/components/FileUploadManager";
import { FileHistory } from "@/components/FileHistory";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CEODashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const kpis = [
    {
      title: "Revenue",
      value: "45,230 ₾",
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      gradient: "ocean-gradient-blue",
    },
    {
      title: "Occupancy",
      value: "85%",
      change: "+5%",
      trend: "up",
      icon: Users,
      gradient: "ocean-gradient-cyan",
    },
    {
      title: "Rating",
      value: "9.2/10",
      change: "+0.3",
      trend: "up",
      icon: Star,
      gradient: "ocean-gradient-orange",
    },
    {
      title: "AI Tasks",
      value: "247",
      change: "+89",
      trend: "up",
      icon: Bot,
      gradient: "ocean-gradient-teal",
    },
  ];

  const channels = [
    { name: "Booking.com", revenue: 18900, percentage: 42, color: "bg-blue-500" },
    { name: "Airbnb", revenue: 13570, percentage: 30, color: "bg-pink-500" },
    { name: "Expedia", revenue: 6785, percentage: 15, color: "bg-yellow-500" },
    { name: "Agoda", revenue: 4523, percentage: 10, color: "bg-green-500" },
    { name: "Others", revenue: 1452, percentage: 3, color: "bg-gray-500" },
  ];

  const insights = [
    {
      title: "Strong October Performance",
      description: "Revenue up 28% compared to September. Booking.com leading with 42% share.",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Excellent Guest Ratings",
      description: "Average rating improved to 9.2/10. Sea view and location most praised.",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "AI Optimization Active",
      description: "247 automated tasks completed this month. 89 more than last month.",
      icon: Bot,
      color: "text-purple-600",
    },
  ];

  const topPerformers = [
    { room: "A 3041", occupancy: "100%", revenue: 4850 },
    { room: "C 2641", occupancy: "96%", revenue: 4620 },
    { room: "D 3418", occupancy: "93%", revenue: 4380 },
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Header with Glassmorphism */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 drop-shadow-sm">CEO Dashboard</h1>
        <p className="text-slate-700 text-lg">Real-time insights for ORBI City Batumi</p>
      </div>

      {/* KPIs with Ocean Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <div key={kpi.title} className={`${kpi.gradient} rounded-2xl p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/90 font-medium text-sm">{kpi.title}</span>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">{kpi.change}</span>
                <span className="text-white/70">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Performance & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Channel */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Revenue by Channel</h3>
              <p className="text-slate-600 text-sm">Distribution across booking platforms</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{channel.revenue.toLocaleString()} ₾</span>
                    <span className="text-xs text-slate-500 ml-2">{channel.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${channel.color} rounded-full transition-all`}
                    style={{ width: `${channel.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quick Insights</h3>
              <p className="text-slate-600 text-sm">AI-powered recommendations</p>
            </div>
            <Bot className="w-5 h-5 text-purple-500" />
          </div>
          
          <div className="space-y-4">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-all">
                  <div className={`p-2 rounded-lg bg-white/80 h-fit`}>
                    <Icon className={`w-4 h-4 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Forecast & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Forecast */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly Forecast</h3>
              <p className="text-xs text-slate-600">AI-predicted performance</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">Expected Revenue</span>
                <span className="text-lg font-bold text-green-600">€52,400</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">Expected Occupancy</span>
                <span className="text-lg font-bold text-blue-600">88%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">Confidence</span>
                <span className="text-lg font-bold text-purple-600">92%</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Recommendation:</strong> Increase prices 8% for Dec 20-27 (high demand period)
              </p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
              <p className="text-xs text-slate-600">Best apartments this month</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {topPerformers.map((room, idx) => (
              <div key={room.room} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{room.room}</div>
                    <div className="text-xs text-slate-600">{room.occupancy} occupancy</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">₾{room.revenue.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
              <p className="text-xs text-slate-600">Common tasks</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start glass-button text-sm">
              <Download className="w-4 h-4 mr-2" />
              Generate Monthly Report
              <span className="ml-auto text-xs text-slate-500">Export P&L, occupancy, revenue</span>
            </Button>
            <Button variant="outline" className="w-full justify-start glass-button text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Review Pricing
              <span className="ml-auto text-xs text-slate-500">AI-suggested price adjustments</span>
            </Button>
            <Button variant="outline" className="w-full justify-start glass-button text-sm">
              <Bot className="w-4 h-4 mr-2" />
              Send Owner Reports
              <span className="ml-auto text-xs text-slate-500">Automated monthly summaries</span>
            </Button>
            <Button variant="outline" className="w-full justify-start glass-button text-sm">
              <Star className="w-4 h-4 mr-2" />
              View Alerts
              <span className="ml-auto text-xs text-slate-500 bg-red-100 text-red-600 px-2 py-0.5 rounded-full">3 pending notifications</span>
            </Button>
          </div>
        </div>
      </div>

      {/* File Manager */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Download className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-xl font-bold text-slate-900">File Manager</h3>
            <p className="text-slate-600 text-sm">ატვირთეთ ფაილი ან ჩამოტვირთეთ ასარჩევი</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Upload New File</h4>
            <FileUploadManager 
              onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
            <p className="text-xs text-slate-500 mt-2">
              Supported formats: Excel (.xlsx, .xls), CSV, PDF, Word, PowerPoint<br />
              Maximum size: 10MB
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">ატვირთული ფაილები</h4>
            <FileHistory key={refreshTrigger} />
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Monthly Overview</h3>
        <p className="text-slate-600 text-sm mb-6">Key metrics for November 2025</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-slate-600 mb-1">Total Bookings</div>
            <div className="text-2xl font-bold text-slate-900">127</div>
            <div className="text-xs text-green-600 mt-1">+12% from Oct</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Avg. Stay</div>
            <div className="text-2xl font-bold text-slate-900">3.2 nights</div>
            <div className="text-xs text-slate-500 mt-1">Same as Oct</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Avg. Price</div>
            <div className="text-2xl font-bold text-slate-900">356 ₾</div>
            <div className="text-xs text-green-600 mt-1">+5% from Oct</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Cancellation Rate</div>
            <div className="text-2xl font-bold text-slate-900">2.1%</div>
            <div className="text-xs text-green-600 mt-1">-0.9% from Oct</div>
          </div>
        </div>
      </div>
    </div>
  );
}
