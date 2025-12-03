import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { bookings, transactions, studios, reviews } from '../../shared/schema';
import { eq, gte, lte, and, desc, sql } from 'drizzle-orm';

/**
 * CEO Dashboard Router
 * 
 * Implements the "Hybrid Transformation" approach from CEO_DASHBOARD_ANALYSIS.md
 * 
 * Features:
 * - Real-time KPI calculation
 * - Health Score (0-100)
 * - AI-generated insights
 * - Predictive analytics
 * - Alert detection
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface KPI {
  value: number;
  trend: 'up' | 'down' | 'stable';
  vsLastPeriod: number; // percentage change
  vsTarget: number; // percentage of target achieved
  target: number;
}

interface HealthScore {
  overall: number; // 0-100
  breakdown: {
    revenue: number;
    occupancy: number;
    satisfaction: number;
    profit: number;
  };
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number; // 1-10
  module: 'finance' | 'marketing' | 'reservations' | 'logistics' | 'analytics';
  actionable: boolean;
  aiReasoning: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  module: string;
  actionRequired: boolean;
  dismissed: boolean;
}

interface Forecast {
  metric: string;
  current: number;
  predicted: number;
  confidence: number; // 0-100
  timeframe: '7d' | '30d' | '90d';
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Revenue KPI
 */
async function getRevenueKPI(): Promise<KPI> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month revenue
  const currentRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, startOfMonth),
        eq(transactions.type, 'income')
      )
    );

  // Last month revenue
  const lastRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, startOfLastMonth),
        lte(transactions.date, endOfLastMonth),
        eq(transactions.type, 'income')
      )
    );

  const current = currentRevenue[0]?.total || 0;
  const last = lastRevenue[0]?.total || 0;
  const target = 50000; // ₾50,000 monthly target

  const vsLastPeriod = last > 0 ? ((current - last) / last) * 100 : 0;
  const vsTarget = (current / target) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (vsLastPeriod > 5) trend = 'up';
  else if (vsLastPeriod < -5) trend = 'down';

  return {
    value: current,
    trend,
    vsLastPeriod,
    vsTarget,
    target,
  };
}

/**
 * Calculate Occupancy KPI
 */
async function getOccupancyKPI(): Promise<KPI> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalStudios = 60;

  // Current month bookings
  const currentBookings = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(
      and(
        gte(bookings.checkIn, startOfMonth),
        eq(bookings.status, 'confirmed')
      )
    );

  // Calculate occupancy rate
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const totalPossibleNights = totalStudios * daysInMonth;
  const bookedNights = currentBookings[0]?.count || 0;
  const occupancyRate = (bookedNights / totalPossibleNights) * 100;

  const target = 85; // 85% target occupancy
  const vsTarget = (occupancyRate / target) * 100;

  // For simplicity, assume last month was 75%
  const lastMonthOccupancy = 75;
  const vsLastPeriod = ((occupancyRate - lastMonthOccupancy) / lastMonthOccupancy) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (vsLastPeriod > 5) trend = 'up';
  else if (vsLastPeriod < -5) trend = 'down';

  return {
    value: occupancyRate,
    trend,
    vsLastPeriod,
    vsTarget,
    target,
  };
}

/**
 * Calculate Guest Satisfaction KPI (NPS)
 */
async function getSatisfactionKPI(): Promise<KPI> {
  // Get recent reviews (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentReviews = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(gte(reviews.date, thirtyDaysAgo));

  if (recentReviews.length === 0) {
    return {
      value: 0,
      trend: 'stable',
      vsLastPeriod: 0,
      vsTarget: 0,
      target: 9,
    };
  }

  // Calculate average rating
  const avgRating = recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length;

  const target = 9; // Target NPS of 9/10
  const vsTarget = (avgRating / target) * 100;

  // For simplicity, assume last period was 8.5
  const lastPeriodRating = 8.5;
  const vsLastPeriod = ((avgRating - lastPeriodRating) / lastPeriodRating) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (vsLastPeriod > 2) trend = 'up';
  else if (vsLastPeriod < -2) trend = 'down';

  return {
    value: avgRating,
    trend,
    vsLastPeriod,
    vsTarget,
    target,
  };
}

/**
 * Calculate Profit Margin KPI
 */
async function getProfitKPI(): Promise<KPI> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Current month income
  const income = await db
    .select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, startOfMonth),
        eq(transactions.type, 'income')
      )
    );

  // Current month expenses
  const expenses = await db
    .select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, startOfMonth),
        eq(transactions.type, 'expense')
      )
    );

  const totalIncome = income[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;
  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  const target = 25; // 25% profit margin target
  const vsTarget = (profitMargin / target) * 100;

  // For simplicity, assume last month was 20%
  const lastPeriodMargin = 20;
  const vsLastPeriod = ((profitMargin - lastPeriodMargin) / lastPeriodMargin) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (vsLastPeriod > 5) trend = 'up';
  else if (vsLastPeriod < -5) trend = 'down';

  return {
    value: profitMargin,
    trend,
    vsLastPeriod,
    vsTarget,
    target,
  };
}

/**
 * Calculate Health Score (0-100)
 * 
 * Weighted average of all KPIs:
 * - Revenue: 30%
 * - Occupancy: 25%
 * - Satisfaction: 25%
 * - Profit: 20%
 */
function calculateHealthScore(kpis: {
  revenue: KPI;
  occupancy: KPI;
  satisfaction: KPI;
  profit: KPI;
}): HealthScore {
  const weights = {
    revenue: 0.3,
    occupancy: 0.25,
    satisfaction: 0.25,
    profit: 0.2,
  };

  const revenueScore = Math.min(kpis.revenue.vsTarget, 100);
  const occupancyScore = Math.min(kpis.occupancy.vsTarget, 100);
  const satisfactionScore = Math.min(kpis.satisfaction.vsTarget, 100);
  const profitScore = Math.min(kpis.profit.vsTarget, 100);

  const overall =
    revenueScore * weights.revenue +
    occupancyScore * weights.occupancy +
    satisfactionScore * weights.satisfaction +
    profitScore * weights.profit;

  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (overall >= 90) status = 'excellent';
  else if (overall >= 75) status = 'good';
  else if (overall >= 60) status = 'warning';
  else status = 'critical';

  // Determine overall trend
  const trends = [kpis.revenue.trend, kpis.occupancy.trend, kpis.satisfaction.trend, kpis.profit.trend];
  const upCount = trends.filter(t => t === 'up').length;
  const downCount = trends.filter(t => t === 'down').length;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (upCount > downCount) trend = 'up';
  else if (downCount > upCount) trend = 'down';

  return {
    overall: Math.round(overall),
    breakdown: {
      revenue: Math.round(revenueScore),
      occupancy: Math.round(occupancyScore),
      satisfaction: Math.round(satisfactionScore),
      profit: Math.round(profitScore),
    },
    status,
    trend,
  };
}

/**
 * Generate AI Insights (placeholder - will integrate with OpenAI/Gemini)
 */
function generateAIInsights(kpis: {
  revenue: KPI;
  occupancy: KPI;
  satisfaction: KPI;
  profit: KPI;
}): AIInsight[] {
  const insights: AIInsight[] = [];

  // Revenue insight
  if (kpis.revenue.trend === 'down') {
    insights.push({
      id: 'revenue-down',
      title: 'Revenue Trending Down',
      description: 'Revenue is down ' + Math.abs(kpis.revenue.vsLastPeriod).toFixed(1) + '% vs last month',
      impact: 'high',
      effort: 'medium',
      priority: 9,
      module: 'marketing',
      actionable: true,
      aiReasoning: 'Increase visibility on OTA platforms (Booking.com, Airbnb) and run targeted promotions',
    });
  }

  // Occupancy insight
  if (kpis.occupancy.value < kpis.occupancy.target) {
    insights.push({
      id: 'occupancy-low',
      title: 'Occupancy Below Target',
      description: 'Current occupancy is ' + kpis.occupancy.value.toFixed(1) + '%, target is ' + kpis.occupancy.target + '%',
      impact: 'high',
      effort: 'low',
      priority: 8,
      module: 'marketing',
      actionable: true,
      aiReasoning: 'Run flash sale or last-minute booking discounts to fill empty studios',
    });
  }

  // Satisfaction insight
  if (kpis.satisfaction.trend === 'down') {
    insights.push({
      id: 'satisfaction-down',
      title: 'Guest Satisfaction Declining',
      description: 'NPS dropped ' + Math.abs(kpis.satisfaction.vsLastPeriod).toFixed(1) + '% vs last month',
      impact: 'high',
      effort: 'medium',
      priority: 7,
      module: 'reservations',
      actionable: true,
      aiReasoning: 'Review recent guest complaints and address common issues (cleanliness, amenities, staff)',
    });
  }

  // Profit insight
  if (kpis.profit.value < kpis.profit.target) {
    insights.push({
      id: 'profit-low',
      title: 'Profit Margin Below Target',
      description: 'Current margin is ' + kpis.profit.value.toFixed(1) + '%, target is ' + kpis.profit.target + '%',
      impact: 'medium',
      effort: 'high',
      priority: 6,
      module: 'finance',
      actionable: true,
      aiReasoning: 'Review and optimize operational expenses, especially logistics and maintenance costs',
    });
  }

  // Sort by priority (highest first)
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Detect Alerts
 */
function detectAlerts(kpis: {
  revenue: KPI;
  occupancy: KPI;
  satisfaction: KPI;
  profit: KPI;
}): Alert[] {
  const alerts: Alert[] = [];

  // Critical: Revenue drop >20%
  if (kpis.revenue.vsLastPeriod < -20) {
    alerts.push({
      id: 'alert-revenue-critical',
      type: 'critical',
      title: 'Critical Revenue Drop',
      description: 'Revenue has dropped ' + Math.abs(kpis.revenue.vsLastPeriod).toFixed(1) + '% vs last month',
      timestamp: new Date(),
      module: 'finance',
      actionRequired: true,
      dismissed: false,
    });
  }

  // Warning: Occupancy <70%
  if (kpis.occupancy.value < 70) {
    alerts.push({
      id: 'alert-occupancy-warning',
      type: 'warning',
      title: 'Low Occupancy Rate',
      description: 'Occupancy is only ' + kpis.occupancy.value.toFixed(1) + '%, well below target',
      timestamp: new Date(),
      module: 'reservations',
      actionRequired: true,
      dismissed: false,
    });
  }

  // Warning: Satisfaction <8.0
  if (kpis.satisfaction.value < 8.0) {
    alerts.push({
      id: 'alert-satisfaction-warning',
      type: 'warning',
      title: 'Guest Satisfaction Below Expectations',
      description: 'Average rating is ' + kpis.satisfaction.value.toFixed(1) + '/10',
      timestamp: new Date(),
      module: 'reservations',
      actionRequired: true,
      dismissed: false,
    });
  }

  return alerts;
}

/**
 * Simple Linear Regression Forecast
 */
function forecastMetric(historicalData: number[], days: number): Forecast {
  if (historicalData.length < 2) {
    return {
      metric: 'revenue',
      current: historicalData[0] || 0,
      predicted: historicalData[0] || 0,
      confidence: 0,
      timeframe: '30d',
      trend: 'stable',
    };
  }

  // Simple linear regression
  const n = historicalData.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predicted = slope * (n + days) + intercept;
  const current = y[y.length - 1];

  // Calculate R² for confidence
  const yMean = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;
  const confidence = Math.max(0, Math.min(100, r2 * 100));

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (predicted > current * 1.05) trend = 'up';
  else if (predicted < current * 0.95) trend = 'down';

  return {
    metric: 'revenue',
    current,
    predicted,
    confidence: Math.round(confidence),
    timeframe: '30d',
    trend,
  };
}

// ============================================================================
// TRPC ROUTER
// ============================================================================

export const ceoDashboardRouter = router({
  /**
   * Get all KPIs (real-time)
   */
  getKPIs: publicProcedure.query(async () => {
    const [revenue, occupancy, satisfaction, profit] = await Promise.all([
      getRevenueKPI(),
      getOccupancyKPI(),
      getSatisfactionKPI(),
      getProfitKPI(),
    ]);

    return {
      revenue,
      occupancy,
      satisfaction,
      profit,
    };
  }),

  /**
   * Get Health Score
   */
  getHealthScore: publicProcedure.query(async () => {
    const kpis = await ceoDashboardRouter.createCaller({} as any).getKPIs();
    return calculateHealthScore(kpis);
  }),

  /**
   * Get AI Insights
   */
  getAIInsights: publicProcedure.query(async () => {
    const kpis = await ceoDashboardRouter.createCaller({} as any).getKPIs();
    return generateAIInsights(kpis);
  }),

  /**
   * Get Alerts
   */
  getAlerts: publicProcedure.query(async () => {
    const kpis = await ceoDashboardRouter.createCaller({} as any).getKPIs();
    return detectAlerts(kpis);
  }),

  /**
   * Get Forecasts
   */
  getForecasts: publicProcedure.query(async () => {
    // For now, use dummy historical data
    // In production, fetch from database
    const revenueHistory = [42000, 45000, 43000, 47000, 45230];
    const occupancyHistory = [72, 75, 73, 78, 76];

    const revenueForecast = forecastMetric(revenueHistory, 30);
    const occupancyForecast = forecastMetric(occupancyHistory, 30);

    return {
      revenue: { ...revenueForecast, metric: 'revenue' },
      occupancy: { ...occupancyForecast, metric: 'occupancy' },
    };
  }),

  /**
   * Get Complete Dashboard Data (all-in-one)
   */
  getDashboard: publicProcedure.query(async () => {
    const [kpis, healthScore, insights, alerts, forecasts] = await Promise.all([
      ceoDashboardRouter.createCaller({} as any).getKPIs(),
      ceoDashboardRouter.createCaller({} as any).getHealthScore(),
      ceoDashboardRouter.createCaller({} as any).getAIInsights(),
      ceoDashboardRouter.createCaller({} as any).getAlerts(),
      ceoDashboardRouter.createCaller({} as any).getForecasts(),
    ]);

    return {
      kpis,
      healthScore,
      insights,
      alerts,
      forecasts,
      lastUpdated: new Date(),
    };
  }),
});
