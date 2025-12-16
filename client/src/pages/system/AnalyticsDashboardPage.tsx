import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  const { data: taskStats } = trpc.analytics.getTaskStats.useQuery({ period });
  const { data: approvalRate } = trpc.analytics.getApprovalRate.useQuery({ period });
  const { data: errorRate } = trpc.analytics.getErrorRate.useQuery({ period });
  const { data: responseTime } = trpc.analytics.getResponseTime.useQuery({ period });
  const { data: trendData } = trpc.analytics.getTrend.useQuery({ days: period === "today" ? 1 : period === "week" ? 7 : 30 });

  const periodLabels = {
    today: "Today",
    week: "This Week",
    month: "This Month",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Analytics Dashboard</h1>
              <p className="text-slate-400">Monitor AI task performance and efficiency</p>
            </div>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tasks Completed */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Tasks Completed</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {taskStats?.completed || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {periodLabels[period]}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {taskStats?.pending || 0} pending
                </Badge>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  {taskStats?.failed || 0} failed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Approval Rate */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Approval Rate</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {approvalRate?.rate || 0}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {approvalRate?.approved || 0} of {approvalRate?.total || 0} suggestions
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${approvalRate?.rate || 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Rate */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Error Rate</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {errorRate?.rate || 0}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {errorRate?.failed || 0} of {errorRate?.total || 0} tasks
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${(errorRate?.rate || 0) > 10 ? "bg-red-500/20" : "bg-yellow-500/20"}`}>
                  <AlertTriangle className={`w-6 h-6 ${(errorRate?.rate || 0) > 10 ? "text-red-400" : "text-yellow-400"}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (errorRate?.rate || 0) > 10 ? "bg-red-500" : (errorRate?.rate || 0) > 5 ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(errorRate?.rate || 0, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Response Time</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {responseTime?.avgMinutes || 0}
                    <span className="text-lg text-slate-400 ml-1">min</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Time to approval
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                {(responseTime?.avgMinutes || 0) < 5 ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400">Excellent</Badge>
                ) : (responseTime?.avgMinutes || 0) < 15 ? (
                  <Badge className="bg-yellow-500/20 text-yellow-400">Good</Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">Needs Improvement</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Task Completion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                      name="Completed"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failed" 
                      stroke="#ef4444" 
                      fillOpacity={1}
                      fill="url(#colorFailed)"
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                  <p>No trend data available yet</p>
                  <p className="text-sm text-slate-500 mt-1">Data will appear as AI tasks are executed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Estimated Time Saved</p>
                  <p className="text-xl font-bold text-white">
                    {((taskStats?.completed || 0) * 5)} min
                  </p>
                  <p className="text-xs text-slate-500">Based on 5 min avg per task</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Automation Rate</p>
                  <p className="text-xl font-bold text-white">
                    {taskStats && (taskStats.completed + taskStats.pending + taskStats.failed) > 0
                      ? Math.round((taskStats.completed / (taskStats.completed + taskStats.pending + taskStats.failed)) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-slate-500">Tasks completed automatically</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Success Rate</p>
                  <p className="text-xl font-bold text-white">
                    {100 - (errorRate?.rate || 0)}%
                  </p>
                  <p className="text-xs text-slate-500">Tasks completed without errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
