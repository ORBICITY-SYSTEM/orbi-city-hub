/**
 * OTELMS Database Operations
 * Helper functions for OTELMS daily reports
 */

import { eq, desc, gte, lte, and } from "drizzle-orm";
import { getDb } from "./db";
import { otelmsDailyReports, type InsertOtelmsDailyReport } from "../drizzle/schema";

/**
 * Get all OTELMS daily reports, ordered by date descending
 */
export async function getAllOtelmsReports() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTELMS reports: database not available");
    return [];
  }

  try {
    const reports = await db
      .select()
      .from(otelmsDailyReports)
      .orderBy(desc(otelmsDailyReports.reportDate));
    
    return reports;
  } catch (error) {
    console.error("[Database] Failed to get OTELMS reports:", error);
    return [];
  }
}

/**
 * Get OTELMS report for a specific date
 */
export async function getOtelmsReportByDate(date: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTELMS report: database not available");
    return null;
  }

  try {
    const reports = await db
      .select()
      .from(otelmsDailyReports)
      .where(eq(otelmsDailyReports.reportDate, date))
      .limit(1);
    
    return reports.length > 0 ? reports[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get OTELMS report:", error);
    return null;
  }
}

/**
 * Get OTELMS reports within a date range
 */
export async function getOtelmsReportsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTELMS reports: database not available");
    return [];
  }

  try {
    const reports = await db
      .select()
      .from(otelmsDailyReports)
      .where(
        and(
          gte(otelmsDailyReports.reportDate, startDate),
          lte(otelmsDailyReports.reportDate, endDate)
        )
      )
      .orderBy(desc(otelmsDailyReports.reportDate));
    
    return reports;
  } catch (error) {
    console.error("[Database] Failed to get OTELMS reports:", error);
    return [];
  }
}

/**
 * Insert or update OTELMS daily report
 */
export async function upsertOtelmsReport(report: InsertOtelmsDailyReport) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert OTELMS report: database not available");
    return false;
  }

  try {
    await db
      .insert(otelmsDailyReports)
      .values(report)
      .onDuplicateKeyUpdate({
        set: {
          // Fix schema field names to match actual schema
          reportDate: report.reportDate,
          occupancy: report.occupancy,
          revenue: report.revenue,
          adr: report.adr,
          revpar: report.revpar,
          bookingsCount: report.bookingsCount,
          checkInsCount: report.checkInsCount,
          checkOutsCount: report.checkOutsCount,
          rawData: report.rawData,
        },
      });
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to upsert OTELMS report:", error);
    return false;
  }
}

/**
 * Get latest OTELMS report
 */
export async function getLatestOtelmsReport() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get latest OTELMS report: database not available");
    return null;
  }

  try {
    const reports = await db
      .select()
      .from(otelmsDailyReports)
      .orderBy(desc(otelmsDailyReports.reportDate))
      .limit(1);
    
    return reports.length > 0 ? reports[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get latest OTELMS report:", error);
    return null;
  }
}

/**
 * Get aggregated statistics for a date range
 */
export async function getOtelmsStatistics(startDate: Date, endDate: Date) {
  const reports = await getOtelmsReportsByDateRange(startDate, endDate);
  
  if (reports.length === 0) {
    return null;
  }

  // Calculate totals - using actual schema field names
  const totals = reports.reduce(
    (acc, report) => ({
      checkInsCount: acc.checkInsCount + (report.checkInsCount || 0),
      checkOutsCount: acc.checkOutsCount + (report.checkOutsCount || 0),
      bookingsCount: acc.bookingsCount + (report.bookingsCount || 0),
      revenue: acc.revenue + (report.revenue || 0),
    }),
    {
      checkInsCount: 0,
      checkOutsCount: 0,
      bookingsCount: 0,
      revenue: 0,
    }
  );

  // Calculate averages - using actual schema field names
  const count = reports.length;
  const averages = {
    occupancy: count > 0 ? Math.round(
      reports.reduce((sum, r) => sum + (r.occupancy || 0), 0) / count
    ) : 0,
    adr: count > 0 ? Math.round(
      reports.reduce((sum, r) => sum + (r.adr || 0), 0) / count
    ) : 0,
    revpar: count > 0 ? Math.round(
      reports.reduce((sum, r) => sum + (r.revpar || 0), 0) / count
    ) : 0,
  };

  return {
    ...totals,
    ...averages,
    reportCount: count,
    dateRange: {
      start: startDate,
      end: endDate,
    },
  };
}
