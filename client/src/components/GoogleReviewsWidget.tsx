/**
 * Google Reviews Widget - Supabase Integrated
 */

import { Star, MessageCircle, ExternalLink } from "lucide-react";
import { useGoogleReviews } from "@/hooks/useMarketingAnalytics";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  const rating = review.rating || 5;
  const date = review.date ? new Date(review.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) : "";

  return (
    <div className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {(review.author || "G").charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">
              {review.author || "Guest"}
            </p>
            <p className="text-xs text-slate-500">{date}</p>
          </div>
        </div>
        <StarRating rating={rating} />
      </div>
      {review.text && (
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
          {review.text}
        </p>
      )}
      {review.response && (
        <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">ORBI City:</span> {review.response}
          </p>
        </div>
      )}
    </div>
  );
}

export function GoogleReviewsWidget() {
  const { data, isLoading } = useGoogleReviews();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const hasRealData = data?.metrics?.totalReviews > 0;
  const metrics = data?.metrics || { averageRating: 0, totalReviews: 0 };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Google Reviews</h3>
          {hasRealData ? (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(metrics.averageRating)} />
              <span className="text-sm font-semibold text-slate-700">
                {metrics.averageRating.toFixed(1)} ({metrics.totalReviews} reviews)
              </span>
            </div>
          ) : (
            <span className="text-sm text-amber-600 font-medium mt-1 inline-block">
              API Integration Coming Soon
            </span>
          )}
        </div>
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {reviews.slice(0, 3).map((review: any, idx: number) => (
          <ReviewCard key={review.id || idx} review={review} />
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-slate-500 py-4">No reviews yet</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <MessageCircle className="w-4 h-4" />
          View all reviews on Google
        </a>
      </div>
    </div>
  );
}
