/**
 * Performance Metrics tRPC Router
 * 
 * Provides endpoints for querying performance metrics and system statistics
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getEndpointStats,
  getSystemStats,
  getMetricsTimeSeries,
  cleanupOldMetrics,
} from "../performanceMetrics";

export const performanceRouter = router({
  /**
   * Get statistics for a specific endpoint
   */
  getEndpointStats: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        hours: z.number().min(1).max(168).default(24),
      })
    )
    .query(async ({ input }) => {
      const stats = await getEndpointStats(input.endpoint, input.hours);
      return stats || {
        requestCount: 0,
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      };
    }),

  /**
   * Get overall system performance statistics
   */
  getSystemStats: protectedProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24),
      })
    )
    .query(async ({ input }) => {
      return await getSystemStats(input.hours);
    }),

  /**
   * Get performance metrics time series for charting
   */
  getTimeSeries: protectedProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24),
        intervalMinutes: z.number().min(5).max(1440).default(60),
      })
    )
    .query(async ({ input }) => {
      return await getMetricsTimeSeries(input.hours, input.intervalMinutes);
    }),

  /**
   * Clean up old performance metrics (admin only)
   */
  cleanup: protectedProcedure
    .input(
      z.object({
        daysToKeep: z.number().min(7).max(365).default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow admin users to cleanup
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can cleanup performance metrics");
      }

      const deletedCount = await cleanupOldMetrics(input.daysToKeep);
      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old performance metrics`,
      };
    }),
});
