/**
 * Real Finance Router - Fetch actual financial data from database
 */

import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";

export const realFinanceRouter = router({
  /**
   * Get financial summary (Oct 2024 - Sep 2025)
   */
  getSummary: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
    );
    const rows = Array.isArray(result[0]) ? result[0] : [];
    return rows[0] || null;
  }),

  /**
   * Get all monthly financial data
   */
  getMonthlyData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC"
    );
    const rows = Array.isArray(result[0]) ? result[0] : [];
    return rows;
  }),

  /**
   * Get monthly revenue chart data
   */
  getRevenueChartData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      "SELECT month, total_revenue, total_expenses, total_profit FROM monthly_financials ORDER BY year ASC, FIELD(month, 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September') ASC"
    );
    const rows = Array.isArray(result[0]) ? result[0] : [];
    return rows;
  }),

  /**
   * Get expense breakdown chart data
   */
  getExpenseBreakdown: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      "SELECT SUM(cleaning_tech) as cleaning_tech, SUM(marketing) as marketing, SUM(salaries) as salaries, SUM(utilities) as utilities FROM monthly_financials"
    );
    const rows = Array.isArray(result[0]) ? result[0] : [];
    return rows[0] || null;
  }),

  /**
   * Get occupancy trend data
   */
  getOccupancyTrend: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      "SELECT month, occupancy_percent, avg_price FROM monthly_financials ORDER BY year ASC, FIELD(month, 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September') ASC"
    );
    const rows = Array.isArray(result[0]) ? result[0] : [];
    return rows;
  }),

  /**
   * Get key metrics
   */
  getKeyMetrics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get summary
    const summaryResult = await db.execute(
      "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
    );
    const summaryRows = Array.isArray(summaryResult[0]) ? summaryResult[0] : [];
    const summary = summaryRows[0] || { total_revenue: 0, total_profit: 0 };

    // Get latest month
    const latestResult = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 1"
    );
    const latestRows = Array.isArray(latestResult[0]) ? latestResult[0] : [];
    const latestMonth = latestRows[0] || { total_revenue: 0, total_profit: 0, occupancy_percent: 0, month: '' };

    // Get previous month for comparison
    const prevResult = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 1 OFFSET 1"
    );
    const prevRows = Array.isArray(prevResult[0]) ? prevResult[0] : [];
    const prevMonth = prevRows[0] || null;

    // Calculate changes
    const revenueChange = prevMonth && prevMonth.total_revenue > 0
      ? ((Number(latestMonth.total_revenue) - Number(prevMonth.total_revenue)) / Number(prevMonth.total_revenue) * 100).toFixed(1)
      : "0";

    const profitChange = prevMonth && prevMonth.total_profit > 0
      ? ((Number(latestMonth.total_profit) - Number(prevMonth.total_profit)) / Number(prevMonth.total_profit) * 100).toFixed(1)
      : "0";

    const occupancyChange = prevMonth
      ? (Number(latestMonth.occupancy_percent) - Number(prevMonth.occupancy_percent)).toFixed(1)
      : "0";

    return {
      totalRevenue: Number(summary.total_revenue) || 0,
      totalProfit: Number(summary.total_profit) || 0,
      profitMargin: summary.total_revenue > 0 ? ((Number(summary.total_profit) / Number(summary.total_revenue)) * 100).toFixed(1) : "0",
      latestMonthRevenue: Number(latestMonth.total_revenue) || 0,
      latestMonthProfit: Number(latestMonth.total_profit) || 0,
      latestMonthOccupancy: Number(latestMonth.occupancy_percent) || 0,
      revenueChange: parseFloat(revenueChange),
      profitChange: parseFloat(profitChange),
      occupancyChange: parseFloat(occupancyChange),
      latestMonth: latestMonth.month || "",
    };
  }),
});
