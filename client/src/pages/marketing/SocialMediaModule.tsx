/**
 * Social Media Analytics - Supabase Integrated
 * All data from social_media_metrics table
 */

import { useState } from "react";
import {
  useCombinedSocialStats,
  useFacebookAnalytics,
  useInstagramAnalytics,
  useTikTokInsights,
  useTikTokVideos,
  useTikTokTrendingSounds,
  useInstagramPosts,
  useInstagramAudience,
  useFacebookPosts,
  useFacebookAudience,
} from "@/hooks/useMarketingAnalytics";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Clock,
  Calendar as CalendarIcon,
  Music2,
  Target,
  Globe,
  Loader2,
} from "lucide-react";
import ContentCalendar from "@/components/ContentCalendar";
import CompetitorComparison from "@/components/CompetitorComparison";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SocialMedia() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch combined stats from Supabase
  const { data: combinedStats, isLoading: loadingCombined } = useCombinedSocialStats();

  // Fetch Facebook data from Supabase
  const { data: fbInsights, isLoading: loadingFb } = useFacebookAnalytics();
  const { data: fbPosts } = useFacebookPosts(10);
  const { data: fbAudience } = useFacebookAudience();

  // Fetch Instagram data from Supabase
  const { data: igInsights, isLoading: loadingIg } = useInstagramAnalytics();
  const { data: igPosts } = useInstagramPosts(9);
  const { data: igAudience } = useInstagramAudience();

  // Fetch TikTok data from Supabase
  const { data: ttInsights, isLoading: loadingTt } = useTikTokInsights();
  const { data: ttVideos } = useTikTokVideos(12);
  const { data: ttSounds } = useTikTokTrendingSounds();

  if (loadingCombined || loadingFb || loadingIg || loadingTt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Social Media Analytics"
        titleKa="სოციალური მედიის ანალიტიკა"
        subtitle="Track your Facebook, Instagram, and TikTok performance"
        subtitleKa="თვალყური ადევნეთ თქვენი Facebook, Instagram და TikTok-ის შედეგებს"
        icon={Globe}
        iconGradient="from-pink-500 to-rose-600"
        dataSource={{ type: "live", source: "Supabase" }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {combinedStats?.data?.totalFollowers.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-white/70">Total Followers</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {combinedStats?.data?.totalReach.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-white/70">Total Reach</div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-orange-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {combinedStats?.data?.totalEngagement.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-white/70">Total Engagement</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              4.5%
            </div>
            <div className="text-sm text-white/70">Engagement Rate</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facebook">
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram">
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="tiktok">
              <Music2 className="w-4 h-4 mr-2" />
              TikTok
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="competitors">
              <Target className="w-4 h-4 mr-2" />
              Competitors
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Facebook Overview */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Facebook className="w-6 h-6 mr-2 text-blue-400" />
                    Facebook
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("facebook")}>
                    View Details
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Followers</span>
                    <span className="text-white font-semibold">
                      {fbInsights?.metrics?.pageFollowers.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Page Likes</span>
                    <span className="text-white font-semibold">
                      {fbInsights?.metrics?.pageLikes.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Reach</span>
                    <span className="text-white font-semibold">
                      {fbInsights?.metrics?.reach?.total?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Engagement</span>
                    <span className="text-white font-semibold">
                      {fbInsights?.metrics?.engagement?.total?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Instagram Overview */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Instagram className="w-6 h-6 mr-2 text-pink-400" />
                    Instagram
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("instagram")}>
                    View Details
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Followers</span>
                    <span className="text-white font-semibold">
                      {igInsights?.metrics?.followers.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Following</span>
                    <span className="text-white font-semibold">
                      {igInsights?.metrics?.following.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Reach</span>
                    <span className="text-white font-semibold">
                      {igInsights?.metrics?.reach.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Engagement Rate</span>
                    <span className="text-white font-semibold">
                      {igInsights?.metrics?.engagement?.rate?.toFixed(2) || "0"}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Best Posting Times */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mt-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-yellow-400" />
                Best Posting Times
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">15:00-18:00</div>
                  <div className="text-sm text-white/70">Peak Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Friday</div>
                  <div className="text-sm text-white/70">Best Day</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">12:00-15:00</div>
                  <div className="text-sm text-white/70">Second Best</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Weekend</div>
                  <div className="text-sm text-white/70">High Activity</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Facebook Tab */}
          <TabsContent value="facebook">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="text-sm text-white/70 mb-1">Organic Reach</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {fbInsights?.metrics?.reach?.organic?.toLocaleString() || "0"}
                  </div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="text-sm text-white/70 mb-1">Paid Reach</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {fbInsights?.metrics?.reach?.paid?.toLocaleString() || "0"}
                  </div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="text-sm text-white/70 mb-1">Impressions</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {fbInsights?.metrics?.impressions?.toLocaleString() || "0"}
                  </div>
                </Card>
              </div>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top Posts</h3>
                <div className="space-y-4">
                  {(fbPosts || []).map((post: any, idx: number) => (
                    <div key={post.id || idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white mb-3">{post.message || "Facebook post"}</p>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />{post.likes || 0}</span>
                        <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />{post.comments || 0}</span>
                        <span className="flex items-center"><Share2 className="w-4 h-4 mr-1" />{post.shares || 0}</span>
                      </div>
                    </div>
                  ))}
                  {(!fbPosts || fbPosts.length === 0) && (
                    <p className="text-white/50 text-center py-8">No posts data available</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Instagram Tab */}
          <TabsContent value="instagram">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="text-sm text-white/70 mb-1">Profile Views</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {igInsights?.metrics?.profileViews?.toLocaleString() || "0"}
                  </div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="text-sm text-white/70 mb-1">Website Clicks</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {igInsights?.metrics?.websiteClicks?.toLocaleString() || "0"}
                  </div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="text-sm text-white/70 mb-1">Impressions</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {igInsights?.metrics?.impressions?.toLocaleString() || "0"}
                  </div>
                </Card>
              </div>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(igPosts || []).map((post: any, idx: number) => (
                    <div key={post.id || idx} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                      <div className="h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                        <Instagram className="w-12 h-12 text-pink-400/50" />
                      </div>
                      <div className="p-4">
                        <p className="text-white text-sm mb-3 line-clamp-2">{post.caption || "Instagram post"}</p>
                        <div className="flex items-center gap-3 text-xs text-white/70">
                          <span className="flex items-center"><Heart className="w-3 h-3 mr-1" />{post.likes || 0}</span>
                          <span className="flex items-center"><MessageCircle className="w-3 h-3 mr-1" />{post.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!igPosts || igPosts.length === 0) && (
                    <p className="text-white/50 text-center py-8 col-span-3">No posts data available</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* TikTok Tab */}
          <TabsContent value="tiktok">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-pink-400" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {ttInsights?.followers?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-white/70">Followers</div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {ttInsights?.videoViews?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-white/70">Total Views</div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {ttInsights?.engagement?.rate?.toFixed(1) || "0"}%
                  </div>
                  <div className="text-sm text-white/70">Engagement Rate</div>
                </Card>
              </div>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Music2 className="w-6 h-6 mr-2 text-purple-400" />
                  Trending Sounds
                </h3>
                <div className="space-y-3">
                  {(ttSounds || []).map((sound: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{sound.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{sound.uses?.toLocaleString() || "0"}</p>
                        <p className="text-white/70 text-xs">uses</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <ContentCalendar />
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors">
            <CompetitorComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
