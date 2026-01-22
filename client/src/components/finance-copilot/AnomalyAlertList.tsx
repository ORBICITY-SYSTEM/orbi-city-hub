import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AnomalyItem = {
  id?: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | string;
  value: string;
};

interface AnomalyAlertListProps {
  anomalies: AnomalyItem[];
  onDismiss?: (id: string) => void;
  className?: string;
  emptyMessage?: string;
}

export function AnomalyAlertList({
  anomalies,
  onDismiss,
  className,
  emptyMessage = "No anomalies detected"
}: AnomalyAlertListProps) {
  const getIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/30 bg-red-500/10";
      case "medium":
        return "border-amber-500/30 bg-amber-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  if (anomalies.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-slate-400 text-sm p-3 bg-slate-800/30 rounded-lg", className)}>
        <Info className="h-4 w-4 text-emerald-400" />
        <span>{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {anomalies.map((anomaly, index) => (
        <div
          key={anomaly.id || index}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            getSeverityStyles(anomaly.severity)
          )}
        >
          <div className="flex items-center gap-3">
            {getIcon(anomaly.severity)}
            <div>
              <p className="text-sm text-white">{anomaly.message}</p>
              <p className="text-xs text-slate-400">{anomaly.value}</p>
            </div>
          </div>
          {onDismiss && anomaly.id && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-white"
              onClick={() => onDismiss(anomaly.id!)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
