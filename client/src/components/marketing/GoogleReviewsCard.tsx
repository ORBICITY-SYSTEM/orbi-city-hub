/**
 * Google Reviews Card - Compact widget for Home/Dashboard
 * Uses ROWS.COM Google Reviews data
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { Star, MessageCircle, CheckCircle2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

export default function GoogleReviewsCard() {
  const { language } = useLanguage();

  const { data: reviews, isLoading } = trpc.rows.getGoogleReviews.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-6 flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </CardContent>
      </Card>
    );
  }

  if (!reviews) return null;

  const { metrics, recentReviews } = reviews;

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 backdrop-blur-md border-amber-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          Google Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Rating */}
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-white">{metrics.averageRating}</div>
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(metrics.averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm">
              {metrics.totalReviews} {language === "ka" ? "რეცენზია" : "reviews"}
            </p>
          </div>
          <div className="ml-auto">
            {metrics.recentTrend === "up" ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : metrics.recentTrend === "down" ? (
              <TrendingDown className="w-5 h-5 text-red-400" />
            ) : null}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">{metrics.responseRate.toFixed(0)}%</span>
            </div>
            <p className="text-white/50 text-xs mt-1">
              {language === "ka" ? "პასუხები" : "Response Rate"}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">{metrics.ratingDistribution[5] || 0}</span>
            </div>
            <p className="text-white/50 text-xs mt-1">
              {language === "ka" ? "5-ვარსკვლავიანი" : "5-Star Reviews"}
            </p>
          </div>
        </div>

        {/* Latest Review Preview */}
        {recentReviews && recentReviews.length > 0 && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm font-medium">
                {recentReviews[0].author}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= recentReviews[0].rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-white/70 text-xs line-clamp-2">
              "{recentReviews[0].text || 'Great experience!'}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
