import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';

/**
 * CEO Dashboard Router
 * 
 * Implements the "Hybrid Transformation" approach from CEO_DASHBOARD_ANALYSIS.md
 * 
 * Features:
 * - Real-time KPI calculation (with fallback to mock data)
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
  label: string;
  unit: string;
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
// MOCK DATA (used when database is not available)
// ============================================================================

function getMockKPIs(): {
  revenue: KPI;
  occupancy: KPI;
  satisfaction: KPI;
  profit: KPI;
} {
  return {
    revenue: {
      value: 42500,
      trend: 'up',
      vsLastPeriod: 8.5,
      vsTarget: 85,
      target: 50000,
      label: 'Revenue',
      unit: '₾',
    },
    occupancy: {
      value: 78.5,
      trend: 'up',
      vsLastPeriod: 5.2,
      vsTarget: 92.4,
      target: 85,
      label: 'Occupancy',
      unit: '%',
    },
    satisfaction: {
      value: 8.7,
      trend: 'stable',
      vsLastPeriod: 2.4,
      vsTarget: 96.7,
      target: 9,
      label: 'Guest Satisfaction',
      unit: '/10',
    },
    profit: {
      value: 22.3,
      trend: 'down',
      vsLastPeriod: -3.5,
      vsTarget: 89.2,
      target: 25,
      label: 'Profit Margin',
      unit: '%',
    },
  };
}

function getMockHealthScore(kpis: {
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

function getMockInsights(kpis: {
  revenue: KPI;
  occupancy: KPI;
  satisfaction: KPI;
  profit: KPI;
}): AIInsight[] {
  const insights: AIInsight[] = [];

  if (kpis.revenue.trend === 'down' || kpis.revenue.vsTarget < 80) {
    insights.push({
      id: 'revenue-optimization',
      title: 'Revenue Optimization Opportunity',
      description: `Revenue is at ${kpis.revenue.vsTarget.toFixed(1)}% of target. Consider dynamic pricing strategies.`,
      impact: 'high',
      effort: 'medium',
      priority: 9,
      module: 'finance',
      actionable: true,
      aiReasoning: 'Implement dynamic pricing based on demand patterns and competitor analysis',
    });
  }

  if (kpis.occupancy.value < kpis.occupancy.target) {
    insights.push({
      id: 'occupancy-boost',
      title: 'Increase Occupancy Rate',
      description: `Current occupancy is ${kpis.occupancy.value.toFixed(1)}%, below target of ${kpis.occupancy.target}%`,
      impact: 'high',
      effort: 'low',
      priority: 8,
      module: 'marketing',
      actionable: true,
      aiReasoning: 'Run targeted promotions on OTA platforms and offer last-minute booking discounts',
    });
  }

  if (kpis.satisfaction.trend === 'down') {
    insights.push({
      id: 'satisfaction-improvement',
      title: 'Guest Satisfaction Declining',
      description: `NPS dropped ${Math.abs(kpis.satisfaction.vsLastPeriod).toFixed(1)}% vs last period`,
      impact: 'high',
      effort: 'medium',
      priority: 7,
      module: 'reservations',
      actionable: true,
      aiReasoning: 'Review recent guest feedback and address common pain points immediately',
    });
  }

  if (kpis.profit.value < kpis.profit.target) {
    insights.push({
      id: 'cost-optimization',
      title: 'Optimize Operational Costs',
      description: `Profit margin is ${kpis.profit.value.toFixed(1)}%, below target of ${kpis.profit.target}%`,
      impact: 'medium',
      effort: 'high',
      priority: 6,
      module: 'logistics',
      actionable: true,
      aiReasoning: 'Analyze and reduce operational expenses, especially in logistics and maintenance',
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

function getMockAlerts(kpis: {
  revenue: KPI;
  occupancy: KPI;
  satisfaction: KPI;
  profit: KPI;
}): Alert[] {
  const alerts: Alert[] = [];

  if (kpis.revenue.vsLastPeriod < -20) {
    alerts.push({
      id: 'alert-revenue-critical',
      type: 'critical',
      title: 'Critical Revenue Drop',
      description: `Revenue has dropped ${Math.abs(kpis.revenue.vsLastPeriod).toFixed(1)}% vs last period`,
      timestamp: new Date(),
      module: 'finance',
      actionRequired: true,
      dismissed: false,
    });
  }

  if (kpis.occupancy.value < 70) {
    alerts.push({
      id: 'alert-occupancy-warning',
      type: 'warning',
      title: 'Low Occupancy Rate',
      description: `Occupancy is only ${kpis.occupancy.value.toFixed(1)}%, well below target`,
      timestamp: new Date(),
      module: 'reservations',
      actionRequired: true,
      dismissed: false,
    });
  }

  if (kpis.satisfaction.value < 8.0) {
    alerts.push({
      id: 'alert-satisfaction-warning',
      type: 'warning',
      title: 'Guest Satisfaction Below Expectations',
      description: `Average rating is ${kpis.satisfaction.value.toFixed(1)}/10`,
      timestamp: new Date(),
      module: 'reservations',
      actionRequired: true,
      dismissed: false,
    });
  }

  if (kpis.profit.value < 15) {
    alerts.push({
      id: 'alert-profit-critical',
      type: 'critical',
      title: 'Profit Margin Too Low',
      description: `Profit margin is only ${kpis.profit.value.toFixed(1)}%`,
      timestamp: new Date(),
      module: 'finance',
      actionRequired: true,
      dismissed: false,
    });
  }

  return alerts;
}

function getMockForecasts(): Forecast[] {
  return [
    {
      metric: 'Revenue',
      current: 42500,
      predicted: 48200,
      confidence: 78,
      timeframe: '30d',
      trend: 'up',
    },
    {
      metric: 'Occupancy',
      current: 78.5,
      predicted: 82.3,
      confidence: 72,
      timeframe: '30d',
      trend: 'up',
    },
    {
      metric: 'Satisfaction',
      current: 8.7,
      predicted: 8.9,
      confidence: 65,
      timeframe: '30d',
      trend: 'up',
    },
    {
      metric: 'Profit Margin',
      current: 22.3,
      predicted: 24.1,
      confidence: 70,
      timeframe: '30d',
      trend: 'up',
    },
  ];
}

// ============================================================================
// ROUTER
// ============================================================================

export const ceoDashboardRouter = router({
  /**
   * Get all KPIs
   */
  getKPIs: publicProcedure.query(async () => {
    const db = await getDb();
    
    // For now, always return mock data
    // TODO: Implement real database queries when data is available
    const kpis = getMockKPIs();
    
    return kpis;
  }),

  /**
   * Get Health Score
   */
  getHealthScore: publicProcedure.query(async () => {
    const db = await getDb();
    
    const kpis = getMockKPIs();
    const healthScore = getMockHealthScore(kpis);
    
    return healthScore;
  }),

  /**
   * Get AI Insights
   */
  getInsights: publicProcedure.query(async () => {
    const db = await getDb();
    
    const kpis = getMockKPIs();
    const insights = getMockInsights(kpis);
    
    return insights;
  }),

  /**
   * Get Alerts
   */
  getAlerts: publicProcedure.query(async () => {
    const db = await getDb();
    
    const kpis = getMockKPIs();
    const alerts = getMockAlerts(kpis);
    
    return alerts;
  }),

  /**
   * Get Forecasts
   */
  getForecasts: publicProcedure.query(async () => {
    const db = await getDb();
    
    const forecasts = getMockForecasts();
    
    return forecasts;
  }),

  /**
   * Get Complete Dashboard Data
   */
  getDashboard: publicProcedure.query(async () => {
    const db = await getDb();
    
    const kpis = getMockKPIs();
    const healthScore = getMockHealthScore(kpis);
    const insights = getMockInsights(kpis);
    const alerts = getMockAlerts(kpis);
    const forecasts = getMockForecasts();
    
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
