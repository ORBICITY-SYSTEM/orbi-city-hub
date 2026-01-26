/**
 * Social Media KPIs Card - Compact widget for Home/Dashboard
 * Shows combined Instagram + Facebook metrics from Supabase
 */

import { useUnifiedMarketingAnalytics } from "@/hooks/useMarketingAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users,
  Eye,
  Heart,
  TrendingUp,
  Instagram,
  Facebook,
  Loader2,
  BarChart3,
} from "lucide-react";

export default function SocialMediaKPIsCard() {
  const { language } = useLanguage();

  const { data: analytics, isLoading } = useUnifiedMarketingAnalytics();

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-6 flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const { summary, instagram, facebook } = analytics;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          {language === "ka" ? "სოციალური მედია" : "Social Media"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-bold">
                {summary.totalFollowers.toLocaleString()}
              </span>
            </div>
            <p className="text-white/50 text-xs">
              {language === "ka" ? "მიმდევრები" : "Followers"}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-white font-bold">
                {summary.totalReach.toLocaleString()}
              </span>
            </div>
            <p className="text-white/50 text-xs">
              {language === "ka" ? "მიღწევა" : "Reach"}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-white font-bold">
                {summary.totalEngagement.toLocaleString()}
              </span>
            </div>
            <p className="text-white/50 text-xs">
              {language === "ka" ? "ჩართულობა" : "Engagement"}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold">
                {summary.avgEngagementRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-white/50 text-xs">
              {language === "ka" ? "ER %" : "Eng. Rate"}
            </p>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 bg-pink-500/20 rounded">
              <Instagram className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {instagram.metrics.followers.toLocaleString()}
              </p>
              <p className="text-white/40 text-xs">
                {instagram.metrics.posts} {language === "ka" ? "პოსტი" : "posts"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 bg-blue-500/20 rounded">
              <Facebook className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {facebook.metrics.pageFollowers.toLocaleString()}
              </p>
              <p className="text-white/40 text-xs">
                {facebook.metrics.postCount} {language === "ka" ? "პოსტი" : "posts"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
