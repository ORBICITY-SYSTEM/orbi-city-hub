/**
 * Uptime Monitoring Router
 * 
 * Provides uptime monitoring endpoints
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  performUptimeCheck,
  getUptimeStatistics,
  cleanupOldUptimeChecks,
} from "../uptimeMonitoring";

export const uptimeRouter = router({
  /**
   * Perform uptime check (public for external monitoring)
   */
  check: publicProcedure.query(async () => {
    return await performUptimeCheck();
  }),

  /**
   * Get uptime statistics
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(720).default(24), // Max 30 days
      })
    )
    .query(async ({ input }) => {
      return await getUptimeStatistics(input.hours);
    }),

  /**
   * Cleanup old checks (admin only)
   */
  cleanup: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can cleanup uptime checks");
    }

    const deletedCount = await cleanupOldUptimeChecks();
    return {
      success: true,
      deletedCount,
    };
  }),
});
