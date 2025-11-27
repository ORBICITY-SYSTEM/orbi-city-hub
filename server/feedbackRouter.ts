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
});
