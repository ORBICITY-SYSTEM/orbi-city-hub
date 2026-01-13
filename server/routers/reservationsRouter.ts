/**
 * Reservations Router
 * tRPC endpoints for AI Reservations Director
 */

import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reservationsTasks } from "../../drizzle/schema";

export const reservationsRouter = router({
  /**
   * Get all reservations tasks with pagination
   */
  getTasks: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        category: z.enum(["bookings", "guests", "calendar", "ota", "reviews", "messages", "general"]).optional(),
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
        conditions.push(eq(reservationsTasks.status, input.status));
      }
      
      if (input?.category) {
        conditions.push(eq(reservationsTasks.category, input.category));
      }
      
      if (input?.agentName) {
        conditions.push(eq(reservationsTasks.agentName, input.agentName));
      }
      
      // Get tasks with pagination
      const tasks = await db
        .select()
        .from(reservationsTasks)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(reservationsTasks.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(reservationsTasks)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult?.count || 0;
      const hasMore = offset + tasks.length < total;

      return { tasks, total, hasMore };
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
        .from(reservationsTasks)
        .where(eq(reservationsTasks.id, input.id))
        .limit(1);

      return task || null;
    }),

  /**
   * Create new reservations task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["bookings", "guests", "calendar", "ota", "reviews", "messages", "general"]).default("general"),
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
        .insert(reservationsTasks)
        .values({
          title: input.title,
          description: input.description || null,
          category: input.category,
          priority: input.priority,
          assignedTo: input.assignedTo || null,
          agentName: input.assignedTo === "ai_agent" ? input.agentName : null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          createdBy: input.createdBy,
          status: "pending",
        })
        .$returningId();

      const [insertedTask] = await db
        .select()
        .from(reservationsTasks)
        .where(eq(reservationsTasks.id, insertResult.id))
        .limit(1);

      return insertedTask || null;
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

      const updates: Partial<typeof reservationsTasks.$inferInsert> = {
        status: input.status,
      };

      if (input.status === "completed") {
        updates.completedAt = new Date();
      }

      await db
        .update(reservationsTasks)
        .set(updates)
        .where(eq(reservationsTasks.id, input.id));

      // Fetch updated task
      const [updated] = await db
        .select()
        .from(reservationsTasks)
        .where(eq(reservationsTasks.id, input.id))
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
        category: z.enum(["bookings", "guests", "calendar", "ota", "reviews", "messages", "general"]).optional(),
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

      const updateData: Partial<typeof reservationsTasks.$inferInsert> = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
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
        .update(reservationsTasks)
        .set(updateData)
        .where(eq(reservationsTasks.id, id));

      // Fetch updated task
      const [updated] = await db
        .select()
        .from(reservationsTasks)
        .where(eq(reservationsTasks.id, id))
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
        .delete(reservationsTasks)
        .where(eq(reservationsTasks.id, input.id));

      return { success: true };
    }),

  /**
   * Get task statistics (optimized with SQL aggregation)
   */
  getTaskStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(case when status = 'pending' then 1 end)`,
        inProgress: sql<number>`count(case when status = 'in_progress' then 1 end)`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)`,
        cancelled: sql<number>`count(case when status = 'cancelled' then 1 end)`,
        bookings: sql<number>`count(case when category = 'bookings' then 1 end)`,
        guests: sql<number>`count(case when category = 'guests' then 1 end)`,
        calendar: sql<number>`count(case when category = 'calendar' then 1 end)`,
        ota: sql<number>`count(case when category = 'ota' then 1 end)`,
        reviews: sql<number>`count(case when category = 'reviews' then 1 end)`,
        messages: sql<number>`count(case when category = 'messages' then 1 end)`,
        general: sql<number>`count(case when category = 'general' then 1 end)`,
      })
      .from(reservationsTasks);

    return stats[0] || {
      total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0,
      bookings: 0, guests: 0, calendar: 0, ota: 0, reviews: 0, messages: 0, general: 0
    };
  }),
});
