/**
 * Finance Data Parser
 * Parses Excel financial reports and provides structured data
 */

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export interface FinancialSummary {
  month: string;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  companyProfit: number;
  ownersProfit: number;
  profitMargin: number;
}

export interface StudioGrowth {
  month: string;
  studioCount: number;
  growthPercent: number;
  daysAvailable: number;
  daysOccupied: number;
  occupancyRate: number;
}

export interface CostBreakdown {
  month: string;
  cleaning: number;
  marketing: number;
  salaries: number;
  utilities: number;
  total: number;
  percentOfRevenue: number;
}

export interface FinanceData {
  summary: FinancialSummary[];
  studioGrowth: StudioGrowth[];
  costBreakdown: CostBreakdown[];
}

/**
 * Parse financial Excel file using Python pandas
 */
export async function parseFinancialReport(
  filePath: string = path.join(__dirname, "../data/financial_report.xlsx")
): Promise<FinanceData> {
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    excel_file = "${filePath}"
    
    # Parse Summary sheet
    summary_df = pd.read_excel(excel_file, sheet_name="Summary", skiprows=1)
    summary_df = summary_df.dropna(subset=['Month'])
    
    summary_data = []
    for _, row in summary_df.iterrows():
        if pd.notna(row['Month']) and row['Month'] != 'Month':
            try:
                profit_margin = str(row['Profit Margin %']).replace('%', '')
                summary_data.append({
                    'month': str(row['Month']),
                    'totalRevenue': float(row['Total Revenue']),
                    'totalExpenses': float(row['Total Expenses']),
                    'totalProfit': float(row['Total Profit']),
                    'companyProfit': float(row['Company Profit']),
                    'ownersProfit': float(row['Owners Profit']),
                    'profitMargin': float(profit_margin)
                })
            except (ValueError, KeyError):
                continue
    
    # Parse Studio Growth sheet
    studio_df = pd.read_excel(excel_file, sheet_name="Studio Growth", skiprows=1)
    studio_df = studio_df.dropna(subset=['Month'])
    
    studio_data = []
    for _, row in studio_df.iterrows():
        if pd.notna(row['Month']) and row['Month'] != 'Month':
            try:
                growth_pct = str(row['Growth %']).replace('%', '')
                days_available = float(row['Days Available'])
                days_occupied = float(row['Days Occupied'])
                occupancy = (days_occupied / days_available * 100) if days_available > 0 else 0
                
                studio_data.append({
                    'month': str(row['Month']),
                    'studioCount': int(row['Studio Count']),
                    'growthPercent': float(growth_pct),
                    'daysAvailable': int(days_available),
                    'daysOccupied': int(days_occupied),
                    'occupancyRate': round(occupancy, 2)
                })
            except (ValueError, KeyError):
                continue
    
    # Parse Cost Optimization sheet
    cost_df = pd.read_excel(excel_file, sheet_name="Cost Optimization", skiprows=1)
    cost_df = cost_df.dropna(subset=['Month'])
    
    cost_data = []
    for _, row in cost_df.iterrows():
        if pd.notna(row['Month']) and row['Month'] != 'Month':
            try:
                pct_revenue = str(row['% of Revenue']).replace('%', '')
                cost_data.append({
                    'month': str(row['Month']),
                    'cleaning': float(row['Cleaning/Tech']),
                    'marketing': float(row['Marketing']),
                    'salaries': float(row['Salaries']),
                    'utilities': float(row['Utilities']),
                    'total': float(row['Total']),
                    'percentOfRevenue': float(pct_revenue)
                })
            except (ValueError, KeyError):
                continue
    
    result = {
        'summary': summary_data,
        'studioGrowth': studio_data,
        'costBreakdown': cost_data
    }
    
    print(json.dumps(result))
    
except Exception as e:
    print(json.dumps({'error': str(e)}), file=sys.stderr)
    sys.exit(1)
`;

  try {
    const { stdout, stderr } = await execAsync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`);
    
    if (stderr && !stdout) {
      throw new Error(`Python error: ${stderr}`);
    }
    
    const data = JSON.parse(stdout);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data as FinanceData;
  } catch (error) {
    console.error("Failed to parse financial report:", error);
    throw new Error(`Financial report parsing failed: ${error}`);
  }
}

/**
 * Calculate financial KPIs
 */
export function calculateFinancialKPIs(data: FinanceData) {
  const summary = data.summary;
  
  if (summary.length === 0) {
    return {
      totalAnnualRevenue: 0,
      totalAnnualExpenses: 0,
      totalAnnualProfit: 0,
      avgProfitMargin: 0,
      roi: 0,
      revenueGrowth: 0,
    };
  }
  
  const totalAnnualRevenue = summary.reduce((sum, m) => sum + m.totalRevenue, 0);
  const totalAnnualExpenses = summary.reduce((sum, m) => sum + m.totalExpenses, 0);
  const totalAnnualProfit = summary.reduce((sum, m) => sum + m.totalProfit, 0);
  const avgProfitMargin = summary.reduce((sum, m) => sum + m.profitMargin, 0) / summary.length;
  
  const roi = totalAnnualExpenses > 0 
    ? (totalAnnualProfit / totalAnnualExpenses) * 100 
    : 0;
  
  const firstMonth = summary[0];
  const lastMonth = summary[summary.length - 1];
  const revenueGrowth = firstMonth.totalRevenue > 0
    ? ((lastMonth.totalRevenue - firstMonth.totalRevenue) / firstMonth.totalRevenue) * 100
    : 0;
  
  return {
    totalAnnualRevenue: Math.round(totalAnnualRevenue),
    totalAnnualExpenses: Math.round(totalAnnualExpenses),
    totalAnnualProfit: Math.round(totalAnnualProfit),
    avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
  };
}

/**
 * Find fastest growing expense category
 */
export function findFastestGrowingExpense(data: FinanceData): {
  category: string;
  growthPercent: number;
  insight: string;
} {
  const costs = data.costBreakdown;
  
  if (costs.length < 2) {
    return {
      category: "N/A",
      growthPercent: 0,
      insight: "Insufficient data for expense trend analysis",
    };
  }
  
  const firstMonth = costs[0];
  const lastMonth = costs[costs.length - 1];
  
  const categories = ['cleaning', 'marketing', 'salaries', 'utilities'] as const;
  const growth: Record<string, number> = {};
  
  for (const category of categories) {
    const initial = firstMonth[category];
    const final = lastMonth[category];
    growth[category] = initial > 0 ? ((final - initial) / initial) * 100 : 0;
  }
  
  const fastest = Object.entries(growth).reduce((max, [cat, val]) => 
    val > max.value ? { category: cat, value: val } : max,
    { category: '', value: -Infinity }
  );
  
  const categoryLabels: Record<string, string> = {
    cleaning: 'Cleaning/Tech',
    marketing: 'Marketing',
    salaries: 'Salaries',
    utilities: 'Utilities',
  };
  
  return {
    category: categoryLabels[fastest.category] || fastest.category,
    growthPercent: Math.round(fastest.value * 100) / 100,
    insight: `${categoryLabels[fastest.category]} costs increased by ${Math.round(fastest.value)}% from ${firstMonth.month} to ${lastMonth.month}`,
  };
}

/**
 * Calculate revenue per studio
 */
export function calculateRevenuePerStudio(data: FinanceData) {
  const { summary, studioGrowth } = data;
  
  return summary.map((s, i) => {
    const studios = studioGrowth[i]?.studioCount || 1;
    return {
      month: s.month,
      revenuePerStudio: Math.round(s.totalRevenue / studios),
      profitPerStudio: Math.round(s.totalProfit / studios),
    };
  });
}
