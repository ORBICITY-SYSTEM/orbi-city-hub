import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { TrendingUp, TrendingDown, Minus, DollarSign, Home, Star, PiggyBank } from 'lucide-react';

/**
 * KPI Cards Grid
 * 
 * Displays 4 core KPIs in a 2x2 grid:
 * - Revenue
 * - Occupancy
 * - Guest Satisfaction (NPS)
 * - Profit Margin
 * 
 * Each card shows:
 * - Current value
 * - Trend vs last period
 * - Progress to target
 * 
 * Design: Dark green gradient cards with large, bold numbers
 */

export function KPICardsGrid() {
  const { data: kpis, isLoading } = trpc.ceoDashboard.getKPIs.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Auto-refresh every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
            <CardContent className="flex items-center justify-center h-48">
              <div className="animate-pulse text-amber-100">Loading...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpis) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KPICard
        title="Revenue"
        value={`₾${kpis.revenue.value.toLocaleString()}`}
        trend={kpis.revenue.trend}
        vsLastPeriod={kpis.revenue.vsLastPeriod}
        vsTarget={kpis.revenue.vsTarget}
        icon={<DollarSign className="w-8 h-8" />}
        emoji="💰"
      />
      <KPICard
        title="Occupancy"
        value={`${kpis.occupancy.value.toFixed(1)}%`}
        trend={kpis.occupancy.trend}
        vsLastPeriod={kpis.occupancy.vsLastPeriod}
        vsTarget={kpis.occupancy.vsTarget}
        icon={<Home className="w-8 h-8" />}
        emoji="🏠"
      />
      <KPICard
        title="Guest Satisfaction"
        value={`${kpis.satisfaction.value.toFixed(1)}/10`}
        trend={kpis.satisfaction.trend}
        vsLastPeriod={kpis.satisfaction.vsLastPeriod}
        vsTarget={kpis.satisfaction.vsTarget}
        icon={<Star className="w-8 h-8" />}
        emoji="⭐"
      />
      <KPICard
        title="Profit Margin"
        value={`${kpis.profit.value.toFixed(1)}%`}
        trend={kpis.profit.trend}
        vsLastPeriod={kpis.profit.vsLastPeriod}
        vsTarget={kpis.profit.vsTarget}
        icon={<PiggyBank className="w-8 h-8" />}
        emoji="💵"
      />
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  vsLastPeriod: number;
  vsTarget: number;
  icon: React.ReactNode;
  emoji: string;
}

function KPICard({ title, value, trend, vsLastPeriod, vsTarget, icon, emoji }: KPICardProps) {
  const TrendIcon = trend === 'up' 
    ? TrendingUp 
    : trend === 'down' 
    ? TrendingDown 
    : Minus;

  const trendColor = trend === 'up'
    ? 'text-emerald-400'
    : trend === 'down'
    ? 'text-red-400'
    : 'text-gray-400';

  const targetColor = vsTarget >= 100
    ? 'text-emerald-400'
    : vsTarget >= 75
    ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700 hover:border-emerald-600 transition-all hover:shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-100 text-lg font-semibold flex items-center justify-between">
          <span>{title}</span>
          <span className="text-3xl">{emoji}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Value */}
        <div className="flex items-baseline space-x-2">
          <div className="text-5xl font-black text-amber-100">{value}</div>
        </div>

        {/* Trend vs Last Period */}
        <div className={`flex items-center space-x-2 ${trendColor}`}>
          <TrendIcon className="w-5 h-5" />
          <span className="text-lg font-semibold">
            {vsLastPeriod > 0 ? '+' : ''}{vsLastPeriod.toFixed(1)}%
          </span>
          <span className="text-amber-100/60 text-sm">vs last month</span>
        </div>

        {/* Progress to Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-100/70">Progress to Target</span>
            <span className={`font-bold ${targetColor}`}>
              {vsTarget.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-emerald-950/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                vsTarget >= 100
                  ? 'bg-emerald-400'
                  : vsTarget >= 75
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(vsTarget, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-800/30">
          <span className="text-amber-100/60 text-xs">Status</span>
          <div className="flex items-center space-x-2">
            {vsTarget >= 100 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-semibold">On Track</span>
              </>
            ) : vsTarget >= 75 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-sm font-semibold">Needs Attention</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 text-sm font-semibold">Critical</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
