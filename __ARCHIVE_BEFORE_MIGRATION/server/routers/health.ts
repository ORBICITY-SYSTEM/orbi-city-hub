import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: "ok" | "error";
      latency?: number;
      error?: string;
    };
    memory: {
      status: "ok" | "warning" | "critical";
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      status: "ok" | "warning" | "critical";
      used: number;
      total: number;
      percentage: number;
    };
  };
  version: string;
}

/**
 * Health check endpoint for monitoring
 * Returns system health status including database, memory, and disk
 */
export const healthRouter = router({
  /**
   * GET /api/trpc/health.check
   * Public endpoint for uptime monitoring services
   */
  check: publicProcedure.query(async (): Promise<HealthCheck> => {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus: HealthCheck["checks"]["database"] = {
      status: "ok"
    };
    
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      
      // Simple query to test connection
      const dbStartTime = Date.now();
      await db.execute("SELECT 1");
      const dbLatency = Date.now() - dbStartTime;
      
      dbStatus = {
        status: "ok",
        latency: dbLatency
      };
    } catch (error) {
      dbStatus = {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const memPercentage = (usedMem / totalMem) * 100;
    
    const memoryStatus: HealthCheck["checks"]["memory"] = {
      status: memPercentage > 90 ? "critical" : memPercentage > 75 ? "warning" : "ok",
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round(memPercentage)
    };

    // Check disk usage (simplified - would need actual disk check in production)
    const diskStatus: HealthCheck["checks"]["disk"] = {
      status: "ok",
      used: 0,
      total: 0,
      percentage: 0
    };

    // Determine overall status
    let overallStatus: HealthCheck["status"] = "healthy";
    if (dbStatus.status === "error" || memoryStatus.status === "critical") {
      overallStatus = "unhealthy";
    } else if (memoryStatus.status === "warning") {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      checks: {
        database: dbStatus,
        memory: memoryStatus,
        disk: diskStatus
      },
      version: process.env.npm_package_version || "1.0.0"
    };
  }),

  /**
   * Simple ping endpoint
   * Returns 200 OK if server is responding
   */
  ping: publicProcedure.query(() => {
    return {
      pong: true,
      timestamp: new Date().toISOString()
    };
  }),
});
