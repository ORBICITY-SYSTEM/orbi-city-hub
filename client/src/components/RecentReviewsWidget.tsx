import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Star, MessageSquare } from "lucide-react";
import { useEffect } from "react";

/**
 * Recent Reviews Widget
 * 
 * Displays latest customer reviews from Google Business Profile
 * Auto-refreshes every 5 minutes to show new reviews
 */
export function RecentReviewsWidget() {
  const { data, isLoading, error, refetch } = trpc.googleBusiness.getRecentReviews.useQuery(undefined, {
    refetchInterval: 300000, // Refresh every 5 minutes
    refetchIntervalInBackground: true,
  });

  // Manual refresh on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recent Reviews
          </CardTitle>
          <CardDescription>Latest customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-red-600" />
            Recent Reviews
          </CardTitle>
          <CardDescription>Latest customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load reviews. Please check Business Profile configuration.
          </div>
        </CardContent>
      </Card>
    );
  }

  const reviews = data?.reviews || [];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Recent Reviews
        </CardTitle>
        <CardDescription>Latest customer feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.reviewId} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
              {/* Reviewer and Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {review.reviewer.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{review.reviewer.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.starRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <div className="flex gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              )}
            </div>
          ))
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Auto-refreshes every 5 minutes
        </div>
      </CardContent>
    </Card>
  );
}
