import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Health Score Widget
 * 
 * Displays overall business health as a single score (0-100)
 * Based on weighted average of all KPIs
 * 
 * Design: Dark green gradient background with large, bold score
 */

export function HealthScoreWidget() {
  const { data: healthScore, isLoading } = trpc.ceoDashboard.getHealthScore.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Auto-refresh every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-amber-100 text-xl">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!healthScore) {
    return null;
  }

  // Determine color based on status
  const statusColors = {
    excellent: 'text-emerald-400',
    good: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  const statusEmojis = {
    excellent: '🎉',
    good: '✅',
    warning: '⚠️',
    critical: '🚨',
  };

  const statusLabels = {
    excellent: 'Excellent',
    good: 'Good',
    warning: 'Needs Attention',
    critical: 'Critical',
  };

  const TrendIcon = healthScore.trend === 'up' 
    ? TrendingUp 
    : healthScore.trend === 'down' 
    ? TrendingDown 
    : Minus;

  const trendColor = healthScore.trend === 'up'
    ? 'text-emerald-400'
    : healthScore.trend === 'down'
    ? 'text-red-400'
    : 'text-gray-400';

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-amber-100 text-2xl font-bold text-center">
          Business Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pb-8">
        {/* Main Score */}
        <div className="flex items-center space-x-4">
          <div className={`text-8xl font-black ${statusColors[healthScore.status]}`}>
            {healthScore.overall}
          </div>
          <div className="flex flex-col items-start">
            <div className="text-4xl text-amber-100">/100</div>
            <div className={`flex items-center space-x-2 ${trendColor}`}>
              <TrendIcon className="w-6 h-6" />
              <span className="text-lg font-semibold capitalize">{healthScore.trend}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-3 bg-emerald-950/50 px-6 py-3 rounded-full">
          <span className="text-3xl">{statusEmojis[healthScore.status]}</span>
          <span className={`text-xl font-bold ${statusColors[healthScore.status]}`}>
            {statusLabels[healthScore.status]}
          </span>
        </div>

        {/* Breakdown */}
        <div className="w-full grid grid-cols-2 gap-4 mt-6">
          <BreakdownItem
            label="Revenue"
            score={healthScore.breakdown.revenue}
          />
          <BreakdownItem
            label="Occupancy"
            score={healthScore.breakdown.occupancy}
          />
          <BreakdownItem
            label="Satisfaction"
            score={healthScore.breakdown.satisfaction}
          />
          <BreakdownItem
            label="Profit"
            score={healthScore.breakdown.profit}
          />
        </div>

        {/* Explanation */}
        <div className="text-center text-amber-100/70 text-sm mt-4 max-w-md">
          This score represents the overall health of your business based on revenue, occupancy, 
          guest satisfaction, and profit margin. Higher is better.
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownItem({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-800/30">
      <div className="text-amber-100/70 text-sm mb-1">{label}</div>
      <div className={`text-2xl font-bold ${getColor(score)}`}>{score}%</div>
    </div>
  );
}
