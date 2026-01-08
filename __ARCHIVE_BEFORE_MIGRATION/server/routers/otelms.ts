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
});
