/**
 * ROWS.COM tRPC Router
 * Bidirectional sync between App and ROWS.COM Central Hub
 *
 * Data Flow:
 * - WRITE: Logistics data (housekeeping, maintenance, inventory) → ROWS.COM
 * - READ: OtelMS data (bookings, calendar) ← ROWS.COM
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  // Read functions
  getCalendarBookings,
  getDailyStatus,
  getRListBookings,
  getFinanceSummary,
  getTodayOperations,
  calculateRevenueFromRows,
  checkRowsConnection,
  // Write functions
  syncInventoryToRows,
  syncHousekeepingToRows,
  syncMaintenanceToRows,
  logActivityToRows,
  appendFinanceSummary,
  // Marketing Analytics
  getInstagramAnalytics,
  getFacebookAnalytics,
  getGoogleReviews,
  getUnifiedMarketingAnalytics,
  // Types
  type InventorySyncData,
  type HousekeepingSyncData,
  type MaintenanceSyncData,
  type ActivityLogData,
  type FinanceSummary,
} from "../lib/rowsClient";

export const rowsRouter = router({
  // ============================================
  // HEALTH CHECK
  // ============================================

  checkConnection: publicProcedure.query(async () => {
    return await checkRowsConnection();
  }),

  // ============================================
  // OTELMS DATA (READ from ROWS.COM)
  // ============================================

  getCalendarBookings: protectedProcedure.query(async () => {
    return await getCalendarBookings();
  }),

  getDailyStatus: protectedProcedure.query(async () => {
    return await getDailyStatus();
  }),

  getRListBookings: protectedProcedure
    .input(z.object({
      sortType: z.enum(['created', 'checkin', 'staydays']).optional().default('created'),
    }))
    .query(async ({ input }) => {
      return await getRListBookings(input.sortType);
    }),

  getTodayOperations: protectedProcedure.query(async () => {
    return await getTodayOperations();
  }),

  // ============================================
  // FINANCE DATA (READ/WRITE)
  // ============================================

  getFinanceSummary: protectedProcedure.query(async () => {
    return await getFinanceSummary();
  }),

  calculateRevenue: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      return await calculateRevenueFromRows(input.startDate, input.endDate);
    }),

  appendFinanceSummary: protectedProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number().min(2020).max(2100),
      revenue: z.number(),
      expenses: z.number(),
      profit: z.number(),
      occupancy: z.number(),
      adr: z.number(),
      revpar: z.number(),
    }))
    .mutation(async ({ input }) => {
      const success = await appendFinanceSummary(input as FinanceSummary);
      return { success };
    }),

  // ============================================
  // LOGISTICS DATA (WRITE to ROWS.COM)
  // ============================================

  syncInventory: protectedProcedure
    .input(z.object({
      roomNumber: z.string(),
      itemName: z.string(),
      category: z.string(),
      quantity: z.number(),
      condition: z.string(),
      notes: z.string().optional(),
      updatedBy: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await syncInventoryToRows(input as InventorySyncData);
      return { success };
    }),

  syncHousekeeping: protectedProcedure
    .input(z.object({
      roomNumbers: z.array(z.string()),
      scheduledDate: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      completedAt: z.string().optional(),
      cleanerName: z.string().optional(),
      notes: z.string().optional(),
      mediaUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const success = await syncHousekeepingToRows(input as HousekeepingSyncData);
      return { success };
    }),

  syncMaintenance: protectedProcedure
    .input(z.object({
      roomNumber: z.string(),
      issue: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      status: z.enum(['pending', 'in_progress', 'completed']),
      cost: z.number().optional(),
      technician: z.string().optional(),
      completedAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const success = await syncMaintenanceToRows(input as MaintenanceSyncData);
      return { success };
    }),

  logActivity: protectedProcedure
    .input(z.object({
      userEmail: z.string(),
      action: z.enum(['create', 'update', 'delete']),
      entityType: z.string(),
      entityId: z.string().optional(),
      entityName: z.string().optional(),
      changes: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const success = await logActivityToRows(input as ActivityLogData);
      return { success };
    }),

  // ============================================
  // BATCH SYNC
  // ============================================

  /**
   * Sync all logistics activity from Supabase to ROWS.COM
   * This is used for bulk sync operations
   */
  batchSyncHousekeeping: protectedProcedure
    .input(z.object({
      schedules: z.array(z.object({
        roomNumbers: z.array(z.string()),
        scheduledDate: z.string(),
        status: z.enum(['pending', 'in_progress', 'completed']),
        completedAt: z.string().optional(),
        cleanerName: z.string().optional(),
        notes: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const results = await Promise.allSettled(
        input.schedules.map(schedule => syncHousekeepingToRows(schedule as HousekeepingSyncData))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failed = results.length - successful;

      return {
        total: results.length,
        successful,
        failed,
      };
    }),

  // ============================================
  // MARKETING ANALYTICS (READ from ROWS.COM)
  // ============================================

  /**
   * Get Instagram analytics from ROWS.COM spreadsheet
   * Spreadsheet ID: 590R621oSJPeF4u2jPBPzz
   */
  getInstagramAnalytics: protectedProcedure.query(async () => {
    return await getInstagramAnalytics();
  }),

  /**
   * Get Facebook analytics from ROWS.COM spreadsheet
   * Spreadsheet ID: 3rHpzRaBXblvh4iHfrp3EE
   */
  getFacebookAnalytics: protectedProcedure.query(async () => {
    return await getFacebookAnalytics();
  }),

  /**
   * Get Google Reviews from ROWS.COM spreadsheet
   * Spreadsheet ID: 6TlKVBasXTLfKBjZJ0U96e
   */
  getGoogleReviews: protectedProcedure.query(async () => {
    return await getGoogleReviews();
  }),

  /**
   * Get unified marketing analytics (all platforms)
   * Combines Instagram, Facebook, and Google Reviews
   */
  getUnifiedMarketingAnalytics: protectedProcedure.query(async () => {
    return await getUnifiedMarketingAnalytics();
  }),
});

export type RowsRouter = typeof rowsRouter;
