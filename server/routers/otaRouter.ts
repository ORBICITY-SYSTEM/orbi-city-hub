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

  getBookings: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(15),
      search: z.string().optional(),
      channel: z.string().optional(),
      status: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { bookings: [], total: 0, totalPages: 0 };
      
      const offset = (input.page - 1) * input.limit;
      let whereClause = sql`1=1`;
      
      if (input.search) {
        whereClause = sql`${whereClause} AND (guest_name LIKE ${`%${input.search}%`} OR booking_number LIKE ${`%${input.search}%`} OR room_number LIKE ${`%${input.search}%`})`;
      }
      if (input.channel) {
        whereClause = sql`${whereClause} AND channel = ${input.channel}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      
      // Get total count
      const countResult = await db.execute(sql`SELECT COUNT(*) as total FROM ota_bookings WHERE ${whereClause}`);
      const total = (countResult[0] as any[])[0]?.total || 0;
      
      // Get bookings with pagination
      const result = await db.execute(sql`
        SELECT * FROM ota_bookings 
        WHERE ${whereClause}
        ORDER BY check_in DESC 
        LIMIT ${input.limit} OFFSET ${offset}
      `);
      
      return {
        bookings: result[0] || [],
        total: Number(total),
        totalPages: Math.ceil(Number(total) / input.limit)
      };
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
