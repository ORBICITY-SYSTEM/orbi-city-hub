import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getFacebookPageInsights,
  getFacebookTopPosts,
  getFacebookAudience,
} from "../facebookApi";
import {
  getInstagramInsights,
  getInstagramTopPosts,
  getInstagramStories,
  getInstagramAudience,
} from "../instagramApi";
import {
  getTikTokInsights,
  getTikTokTopVideos,
  getTikTokTrendingSounds,
  getTikTokAudience,
} from "../tiktokApi";

export const socialMediaRouter = router({
  // Facebook endpoints
  getFacebookInsights: publicProcedure
    .input(
      z.object({
        pageId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getFacebookPageInsights(input.pageId);
    }),

  getFacebookPosts: publicProcedure
    .input(
      z.object({
        pageId: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      return await getFacebookTopPosts(input.pageId, input.limit);
    }),

  getFacebookAudience: publicProcedure
    .input(
      z.object({
        pageId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getFacebookAudience(input.pageId);
    }),

  // Instagram endpoints
  getInstagramInsights: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getInstagramInsights(input.accountId);
    }),

  getInstagramPosts: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
        limit: z.number().min(1).max(50).default(9),
      })
    )
    .query(async ({ input }) => {
      return await getInstagramTopPosts(input.accountId, input.limit);
    }),

  getInstagramStories: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getInstagramStories(input.accountId);
    }),

  getInstagramAudience: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getInstagramAudience(input.accountId);
    }),

  // TikTok endpoints
  getTikTokInsights: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getTikTokInsights(input.accountId);
    }),

  getTikTokVideos: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
        limit: z.number().min(1).max(50).default(12),
      })
    )
    .query(async ({ input }) => {
      return await getTikTokTopVideos(input.accountId, input.limit);
    }),

  getTikTokTrendingSounds: publicProcedure.query(async () => {
    return await getTikTokTrendingSounds();
  }),

  getTikTokAudience: publicProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getTikTokAudience(input.accountId);
    }),

  // Combined stats
  getCombinedStats: publicProcedure.query(async () => {
    const [fbInsights, igInsights, ttInsights] = await Promise.all([
      getFacebookPageInsights(),
      getInstagramInsights(),
      getTikTokInsights(),
    ]);

    if (!fbInsights.success || !igInsights.success || !ttInsights.success) {
      return {
        success: false,
        error: "Failed to fetch combined stats",
      };
    }

    const totalFollowers =
      (fbInsights.data?.followers || 0) + (igInsights.data?.followers || 0) + (ttInsights.data?.followers || 0);
    const totalReach =
      (fbInsights.data?.reach.total || 0) + (igInsights.data?.reach || 0) + (ttInsights.data?.totalViews || 0);
    const totalEngagement =
      (fbInsights.data?.engagement.total || 0) +
      (igInsights.data?.engagement.total || 0) +
      (ttInsights.data?.totalLikes || 0);
    const avgEngagementRate =
      totalFollowers > 0
        ? ((totalEngagement / totalFollowers) * 100).toFixed(2)
        : "0";

    return {
      success: true,
      data: {
        totalFollowers,
        totalReach,
        totalEngagement,
        avgEngagementRate: parseFloat(avgEngagementRate),
        facebook: fbInsights.data,
        instagram: igInsights.data,
        tiktok: ttInsights.data,
      },
    };
  }),
});
