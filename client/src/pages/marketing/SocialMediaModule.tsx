import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";
import ContentCalendar from "@/components/ContentCalendar";
import CompetitorComparison from "@/components/CompetitorComparison";
import { Loader2 } from "lucide-react";

export default function SocialMedia() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch combined stats
  const { data: combinedStats, isLoading: loadingCombined } =
    trpc.socialMedia.getCombinedStats.useQuery();

  // Fetch Facebook data
  const { data: fbInsights, isLoading: loadingFb } =
    trpc.socialMedia.getFacebookInsights.useQuery({});
  const { data: fbPosts } = trpc.socialMedia.getFacebookPosts.useQuery({
    limit: 10,
  });
  const { data: fbAudience } = trpc.socialMedia.getFacebookAudience.useQuery(
    {}
  );

  // Fetch Instagram data
  const { data: igInsights, isLoading: loadingIg } =
    trpc.socialMedia.getInstagramInsights.useQuery({});

  // Fetch TikTok data
  const { data: ttInsights, isLoading: loadingTt } =
    trpc.socialMedia.getTikTokInsights.useQuery({});
  const { data: ttVideos } = trpc.socialMedia.getTikTokVideos.useQuery({
    limit: 12,
  });
  const { data: ttSounds } = trpc.socialMedia.getTikTokTrendingSounds.useQuery();
  const { data: igPosts } = trpc.socialMedia.getInstagramPosts.useQuery({
    limit: 9,
  });
  const { data: igAudience } = trpc.socialMedia.getInstagramAudience.useQuery(
    {}
  );

  if (loadingCombined || loadingFb || loadingIg || loadingTt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Social Media Analytics
        </h1>
        <p className="text-white/70">
          Track your Facebook, Instagram, and TikTok performance
        </p>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {combinedStats?.data?.totalFollowers.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-white/70">Total Followers</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {combinedStats?.data?.totalReach.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-white/70">Total Reach</div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-orange-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {combinedStats?.data?.totalEngagement.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-white/70">Total Engagement</div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {combinedStats?.data?.avgEngagementRate.toFixed(2) || "0"}%
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
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facebook Overview */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Facebook className="w-6 h-6 mr-2 text-blue-400" />
                  Facebook
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("facebook")}
                >
                  View Details
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Followers</span>
                  <span className="text-white font-semibold">
                    {fbInsights?.data?.followers.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Page Likes</span>
                  <span className="text-white font-semibold">
                    {fbInsights?.data?.likes.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Reach</span>
                  <span className="text-white font-semibold">
                    {fbInsights?.data?.reach.total.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Engagement</span>
                  <span className="text-white font-semibold">
                    {fbInsights?.data?.engagement.total.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Posts</span>
                  <span className="text-white font-semibold">
                    {fbInsights?.data?.postCount || "0"}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("instagram")}
                >
                  View Details
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Followers</span>
                  <span className="text-white font-semibold">
                    {igInsights?.data?.followers.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Following</span>
                  <span className="text-white font-semibold">
                    {igInsights?.data?.following.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Reach</span>
                  <span className="text-white font-semibold">
                    {igInsights?.data?.reach.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Engagement Rate</span>
                  <span className="text-white font-semibold">
                    {igInsights?.data?.engagement.rate.toFixed(2) || "0"}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Posts</span>
                  <span className="text-white font-semibold">
                    {igInsights?.data?.mediaCount || "0"}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">15:00-18:00</div>
                <div className="text-sm text-white/70">Peak Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Friday</div>
                <div className="text-sm text-white/70">Best Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12:00-15:00</div>
                <div className="text-sm text-white/70">Second Best</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Weekend</div>
                <div className="text-sm text-white/70">High Activity</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook">
          <div className="space-y-6">
            {/* Facebook Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-sm text-white/70 mb-1">Organic Reach</div>
                <div className="text-2xl font-bold text-white">
                  {fbInsights?.data?.reach.organic.toLocaleString() || "0"}
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-sm text-white/70 mb-1">Paid Reach</div>
                <div className="text-2xl font-bold text-white">
                  {fbInsights?.data?.reach.paid.toLocaleString() || "0"}
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-sm text-white/70 mb-1">Impressions</div>
                <div className="text-2xl font-bold text-white">
                  {fbInsights?.data?.impressions.toLocaleString() || "0"}
                </div>
              </Card>
            </div>

            {/* Top Posts */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Top Posts</h3>
              <div className="space-y-4">
                {fbPosts?.posts?.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <p className="text-white mb-3">{post.message}</p>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </span>
                      <span className="flex items-center">
                        <Share2 className="w-4 h-4 mr-1" />
                        {post.shares}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.reach.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram">
          <div className="space-y-6">
            {/* Instagram Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-sm text-white/70 mb-1">Profile Views</div>
                <div className="text-2xl font-bold text-white">
                  {igInsights?.data?.profileViews.toLocaleString() || "0"}
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-sm text-white/70 mb-1">
                  Website Clicks
                </div>
                <div className="text-2xl font-bold text-white">
                  {igInsights?.data?.websiteClicks.toLocaleString() || "0"}
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="text-sm text-white/70 mb-1">Impressions</div>
                <div className="text-2xl font-bold text-white">
                  {igInsights?.data?.impressions.toLocaleString() || "0"}
                </div>
              </Card>
            </div>

            {/* Top Posts Grid */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Top Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {igPosts?.posts?.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white/5 rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={post.mediaUrl}
                      alt="Instagram post"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-white text-sm mb-3 line-clamp-2">
                        {post.caption}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {post.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {post.comments}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.reach.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TikTok Tab */}
        <TabsContent value="tiktok">
          <div className="space-y-6">
            {/* TikTok Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {ttInsights?.data?.followers.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-white/70">Followers</div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {ttInsights?.data?.totalViews.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-white/70">Total Views</div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {ttInsights?.data?.avgEngagementRate.toFixed(1) || "0"}%
                </div>
                <div className="text-sm text-white/70">Engagement Rate</div>
              </Card>
            </div>

            {/* Top Videos */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Top Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ttVideos?.videos?.slice(0, 6).map((video: any) => (
                  <div
                    key={video.id}
                    className="bg-white/5 rounded-lg overflow-hidden"
                  >
                    <img
                      src={video.coverUrl}
                      alt="Video thumbnail"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-white text-sm mb-2 line-clamp-2">
                        {video.caption}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {video.comments.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending Sounds */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Music2 className="w-6 h-6 mr-2 text-purple-400" />
                Trending Sounds
              </h3>
              <div className="space-y-3">
                {ttSounds?.sounds?.slice(0, 5).map((sound: any) => (
                  <div
                    key={sound.id}
                    className="flex items-center justify-between bg-white/5 p-4 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">{sound.title}</p>
                      <p className="text-white/70 text-sm">{sound.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {sound.useCount.toLocaleString()}
                      </p>
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

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Platform Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/70 pb-3">Metric</th>
                    <th className="text-right text-white/70 pb-3">Facebook</th>
                    <th className="text-right text-white/70 pb-3">Instagram</th>
                    <th className="text-right text-white/70 pb-3">TikTok</th>
                    <th className="text-right text-white/70 pb-3">Total</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-b border-white/10">
                    <td className="py-3">Followers</td>
                    <td className="text-right">
                      {fbInsights?.data?.followers.toLocaleString() || "0"}
                    </td>
                    <td className="text-right">
                      {igInsights?.data?.followers.toLocaleString() || "0"}
                    </td>
                    <td className="text-right">
                      {ttInsights?.data?.followers.toLocaleString() || "0"}
                    </td>
                    <td className="text-right font-bold">
                      {combinedStats?.data?.totalFollowers.toLocaleString() ||
                        "0"}
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3">Reach/Views</td>
                    <td className="text-right">
                      {fbInsights?.data?.reach.total.toLocaleString() || "0"}
                    </td>
                    <td className="text-right">
                      {igInsights?.data?.reach.toLocaleString() || "0"}
                    </td>
                    <td className="text-right">
                      {ttInsights?.data?.totalViews.toLocaleString() || "0"}
                    </td>
                    <td className="text-right font-bold">
                      {combinedStats?.data?.totalReach.toLocaleString() || "0"}
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3">Engagement</td>
                    <td className="text-right">
                      {fbInsights?.data?.engagement.total.toLocaleString() ||
                        "0"}
                    </td>
                    <td className="text-right">
                      {igInsights?.data?.engagement.total.toLocaleString() ||
                        "0"}
                    </td>
                    <td className="text-right">
                      {ttInsights?.data?.totalLikes.toLocaleString() || "0"}
                    </td>
                    <td className="text-right font-bold">
                      {combinedStats?.data?.totalEngagement.toLocaleString() ||
                        "0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3">Posts/Videos</td>
                    <td className="text-right">
                      {fbInsights?.data?.postCount || "0"}
                    </td>
                    <td className="text-right">
                      {igInsights?.data?.mediaCount || "0"}
                    </td>
                    <td className="text-right">
                      {ttInsights?.data?.videoCount || "0"}
                    </td>
                    <td className="text-right font-bold">
                      {(fbInsights?.data?.postCount || 0) +
                        (igInsights?.data?.mediaCount || 0) +
                        (ttInsights?.data?.videoCount || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facebook Audience */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Facebook className="w-6 h-6 mr-2 text-blue-400" />
                Facebook Audience
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white/70 mb-2">Top Countries</h4>
                  {Object.entries(fbAudience?.data?.demographics.country || {})
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div
                        key={country}
                        className="flex justify-between items-center mb-2"
                      >
                        <span className="text-white">{country}</span>
                        <span className="text-white/70">{count}</span>
                      </div>
                    ))}
                </div>
                <div>
                  <h4 className="text-white/70 mb-2">Gender Split</h4>
                  {Object.entries(fbAudience?.data?.demographics.gender || {}).map(
                    ([gender, count]) => (
                      <div
                        key={gender}
                        className="flex justify-between items-center mb-2"
                      >
                        <span className="text-white capitalize">{gender}</span>
                        <span className="text-white/70">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>

            {/* Instagram Audience */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Instagram className="w-6 h-6 mr-2 text-pink-400" />
                Instagram Audience
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white/70 mb-2">Top Countries</h4>
                  {Object.entries(igAudience?.data?.demographics.country || {})
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div
                        key={country}
                        className="flex justify-between items-center mb-2"
                      >
                        <span className="text-white">{country}</span>
                        <span className="text-white/70">{count}</span>
                      </div>
                    ))}
                </div>
                <div>
                  <h4 className="text-white/70 mb-2">Most Active Day</h4>
                  {Object.entries(igAudience?.data?.activeDays || {})
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([day, count]) => (
                      <div
                        key={day}
                        className="flex justify-between items-center mb-2"
                      >
                        <span className="text-white">{day}</span>
                        <span className="text-white/70">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
