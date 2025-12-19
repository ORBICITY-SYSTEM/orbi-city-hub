import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Sparkles,
  XCircle,
  Timer
} from "lucide-react";

export function AIResponseMetricsWidget() {
  const { t } = useLanguage();
  const [days, setDays] = useState(30);
  
  const { data: metrics, isLoading, refetch } = trpc.butler.getAIResponseMetrics.useQuery({ days });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const approvalRateTrend = metrics?.dailyStats && metrics.dailyStats.length >= 2
    ? metrics.dailyStats[0].approvalRate - metrics.dailyStats[1].approvalRate
    : 0;

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 via-card to-purple-500/5 border-violet-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-violet-500" />
            {t("AI პასუხების მეტრიკები", "AI Response Metrics")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {t(`ბოლო ${days} დღე`, `Last ${days} days`)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AI Generation Time */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              {t("გენერაციის დრო", "Generation Time")}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-yellow-500">
                {metrics?.avgGenerationTime || 0}
              </span>
              <span className="text-sm text-muted-foreground">{t("წამი", "sec")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("საშუალო AI პასუხის დრო", "Avg AI response time")}
            </p>
          </div>

          {/* Manager Approval Rate */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t("დადასტურების %", "Approval Rate")}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-500">
                {metrics?.approvalRate || 0}%
              </span>
              {approvalRateTrend !== 0 && (
                <span className={`flex items-center text-xs ${approvalRateTrend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {approvalRateTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {approvalRateTrend > 0 ? '+' : ''}{approvalRateTrend}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("მენეჯერის დადასტურება", "Manager approval")}
            </p>
          </div>

          {/* Average Approval Time */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Timer className="h-4 w-4 text-blue-500" />
              {t("დადასტურების დრო", "Approval Time")}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-500">
                {metrics?.avgApprovalTime ? Math.round(metrics.avgApprovalTime / 60) : 0}
              </span>
              <span className="text-sm text-muted-foreground">{t("წუთი", "min")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("საშუალო დადასტურების დრო", "Avg time to approve")}
            </p>
          </div>

          {/* Total Responses */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <BarChart3 className="h-4 w-4 text-violet-500" />
              {t("სულ პასუხები", "Total Responses")}
            </div>
            <div className="text-2xl font-bold text-violet-500">
              {metrics?.totalResponses || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("AI-ს მიერ გენერირებული", "AI generated")}
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {t("დადასტურებული", "Approved")}: <span className="font-medium text-foreground">{metrics?.approvedCount || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-sm text-muted-foreground">
              {t("მოლოდინში", "Pending")}: <span className="font-medium text-foreground">{metrics?.pendingCount || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">
              {t("უარყოფილი", "Rejected")}: <span className="font-medium text-foreground">{metrics?.rejectedCount || 0}</span>
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        {(metrics?.totalResponses || 0) > 0 && (
          <div className="space-y-2">
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div 
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${((metrics?.approvedCount || 0) / (metrics?.totalResponses || 1)) * 100}%` }}
              />
              <div 
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${((metrics?.pendingCount || 0) / (metrics?.totalResponses || 1)) * 100}%` }}
              />
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${((metrics?.rejectedCount || 0) / (metrics?.totalResponses || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs text-muted-foreground">{t("გაგზავნილი N8N-ში", "Sent to N8N")}</p>
            <p className="font-semibold text-emerald-500">{metrics?.approvedCount || 0}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <Clock className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-xs text-muted-foreground">{t("ელოდება დადასტურებას", "Awaiting Approval")}</p>
            <p className="font-semibold text-amber-500">{metrics?.pendingCount || 0}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <XCircle className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-xs text-muted-foreground">{t("უარყოფილი", "Rejected")}</p>
            <p className="font-semibold text-red-500">{metrics?.rejectedCount || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
