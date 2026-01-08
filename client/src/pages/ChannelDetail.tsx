import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  Lightbulb,
  Zap,
  Calendar,
  RefreshCw,
  Settings,
} from "lucide-react";
import { CHANNELS } from "@/../../shared/channelsData";

export default function ChannelDetail() {
  const [, params] = useRoute("/marketing/channels/:id");
  const [, setLocation] = useLocation();
  
  const channel = CHANNELS.find(c => c.id === params?.id);

  if (!channel) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Channel Not Found</h2>
          <p className="text-white/70 mb-6">The channel you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/marketing")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketing
          </Button>
        </Card>
      </div>
    );
  }

  const getChannelIcon = (name: string) => {
    const icons: Record<string, string> = {
      "Facebook": "📘",
      "Instagram": "📷",
      "orbicitybatumi.com": "🏢",
      "Booking.com": "🅱️",
      "Agoda": "🅰️",
      "Expedia": "✈️",
      "TikTok": "🎵",
      "ostrovok.ru": "🏝️",
      "sutochno.com": "📅",
      "Airbnb": "🏠",
      "bronevik.com": "💼",
      "tvil.ru": "🏨",
      "Hostelworld": "🎒",
      "YouTube": "▶️",
      "TripAdvisor": "🦉",
    };
    return icons[name] || "🌐";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-base px-4 py-1">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Connected
          </Badge>
        );
      case "not_connected":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-base px-4 py-1">
            <AlertCircle className="w-4 h-4 mr-2" />
            Not Connected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "OTA": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Social Media": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Review Site": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Direct Booking": "bg-green-500/20 text-green-400 border-green-500/30",
      "Metasearch": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-4 border-green-500 bg-green-500/10";
      case "warning":
        return "border-l-4 border-orange-500 bg-orange-500/10";
      case "info":
        return "border-l-4 border-blue-500 bg-blue-500/10";
      default:
        return "border-l-4 border-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/marketing")}
          className="mb-4 text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Channels
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl">
              {getChannelIcon(channel.name)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{channel.name}</h1>
                {getStatusBadge(channel.status)}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(channel.category)}>
                  {channel.category}
                </Badge>
                <span className="text-white/70">•</span>
                <span className="text-white/70">{channel.commissionRate}% Commission</span>
              </div>
              <p className="text-white/70 max-w-2xl">{channel.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20"
              onClick={() => window.open(channel.url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Channel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {channel.metrics.bookings}
          </div>
          <div className="text-sm text-white/70">Total Bookings</div>
          <div className="mt-2 text-xs text-green-400">
            +{channel.metrics.monthlyGrowth}% this month
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ₾{channel.metrics.revenue.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">Total Revenue</div>
          <div className="mt-2 text-xs text-white/50">
            Avg: ₾{channel.metrics.avgBookingValue}/booking
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {channel.metrics.roi}%
          </div>
          <div className="text-sm text-white/70">ROI</div>
          <div className="mt-2 text-xs text-green-400">
            {channel.metrics.conversionRate}% conversion rate
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-orange-400" />
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ₾{channel.metrics.commission.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">Commission Paid</div>
          <div className="mt-2 text-xs text-orange-400">
            {channel.commissionRate}% rate
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Connection Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">API Integration</span>
                <Badge className={channel.connection.apiIntegrated ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {channel.connection.apiIntegrated ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {channel.connection.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Last Sync</span>
                  <span className="text-white">
                    {new Date(channel.connection.lastSync).toLocaleString()}
                  </span>
                </div>
              )}
              {channel.connection.syncFrequency && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Sync Frequency</span>
                  <span className="text-white">{channel.connection.syncFrequency}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Commission Calculator */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Commission Calculator
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Commission Rate</span>
                  <span className="text-2xl font-bold text-orange-400">
                    {channel.commissionRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total Commission Paid</span>
                  <span className="text-xl font-bold text-white">
                    ₾{channel.metrics.commission.toLocaleString()}
                  </span>
                </div>
              </div>
              {channel.upgrades.potentialSavings && channel.upgrades.potentialSavings > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">Potential Savings</span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">
                    By upgrading, you could save up to:
                  </p>
                  <div className="text-2xl font-bold text-green-400">
                    ₾{channel.upgrades.potentialSavings.toLocaleString()}/month
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Best Practices */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Best Practices
            </h3>
            <ul className="space-y-3">
              {channel.bestPractices.map((practice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">{practice}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upgrade Opportunities */}
          {channel.upgrades.available && channel.upgrades.suggestions.length > 0 && (
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Upgrade Opportunities
              </h3>
              <div className="space-y-3">
                {channel.upgrades.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white/10 p-4 rounded-lg">
                    <p className="text-white text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Card>
          )}

          {/* AI Insights */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {channel.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${getInsightColor(insight.type)}`}
                >
                  <p className="text-white text-sm">{insight.message}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-white/10 border-white/20 justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Update Availability
              </Button>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Adjust Pricing
              </Button>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Channel Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
