/**
 * Performance Metrics Middleware
 * 
 * Express middleware that tracks response times and logs performance metrics
 */

import { Request, Response, NextFunction } from "express";
import { logPerformanceMetric } from "./performanceMetrics";

/**
 * Middleware to track request performance
 */
export function performanceTrackingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Capture the original res.end function
  const originalEnd = res.end;

  // Override res.end to log performance when response is sent
  res.end = function (this: Response, ...args: any[]) {
    const responseTime = Date.now() - startTime;

    // Log performance metric (async, non-blocking)
    logPerformanceMetric({
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      userId: (req as any).user?.id,
      userAgent: req.get("user-agent"),
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch((error) => {
      // Silent failure - don't break the response
      console.error("[Performance] Failed to log metric:", error);
    });

    // Call the original res.end
    return originalEnd.apply(this, args);
  };

  next();
}

/**
 * Middleware to add performance headers to response
 */
export function performanceHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    res.setHeader("X-Response-Time", `${responseTime}ms`);
  });

  next();
}
