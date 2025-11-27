import { getDb } from "../db";
import { errorLogs } from "../../drizzle/schema";

/**
 * Simple error logging system
 * Logs errors to database and console
 * Optional Sentry integration if configured
 */

export interface ErrorLogEntry {
  level: "error" | "warning" | "info";
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: number;
  userEmail?: string;
  url?: string;
  userAgent?: string;
}

/**
 * Log error to database
 */
export async function logError(entry: ErrorLogEntry) {
  try {
    // Log to console
    console.error(`[${entry.level.toUpperCase()}]`, entry.message, entry.context || "");

    // Log to database
    const db = await getDb();
    if (db) {
      await db.insert(errorLogs).values({
        level: entry.level,
        message: entry.message,
        stack: entry.stack || null,
        context: entry.context ? JSON.stringify(entry.context) : null,
        userId: entry.userId || null,
        userEmail: entry.userEmail || null,
        url: entry.url || null,
        userAgent: entry.userAgent || null,
      });
    }

    // Optional: Send to Sentry if configured
    if (process.env.SENTRY_DSN) {
      // Will be implemented later
    }
  } catch (error) {
    // Fallback to console if database logging fails
    console.error("[ErrorLogger] Failed to log error:", error);
    console.error("[ErrorLogger] Original error:", entry);
  }
}

/**
 * Express middleware for error logging
 */
export function errorLoggerMiddleware(err: Error, req: any, res: any, next: any) {
  logError({
    level: "error",
    message: err.message,
    stack: err.stack,
    context: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
    },
    userId: req.user?.id,
    userEmail: req.user?.email,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"],
  });

  // Pass to next error handler
  next(err);
}

/**
 * Get recent error logs
 */
export async function getRecentErrors(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(errorLogs)
    .orderBy(errorLogs.createdAt)
    .limit(limit);
}
