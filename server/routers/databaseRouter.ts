/**
 * Database Optimization Router
 * 
 * Provides database optimization and analysis endpoints
 */

import { protectedProcedure, router } from "../_core/trpc";
import {
  runDatabaseOptimization,
  getTableSizes,
  getIndexes,
  createMissingIndexes,
} from "../databaseOptimization";

export const databaseRouter = router({
  /**
   * Run full database optimization (admin only)
   */
  optimize: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run database optimization");
    }

    return await runDatabaseOptimization();
  }),

  /**
   * Get table sizes
   */
  getTableSizes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view table sizes");
    }

    return await getTableSizes();
  }),

  /**
   * Get indexes
   */
  getIndexes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view indexes");
    }

    return await getIndexes();
  }),

  /**
   * Create missing indexes
   */
  createIndexes: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can create indexes");
    }

    return await createMissingIndexes();
  }),
});
