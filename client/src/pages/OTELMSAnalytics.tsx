import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Building2 } from "lucide-react";
import { useMemo } from "react";

export default function OTELMSAnalytics() {
  // Fetch latest OTELMS report
  const { data: latestReport, isLoading: loadingLatest } = trpc.otelms.getLatest.useQuery();
  
  // Fetch last 30 days statistics
  const endDate = useMemo(() => new Date().toISOString(), []);
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }, []);
  
  const { data: stats, isLoading: loadingStats } = trpc.otelms.getStatistics.useQuery({
    startDate,
    endDate,
  });

  // Fetch all reports for table
  const { data: allReports, isLoading: loadingAll } = trpc.otelms.getAll.useQuery();

  const isLoading = loadingLatest || loadingStats || loadingAll;

  // Parse channel data from latest report
  const channelData = useMemo(() => {
    if (!latestReport?.channelData) return [];
    
    const data = latestReport.channelData as Record<string, { count: number; revenue: number }>;
    return Object.entries(data).map(([name, values]) => ({
      name,
      count: values.count,
      revenue: values.revenue / 100, // Convert from tetri to GEL
    }));
  }, [latestReport]);

  // Calculate total channel revenue
  const totalChannelRevenue = useMemo(() => {
    return channelData.reduce((sum, channel) => sum + channel.revenue, 0);
  }, [channelData]);

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E40] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading OTELMS data...</p>
        </div>
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="p-8 min-h-screen">
        <div className="glass-card p-8 text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No OTELMS Data Available</h2>
          <p className="text-slate-600">
            Daily reports from OTELMS will appear here once the email integration is active.
          </p>
        </div>
      </div>
    );
  }

  // Format report date
  const reportDate = new Date(latestReport.reportDate);
  const formattedDate = reportDate.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // KPIs from latest report
  const kpis = [
    {
      title: "Check-ins Today",
      value: latestReport.checkIns || 0,
      subtitle: "Guests arriving",
      icon: Users,
      gradient: "ocean-gradient-blue",
    },
    {
      title: "Check-outs Today",
      value: latestReport.checkOuts || 0,
      subtitle: "Guests departing",
      icon: Calendar,
      gradient: "ocean-gradient-cyan",
    },
    {
      title: "Daily Revenue",
      value: `₾${((latestReport.totalRevenue || 0) / 100).toLocaleString()}`,
      subtitle: formattedDate,
      icon: DollarSign,
      gradient: "ocean-gradient-teal",
    },
    {
      title: "Occupancy Rate",
      value: `${((latestReport.occupancyRate || 0) / 100).toFixed(1)}%`,
      subtitle: `${latestReport.roomsOccupied || 0} rooms occupied`,
      icon: Building2,
      gradient: "ocean-gradient-orange",
    },
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 drop-shadow-sm">
          OTELMS Analytics
        </h1>
        <p className="text-slate-700 text-lg">
          Real-time data from OTELMS Hotel Management System
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          
          return (
            <div
              key={kpi.title}
              className={`${kpi.gradient} rounded-2xl p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/90 font-medium text-sm">{kpi.title}</span>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{kpi.value}</div>
              <div className="text-white/80 text-sm">{kpi.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Guest Statistics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Guest Statistics</CardTitle>
            <CardDescription>Current occupancy details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Guests</span>
                <span className="text-2xl font-bold text-slate-900">
                  {latestReport.totalGuests || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Children</span>
                <span className="text-2xl font-bold text-slate-900">
                  {latestReport.totalChildren || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Rooms Occupied</span>
                <span className="text-2xl font-bold text-slate-900">
                  {latestReport.roomsOccupied || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cars Parked</span>
                <span className="text-2xl font-bold text-slate-900">
                  {latestReport.carsParked || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Metrics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue Metrics</CardTitle>
            <CardDescription>Performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">ADR (Average Daily Rate)</span>
                <span className="text-2xl font-bold text-slate-900">
                  ₾{((latestReport.adr || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">RevPAR</span>
                <span className="text-2xl font-bold text-slate-900">
                  ₾{((latestReport.revPAR || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cancellations</span>
                <span className="text-2xl font-bold text-red-600">
                  {latestReport.cancellations || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Channel Performance (Last 24 Hours)</CardTitle>
          <CardDescription>Bookings and revenue by distribution channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelData.map((channel) => {
              const percentage = totalChannelRevenue > 0
                ? (channel.revenue / totalChannelRevenue) * 100
                : 0;
              
              return (
                <div key={channel.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        ₾{channel.revenue.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {channel.count} bookings
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B5E40] rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Total Revenue (24h)</span>
              <span className="text-2xl font-bold text-[#1B5E40]">
                ₾{totalChannelRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last 30 Days Statistics */}
      {stats && (
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle>Last 30 Days Summary</CardTitle>
            <CardDescription>Aggregated statistics from {stats.reportCount} daily reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Check-ins</p>
                <p className="text-3xl font-bold text-slate-900">{stats.checkIns}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Check-outs</p>
                <p className="text-3xl font-bold text-slate-900">{stats.checkOuts}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-[#1B5E40]">
                  ₾{((stats.totalRevenue || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Occupancy</p>
                <p className="text-3xl font-bold text-slate-900">
                  {((stats.occupancyRate || 0) / 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Daily Reports</CardTitle>
          <CardDescription>Historical OTELMS data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Check-ins</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Check-outs</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Occupancy</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Guests</th>
                </tr>
              </thead>
              <tbody>
                {allReports?.slice(0, 10).map((report) => {
                  const date = new Date(report.reportDate);
                  return (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {date.toLocaleDateString('ka-GE')}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {report.checkIns}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {report.checkOuts}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-[#1B5E40]">
                        ₾{((report.totalRevenue || 0) / 100).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {((report.occupancyRate || 0) / 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {report.totalGuests}
                      </td>
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
