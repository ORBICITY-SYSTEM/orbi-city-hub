import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Lightbulb,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  category: string;
  commissionRate: number;
  metrics: {
    bookings: number;
    revenue: number;
    commission: number;
    roi: number;
    conversionRate: number;
    avgBookingValue: number;
    monthlyGrowth: number;
  };
}

interface ChannelComparisonProps {
  channels: Channel[];
}

type SortField = "bookings" | "revenue" | "roi" | "commission" | "growth";
type SortDirection = "asc" | "desc";

export default function ChannelComparison({ channels }: ChannelComparisonProps) {
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    channels.slice(0, 5).map(c => c.id)
  );

  // Sort channels
  const sortedChannels = [...channels].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortField) {
      case "bookings":
        aValue = a.metrics.bookings;
        bValue = b.metrics.bookings;
        break;
      case "revenue":
        aValue = a.metrics.revenue;
        bValue = b.metrics.revenue;
        break;
      case "roi":
        aValue = a.metrics.roi;
        bValue = b.metrics.roi;
        break;
      case "commission":
        aValue = a.metrics.commission;
        bValue = b.metrics.commission;
        break;
      case "growth":
        aValue = a.metrics.monthlyGrowth;
        bValue = b.metrics.monthlyGrowth;
        break;
      default:
        return 0;
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Filter selected channels
  const displayChannels = sortedChannels.filter(c => selectedChannels.includes(c.id));

  // Calculate totals
  const totals = displayChannels.reduce(
    (acc, channel) => ({
      bookings: acc.bookings + channel.metrics.bookings,
      revenue: acc.revenue + channel.metrics.revenue,
      commission: acc.commission + channel.metrics.commission,
    }),
    { bookings: 0, revenue: 0, commission: 0 }
  );

  // Toggle channel selection
  const toggleChannel = (id: string) => {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get top performers
  const topBookings = [...channels].sort((a, b) => b.metrics.bookings - a.metrics.bookings)[0];
  const topRevenue = [...channels].sort((a, b) => b.metrics.revenue - a.metrics.revenue)[0];
  const topROI = [...channels].sort((a, b) => b.metrics.roi - a.metrics.roi)[0];
  const lowestCommission = [...channels].sort((a, b) => a.commissionRate - b.commissionRate)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Channel Comparison</h2>
          <p className="text-white/70 mt-1">
            Compare performance across {displayChannels.length} selected channels
          </p>
        </div>
      </div>

      {/* Top Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-white/70 text-sm">Most Bookings</span>
          </div>
          <div className="text-xl font-bold text-white">{topBookings?.name}</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {topBookings?.metrics.bookings}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white/70 text-sm">Highest Revenue</span>
          </div>
          <div className="text-xl font-bold text-white">{topRevenue?.name}</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            ₾{topRevenue?.metrics.revenue.toLocaleString()}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-white/70 text-sm">Best ROI</span>
          </div>
          <div className="text-xl font-bold text-white">{topROI?.name}</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {topROI?.metrics.roi}%
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="text-white/70 text-sm">Lowest Commission</span>
          </div>
          <div className="text-xl font-bold text-white">{lowestCommission?.name}</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">
            {lowestCommission?.commissionRate}%
          </div>
        </Card>
      </div>

      {/* Channel Selection */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Channels to Compare</h3>
        <div className="flex flex-wrap gap-2">
          {channels.map(channel => (
            <Badge
              key={channel.id}
              className={`cursor-pointer transition-all ${
                selectedChannels.includes(channel.id)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
              }`}
              onClick={() => toggleChannel(channel.id)}
            >
              {channel.name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left text-white/70 pb-4 pr-4">Channel</th>
              <th
                className="text-right text-white/70 pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort("bookings")}
              >
                <div className="flex items-center justify-end gap-1">
                  Bookings
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="text-right text-white/70 pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort("revenue")}
              >
                <div className="flex items-center justify-end gap-1">
                  Revenue
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="text-right text-white/70 pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort("commission")}
              >
                <div className="flex items-center justify-end gap-1">
                  Commission
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="text-right text-white/70 pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort("roi")}
              >
                <div className="flex items-center justify-end gap-1">
                  ROI
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="text-right text-white/70 pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort("growth")}
              >
                <div className="flex items-center justify-end gap-1">
                  Growth
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-right text-white/70 pb-4 pl-4">Avg Booking</th>
            </tr>
          </thead>
          <tbody>
            {displayChannels.map(channel => (
              <tr key={channel.id} className="border-b border-white/10">
                <td className="py-4 pr-4">
                  <div>
                    <div className="font-semibold text-white">{channel.name}</div>
                    <div className="text-xs text-white/60">{channel.category}</div>
                  </div>
                </td>
                <td className="text-right text-white py-4 px-4">
                  {channel.metrics.bookings}
                </td>
                <td className="text-right text-white py-4 px-4">
                  ₾{channel.metrics.revenue.toLocaleString()}
                </td>
                <td className="text-right py-4 px-4">
                  <div className="text-orange-400">
                    ₾{channel.metrics.commission.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/60">
                    {channel.commissionRate}%
                  </div>
                </td>
                <td className="text-right text-green-400 py-4 px-4">
                  {channel.metrics.roi}%
                </td>
                <td className="text-right py-4 px-4">
                  <span
                    className={`flex items-center justify-end gap-1 ${
                      channel.metrics.monthlyGrowth > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {channel.metrics.monthlyGrowth > 0 ? "+" : ""}
                    {channel.metrics.monthlyGrowth}%
                    {channel.metrics.monthlyGrowth > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                  </span>
                </td>
                <td className="text-right text-white py-4 pl-4">
                  ₾{channel.metrics.avgBookingValue}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-white/5 font-bold">
              <td className="py-4 pr-4 text-white">TOTAL</td>
              <td className="text-right text-white py-4 px-4">
                {totals.bookings}
              </td>
              <td className="text-right text-white py-4 px-4">
                ₾{totals.revenue.toLocaleString()}
              </td>
              <td className="text-right text-orange-400 py-4 px-4">
                ₾{totals.commission.toLocaleString()}
              </td>
              <td className="text-right text-white py-4 px-4">-</td>
              <td className="text-right text-white py-4 px-4">-</td>
              <td className="text-right text-white py-4 pl-4">-</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          AI Recommendations
        </h3>
        <div className="space-y-3">
          <div className="bg-white/10 p-4 rounded-lg border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold mb-1">Optimize Commission Costs</p>
                <p className="text-white/80 text-sm">
                  Focus on {lowestCommission?.name} ({lowestCommission?.commissionRate}% commission) and orbicitybatumi.com (0% commission) to reduce costs by ₾{totals.commission.toLocaleString()} monthly.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold mb-1">Boost High-ROI Channels</p>
                <p className="text-white/80 text-sm">
                  {topROI?.name} has the highest ROI ({topROI?.metrics.roi}%). Increase marketing spend here for maximum returns.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold mb-1">Review Underperforming Channels</p>
                <p className="text-white/80 text-sm">
                  Channels with negative growth need attention. Consider adjusting pricing, improving listings, or reallocating resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Bulk Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-blue-500 hover:bg-blue-600">
            Update Prices Across All Channels
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20">
            Sync Availability
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20">
            Export Comparison Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
