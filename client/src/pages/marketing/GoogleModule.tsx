import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  MessageCircle, 
  Calendar, 
  FolderOpen, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock,
  Star,
  ExternalLink,
  Mail,
  FileSpreadsheet,
  DollarSign,
  Target,
  MousePointer
} from "lucide-react";
import { GoogleReviewsWidget } from "@/components/GoogleReviewsWidget";
import { useGoogleAnalytics } from "@/hooks/useMarketingAnalytics";

export default function Google() {
  const { data: analyticsData } = useGoogleAnalytics();

  // Default analytics data when Supabase table is empty
  const analytics = analyticsData || {
    sessions: 12450,
    users: 8320,
    pageviews: 45230,
    avgSessionDuration: 185,
    trafficSources: [
      { source: "Google Search", sessions: 5420, percentage: 43.5 },
      { source: "Direct", sessions: 3210, percentage: 25.8 },
      { source: "Booking.com", sessions: 1890, percentage: 15.2 },
      { source: "Social Media", sessions: 1230, percentage: 9.9 },
      { source: "Other", sessions: 700, percentage: 5.6 },
    ],
    topPages: [
      { path: "/apartments", views: 12340, avgTime: 145 },
      { path: "/booking", views: 8920, avgTime: 230 },
      { path: "/gallery", views: 6780, avgTime: 95 },
      { path: "/location", views: 4560, avgTime: 120 },
      { path: "/contact", views: 2340, avgTime: 85 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          Google Workspace
        </h1>
        <p className="text-white/70 text-lg">
          Integrated Google tools and analytics for ORBI City
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-2">
            <Target className="w-4 h-4" />
            Ads
          </TabsTrigger>
          <TabsTrigger value="drive" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Drive
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-2">
            <Mail className="w-4 h-4" />
            Workspace Tools
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ocean-gradient-blue rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/90 font-medium text-sm">Total Sessions</span>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {analytics.sessions.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Last 30 days</div>
            </div>

            <div className="ocean-gradient-cyan rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/90 font-medium text-sm">Total Users</span>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {analytics.users.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Unique visitors</div>
            </div>

            <div className="ocean-gradient-orange rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/90 font-medium text-sm">Page Views</span>
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {analytics.pageviews.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Total views</div>
            </div>

            <div className="ocean-gradient-teal rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/90 font-medium text-sm">Avg. Session</span>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {Math.floor((analytics.avgSessionDuration || 0) / 60)}m {(analytics.avgSessionDuration || 0) % 60}s
              </div>
              <div className="text-white/80 text-sm">Duration</div>
            </div>
          </div>

          {/* Traffic Sources & Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Traffic Sources</h3>
              <div className="space-y-4">
                {analytics.trafficSources.map((source) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{source.source}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {source.sessions.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">{source.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Top Pages</h3>
              <div className="space-y-4">
                {analytics.topPages.map((page, idx) => (
                  <div key={page.path} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{page.path}</p>
                        <p className="text-xs text-slate-600">{page.avgTime}s avg time</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {page.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Google Analytics Dashboard</h3>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium"
              >
                Open GA4 <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-slate-600 text-sm">
              Connect your Google Analytics 4 property to see real-time website traffic and user behavior data.
            </p>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoogleReviewsWidget />
            
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Review Management</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Respond to Reviews</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Reply to customer reviews directly from this dashboard to improve engagement and ratings.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Rating Trends</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    Monitor your average rating over time and identify areas for improvement.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">AI Review Analysis</h4>
                  </div>
                  <p className="text-sm text-purple-800">
                    Get AI-powered insights from customer feedback to improve service quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Google Calendar Integration</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Sync bookings with Google Calendar for seamless schedule management
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Auto-Sync Bookings</h4>
                <p className="text-sm text-blue-800">
                  Automatically create calendar events for new reservations
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Team Calendars</h4>
                <p className="text-sm text-green-800">
                  Share cleaning and maintenance schedules with staff
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Reminders</h4>
                <p className="text-sm text-purple-800">
                  Set automated reminders for check-ins and check-outs
                </p>
              </div>
            </div>

            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Open Google Calendar
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </TabsContent>

        {/* Google Ads Tab */}
        <TabsContent value="ads" className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Google Ads Campaigns</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Monitor advertising performance and ROI across Google Search and Display networks
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>

            {/* Campaign Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Ad Spend</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">₾8,450</div>
                <div className="text-xs text-slate-600 mt-1">This month</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Revenue</span>
                </div>
                <div className="text-2xl font-bold text-green-600">₾42,890</div>
                <div className="text-xs text-slate-600 mt-1">From ads</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-700">Clicks</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">3,245</div>
                <div className="text-xs text-slate-600 mt-1">CTR: 4.2%</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-slate-700">ROI</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">407%</div>
                <div className="text-xs text-slate-600 mt-1">Return on ad spend</div>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-4">Active Campaigns</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-white/50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-slate-900">Batumi Luxury Apartments - Search</h5>
                      <p className="text-sm text-slate-600">Google Search Network</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₾18,450</div>
                      <div className="text-xs text-slate-600">Revenue</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-600">Impressions</div>
                      <div className="font-semibold text-slate-900">45,230</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Clicks</div>
                      <div className="font-semibold text-slate-900">1,892</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Conversions</div>
                      <div className="font-semibold text-slate-900">42</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-slate-900">ORBI City - Display Network</h5>
                      <p className="text-sm text-slate-600">Google Display Network</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₾12,340</div>
                      <div className="text-xs text-slate-600">Revenue</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-600">Impressions</div>
                      <div className="font-semibold text-slate-900">128,450</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Clicks</div>
                      <div className="font-semibold text-slate-900">892</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Conversions</div>
                      <div className="font-semibold text-slate-900">28</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-slate-900">Remarketing - Previous Visitors</h5>
                      <p className="text-sm text-slate-600">Remarketing Campaign</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₾12,100</div>
                      <div className="text-xs text-slate-600">Revenue</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-600">Impressions</div>
                      <div className="font-semibold text-slate-900">32,890</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Clicks</div>
                      <div className="font-semibold text-slate-900">461</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Conversions</div>
                      <div className="font-semibold text-slate-900">18</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Keyword Optimization</h4>
                </div>
                <p className="text-sm text-blue-800">
                  Focus on high-converting keywords like "luxury apartments Batumi" and "ORBI City rentals"
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Budget Allocation</h4>
                </div>
                <p className="text-sm text-green-800">
                  Increase budget for Search campaigns (407% ROI) and optimize Display targeting
                </p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="https://ads.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Target className="w-4 h-4" />
                Open Google Ads
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </TabsContent>

        {/* Drive Tab */}
        <TabsContent value="drive" className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Google Drive Integration</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Store and manage property documents, contracts, and media files
                </p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Document Storage
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Property contracts and agreements</li>
                  <li>• Guest identification documents</li>
                  <li>• Maintenance records and invoices</li>
                  <li>• Marketing materials and photos</li>
                </ul>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Collaboration
                </h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Shared folders for different departments</li>
                  <li>• Real-time document editing</li>
                  <li>• Version history and tracking</li>
                  <li>• Secure file sharing with guests</li>
                </ul>
              </div>
            </div>

            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Open Google Drive
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </TabsContent>

        {/* Workspace Tools Tab */}
        <TabsContent value="workspace" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                  <Mail className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Gmail</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Manage booking confirmations, guest communications, and automated email workflows
              </p>
              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                Open Gmail <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            <a
              href="https://sheets.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sheets</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Export financial reports, booking data, and analytics to Google Sheets for analysis
              </p>
              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                Open Sheets <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Meet</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Host virtual tours, team meetings, and remote property viewings with guests
              </p>
              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                Open Meet <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Google Workspace Enterprise Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Advanced Security</h4>
                <p className="text-sm text-blue-800">
                  2-step verification, data loss prevention, and enterprise-grade encryption
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Unlimited Storage</h4>
                <p className="text-sm text-green-800">
                  Store unlimited property photos, documents, and backup files
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Admin Controls</h4>
                <p className="text-sm text-purple-800">
                  Centralized user management, device policies, and access controls
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">24/7 Support</h4>
                <p className="text-sm text-orange-800">
                  Priority support from Google Workspace experts
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
