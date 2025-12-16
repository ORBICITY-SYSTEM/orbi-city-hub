import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, Calendar, Euro, Building2, Activity, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const OTADashboard = () => {
  const [syncing, setSyncing] = useState(false);

  // Fetch OTA channel data from database
  const { data: channels = [], isLoading: channelsLoading, refetch: refetchChannels } = trpc.ota.getChannels.useQuery();
  const { data: totals, isLoading: totalsLoading } = trpc.ota.getTotals.useQuery();

  const handleSync = async () => {
    setSyncing(true);
    try {
      await refetchChannels();
      toast.success("სინქრონიზაცია დასრულდა", {
        description: "OTA არხების მონაცემები განახლდა"
      });
    } catch (error) {
      toast.error("სინქრონიზაცია ვერ მოხერხდა");
    } finally {
      setSyncing(false);
    }
  };

  // Prepare chart data
  const chartData = (channels as any[]).map((ch: any) => ({
    name: ch.name,
    bookings: ch.total_bookings,
    revenue: parseFloat(ch.total_revenue) || 0,
    nights: ch.total_nights,
    avgRevenue: parseFloat(ch.avg_revenue) || 0
  }));

  const pieData = chartData.map((ch, idx) => ({
    name: ch.name,
    value: ch.revenue,
    color: COLORS[idx % COLORS.length]
  }));

  const totalBookings = totals?.total_bookings || 0;
  const totalRevenue = parseFloat(totals?.total_revenue as string) || 0;
  const totalNights = totals?.total_nights || 0;
  const activeChannels = totals?.active_channels || 0;
  const avgRevenue = totalBookings > 0 ? totalRevenue / Number(totalBookings) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Orbi OTA Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time booking analytics across all channels
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            size="lg"
            className="gap-2 bg-cyan-600 hover:bg-cyan-700"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">{Number(totalBookings).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                0 cancelled
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">
                  €{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg: €{avgRevenue.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Nights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">{Number(totalNights).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all bookings
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">
                  {Number(activeChannels)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                OTA platforms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Channel Bar Chart */}
          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                Revenue by Channel
              </CardTitle>
              <CardDescription>Total revenue from each OTA platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2' }}
                    />
                    <Bar dataKey="revenue" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Distribution Pie Chart */}
          <Card className="border-cyan-500/30 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Revenue Distribution
              </CardTitle>
              <CardDescription>Share of revenue by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance Table */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Revenue and booking count by OTA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {chartData
                .sort((a, b) => b.revenue - a.revenue)
                .map((channel, idx) => (
                  <Card key={channel.name} className="border-cyan-500/20 bg-slate-800/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{channel.name}</h3>
                        <Badge className="bg-cyan-600">{channel.bookings}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-cyan-400">
                        €{channel.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{channel.nights} nights</span>
                        <span>Avg: €{channel.avgRevenue.toFixed(0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel Details Table */}
        <Card className="border-cyan-500/30 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Detailed Channel Statistics</CardTitle>
            <CardDescription>Complete breakdown of all OTA channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Channel</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Bookings</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Nights</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Avg/Booking</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((channel) => (
                      <tr key={channel.name} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium text-white">{channel.name}</td>
                        <td className="text-right py-3 px-4">{channel.bookings.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-cyan-400 font-semibold">
                          €{channel.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4">{channel.nights.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">€{channel.avgRevenue.toFixed(0)}</td>
                        <td className="text-right py-3 px-4">
                          {totalRevenue > 0 ? ((channel.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-cyan-500/50 bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white">TOTAL</td>
                    <td className="text-right py-3 px-4 font-bold">{Number(totalBookings).toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold text-cyan-400">
                      €{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right py-3 px-4 font-bold">{Number(totalNights).toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold">€{avgRevenue.toFixed(0)}</td>
                    <td className="text-right py-3 px-4 font-bold">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTADashboard;
