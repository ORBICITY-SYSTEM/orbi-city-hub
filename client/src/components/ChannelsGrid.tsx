import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useLocation } from "wouter";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  status: "connected" | "not_connected" | "coming_soon";
  commissionRate: number;
  metrics: {
    bookings: number;
    revenue: number;
    roi: number;
    monthlyGrowth: number;
  };
}

interface ChannelsGridProps {
  channels: Channel[];
  comingSoonChannels?: any[];
}

export default function ChannelsGrid({ channels, comingSoonChannels = [] }: ChannelsGridProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(channels.map(c => c.category)))];

  // Filter channels
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get channel logo (using emoji as placeholder)
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
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case "not_connected":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        );
      case "coming_soon":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Coming Soon
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Distribution Channels</h2>
            <DataSourceBadge type="demo" size="md" />
          </div>
          <p className="text-white/70 mt-1">
            Manage your {channels.length} active booking channels
          </p>
        </div>
        <Button variant="outline" className="bg-white/10 border-white/20">
          <ExternalLink className="w-4 h-4 mr-2" />
          Add New Channel
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              }
            >
              {category === "all" ? "All" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <Card
            key={channel.id}
            className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover:bg-white/15 transition-all cursor-pointer"
            onClick={() => setLocation(`/marketing/channels/${channel.id}`)}
          >
            {/* Channel Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                  {getChannelIcon(channel.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{channel.name}</h3>
                  <Badge className={getCategoryColor(channel.category)}>
                    {channel.category}
                  </Badge>
                </div>
              </div>
              {getStatusBadge(channel.status)}
            </div>

            {/* Metrics */}
            {channel.status === "connected" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Bookings</span>
                  <span className="text-white font-semibold">
                    {channel.metrics.bookings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Revenue</span>
                  <span className="text-white font-semibold">
                    ₾{channel.metrics.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">ROI</span>
                  <span className="text-green-400 font-semibold flex items-center gap-1">
                    {channel.metrics.roi}%
                    <TrendingUp className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Growth</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
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
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Commission</span>
                    <span className="text-orange-400 font-semibold">
                      {channel.commissionRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Coming Soon Info */}
            {channel.status === "coming_soon" && (
              <div className="text-center py-4">
                <p className="text-white/70 text-sm">
                  Integration in progress
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      {comingSoonChannels.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Coming Soon - Strategic Partnerships
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoonChannels.map((channel) => (
              <Card
                key={channel.id}
                className="bg-white/5 backdrop-blur-md border-white/10 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{channel.name}</h4>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
                  {channel.estimatedLaunch}
                </Badge>
                <p className="text-white/60 text-sm">{channel.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredChannels.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12 text-center">
          <Filter className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No channels found
          </h3>
          <p className="text-white/70">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      )}
    </div>
  );
}
