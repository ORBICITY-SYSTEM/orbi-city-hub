import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import ManusAIChat from "@/components/ManusAIChat";

export default function Marketing() {
  const channels = [
    { name: "Booking.com", status: "active", bookings: 53 },
    { name: "Airbnb", status: "active", bookings: 38 },
    { name: "Expedia", status: "active", bookings: 19 },
    { name: "Agoda", status: "active", bookings: 12 },
    { name: "Ostrovok", status: "active", bookings: 8 },
    { name: "TikTok", status: "active", bookings: 6 },
    { name: "Trip.com", status: "active", bookings: 5 },
    { name: "Sutochno", status: "active", bookings: 4 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Marketing</h1>
        <p className="text-slate-600">Distribution channels and campaigns</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Distribution Channels
          </CardTitle>
          <CardDescription>15 active booking platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.name}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{channel.name}</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-slate-900">{channel.bookings}</div>
                <p className="text-xs text-slate-600">bookings this month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>TikTok & Instagram performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">TikTok Views</span>
                  <span className="text-lg font-bold">15.2K</span>
                </div>
                <div className="text-sm text-green-600">+120% this month</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Instagram Engagement</span>
                  <span className="text-lg font-bold">8.5%</span>
                </div>
                <div className="text-sm text-green-600">+2.3% this month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign ROI</CardTitle>
            <CardDescription>Return on marketing investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-2">12.5x</div>
            <p className="text-sm text-slate-600">
              Every 1 ₾ spent generates 12.5 ₾ in revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manus AI Assistant */}
      <ManusAIChat
        module="Marketing"
        title="📢 Marketing AI Agent"
        description="Upload campaign data or ask about channel performance, ROI optimization, social media strategy"
        placeholder="e.g., 'Which channel has best ROI?' or 'Suggest TikTok content ideas'"
      />
    </div>
  );
}
