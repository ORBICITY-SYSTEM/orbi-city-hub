/**
 * Monitoring and Error Tracking
 *
 * This module provides error tracking and monitoring capabilities.
 * Currently configured as a placeholder for Sentry integration.
 *
 * To enable Sentry:
 * 1. Install: pnpm add @sentry/react
 * 2. Set VITE_SENTRY_DSN environment variable
 * 3. Uncomment Sentry initialization code below
 */

// import * as Sentry from "@sentry/react";

export interface MonitoringConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

/**
 * Initialize monitoring service
 */
export function initMonitoring(config?: MonitoringConfig) {
  const dsn = config?.dsn || import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn("[Monitoring] No DSN configured. Error tracking is disabled.");
    return;
  }

  // TODO: Uncomment when Sentry is installed
  // Sentry.init({
  //   dsn,
  //   environment: config?.environment || import.meta.env.MODE,
  //   release: config?.release || import.meta.env.VITE_APP_VERSION,
  //   tracesSampleRate: config?.tracesSampleRate || 0.1,
  //   integrations: [
  //     new Sentry.BrowserTracing(),
  //     new Sentry.Replay({
  //       maskAllText: false,
  //       blockAllMedia: false,
  //     }),
  //   ],
  //   replaysSessionSampleRate: 0.1,
  //   replaysOnErrorSampleRate: 1.0,
  // });

  console.log("[Monitoring] Initialized successfully");
}

/**
 * Capture an exception
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  console.error("[Monitoring] Exception:", error, context);

  // TODO: Uncomment when Sentry is installed
  // Sentry.captureException(error, {
  //   contexts: context ? { custom: context } : undefined,
  // });
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  console.log(`[Monitoring] ${level.toUpperCase()}:`, message);

  // TODO: Uncomment when Sentry is installed
  // Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(
  user: { id: string; email?: string; name?: string } | null
) {
  console.log("[Monitoring] User context:", user);

  // TODO: Uncomment when Sentry is installed
  // Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  console.log("[Monitoring] Breadcrumb:", message, data);

  // TODO: Uncomment when Sentry is installed
  // Sentry.addBreadcrumb({
  //   message,
  //   data,
  //   timestamp: Date.now() / 1000,
  // });
}

/**
 * Performance monitoring - start transaction
 */
export function startTransaction(name: string, op: string) {
  console.log(`[Monitoring] Transaction started: ${name} (${op})`);

  // TODO: Uncomment when Sentry is installed
  // return Sentry.startTransaction({ name, op });

  return {
    finish: () => console.log(`[Monitoring] Transaction finished: ${name}`),
  };
}
