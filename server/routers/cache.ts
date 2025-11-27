import { router, protectedProcedure } from "../_core/trpc";
import { getCacheStats, cacheClear, cacheDelPattern } from "../_core/cache";
import { z } from "zod";

/**
 * Cache management router
 * Only accessible to authenticated users (admins)
 */
export const cacheRouter = router({
  /**
   * Get cache statistics
   */
  stats: protectedProcedure.query(async () => {
    return await getCacheStats();
  }),

  /**
   * Clear all cache
   */
  clear: protectedProcedure.mutation(async () => {
    const success = await cacheClear();
    return { success };
  }),

  /**
   * Clear cache by pattern
   */
  clearPattern: protectedProcedure
    .input(z.object({
      pattern: z.string()
    }))
    .mutation(async ({ input }) => {
      const deletedCount = await cacheDelPattern(input.pattern);
      return {
        success: true,
        deletedCount
      };
    }),
});
