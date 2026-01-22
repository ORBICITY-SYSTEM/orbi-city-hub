import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineData {
  value: number;
}

interface HeroKPICardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
  suffix?: string;
  gradient: string;
  sparklineData?: SparklineData[];
  trend?: number; // Percentage change
  trendLabel?: string;
  source?: string;
}

export const HeroKPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  isLoading, 
  suffix = "", 
  gradient,
  sparklineData,
  trend,
  trendLabel,
  source,
}: HeroKPICardProps) => {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-3 w-3" />;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground bg-muted/50";
    if (trend > 0) return "text-green-500 bg-green-500/20";
    return "text-red-500 bg-red-500/20";
  };

  return (
    <div className="kpi-card rounded-2xl p-6 group relative overflow-hidden bg-slate-800/50 border border-slate-700">
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`icon-3d w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white relative z-10" />
          </div>
          
          {/* Trend Badge */}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-muted/50" />
          ) : (
            <p className="text-4xl font-bold tracking-tight text-white">
              {value?.toLocaleString() || 0}
              {suffix && <span className="text-2xl text-cyan-400 ml-1">{suffix}</span>}
            </p>
          )}
        </div>

        {/* Title & Trend Label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider">
              {title}
            </p>
            {source && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {source}
              </span>
            )}
          </div>
          {trendLabel && (
            <p className="text-xs text-white/40">
              {trendLabel}
            </p>
          )}
        </div>

        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`sparkline-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(34, 211, 238)"
                  strokeWidth={2}
                  fill={`url(#sparkline-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
