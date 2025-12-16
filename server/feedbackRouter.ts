import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Feedback router for user feedback, bug reports, and feature requests
 */
export const feedbackRouter = router({
  /**
   * Submit feedback
   */
  submit: publicProcedure
    .input(
      z.object({
        type: z.enum(["bug", "feature", "feedback"]),
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        url: z.string().optional(),
        userAgent: z.string().optional(),
        screenshot: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        INSERT INTO userFeedback (userId, userEmail, type, title, description, url, userAgent, screenshot)
        VALUES (${ctx.user?.id || null}, ${ctx.user?.email || null}, ${input.type}, ${input.title}, ${input.description}, ${input.url || null}, ${input.userAgent || null}, ${input.screenshot || null})
      `);

      return { success: true };
    }),

  /**
   * Get all feedback (admin only)
   */
  list: publicProcedure.query(async ({ ctx }) => {
    // Only allow admin users
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) return [];

    const result = await db.execute(sql`
      SELECT * FROM userFeedback
      ORDER BY createdAt DESC
      LIMIT 100
    `);

    return result[0] as any[];
  }),

  /**
   * Update feedback status (admin only)
   */
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "in_progress", "resolved", "closed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow admin users
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        UPDATE userFeedback
        SET status = ${input.status}
        WHERE id = ${input.id}
      `);

      return { success: true };
    }),

  /**
   * Delete feedback (admin only)
   */
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow admin users
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        DELETE FROM userFeedback
        WHERE id = ${input.id}
      `);

      return { success: true };
    }),

  /**
   * Get feedback statistics (admin only)
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    // Only allow admin users
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) {
      return {
        total: 0,
        byType: { bug: 0, feature: 0, feedback: 0 },
        byStatus: { new: 0, in_progress: 0, resolved: 0, closed: 0 },
      };
    }

    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'bug' THEN 1 ELSE 0 END) as bugs,
        SUM(CASE WHEN type = 'feature' THEN 1 ELSE 0 END) as features,
        SUM(CASE WHEN type = 'feedback' THEN 1 ELSE 0 END) as feedback,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count
      FROM userFeedback
    `);

    const row = result[0]?.[0] as any;

    return {
      total: Number(row?.total || 0),
      byType: {
        bug: Number(row?.bugs || 0),
        feature: Number(row?.features || 0),
        feedback: Number(row?.feedback || 0),
      },
      byStatus: {
        new: Number(row?.new_count || 0),
        in_progress: Number(row?.in_progress_count || 0),
        resolved: Number(row?.resolved_count || 0),
        closed: Number(row?.closed_count || 0),
      },
    };
  }),
});
