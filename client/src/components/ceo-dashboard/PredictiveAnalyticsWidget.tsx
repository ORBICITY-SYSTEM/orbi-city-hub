import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

/**
 * Predictive Analytics Widget
 * 
 * Displays AI-powered forecasts for key metrics:
 * - Revenue forecast (30 days)
 * - Occupancy forecast (30 days)
 * 
 * Shows:
 * - Current value
 * - Predicted value
 * - Confidence level
 * - Trend direction
 * 
 * Design: Dark green gradient with futuristic data visualization
 */

export function PredictiveAnalyticsWidget() {
  const { data: forecasts, isLoading } = trpc.ceoDashboard.getForecasts.useQuery(
    undefined,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-amber-100 text-xl">
            🔮 Analyzing trends...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecasts) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-amber-100 text-xl font-bold flex items-center space-x-2">
          <Target className="w-6 h-6 text-purple-400" />
          <span>🔮 Predictive Analytics</span>
        </CardTitle>
        <p className="text-amber-100/70 text-sm mt-2">
          AI-powered forecasts for the next 30 days
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ForecastCard
          title="Revenue Forecast"
          current={forecasts.revenue.current}
          predicted={forecasts.revenue.predicted}
          confidence={forecasts.revenue.confidence}
          trend={forecasts.revenue.trend}
          unit="₾"
          emoji="💰"
        />
        <ForecastCard
          title="Occupancy Forecast"
          current={forecasts.occupancy.current}
          predicted={forecasts.occupancy.predicted}
          confidence={forecasts.occupancy.confidence}
          trend={forecasts.occupancy.trend}
          unit="%"
          emoji="🏠"
        />
      </CardContent>
    </Card>
  );
}

interface ForecastCardProps {
  title: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  emoji: string;
}

function ForecastCard({ title, current, predicted, confidence, trend, unit, emoji }: ForecastCardProps) {
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

  const change = predicted - current;
  const changePercent = current > 0 ? (change / current) * 100 : 0;

  const confidenceColor = confidence >= 80
    ? 'text-emerald-400'
    : confidence >= 60
    ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <div className="bg-emerald-950/40 rounded-lg p-4 border border-emerald-800/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-amber-100 font-semibold text-lg">{title}</h4>
        <span className="text-2xl">{emoji}</span>
      </div>

      {/* Current vs Predicted */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-emerald-950/50 rounded-md p-3">
          <div className="text-amber-100/60 text-xs mb-1">Current</div>
          <div className="text-amber-100 text-2xl font-bold">
            {unit === '₾' ? unit : ''}{current.toLocaleString()}{unit === '%' ? unit : ''}
          </div>
        </div>
        <div className="bg-purple-950/30 rounded-md p-3 border border-purple-800/30">
          <div className="text-purple-400 text-xs mb-1">Predicted (30d)</div>
          <div className="text-purple-300 text-2xl font-bold">
            {unit === '₾' ? unit : ''}{predicted.toLocaleString()}{unit === '%' ? unit : ''}
          </div>
        </div>
      </div>

      {/* Change */}
      <div className={`flex items-center space-x-2 mb-4 ${trendColor}`}>
        <TrendIcon className="w-5 h-5" />
        <span className="text-lg font-semibold">
          {change > 0 ? '+' : ''}{unit === '₾' ? unit : ''}{change.toFixed(unit === '%' ? 1 : 0)}{unit === '%' ? unit : ''}
        </span>
        <span className="text-amber-100/60 text-sm">
          ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
        </span>
      </div>

      {/* Confidence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-100/70">Confidence Level</span>
          <span className={`font-bold ${confidenceColor}`}>
            {confidence}%
          </span>
        </div>
        <div className="w-full bg-emerald-950/50 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              confidence >= 80
                ? 'bg-emerald-400'
                : confidence >= 60
                ? 'bg-yellow-400'
                : 'bg-red-400'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="text-xs text-amber-100/60 italic">
          {confidence >= 80 
            ? '✅ High confidence - reliable forecast' 
            : confidence >= 60 
            ? '⚠️ Medium confidence - use with caution' 
            : '❌ Low confidence - more data needed'}
        </div>
      </div>

      {/* Visualization (simple bar chart) */}
      <div className="mt-4 pt-4 border-t border-emerald-800/30">
        <div className="flex items-end justify-between h-24 space-x-2">
          {/* Simple 7-bar chart showing trend */}
          {[0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0].map((factor, i) => {
            const value = current + (predicted - current) * factor;
            const maxValue = Math.max(current, predicted);
            const height = (value / maxValue) * 100;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all ${
                    i === 6 ? 'bg-purple-400' : 'bg-emerald-600/40'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-amber-100/50 mt-2">
          <span>Now</span>
          <span>+30 days</span>
        </div>
      </div>
    </div>
  );
}
