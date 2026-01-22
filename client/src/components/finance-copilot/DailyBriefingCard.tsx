import { cn } from "@/lib/utils";
import { Sun, Moon, CloudSun, RefreshCw } from "lucide-react";
import { KeyMetricsGrid, MetricItem } from "./KeyMetricsGrid";
import { AnomalyAlertList, AnomalyItem } from "./AnomalyAlertList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyBriefingCardProps {
  greeting: string;
  summary: string;
  keyMetrics: MetricItem[];
  anomalies: AnomalyItem[];
  dateInfo?: string;
  isLoading?: boolean;
  isCached?: boolean;
  onRefresh?: () => void;
  language?: "ka" | "en";
  className?: string;
}

export function DailyBriefingCard({
  greeting,
  summary,
  keyMetrics,
  anomalies,
  dateInfo,
  isLoading = false,
  isCached = false,
  onRefresh,
  language = "ka",
  className
}: DailyBriefingCardProps) {
  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return <Sun className="h-5 w-5 text-amber-400" />;
    } else if (hour >= 12 && hour < 18) {
      return <CloudSun className="h-5 w-5 text-orange-400" />;
    } else {
      return <Moon className="h-5 w-5 text-indigo-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with greeting */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            {getTimeIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{greeting}</h3>
            {dateInfo && (
              <p className="text-xs text-slate-400">{dateInfo}</p>
            )}
          </div>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
          {isCached && (
            <p className="text-xs text-slate-500 mt-2">
              {language === "ka" ? "კეშირებული" : "Cached"}
            </p>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2">
          {language === "ka" ? "ძირითადი მეტრიკები" : "Key Metrics"}
        </h4>
        <KeyMetricsGrid metrics={keyMetrics} />
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">
            {language === "ka" ? "ანომალიები" : "Anomalies"}
          </h4>
          <AnomalyAlertList
            anomalies={anomalies}
            emptyMessage={language === "ka" ? "ანომალიები არ არის" : "No anomalies"}
          />
        </div>
      )}
    </div>
  );
}
