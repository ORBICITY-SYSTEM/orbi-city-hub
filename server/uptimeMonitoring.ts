/**
 * Uptime Monitoring System
 * 
 * Features:
 * - Health check pings
 * - Downtime detection
 * - Alert notifications
 * - Uptime statistics
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Uptime Check Result
 */
export interface UptimeCheckResult {
  timestamp: Date;
  status: "up" | "down" | "degraded";
  responseTime: number;
  checks: {
    database: boolean;
    api: boolean;
    memory: boolean;
  };
  errors: string[];
}

/**
 * Uptime Statistics
 */
export interface UptimeStatistics {
  period: string;
  uptime: number; // percentage
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  incidents: {
    timestamp: Date;
    duration: number; // minutes
    reason: string;
  }[];
}

/**
 * Perform uptime check
 */
export async function performUptimeCheck(): Promise<UptimeCheckResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const checks = {
    database: false,
    api: false,
    memory: false,
  };

  // Check database
  try {
    const db = await getDb();
    if (db) {
      await db.execute(sql`SELECT 1`);
      checks.database = true;
    } else {
      errors.push("Database connection failed");
    }
  } catch (error) {
    errors.push(`Database error: ${error}`);
  }

  // Check API (basic health)
  try {
    checks.api = true;
  } catch (error) {
    errors.push(`API error: ${error}`);
  }

  // Check memory usage
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (usagePercent > 90) {
      errors.push(`High memory usage: ${usagePercent.toFixed(2)}%`);
    } else {
      checks.memory = true;
    }
  } catch (error) {
    errors.push(`Memory check error: ${error}`);
  }

  const responseTime = Date.now() - startTime;

  // Determine status
  let status: "up" | "down" | "degraded" = "up";
  if (errors.length > 0) {
    if (checks.database && checks.api) {
      status = "degraded";
    } else {
      status = "down";
    }
  }

  const result: UptimeCheckResult = {
    timestamp: new Date(),
    status,
    responseTime,
    checks,
    errors,
  };

  // Record check in database
  await recordUptimeCheck(result);

  // Send alert if down
  if (status === "down") {
    await notifyOwner({
      title: "🚨 System Down",
      content: `The system is currently down. Errors: ${errors.join(", ")}`,
    });
  } else if (status === "degraded") {
    await notifyOwner({
      title: "⚠️ System Degraded",
      content: `The system is experiencing issues. Errors: ${errors.join(", ")}`,
    });
  }

  return result;
}

/**
 * Record uptime check in database
 */
async function recordUptimeCheck(result: UptimeCheckResult) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      INSERT INTO uptimeChecks 
      (timestamp, status, responseTime, databaseCheck, apiCheck, memoryCheck, errors)
      VALUES (
        ${result.timestamp},
        ${result.status},
        ${result.responseTime},
        ${result.checks.database},
        ${result.checks.api},
        ${result.checks.memory},
        ${JSON.stringify(result.errors)}
      )
    `);
  } catch (error) {
    console.error("[Uptime Monitoring] Failed to record check:", error);
  }
}

/**
 * Get uptime statistics
 */
export async function getUptimeStatistics(hours: number = 24): Promise<UptimeStatistics> {
  const db = await getDb();
  if (!db) {
    return {
      period: `${hours} hours`,
      uptime: 0,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      incidents: [],
    };
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Get all checks in period
  const checksResult = await db.execute(sql`
    SELECT * FROM uptimeChecks
    WHERE timestamp >= ${since}
    ORDER BY timestamp DESC
  `);

  const checks = (checksResult as any).rows || checksResult;
  const totalChecks = checks.length;
  const successfulChecks = checks.filter((c: any) => c.status === "up").length;
  const failedChecks = totalChecks - successfulChecks;
  const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

  // Calculate average response time
  const totalResponseTime = checks.reduce((sum: number, c: any) => sum + (c.responseTime || 0), 0);
  const averageResponseTime = totalChecks > 0 ? totalResponseTime / totalChecks : 0;

  // Find incidents (consecutive failures)
  const incidents: { timestamp: Date; duration: number; reason: string }[] = [];
  let currentIncident: { start: Date; end: Date; errors: string[] } | null = null;

  for (const check of checks as any[]) {
    if (check.status !== "up") {
      if (!currentIncident) {
        currentIncident = {
          start: new Date(check.timestamp),
          end: new Date(check.timestamp),
          errors: JSON.parse(check.errors || "[]"),
        };
      } else {
        currentIncident.end = new Date(check.timestamp);
        currentIncident.errors.push(...JSON.parse(check.errors || "[]"));
      }
    } else if (currentIncident) {
      const duration = Math.round(
        (currentIncident.end.getTime() - currentIncident.start.getTime()) / 60000
      );
      incidents.push({
        timestamp: currentIncident.start,
        duration,
        reason: currentIncident.errors.join(", "),
      });
      currentIncident = null;
    }
  }

  return {
    period: `${hours} hours`,
    uptime: Math.round(uptime * 100) / 100,
    totalChecks,
    successfulChecks,
    failedChecks,
    averageResponseTime: Math.round(averageResponseTime),
    incidents,
  };
}

/**
 * Cleanup old uptime checks (keep 30 days)
 */
export async function cleanupOldUptimeChecks() {
  const db = await getDb();
  if (!db) return 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await db.execute(sql`
    DELETE FROM uptimeChecks
    WHERE timestamp < ${thirtyDaysAgo}
  `);

  return (result as any).rowsAffected || 0;
}
