import { Star, MessageCircle, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

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
  const ratingMap: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  const rating = ratingMap[review.starRating];
  const date = new Date(review.createTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {review.reviewer.profilePhotoUrl ? (
            <img
              src={review.reviewer.profilePhotoUrl}
              alt={review.reviewer.displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {review.reviewer.displayName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-slate-900">
              {review.reviewer.displayName}
            </p>
            <p className="text-xs text-slate-500">{date}</p>
          </div>
        </div>
        <StarRating rating={rating} />
      </div>
      {review.comment && (
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
          {review.comment}
        </p>
      )}
      {review.reviewReply && (
        <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">ORBI City:</span> {review.reviewReply.comment}
          </p>
        </div>
      )}
    </div>
  );
}

export function GoogleReviewsWidget() {
  const { data, isLoading } = trpc.google.getReviews.useQuery({
    pageSize: 5,
  });

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

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Google Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(data?.averageRating || 0)} />
            <span className="text-sm font-semibold text-slate-700">
              {data?.averageRating?.toFixed(1)} ({data?.totalReviewCount} reviews)
            </span>
          </div>
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
        {data?.reviews?.slice(0, 3).map((review) => (
          <ReviewCard key={review.reviewId} review={review} />
        ))}
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
