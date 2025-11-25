import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { fetchGoogleBusinessReviews, replyToGoogleReview, deleteGoogleReviewReply } from "../googleBusinessProfile";

export const googleRouter = router({
  // Get Google Business Profile reviews
  getReviews: publicProcedure
    .input(
      z.object({
        locationId: z.string().optional(),
        pageSize: z.number().min(1).max(50).default(10),
        pageToken: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const locationId = input.locationId || process.env.GOOGLE_BUSINESS_LOCATION_ID || "default";
      return await fetchGoogleBusinessReviews(locationId, input.pageSize, input.pageToken);
    }),

  // Reply to a review
  replyToReview: publicProcedure
    .input(
      z.object({
        reviewName: z.string(),
        replyText: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ input }) => {
      const success = await replyToGoogleReview(input.reviewName, input.replyText);
      return { success };
    }),

  // Delete a review reply
  deleteReply: publicProcedure
    .input(
      z.object({
        reviewName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await deleteGoogleReviewReply(input.reviewName);
      return { success };
    }),

  // Get Google Analytics metrics (placeholder)
  getAnalytics: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implement Google Analytics 4 API integration
      return {
        sessions: 12543,
        users: 8932,
        pageviews: 45231,
        bounceRate: 32.4,
        avgSessionDuration: 245,
        topPages: [
          { path: "/", views: 15234, avgTime: 180 },
          { path: "/reservations", views: 8932, avgTime: 320 },
          { path: "/finance", views: 5421, avgTime: 280 },
        ],
        trafficSources: [
          { source: "Google Search", sessions: 5234, percentage: 41.7 },
          { source: "Direct", sessions: 3421, percentage: 27.3 },
          { source: "Social Media", sessions: 2134, percentage: 17.0 },
          { source: "Referral", sessions: 1754, percentage: 14.0 },
        ],
      };
    }),
});
