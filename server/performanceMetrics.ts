/**
 * Performance Metrics Tracking System
 * 
 * Tracks response times, query performance, and system metrics
 * for monitoring and optimization purposes.
 */

import { getDb } from "./db";

export interface PerformanceMetric {
  id?: number;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userId?: number;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
}

/**
 * Log a performance metric to the database
 */
export async function logPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Performance] Cannot log metric: database not available");
    return;
  }

  try {
    await db.execute({
      sql: `
        INSERT INTO performanceMetrics 
        (endpoint, method, responseTime, statusCode, userId, userAgent, ipAddress, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      args: [
        metric.endpoint,
        metric.method,
        metric.responseTime,
        metric.statusCode,
        metric.userId || null,
        metric.userAgent || null,
        metric.ipAddress || null,
      ],
    });
  } catch (error) {
    // Don't throw - performance logging should never break the app
    console.error("[Performance] Failed to log metric:", error);
  }
}

/**
 * Get performance statistics for a specific endpoint
 */
export async function getEndpointStats(endpoint: string, hours: number = 24) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as requestCount,
          AVG(responseTime) as avgResponseTime,
          MIN(responseTime) as minResponseTime,
          MAX(responseTime) as maxResponseTime,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY responseTime) as p95ResponseTime,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY responseTime) as p99ResponseTime
        FROM performanceMetrics
        WHERE endpoint = ?
          AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `,
      args: [endpoint, hours],
    });

    return result.rows[0] || null;
  } catch (error) {
    console.error("[Performance] Failed to get endpoint stats:", error);
    return null;
  }
}

/**
 * Get overall system performance statistics
 */
export async function getSystemStats(hours: number = 24) {
  const db = await getDb();
  if (!db) {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      slowestEndpoints: [],
    };
  }

  try {
    // Overall stats
    const overallResult = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as totalRequests,
          AVG(responseTime) as avgResponseTime,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY responseTime) as p95ResponseTime,
          SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as errorRate
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `,
      args: [hours],
    });

    // Slowest endpoints
    const slowestResult = await db.execute({
      sql: `
        SELECT 
          endpoint,
          COUNT(*) as requestCount,
          AVG(responseTime) as avgResponseTime
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY endpoint
        ORDER BY avgResponseTime DESC
        LIMIT 10
      `,
      args: [hours],
    });

    return {
      totalRequests: Number(overallResult.rows[0]?.totalRequests || 0),
      avgResponseTime: Number(overallResult.rows[0]?.avgResponseTime || 0),
      p95ResponseTime: Number(overallResult.rows[0]?.p95ResponseTime || 0),
      errorRate: Number(overallResult.rows[0]?.errorRate || 0),
      slowestEndpoints: slowestResult.rows,
    };
  } catch (error) {
    console.error("[Performance] Failed to get system stats:", error);
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      slowestEndpoints: [],
    };
  }
}

/**
 * Get performance metrics over time (for charting)
 */
export async function getMetricsTimeSeries(hours: number = 24, intervalMinutes: number = 60) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.execute({
      sql: `
        SELECT 
          DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as timeSlot,
          COUNT(*) as requestCount,
          AVG(responseTime) as avgResponseTime,
          SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END) as errorCount
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY timeSlot
        ORDER BY timeSlot ASC
      `,
      args: [hours],
    });

    return result.rows;
  } catch (error) {
    console.error("[Performance] Failed to get time series:", error);
    return [];
  }
}

/**
 * Clean up old performance metrics (retention policy)
 */
export async function cleanupOldMetrics(daysToKeep: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Performance] Cannot cleanup: database not available");
    return 0;
  }

  try {
    const result = await db.execute({
      sql: `
        DELETE FROM performanceMetrics
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
      `,
      args: [daysToKeep],
    });

    const deletedCount = result.rowsAffected || 0;
    console.log(`[Performance] Cleaned up ${deletedCount} old metrics`);
    return deletedCount;
  } catch (error) {
    console.error("[Performance] Failed to cleanup old metrics:", error);
    return 0;
  }
}
