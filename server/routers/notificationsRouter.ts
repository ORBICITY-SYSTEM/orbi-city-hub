import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { desc, eq, and, isNull, sql, lte } from "drizzle-orm";

export const notificationsRouter = router({
  // Get all notifications for a user
  getAll: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      unreadOnly: z.boolean().default(false),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input.userId) conditions.push(eq(notifications.userId, input.userId));
      if (input.unreadOnly) conditions.push(eq(notifications.isRead, false));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return db.select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit);
    }),

  // Get unread count
  getUnreadCount: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;

      const conditions = [eq(notifications.isRead, false)];
      if (input.userId) conditions.push(eq(notifications.userId, input.userId));

      const result = await db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...conditions));

      return result[0]?.count || 0;
    }),

  // Create a notification
  create: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      type: z.enum(["info", "success", "warning", "error", "approval"]).default("info"),
      title: z.string(),
      message: z.string().optional(),
      actionUrl: z.string().optional(),
      actionLabel: z.string().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      expiresAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.insert(notifications).values({
        ...input,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });

      return { id: result[0].insertId };
    }),

  // Mark as read
  markAsRead: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db.update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  // Mark all as read
  markAllAsRead: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const conditions = [eq(notifications.isRead, false)];
      if (input.userId) conditions.push(eq(notifications.userId, input.userId));

      await db.update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(and(...conditions));

      return { success: true };
    }),

  // Delete a notification
  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db.delete(notifications)
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  // Cleanup expired notifications
  cleanupExpired: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) return { deleted: 0 };

    const result = await db.delete(notifications)
      .where(and(
        sql`${notifications.expiresAt} IS NOT NULL`,
        lte(notifications.expiresAt, new Date())
      ));

    return { deleted: result[0].affectedRows || 0 };
  }),
});
