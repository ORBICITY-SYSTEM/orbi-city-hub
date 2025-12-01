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

    const [rows] = await db.execute(
      "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
    );

    return rows[0] || null;
  }),

  /**
   * Get all monthly financial data
   */
  getMonthlyData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [rows] = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC"
    );

    return rows;
  }),

  /**
   * Get monthly revenue chart data
   */
  getRevenueChartData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [rows] = await db.execute(
      "SELECT month, total_revenue, total_expenses, total_profit FROM monthly_financials ORDER BY year ASC, FIELD(month, 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September') ASC"
    );

    return rows;
  }),

  /**
   * Get expense breakdown chart data
   */
  getExpenseBreakdown: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [rows] = await db.execute(
      "SELECT SUM(cleaning_tech) as cleaning_tech, SUM(marketing) as marketing, SUM(salaries) as salaries, SUM(utilities) as utilities FROM monthly_financials"
    );

    return rows[0] || null;
  }),

  /**
   * Get occupancy trend data
   */
  getOccupancyTrend: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [rows] = await db.execute(
      "SELECT month, occupancy_percent, avg_price FROM monthly_financials ORDER BY year ASC, FIELD(month, 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September') ASC"
    );

    return rows;
  }),

  /**
   * Get key metrics
   */
  getKeyMetrics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get summary
    const [summaryRows] = await db.execute(
      "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
    );
    const summary = summaryRows[0];

    // Get latest month
    const [latestRows] = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 1"
    );
    const latestMonth = latestRows[0];

    // Get previous month for comparison
    const [prevRows] = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 1 OFFSET 1"
    );
    const prevMonth = prevRows[0];

    // Calculate changes
    const revenueChange = prevMonth
      ? ((latestMonth.total_revenue - prevMonth.total_revenue) / prevMonth.total_revenue * 100).toFixed(1)
      : 0;

    const profitChange = prevMonth
      ? ((latestMonth.total_profit - prevMonth.total_profit) / prevMonth.total_profit * 100).toFixed(1)
      : 0;

    const occupancyChange = prevMonth
      ? (latestMonth.occupancy_percent - prevMonth.occupancy_percent).toFixed(1)
      : 0;

    return {
      totalRevenue: summary.total_revenue,
      totalProfit: summary.total_profit,
      profitMargin: ((summary.total_profit / summary.total_revenue) * 100).toFixed(1),
      latestMonthRevenue: latestMonth.total_revenue,
      latestMonthProfit: latestMonth.total_profit,
      latestMonthOccupancy: latestMonth.occupancy_percent,
      revenueChange: parseFloat(revenueChange),
      profitChange: parseFloat(profitChange),
      occupancyChange: parseFloat(occupancyChange),
      latestMonth: latestMonth.month,
    };
  }),
});
