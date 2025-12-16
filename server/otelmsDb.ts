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
          checkIns: report.checkIns,
          checkOuts: report.checkOuts,
          cancellations: report.cancellations,
          totalRevenue: report.totalRevenue,
          adr: report.adr,
          occupancyRate: report.occupancyRate,
          revPAR: report.revPAR,
          totalGuests: report.totalGuests,
          totalChildren: report.totalChildren,
          roomsOccupied: report.roomsOccupied,
          carsParked: report.carsParked,
          channelData: report.channelData,
          emailId: report.emailId,
          rawContent: report.rawContent,
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

  // Calculate totals
  const totals = reports.reduce(
    (acc, report) => ({
      checkIns: acc.checkIns + (report.checkIns || 0),
      checkOuts: acc.checkOuts + (report.checkOuts || 0),
      cancellations: acc.cancellations + (report.cancellations || 0),
      totalRevenue: acc.totalRevenue + (report.totalRevenue || 0),
      totalGuests: acc.totalGuests + (report.totalGuests || 0),
      roomsOccupied: acc.roomsOccupied + (report.roomsOccupied || 0),
    }),
    {
      checkIns: 0,
      checkOuts: 0,
      cancellations: 0,
      totalRevenue: 0,
      totalGuests: 0,
      roomsOccupied: 0,
    }
  );

  // Calculate averages
  const count = reports.length;
  const averages = {
    occupancyRate: Math.round(
      reports.reduce((sum, r) => sum + (r.occupancyRate || 0), 0) / count
    ),
    adr: Math.round(
      reports.reduce((sum, r) => sum + (r.adr || 0), 0) / count
    ),
    revPAR: Math.round(
      reports.reduce((sum, r) => sum + (r.revPAR || 0), 0) / count
    ),
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
