import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export type MetricItem = {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | string;
};

interface KeyMetricsGridProps {
  metrics: MetricItem[];
  className?: string;
}

export function KeyMetricsGrid({ metrics, className }: KeyMetricsGridProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
        >
          <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
          <p className="text-lg font-bold text-white">{metric.value}</p>
          <div className="flex items-center gap-1 mt-1">
            {metric.trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-400" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                metric.trend === "up" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {metric.change > 0 ? "+" : ""}{metric.change}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
