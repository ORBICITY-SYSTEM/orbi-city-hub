/**
 * Marketing Router
 * tRPC endpoints for AI Marketing Director
 */

import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { marketingTasks } from "../../drizzle/schema";

export const marketingRouter = router({
  /**
   * Get all marketing tasks with pagination
   */
  getTasks: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        channel: z.enum(["general", "instagram", "website", "ota", "leads", "content", "analytics"]).optional(),
        agentName: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const conditions = [];
      
      if (input?.status) {
        conditions.push(eq(marketingTasks.status, input.status));
      }
      
      if (input?.channel) {
        conditions.push(eq(marketingTasks.channel, input.channel));
      }
      
      if (input?.agentName) {
        conditions.push(eq(marketingTasks.agentName, input.agentName));
      }
      
      // Get tasks with pagination
      const tasks = await db
        .select()
        .from(marketingTasks)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(marketingTasks.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(marketingTasks)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      return {
        tasks,
        total: Number(totalResult.count),
        limit,
        offset,
        hasMore: offset + tasks.length < Number(totalResult.count),
      };
    }),

  /**
   * Get task by ID
   */
  getTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const [task] = await db
        .select()
        .from(marketingTasks)
        .where(eq(marketingTasks.id, input.id))
        .limit(1);
      
      return task || null;
    }),

  /**
   * Create new marketing task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        channel: z.enum(["general", "instagram", "website", "ota", "leads", "content", "analytics"]).default("general"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        assignedTo: z.string().optional(),
        agentName: z.string().optional(),
        dueDate: z.string().optional(), // ISO date string
        createdBy: z.string().default("human"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const insertResult = await db
        .insert(marketingTasks)
        .values({
          title: input.title,
          description: input.description || null,
          channel: input.channel,
          priority: input.priority,
          assignedTo: input.assignedTo || null,
          agentName: input.agentName || null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          createdBy: input.createdBy,
          status: "pending",
        });

      const insertId = (insertResult as any).insertId;
      const [created] = await db
        .select()
        .from(marketingTasks)
        .where(eq(marketingTasks.id, insertId))
        .limit(1);
      
      return created || null;
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const updates: Partial<typeof marketingTasks.$inferInsert> = {
        status: input.status,
      };
      
      if (input.status === "completed") {
        updates.completedAt = new Date();
      }
      
      await db
        .update(marketingTasks)
        .set(updates)
        .where(eq(marketingTasks.id, input.id));
      
      const [updated] = await db
        .select()
        .from(marketingTasks)
        .where(eq(marketingTasks.id, input.id))
        .limit(1);
      
      return updated || null;
    }),

  /**
   * Update task
   */
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        channel: z.enum(["general", "instagram", "website", "ota", "leads", "content", "analytics"]).optional(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.string().optional().nullable(),
        agentName: z.string().optional().nullable(),
        dueDate: z.string().optional().nullable(),
        aiNotes: z.string().optional().nullable(),
        humanNotes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const { id, ...updates } = input;
      
      const updateData: Partial<typeof marketingTasks.$inferInsert> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.channel !== undefined) updateData.channel = updates.channel;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo;
      if (updates.agentName !== undefined) updateData.agentName = updates.agentName;
      if (updates.dueDate !== undefined) {
        updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }
      if (updates.aiNotes !== undefined) updateData.aiNotes = updates.aiNotes;
      if (updates.humanNotes !== undefined) updateData.humanNotes = updates.humanNotes;
      
      if (updates.status === "completed" && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }
      
      await db
        .update(marketingTasks)
        .set(updateData)
        .where(eq(marketingTasks.id, id));
      
      const [updated] = await db
        .select()
        .from(marketingTasks)
        .where(eq(marketingTasks.id, id))
        .limit(1);
      
      return updated || null;
    }),

  /**
   * Delete task
   */
  deleteTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .delete(marketingTasks)
        .where(eq(marketingTasks.id, input.id));
      
      return { success: true };
    }),

  /**
   * Get task statistics (OPTIMIZED - uses SQL aggregation)
   */
  getTaskStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Use SQL aggregation for better performance
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketingTasks);

    const statusStats = await db
      .select({
        status: marketingTasks.status,
        count: sql<number>`count(*)`,
      })
      .from(marketingTasks)
      .groupBy(marketingTasks.status);

    const channelStats = await db
      .select({
        channel: marketingTasks.channel,
        count: sql<number>`count(*)`,
      })
      .from(marketingTasks)
      .groupBy(marketingTasks.channel);

    // Transform to desired format
    const getCount = (stats: Array<{ status?: string; channel?: string; count: number }>, value: string) => {
      const found = stats.find(s => (s.status === value || s.channel === value));
      return Number(found?.count || 0);
    };

    return {
      total: Number(totalResult.count),
      pending: getCount(statusStats, "pending"),
      inProgress: getCount(statusStats, "in_progress"),
      completed: getCount(statusStats, "completed"),
      cancelled: getCount(statusStats, "cancelled"),
      byChannel: {
        general: getCount(channelStats, "general"),
        instagram: getCount(channelStats, "instagram"),
        website: getCount(channelStats, "website"),
        ota: getCount(channelStats, "ota"),
        leads: getCount(channelStats, "leads"),
        content: getCount(channelStats, "content"),
        analytics: getCount(channelStats, "analytics"),
      },
    };
  }),
});
