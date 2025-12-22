/**
 * RevenueHistoryChart.tsx
 * 
 * Detailed historical revenue chart for PowerStack Dashboard
 * Displays monthly revenue, expenses, profit, and occupancy trends
 * Data fetched from Google Sheets via GoogleSheetsService
 */

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinancialMetrics } from '@/hooks/useGoogleSheets';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// TYPES
// ============================================================================

type ChartView = 'revenue' | 'profit' | 'combined';

interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  occupancy: number;
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  language: string;
}

function CustomTooltip({ active, payload, label, language }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const labels: Record<string, Record<string, string>> = {
    revenue: { en: 'Revenue', ka: 'შემოსავალი' },
    expenses: { en: 'Expenses', ka: 'ხარჯები' },
    profit: { en: 'Net Profit', ka: 'წმინდა მოგება' },
    occupancy: { en: 'Occupancy', ka: 'დატვირთულობა' },
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white font-semibold mb-2">{label} 2025</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/70 text-sm">
                {labels[entry.dataKey]?.[language] || entry.name}
              </span>
            </div>
            <span className="text-white font-medium text-sm">
              {entry.dataKey === 'occupancy' 
                ? `${entry.value}%` 
                : formatCurrency(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RevenueHistoryChart() {
  const { language } = useLanguage();
  const { isDemo } = useDemoMode();
  const { data: financials, isLoading } = useFinancialMetrics();
  const [chartView, setChartView] = useState<ChartView>('combined');

  // Transform data for chart - financials is an object with monthlyData array
  const chartData: ChartDataPoint[] = financials?.monthlyData?.map((f: any) => ({
    month: f.month,
    revenue: f.totalRevenue,
    expenses: f.totalExpenses,
    profit: f.netProfit,
    occupancy: f.occupancyRate,
  })) || [];

  // Calculate totals and trends
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = chartData.reduce((sum, d) => sum + d.profit, 0);
  const avgOccupancy = chartData.length 
    ? Math.round(chartData.reduce((sum, d) => sum + d.occupancy, 0) / chartData.length)
    : 0;

  // Calculate YoY growth (comparing to previous period)
  const currentQuarter = chartData.slice(-3);
  const previousQuarter = chartData.slice(-6, -3);
  const currentRevenue = currentQuarter.reduce((sum, d) => sum + d.revenue, 0);
  const previousRevenue = previousQuarter.reduce((sum, d) => sum + d.revenue, 0);
  const revenueGrowth = previousRevenue > 0 
    ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
    : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₾${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₾${(value / 1000).toFixed(0)}K`;
    }
    return `₾${value}`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              {language === 'ka' ? 'შემოსავლების ისტორია' : 'Revenue History'}
            </CardTitle>
            {isDemo && (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                Demo Data
              </Badge>
            )}
          </div>
          
          {/* Chart View Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1">
            <Button
              size="sm"
              variant={chartView === 'revenue' ? 'default' : 'ghost'}
              className={`h-7 px-3 text-xs ${
                chartView === 'revenue' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setChartView('revenue')}
            >
              {language === 'ka' ? 'შემოსავალი' : 'Revenue'}
            </Button>
            <Button
              size="sm"
              variant={chartView === 'profit' ? 'default' : 'ghost'}
              className={`h-7 px-3 text-xs ${
                chartView === 'profit' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setChartView('profit')}
            >
              {language === 'ka' ? 'მოგება' : 'Profit'}
            </Button>
            <Button
              size="sm"
              variant={chartView === 'combined' ? 'default' : 'ghost'}
              className={`h-7 px-3 text-xs ${
                chartView === 'combined' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setChartView('combined')}
            >
              {language === 'ka' ? 'კომბინირებული' : 'Combined'}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-cyan-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              {language === 'ka' ? 'ჯამური შემოსავალი' : 'Total Revenue'}
            </div>
            <div className="text-white font-bold text-lg">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              {language === 'ka' ? 'ჯამური ხარჯი' : 'Total Expenses'}
            </div>
            <div className="text-white font-bold text-lg">{formatCurrency(totalExpenses)}</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              {language === 'ka' ? 'წმინდა მოგება' : 'Net Profit'}
            </div>
            <div className="text-white font-bold text-lg">{formatCurrency(totalProfit)}</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
              {revenueGrowth >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {language === 'ka' ? 'კვარტალური ზრდა' : 'QoQ Growth'}
            </div>
            <div className={`font-bold text-lg ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'combined' ? (
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={formatYAxis}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip language={language} />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    const labels: Record<string, Record<string, string>> = {
                      revenue: { en: 'Revenue', ka: 'შემოსავალი' },
                      expenses: { en: 'Expenses', ka: 'ხარჯები' },
                      profit: { en: 'Net Profit', ka: 'წმინდა მოგება' },
                      occupancy: { en: 'Occupancy %', ka: 'დატვირთულობა %' },
                    };
                    return <span className="text-white/70 text-sm">{labels[value]?.[language] || value}</span>;
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="expenses" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#22c55e' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#a855f7', strokeWidth: 2, r: 3 }}
                />
              </ComposedChart>
            ) : chartView === 'revenue' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expensesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip language={language} />} />
                <Legend 
                  formatter={(value) => {
                    const labels: Record<string, Record<string, string>> = {
                      revenue: { en: 'Revenue', ka: 'შემოსავალი' },
                      expenses: { en: 'Expenses', ka: 'ხარჯები' },
                    };
                    return <span className="text-white/70 text-sm">{labels[value]?.[language] || value}</span>;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fill="url(#revenueAreaGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="url(#expensesAreaGradient)"
                />
              </AreaChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profitAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip language={language} />} />
                <Legend 
                  formatter={(value) => {
                    const labels: Record<string, Record<string, string>> = {
                      profit: { en: 'Net Profit', ka: 'წმინდა მოგება' },
                    };
                    return <span className="text-white/70 text-sm">{labels[value]?.[language] || value}</span>;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  fill="url(#profitAreaGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40">
            {language === 'ka' 
              ? 'მონაცემები: 2025 წლის იანვარი - დეკემბერი' 
              : 'Data: January - December 2025'
            }
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{language === 'ka' ? 'საშ. დატვირთულობა:' : 'Avg Occupancy:'}</span>
            <span className="text-purple-400 font-medium">{avgOccupancy}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueHistoryChart;
