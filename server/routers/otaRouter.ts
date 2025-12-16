import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const otaRouter = router({
  getChannels: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.execute(sql`SELECT * FROM ota_channels ORDER BY total_revenue DESC`);
    return result[0] || [];
  }),

  getTotals: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total_bookings: 0, total_revenue: 0, total_nights: 0, active_channels: 0, avg_revenue: 0 };
    const result = await db.execute(sql`
      SELECT 
        SUM(total_bookings) as total_bookings,
        SUM(total_revenue) as total_revenue,
        SUM(total_nights) as total_nights,
        COUNT(*) as active_channels,
        AVG(avg_revenue) as avg_revenue
      FROM ota_channels 
      WHERE is_active = TRUE
    `);
    const rows = result[0] as any[];
    return rows[0] || { total_bookings: 0, total_revenue: 0, total_nights: 0, active_channels: 0, avg_revenue: 0 };
  }),

  syncChannel: publicProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.execute(sql`UPDATE ota_channels SET last_sync = NOW() WHERE id = ${input.channelId}`);
      return { success: true };
    }),
});
