import { int, mysqlTable, varchar, decimal, timestamp } from "drizzle-orm/mysql-core";

/**
 * Financial Data Schema for ORBI City Dashboard
 * Stores monthly financial performance data from OTELMS Excel reports
 */
export const financialData = mysqlTable("financial_data", {
  id: int("id").autoincrement().primaryKey(),
  
  // Period
  month: varchar("month", { length: 50 }).notNull(), // "September 2025"
  year: int("year").notNull(),
  monthNumber: int("month_number").notNull(), // 1-12
  
  // Operational Metrics
  studios: int("studios").notNull(),
  daysAvailable: int("days_available").notNull(),
  daysOccupied: int("days_occupied").notNull(),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).notNull(), // 80.50
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }).notNull(),
  
  // Revenue
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).notNull(),
  
  // Expenses
  cleaningTech: decimal("cleaning_tech", { precision: 15, scale: 2 }).notNull(),
  marketing: decimal("marketing", { precision: 15, scale: 2 }).notNull(),
  salaries: decimal("salaries", { precision: 15, scale: 2 }).notNull(),
  utilities: decimal("utilities", { precision: 15, scale: 2 }).notNull(),
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).notNull(),
  
  // Profit
  totalProfit: decimal("total_profit", { precision: 15, scale: 2 }).notNull(),
  companyProfit: decimal("company_profit", { precision: 15, scale: 2 }).notNull(),
  ownersProfit: decimal("owners_profit", { precision: 15, scale: 2 }).notNull(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = typeof financialData.$inferInsert;
