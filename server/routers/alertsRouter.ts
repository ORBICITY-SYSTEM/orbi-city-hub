/**
 * Alerts tRPC Router
 * 
 * Provides endpoints for managing system alerts
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createAlert,
  getActiveAlerts,
  getAlertsByType,
  acknowledgeAlert,
  resolveAlert,
  runAlertChecks,
  type AlertSeverity,
} from "../alertSystem";

export const alertsRouter = router({
  /**
   * Get all active alerts
   */
  getActive: protectedProcedure.query(async () => {
    return await getActiveAlerts();
  }),

  /**
   * Get alerts by type
   */
  getByType: protectedProcedure
    .input(
      z.object({
        type: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getAlertsByType(input.type);
    }),

  /**
   * Create a new alert (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]),
        title: z.string(),
        message: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create alerts");
      }

      const alertId = await createAlert({
        type: input.type,
        severity: input.severity as AlertSeverity,
        title: input.title,
        message: input.message,
        metadata: input.metadata,
      });

      return {
        success: alertId !== null,
        alertId,
      };
    }),

  /**
   * Acknowledge an alert
   */
  acknowledge: protectedProcedure
    .input(
      z.object({
        alertId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await acknowledgeAlert(input.alertId, ctx.user.id);

      return {
        success,
        message: success
          ? "Alert acknowledged successfully"
          : "Failed to acknowledge alert",
      };
    }),

  /**
   * Resolve an alert
   */
  resolve: protectedProcedure
    .input(
      z.object({
        alertId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await resolveAlert(input.alertId, ctx.user.id);

      return {
        success,
        message: success
          ? "Alert resolved successfully"
          : "Failed to resolve alert",
      };
    }),

  /**
   * Run alert checks manually (admin only)
   */
  runChecks: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run alert checks");
    }

    await runAlertChecks();

    return {
      success: true,
      message: "Alert checks completed",
    };
  }),
});
