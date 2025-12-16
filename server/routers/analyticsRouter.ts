import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { aiTaskAnalytics, activityLogs } from "../../drizzle/schema";
import { desc, eq, and, gte, sql, count } from "drizzle-orm";

export const analyticsRouter = router({
  // Get task completion stats
  getTaskStats: publicProcedure
    .input(z.object({
      period: z.enum(["today", "week", "month"]).default("week"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { completed: 0, pending: 0, failed: 0 };

      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const stats = await db.select({
        status: aiTaskAnalytics.status,
        count: sql<number>`count(*)`,
      })
        .from(aiTaskAnalytics)
        .where(gte(aiTaskAnalytics.createdAt, startDate))
        .groupBy(aiTaskAnalytics.status);

      const result = {
        completed: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        failed: 0,
      };

      stats.forEach(s => {
        if (s.status in result) {
          result[s.status as keyof typeof result] = s.count;
        }
      });

      return result;
    }),

  // Get approval rate
  getApprovalRate: publicProcedure
    .input(z.object({
      period: z.enum(["today", "week", "month"]).default("week"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { rate: 0, approved: 0, rejected: 0, total: 0 };

      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const [approved] = await db.select({ count: sql<number>`count(*)` })
        .from(aiTaskAnalytics)
        .where(and(
          gte(aiTaskAnalytics.createdAt, startDate),
          eq(aiTaskAnalytics.status, "approved")
        ));

      const [rejected] = await db.select({ count: sql<number>`count(*)` })
        .from(aiTaskAnalytics)
        .where(and(
          gte(aiTaskAnalytics.createdAt, startDate),
          eq(aiTaskAnalytics.status, "rejected")
        ));

      const total = (approved?.count || 0) + (rejected?.count || 0);
      const rate = total > 0 ? ((approved?.count || 0) / total) * 100 : 0;

      return {
        rate: Math.round(rate * 10) / 10,
        approved: approved?.count || 0,
        rejected: rejected?.count || 0,
        total,
      };
    }),

  // Get error rate
  getErrorRate: publicProcedure
    .input(z.object({
      period: z.enum(["today", "week", "month"]).default("week"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { rate: 0, failed: 0, total: 0 };

      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const [total] = await db.select({ count: sql<number>`count(*)` })
        .from(aiTaskAnalytics)
        .where(gte(aiTaskAnalytics.createdAt, startDate));

      const [failed] = await db.select({ count: sql<number>`count(*)` })
        .from(aiTaskAnalytics)
        .where(and(
          gte(aiTaskAnalytics.createdAt, startDate),
          eq(aiTaskAnalytics.status, "failed")
        ));

      const rate = (total?.count || 0) > 0 
        ? ((failed?.count || 0) / (total?.count || 1)) * 100 
        : 0;

      return {
        rate: Math.round(rate * 10) / 10,
        failed: failed?.count || 0,
        total: total?.count || 0,
      };
    }),

  // Get average response time
  getResponseTime: publicProcedure
    .input(z.object({
      period: z.enum(["today", "week", "month"]).default("week"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { avgMinutes: 0 };

      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const result = await db.select({
        avgTime: sql<number>`AVG(TIMESTAMPDIFF(MINUTE, createdAt, approvedAt))`,
      })
        .from(aiTaskAnalytics)
        .where(and(
          gte(aiTaskAnalytics.createdAt, startDate),
          sql`${aiTaskAnalytics.approvedAt} IS NOT NULL`
        ));

      return {
        avgMinutes: Math.round(result[0]?.avgTime || 0),
      };
    }),

  // Get trend data for charts
  getTrend: publicProcedure
    .input(z.object({
      days: z.number().default(7),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      const result = await db.select({
        date: sql<string>`DATE(createdAt)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
        total: sql<number>`count(*)`,
      })
        .from(aiTaskAnalytics)
        .where(gte(aiTaskAnalytics.createdAt, startDate))
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return result;
    }),

  // Log a new AI task
  logTask: publicProcedure
    .input(z.object({
      taskType: z.string(),
      status: z.enum(["pending", "approved", "rejected", "completed", "failed"]).default("pending"),
      userId: z.number().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.insert(aiTaskAnalytics).values(input);
      return { id: result[0].insertId };
    }),

  // Update task status
  updateTaskStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "completed", "failed"]),
      approvedBy: z.number().optional(),
      executionTimeMs: z.number().optional(),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const updateData: any = { status: input.status };
      
      if (input.status === "approved" && input.approvedBy) {
        updateData.approvedBy = input.approvedBy;
        updateData.approvedAt = new Date();
      }
      
      if (input.status === "completed") {
        updateData.completedAt = new Date();
        if (input.executionTimeMs) {
          updateData.executionTimeMs = input.executionTimeMs;
        }
      }
      
      if (input.status === "failed" && input.errorMessage) {
        updateData.errorMessage = input.errorMessage;
      }

      await db.update(aiTaskAnalytics)
        .set(updateData)
        .where(eq(aiTaskAnalytics.id, input.id));

      return { success: true };
    }),
});
