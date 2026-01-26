/**
 * Marketing Analytics Dashboard - Supabase Unified View
 * Displays real data from Instagram, Facebook, and Google Reviews
 * NOTE: Migrating from rows.com to Supabase (2025-01-26)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import {
  Instagram,
  Facebook,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Zap,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Color palette
const COLORS = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  google: "#4285F4",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  chart: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
};

export default function MarketingAnalyticsDashboard() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch unified marketing analytics (TODO: migrate to Supabase)
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = trpc.rows.getUnifiedMarketingAnalytics.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <p className="text-white/70">
            {language === "ka" ? "მონაცემები იტვირთება..." : "Loading marketing data..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">
            {language === "ka" ? "მონაცემების ჩატვირთვა ვერ მოხერხდა" : "Failed to load analytics data"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            {language === "ka" ? "თავიდან ცდა" : "Try Again"}
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            {language === "ka" ? "მარკეტინგის ანალიტიკა" : "Marketing Analytics"}
          </h2>
          <p className="text-white/60 mt-1">
            {language === "ka" ? "სოციალური მედიის მონაცემები" : "Social media metrics"}
          </p>
        </div>
        <DataSourceBadge type="live" source="Supabase" size="md" />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          icon={<Users className="w-6 h-6" />}
          title={language === "ka" ? "მიმდევრები" : "Followers"}
          value={analytics.summary.totalFollowers.toLocaleString()}
          trend={12}
          color="cyan"
        />
        <KPICard
          icon={<Eye className="w-6 h-6" />}
          title={language === "ka" ? "მიღწევა" : "Total Reach"}
          value={analytics.summary.totalReach.toLocaleString()}
          trend={8}
          color="purple"
        />
        <KPICard
          icon={<Heart className="w-6 h-6" />}
          title={language === "ka" ? "ჩართულობა" : "Engagement"}
          value={analytics.summary.totalEngagement.toLocaleString()}
          trend={15}
          color="pink"
        />
        <KPICard
          icon={<Zap className="w-6 h-6" />}
          title={language === "ka" ? "ER %" : "Engagement Rate"}
          value={`${analytics.summary.avgEngagementRate.toFixed(1)}%`}
          trend={2}
          color="yellow"
        />
        <KPICard
          icon={<Star className="w-6 h-6" />}
          title={language === "ka" ? "რეიტინგი" : "Avg Rating"}
          value={analytics.summary.avgReviewRating.toFixed(1)}
          trend={analytics.reviews.metrics.recentTrend === "up" ? 5 : -2}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
            <Globe className="w-4 h-4 mr-2" />
            {language === "ka" ? "მიმოხილვა" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-500/30">
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-500/30">
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-amber-500/30">
            <Star className="w-4 h-4 mr-2" />
            {language === "ka" ? "რეცენზიები" : "Reviews"}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Platform Comparison */}
            <Card className="lg:col-span-2 bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  {language === "ka" ? "პლატფორმების შედარება" : "Platform Comparison"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Instagram Row */}
                  <PlatformRow
                    icon={<Instagram className="w-5 h-5" />}
                    name="Instagram"
                    color={COLORS.instagram}
                    followers={analytics.instagram.metrics.followers}
                    engagement={analytics.instagram.metrics.engagement.total}
                    reach={analytics.instagram.metrics.reach}
                    language={language}
                  />
                  {/* Facebook Row */}
                  <PlatformRow
                    icon={<Facebook className="w-5 h-5" />}
                    name="Facebook"
                    color={COLORS.facebook}
                    followers={analytics.facebook.metrics.pageFollowers}
                    engagement={analytics.facebook.metrics.engagement.total}
                    reach={analytics.facebook.metrics.reach.total}
                    language={language}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reviews Summary */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Google Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">
                    {analytics.reviews.metrics.averageRating}
                  </div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(analytics.reviews.metrics.averageRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm">
                    {analytics.reviews.metrics.totalReviews} {language === "ka" ? "რეცენზია" : "reviews"}
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = analytics.reviews.metrics.ratingDistribution[rating] || 0;
                    const percent = analytics.reviews.metrics.totalReviews > 0
                      ? (count / analytics.reviews.metrics.totalReviews) * 100
                      : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-white/60 text-sm w-4">{rating}</span>
                        <Star className="w-3 h-3 text-amber-400" />
                        <Progress value={percent} className="flex-1 h-2" />
                        <span className="text-white/60 text-xs w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      {language === "ka" ? "პასუხების %" : "Response Rate"}
                    </span>
                    <span className="text-white font-medium">
                      {analytics.reviews.metrics.responseRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Chart */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                {language === "ka" ? "ჩართულობის განაწილება" : "Engagement Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Instagram", value: analytics.instagram.metrics.engagement.total },
                        { name: "Facebook", value: analytics.facebook.metrics.engagement.total },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={COLORS.instagram} />
                      <Cell fill={COLORS.facebook} />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="space-y-6 mt-6">
          <InstagramSection analytics={analytics.instagram} language={language} />
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="space-y-6 mt-6">
          <FacebookSection analytics={analytics.facebook} language={language} />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6 mt-6">
          <ReviewsSection analytics={analytics.reviews} language={language} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: number;
  color: "cyan" | "purple" | "pink" | "yellow" | "amber" | "green";
}

function KPICard({ icon, title, value, trend, color }: KPICardProps) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    purple: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
    pink: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    yellow: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  };

  const iconColors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    yellow: "text-yellow-400",
    amber: "text-amber-400",
    green: "text-green-400",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={iconColors[color]}>{icon}</div>
          {trend !== 0 && (
            <div className={`flex items-center text-xs ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-white/60">{title}</div>
      </CardContent>
    </Card>
  );
}

interface PlatformRowProps {
  icon: React.ReactNode;
  name: string;
  color: string;
  followers: number;
  engagement: number;
  reach: number;
  language: string;
}

function PlatformRow({ icon, name, color, followers, engagement, reach, language }: PlatformRowProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="flex-1">
        <h4 className="text-white font-medium">{name}</h4>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <p className="text-white/50 text-xs">{language === "ka" ? "მიმდევრები" : "Followers"}</p>
            <p className="text-white font-semibold">{followers.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">{language === "ka" ? "ჩართულობა" : "Engagement"}</p>
            <p className="text-white font-semibold">{engagement.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">{language === "ka" ? "მიღწევა" : "Reach"}</p>
            <p className="text-white font-semibold">{reach.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Instagram Section
function InstagramSection({ analytics, language }: { analytics: any; language: string }) {
  return (
    <div className="space-y-6">
      {/* Instagram Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={language === "ka" ? "მიმდევრები" : "Followers"}
          value={analytics.metrics.followers.toLocaleString()}
          icon={<Users className="w-5 h-5 text-pink-400" />}
        />
        <StatCard
          label={language === "ka" ? "პოსტები" : "Posts"}
          value={analytics.metrics.posts.toLocaleString()}
          icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
        />
        <StatCard
          label={language === "ka" ? "მიღწევა" : "Reach"}
          value={analytics.metrics.reach.toLocaleString()}
          icon={<Eye className="w-5 h-5 text-cyan-400" />}
        />
        <StatCard
          label={language === "ka" ? "ER %" : "Engagement Rate"}
          value={`${analytics.metrics.engagement.rate.toFixed(2)}%`}
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
        />
      </div>

      {/* KPIs */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            {language === "ka" ? "საშუალო მაჩვენებლები" : "Average Performance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(analytics.metrics.kpis.avgLikes).toLocaleString()}
              </p>
              <p className="text-white/60 text-sm">{language === "ka" ? "საშ. მოწონება" : "Avg Likes"}</p>
            </div>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(analytics.metrics.kpis.avgComments).toLocaleString()}
              </p>
              <p className="text-white/60 text-sm">{language === "ka" ? "საშ. კომენტარი" : "Avg Comments"}</p>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(analytics.metrics.kpis.avgReach).toLocaleString()}
              </p>
              <p className="text-white/60 text-sm">{language === "ka" ? "საშ. მიღწევა" : "Avg Reach"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Posting Time */}
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold mb-4">
            {language === "ka" ? "საუკეთესო პოსტის დრო" : "Best Posting Time"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-pink-400">{analytics.bestPostingTime.hour}</p>
              <p className="text-white/60 text-sm">{language === "ka" ? "საათი" : "Time"}</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-purple-400">{analytics.bestPostingTime.day}</p>
              <p className="text-white/60 text-sm">{language === "ka" ? "დღე" : "Day"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      {analytics.topPosts && analytics.topPosts.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {language === "ka" ? "საუკეთესო პოსტები" : "Top Posts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPosts.slice(0, 5).map((post: any, i: number) => (
                <div key={post.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-pink-400">#{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-white text-sm line-clamp-2">{post.caption || "No caption"}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {post.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {post.comments.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {post.reach.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Facebook Section
function FacebookSection({ analytics, language }: { analytics: any; language: string }) {
  return (
    <div className="space-y-6">
      {/* Facebook Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={language === "ka" ? "მიმდევრები" : "Followers"}
          value={analytics.metrics.pageFollowers.toLocaleString()}
          icon={<Users className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          label={language === "ka" ? "მოწონებები" : "Page Likes"}
          value={analytics.metrics.pageLikes.toLocaleString()}
          icon={<Heart className="w-5 h-5 text-red-400" />}
        />
        <StatCard
          label={language === "ka" ? "მიღწევა" : "Total Reach"}
          value={analytics.metrics.reach.total.toLocaleString()}
          icon={<Eye className="w-5 h-5 text-green-400" />}
        />
        <StatCard
          label={language === "ka" ? "შთაბეჭდილებები" : "Impressions"}
          value={analytics.metrics.impressions.toLocaleString()}
          icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Reach Breakdown */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Facebook className="w-5 h-5 text-blue-400" />
            {language === "ka" ? "მიღწევის განაწილება" : "Reach Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-3xl font-bold text-green-400">
                {analytics.metrics.reach.organic.toLocaleString()}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {language === "ka" ? "ორგანული მიღწევა" : "Organic Reach"}
              </p>
            </div>
            <div className="text-center p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-3xl font-bold text-blue-400">
                {analytics.metrics.reach.paid.toLocaleString()}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {language === "ka" ? "ფასიანი მიღწევა" : "Paid Reach"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Breakdown */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            {language === "ka" ? "ჩართულობის დეტალები" : "Engagement Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">
                {analytics.metrics.engagement.reactions.toLocaleString()}
              </p>
              <p className="text-white/60 text-xs">{language === "ka" ? "რეაქციები" : "Reactions"}</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">
                {analytics.metrics.engagement.comments.toLocaleString()}
              </p>
              <p className="text-white/60 text-xs">{language === "ka" ? "კომენტარები" : "Comments"}</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Share2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">
                {analytics.metrics.engagement.shares.toLocaleString()}
              </p>
              <p className="text-white/60 text-xs">{language === "ka" ? "გაზიარებები" : "Shares"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              {language === "ka" ? "ქვეყნები" : "Top Countries"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.demographics.countries).map(([country, percent]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-white">{country}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={percent as number} className="w-24 h-2" />
                    <span className="text-white/60 text-sm w-8">{percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              {language === "ka" ? "ასაკობრივი ჯგუფები" : "Age Groups"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.demographics.ageGroups).map(([age, percent]) => (
                <div key={age} className="flex items-center justify-between">
                  <span className="text-white">{age}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={percent as number} className="w-24 h-2" />
                    <span className="text-white/60 text-sm w-8">{percent}%</span>
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

// Reviews Section
function ReviewsSection({ analytics, language }: { analytics: any; language: string }) {
  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/30">
          <CardContent className="p-6 text-center">
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-3 fill-amber-400" />
            <p className="text-4xl font-bold text-white">{analytics.metrics.averageRating}</p>
            <p className="text-white/60">{language === "ka" ? "საშუალო რეიტინგი" : "Average Rating"}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-4xl font-bold text-white">{analytics.metrics.totalReviews}</p>
            <p className="text-white/60">{language === "ka" ? "სულ რეცენზიები" : "Total Reviews"}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-4xl font-bold text-white">{analytics.metrics.responseRate.toFixed(0)}%</p>
            <p className="text-white/60">{language === "ka" ? "პასუხის %" : "Response Rate"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            {language === "ka" ? "რეიტინგის განაწილება" : "Rating Distribution"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[5, 4, 3, 2, 1].map((rating) => ({
                  rating: `${rating} star`,
                  count: analytics.metrics.ratingDistribution[rating] || 0,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="rating" type="category" stroke="rgba(255,255,255,0.5)" width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      {analytics.recentReviews && analytics.recentReviews.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {language === "ka" ? "ბოლო რეცენზიები" : "Recent Reviews"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentReviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{review.author}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? "text-amber-400 fill-amber-400" : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm">{review.text || "No review text"}</p>
                  <p className="text-white/40 text-xs mt-2">{review.date}</p>
                  {review.response && (
                    <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-blue-300 text-xs font-medium mb-1">
                        {language === "ka" ? "თქვენი პასუხი:" : "Your Response:"}
                      </p>
                      <p className="text-white/70 text-sm">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Simple Stat Card
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-white font-semibold">{value}</p>
            <p className="text-white/50 text-xs">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
