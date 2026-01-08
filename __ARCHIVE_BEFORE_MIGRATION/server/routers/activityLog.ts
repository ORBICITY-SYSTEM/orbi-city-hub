import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { activityLogs } from "../../drizzle/schema";
import { desc, eq, and, gte, lte, like, sql } from "drizzle-orm";

export const activityLogRouter = router({
  // Get activity logs with filters
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      userId: z.number().optional(),
      actionType: z.string().optional(),
      module: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { logs: [], total: 0 };

      const { page, limit, userId, actionType, module, startDate, endDate } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (userId) conditions.push(eq(activityLogs.userId, userId));
      if (actionType) conditions.push(eq(activityLogs.actionType, actionType));
      if (module) conditions.push(eq(activityLogs.module, module));
      if (startDate) conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
      if (endDate) conditions.push(lte(activityLogs.createdAt, new Date(endDate)));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [logs, countResult] = await Promise.all([
        db.select()
          .from(activityLogs)
          .where(whereClause)
          .orderBy(desc(activityLogs.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(activityLogs)
          .where(whereClause),
      ]);

      return {
        logs,
        total: countResult[0]?.count || 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
      };
    }),

  // Log an activity
  create: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      actionType: z.string(),
      targetEntity: z.string().optional(),
      targetId: z.string().optional(),
      oldValue: z.any().optional(),
      newValue: z.any().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      module: z.string().optional(),
      isRollbackable: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.insert(activityLogs).values(input);
      return { id: result[0].insertId };
    }),

  // Rollback an activity
  rollback: publicProcedure
    .input(z.object({
      id: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, message: "Database not available" };

      // Get the activity log
      const [log] = await db.select()
        .from(activityLogs)
        .where(eq(activityLogs.id, input.id));

      if (!log) {
        return { success: false, message: "Activity log not found" };
      }

      if (!log.isRollbackable) {
        return { success: false, message: "This action cannot be rolled back" };
      }

      if (log.rolledBackAt) {
        return { success: false, message: "This action has already been rolled back" };
      }

      // Check if within 15 minute window
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (log.createdAt < fifteenMinutesAgo) {
        return { success: false, message: "Rollback window (15 minutes) has expired" };
      }

      // Mark as rolled back
      await db.update(activityLogs)
        .set({
          rolledBackAt: new Date(),
          rolledBackBy: input.userId,
        })
        .where(eq(activityLogs.id, input.id));

      // Return the old value for the caller to restore
      return {
        success: true,
        oldValue: log.oldValue,
        targetEntity: log.targetEntity,
        targetId: log.targetId,
      };
    }),

  // Get action types for filter dropdown
  getActionTypes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const result = await db.selectDistinct({ actionType: activityLogs.actionType })
      .from(activityLogs);

    return result.map(r => r.actionType);
  }),

  // Get modules for filter dropdown
  getModules: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const result = await db.selectDistinct({ module: activityLogs.module })
      .from(activityLogs)
      .where(sql`${activityLogs.module} IS NOT NULL`);

    return result.map(r => r.module).filter(Boolean);
  }),

  // Cleanup old logs (90 days)
  cleanup: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) return { deleted: 0 };

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await db.delete(activityLogs)
      .where(lte(activityLogs.createdAt, ninetyDaysAgo));

    return { deleted: result[0].affectedRows || 0 };
  }),
});
