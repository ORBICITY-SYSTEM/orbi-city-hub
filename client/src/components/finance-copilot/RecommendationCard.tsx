import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ClipboardList, X, TrendingUp, DollarSign, PiggyBank, Zap } from "lucide-react";

export type RecommendationType = "pricing" | "expense" | "revenue" | "efficiency" | string;

export type RecommendationItem = {
  id: number;
  type: RecommendationType;
  title: string;
  titleGe?: string | null;
  description: string | null;
  descriptionGe?: string | null;
  estimatedImpact: string | null;
  priority: number | null;
  status: string;
};

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  language?: "ka" | "en";
  onAccept?: (id: number) => void;
  onCreateTask?: (id: number) => void;
  onDismiss?: (id: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  language = "ka",
  onAccept,
  onCreateTask,
  onDismiss,
  isLoading = false,
  className
}: RecommendationCardProps) {
  const getTypeIcon = (type: RecommendationType) => {
    switch (type) {
      case "pricing":
        return <DollarSign className="h-4 w-4" />;
      case "expense":
        return <PiggyBank className="h-4 w-4" />;
      case "revenue":
        return <TrendingUp className="h-4 w-4" />;
      case "efficiency":
        return <Zap className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: RecommendationType) => {
    switch (type) {
      case "pricing":
        return "text-purple-400 bg-purple-500/20";
      case "expense":
        return "text-red-400 bg-red-500/20";
      case "revenue":
        return "text-emerald-400 bg-emerald-500/20";
      case "efficiency":
        return "text-amber-400 bg-amber-500/20";
      default:
        return "text-blue-400 bg-blue-500/20";
    }
  };

  const title = language === "ka" && recommendation.titleGe
    ? recommendation.titleGe
    : recommendation.title;

  const description = language === "ka" && recommendation.descriptionGe
    ? recommendation.descriptionGe
    : recommendation.description;

  return (
    <div
      className={cn(
        "bg-slate-800/50 border border-slate-700/50 rounded-lg p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded", getTypeColor(recommendation.type))}>
            {getTypeIcon(recommendation.type)}
          </div>
          <h4 className="font-medium text-white">{title}</h4>
        </div>
        {recommendation.priority && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  i < recommendation.priority! ? "bg-emerald-400" : "bg-slate-600"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-slate-300 mb-3">{description}</p>
      )}

      {recommendation.estimatedImpact && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-400">
            {language === "ka" ? "პოტენციური გავლენა:" : "Potential impact:"} {recommendation.estimatedImpact}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {onAccept && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
            onClick={() => onAccept(recommendation.id)}
            disabled={isLoading}
          >
            <Check className="h-3 w-3 mr-1" />
            {language === "ka" ? "მიღება" : "Accept"}
          </Button>
        )}
        {onCreateTask && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
            onClick={() => onCreateTask(recommendation.id)}
            disabled={isLoading}
          >
            <ClipboardList className="h-3 w-3 mr-1" />
            {language === "ka" ? "დავალება" : "Task"}
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={() => onDismiss(recommendation.id)}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
