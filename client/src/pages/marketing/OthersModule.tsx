import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Users, TrendingUp, Send, Eye, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OthersModule() {
  // Mock data for Email, SMS, Referral channels
  const emailStats = {
    totalSent: 1250,
    openRate: 32.5,
    clickRate: 8.2,
    bounceRate: 2.1,
    unsubscribeRate: 0.5,
  };

  const smsStats = {
    totalSent: 450,
    deliveryRate: 98.5,
    clickRate: 15.3,
    responseRate: 22.1,
  };

  const referralStats = {
    totalReferrals: 89,
    conversionRate: 18.5,
    revenue: 12500,
    topReferrers: [
      { name: "Travel Blogs", count: 25, revenue: 4200 },
      { name: "Partner Websites", count: 18, revenue: 3100 },
      { name: "Affiliate Links", count: 15, revenue: 2800 },
      { name: "Direct Referrals", count: 31, revenue: 2400 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10 text-white p-8 rounded-lg mb-6 shadow-xl">
        <h1 className="text-4xl font-bold mb-2">📬 Other Marketing Channels</h1>
        <p className="text-white/90 font-bold">
          Email Marketing • SMS Campaigns • Referral Programs
        </p>
      </div>

      {/* Email Marketing */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Email Marketing
        </h2>

        <div className="grid grid-cols-5 gap-4 mb-4">
          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Total Sent</div>
            <div className="text-2xl font-bold text-white">{emailStats.totalSent.toLocaleString()}</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Open Rate
            </div>
            <div className="text-2xl font-bold text-green-300">{emailStats.openRate}%</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold flex items-center gap-1">
              <MousePointerClick className="w-4 h-4" />
              Click Rate
            </div>
            <div className="text-2xl font-bold text-blue-300">{emailStats.clickRate}%</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Bounce Rate</div>
            <div className="text-2xl font-bold text-orange-300">{emailStats.bounceRate}%</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Unsubscribe</div>
            <div className="text-2xl font-bold text-red-300">{emailStats.unsubscribeRate}%</div>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Email Campaigns</CardTitle>
            <CardDescription className="text-white/70">Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Summer Promotion 2025", sent: 450, open: 35.2, click: 9.1, status: "Completed" },
                { name: "Weekly Newsletter #45", sent: 380, open: 28.5, click: 6.8, status: "Completed" },
                { name: "Last Minute Deals", sent: 420, open: 42.1, click: 12.3, status: "Completed" },
              ].map((campaign, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-bold text-white">{campaign.name}</div>
                    <div className="text-sm text-white/70">Sent: {campaign.sent} • Open: {campaign.open}% • Click: {campaign.click}%</div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">{campaign.status}</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold">
              <Send className="w-4 h-4 mr-2" />
              Create New Email Campaign
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SMS Marketing */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          SMS Marketing
        </h2>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Total Sent</div>
            <div className="text-2xl font-bold text-white">{smsStats.totalSent.toLocaleString()}</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Delivery Rate</div>
            <div className="text-2xl font-bold text-green-300">{smsStats.deliveryRate}%</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Click Rate</div>
            <div className="text-2xl font-bold text-blue-300">{smsStats.clickRate}%</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Response Rate</div>
            <div className="text-2xl font-bold text-purple-300">{smsStats.responseRate}%</div>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">SMS Campaign Templates</CardTitle>
            <CardDescription className="text-white/70">Quick send templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Booking Confirmation", usage: 120 },
                { name: "Check-in Reminder", usage: 95 },
                { name: "Special Offer Alert", usage: 78 },
                { name: "Feedback Request", usage: 62 },
              ].map((template, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-bold text-white">{template.name}</div>
                    <div className="text-sm text-white/70">Used {template.usage} times this month</div>
                  </div>
                  <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Program */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Referral Program
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Total Referrals</div>
            <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Conversion Rate</div>
            <div className="text-2xl font-bold text-green-300">{referralStats.conversionRate}%</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="text-sm text-white/80 mb-1 font-bold">Revenue Generated</div>
            <div className="text-2xl font-bold text-yellow-300">₾{referralStats.revenue.toLocaleString()}</div>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Top Referral Sources</CardTitle>
            <CardDescription className="text-white/70">Best performing referral channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.topReferrers.map((referrer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white">{referrer.name}</div>
                      <div className="text-sm text-white/70">{referrer.count} referrals</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-300">₾{referrer.revenue.toLocaleString()}</div>
                    <div className="text-xs text-white/70">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
