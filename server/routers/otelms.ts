/**
 * OTELMS Router
 * API endpoints for OTELMS daily reports
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getAllOtelmsReports,
  getOtelmsReportByDate,
  getOtelmsReportsByDateRange,
  getLatestOtelmsReport,
  getOtelmsStatistics,
} from "../otelmsDb";

export const otelmsRouter = router({
  /**
   * Get all OTELMS daily reports
   */
  getAll: publicProcedure.query(async () => {
    const reports = await getAllOtelmsReports();
    return reports;
  }),

  /**
   * Get latest OTELMS report
   */
  getLatest: publicProcedure.query(async () => {
    const report = await getLatestOtelmsReport();
    return report;
  }),

  /**
   * Get OTELMS report by date
   */
  getByDate: publicProcedure
    .input(
      z.object({
        date: z.string(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const date = new Date(input.date);
      const report = await getOtelmsReportByDate(date);
      return report;
    }),

  /**
   * Get OTELMS reports by date range
   */
  getByDateRange: publicProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO date string
        endDate: z.string(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const reports = await getOtelmsReportsByDateRange(startDate, endDate);
      return reports;
    }),

  /**
   * Get aggregated statistics for a date range
   */
  getStatistics: publicProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO date string
        endDate: z.string(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const stats = await getOtelmsStatistics(startDate, endDate);
      return stats;
    }),

  /**
   * Get dashboard summary (last 30 days)
   */
  getDashboardSummary: publicProcedure.query(async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const stats = await getOtelmsStatistics(startDate, endDate);
    const latestReport = await getLatestOtelmsReport();

    return {
      last30Days: stats,
      latestReport,
    };
  }),

  /**
   * Trigger calendar sync from OTELMS to Rows.com
   * Calls the Python API endpoint to scrape OTELMS and push to Rows.com
   */
  syncCalendar: publicProcedure
    .mutation(async () => {
      const otelmsApiUrl = process.env.OTELMS_API_URL || process.env.VITE_OTELMS_API_URL || "https://otelms-api.run.app";
      const timeout = 30000; // 30 seconds timeout
      
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Call Python API /scrape endpoint for calendar sync
        const response = await fetch(`${otelmsApiUrl}/scrape`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "calendar",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          
          // Better error messages based on status code
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          }
          if (response.status === 502 || response.status === 503) {
            throw new Error("OTELMS API is temporarily unavailable. Please try again in a few minutes.");
          }
          if (response.status === 504) {
            throw new Error("Request timeout. The sync is taking too long. Please try again.");
          }
          
          throw new Error(`OTELMS API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        return {
          success: true,
          message: "Calendar synced successfully",
          data,
          syncedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("OTELMS sync error:", error);
        
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Request timeout. The sync is taking too long. Please try again.");
        }
        
        throw new Error(
          `Failed to sync calendar: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Trigger status sync from OTELMS to Rows.com
   */
  syncStatus: publicProcedure
    .mutation(async () => {
      const otelmsApiUrl = process.env.OTELMS_API_URL || process.env.VITE_OTELMS_API_URL || "https://otelms-api.run.app";
      const timeout = 30000; // 30 seconds timeout
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${otelmsApiUrl}/scrape/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          }
          if (response.status === 502 || response.status === 503) {
            throw new Error("OTELMS API is temporarily unavailable. Please try again in a few minutes.");
          }
          if (response.status === 504) {
            throw new Error("Request timeout. The sync is taking too long. Please try again.");
          }
          
          throw new Error(`OTELMS API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        return {
          success: true,
          message: "Status synced successfully",
          data,
          syncedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("OTELMS sync error:", error);
        
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Request timeout. The sync is taking too long. Please try again.");
        }
        
        throw new Error(
          `Failed to sync status: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
