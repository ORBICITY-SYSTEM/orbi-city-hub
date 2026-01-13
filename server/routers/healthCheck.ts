import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

/**
 * Health check router for system monitoring
 */
export const healthCheckRouter = router({
  /**
   * Basic health check
   */
  check: publicProcedure.query(async () => {
    const db = await getDb();
    const dbHealthy = !!db;

    return {
      status: dbHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: dbHealthy,
      },
    };
  }),

  /**
   * Detailed system status
   */
  status: publicProcedure.query(async () => {
    const db = await getDb();
    
    // Check database connection
    let dbStatus = "disconnected";
    let dbLatency = 0;
    try {
      const start = Date.now();
      if (db) {
        await db.execute({ sql: "SELECT 1", params: [] });
        dbLatency = Date.now() - start;
        dbStatus = "connected";
      }
    } catch (error) {
      dbStatus = "error";
    }

    // System info
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: dbStatus === "connected" ? "operational" : "degraded",
      timestamp: new Date().toISOString(),
      components: {
        database: {
          status: dbStatus,
          latency: dbLatency,
        },
        api: {
          status: "operational",
          uptime: Math.floor(uptime),
        },
        memory: {
          status: memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? "healthy" : "warning",
          used: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.floor((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        },
      },
      metrics: {
        uptime: Math.floor(uptime),
        memoryUsage: {
          rss: Math.floor(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.floor(memoryUsage.external / 1024 / 1024),
        },
      },
    };
  }),

  /**
   * Get recent errors
   */
  errors: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      // Only allow admin users
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) return [];

      const limit = input?.limit || 20;
      const result = await db.execute({
        sql: `SELECT * FROM errorLogs ORDER BY createdAt DESC LIMIT ${limit}`,
        params: [],
      });

      // Drizzle execute returns [rows[], FieldPacket[]] for SELECT queries
      const rows = Array.isArray(result[0]) ? result[0] : [];
      return rows as any[];
    }),
});
