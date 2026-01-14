/**
 * Alert System
 * 
 * Manages system alerts and notifications for critical events,
 * performance degradation, and backup failures.
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id?: number;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  status: AlertStatus;
  acknowledgedBy?: number;
  acknowledgedAt?: Date;
  resolvedBy?: number;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create a new alert
 */
export async function createAlert(
  alert: Omit<Alert, "id" | "status" | "createdAt" | "updatedAt">
): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Alert] Cannot create alert: database not available");
    return null;
  }

  try {
    const result = await db.execute(sql`
      INSERT INTO alerts 
      (type, severity, title, message, metadata, status)
      VALUES (${alert.type}, ${alert.severity}, ${alert.title}, ${alert.message}, ${alert.metadata ? JSON.stringify(alert.metadata) : null}, 'active')
    `);

    const alertId = Number((result as any).insertId);

    // Send notification for high and critical alerts
    if (alert.severity === "high" || alert.severity === "critical") {
      await notifyOwner({
        title: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
        content: alert.message,
      }).catch((error) => {
        console.error("[Alert] Failed to send notification:", error);
      });
    }

    console.log(`[Alert] Created ${alert.severity} alert: ${alert.title}`);
    return alertId;
  } catch (error) {
    console.error("[Alert] Failed to create alert:", error);
    return null;
  }
}

/**
 * Get all active alerts
 */
export async function getActiveAlerts(): Promise<Alert[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.execute(sql`
      SELECT * FROM alerts
      WHERE status = 'active'
      ORDER BY 
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        createdAt DESC
    `);

    return ((result as any) as any[]).map((row: any) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));
  } catch (error) {
    console.error("[Alert] Failed to get active alerts:", error);
    return [];
  }
}

/**
 * Get alerts by type
 */
export async function getAlertsByType(type: string): Promise<Alert[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.execute(sql`
      SELECT * FROM alerts
      WHERE type = ${type}
      ORDER BY createdAt DESC
      LIMIT 100
    `);

    return ((result as any) as any[]).map((row: any) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));
  } catch (error) {
    console.error("[Alert] Failed to get alerts by type:", error);
    return [];
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    await db.execute(sql`
      UPDATE alerts
      SET status = 'acknowledged',
          acknowledgedBy = ${userId},
          acknowledgedAt = NOW()
      WHERE id = ${alertId} AND status = 'active'
    `);

    return true;
  } catch (error) {
    console.error("[Alert] Failed to acknowledge alert:", error);
    return false;
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(
  alertId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    await db.execute(sql`
      UPDATE alerts
      SET status = 'resolved',
          resolvedBy = ${userId},
          resolvedAt = NOW()
      WHERE id = ${alertId} AND status IN ('active', 'acknowledged')
    `);

    return true;
  } catch (error) {
    console.error("[Alert] Failed to resolve alert:", error);
    return false;
  }
}

/**
 * Alert Triggers - Functions that check conditions and create alerts
 */

/**
 * Check for high error rate and create alert if threshold exceeded
 */
export async function checkErrorRate(threshold: number = 5): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as totalRequests,
        SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END) as errorCount
      FROM performanceMetrics
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `);

    const row = ((result as any) as any[])[0] as any;
    const totalRequests = Number(row?.totalRequests || 0);
    const errorCount = Number(row?.errorCount || 0);

    if (totalRequests > 10) {
      const errorRate = (errorCount / totalRequests) * 100;

      if (errorRate > threshold) {
        await createAlert({
          type: "high_error_rate",
          severity: errorRate > 20 ? "critical" : "high",
          title: "High Error Rate Detected",
          message: `Error rate is ${errorRate.toFixed(
            2
          )}% (${errorCount}/${totalRequests} requests failed in the last 5 minutes)`,
          metadata: {
            errorRate,
            errorCount,
            totalRequests,
            threshold,
          },
        });
      }
    }
  } catch (error) {
    console.error("[Alert] Failed to check error rate:", error);
  }
}

/**
 * Check for slow response times and create alert if threshold exceeded
 */
export async function checkResponseTime(threshold: number = 1000): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const result = await db.execute(sql`
      SELECT 
        AVG(responseTime) as avgResponseTime,
        MAX(responseTime) as maxResponseTime
      FROM performanceMetrics
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `);

    const row = ((result as any) as any[])[0] as any;
    const avgResponseTime = Number(row?.avgResponseTime || 0);
    const maxResponseTime = Number(row?.maxResponseTime || 0);

    if (avgResponseTime > threshold) {
      await createAlert({
        type: "slow_response_time",
        severity: avgResponseTime > threshold * 2 ? "high" : "medium",
        title: "Slow Response Time Detected",
        message: `Average response time is ${avgResponseTime.toFixed(
          0
        )}ms (threshold: ${threshold}ms) in the last 5 minutes`,
        metadata: {
          avgResponseTime,
          maxResponseTime,
          threshold,
        },
      });
    }
  } catch (error) {
    console.error("[Alert] Failed to check response time:", error);
  }
}

/**
 * Check for backup failures
 */
export async function checkBackupStatus(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const result = await db.execute(sql`
      SELECT status, createdAt
      FROM backups
      ORDER BY createdAt DESC
      LIMIT 1
    `);

    const lastBackup = ((result as any) as any[])[0] as any;

    if (!lastBackup) {
      // No backups found
      await createAlert({
        type: "backup_missing",
        severity: "high",
        title: "No Backups Found",
        message: "No database backups have been created yet. Please configure automated backups.",
        metadata: {},
      });
    } else if (lastBackup.status === "failed") {
      // Last backup failed
      await createAlert({
        type: "backup_failed",
        severity: "critical",
        title: "Database Backup Failed",
        message: `Last backup attempt failed at ${new Date(
          lastBackup.createdAt
        ).toLocaleString()}`,
        metadata: {
          lastBackupTime: lastBackup.createdAt,
        },
      });
    } else {
      // Check if last successful backup is too old (>48 hours)
      const hoursSinceBackup =
        (Date.now() - new Date(lastBackup.createdAt).getTime()) / (1000 * 60 * 60);

      if (hoursSinceBackup > 48) {
        await createAlert({
          type: "backup_overdue",
          severity: "high",
          title: "Backup Overdue",
          message: `Last successful backup was ${hoursSinceBackup.toFixed(
            1
          )} hours ago. Backups should run daily.`,
          metadata: {
            lastBackupTime: lastBackup.createdAt,
            hoursSinceBackup,
          },
        });
      }
    }
  } catch (error) {
    console.error("[Alert] Failed to check backup status:", error);
  }
}

/**
 * Run all alert checks
 */
export async function runAlertChecks(): Promise<void> {
  console.log("[Alert] Running alert checks...");

  await Promise.all([
    checkErrorRate(),
    checkResponseTime(),
    checkBackupStatus(),
  ]);

  console.log("[Alert] Alert checks completed");
}
