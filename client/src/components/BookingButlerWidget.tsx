/**
 * Booking.com Butler Widget
 * 
 * Displays on Marketing → OTA Channels page.
 * Shows Butler status, pending tasks, and quick actions.
 */

import { Bot, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function BookingButlerWidget() {
  const [, setLocation] = useLocation();
  
  const { data: pendingTasks, isLoading: tasksLoading } = trpc.butler.getPendingTasks.useQuery();
  const { data: metrics, isLoading: metricsLoading } = trpc.butler.getMetrics.useQuery({ days: 30 });
  const { data: stats, isLoading: statsLoading } = trpc.butler.getStats.useQuery({ days: 30 });
  const { data: recommendations, isLoading: recsLoading } = trpc.butler.getRecommendations.useQuery();

  const isLoading = tasksLoading || metricsLoading || statsLoading || recsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Booking.com Butler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const latestMetrics = metrics?.latest;
  const trends = metrics?.trends;

  return (
    <Card className="border-2 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Booking.com Butler</CardTitle>
              <CardDescription>AI-powered automation assistant</CardDescription>
            </div>
          </div>
          <Badge variant="default" className="bg-green-600">
            <div className="h-2 w-2 rounded-full bg-white mr-1 animate-pulse" />
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Occupancy</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{latestMetrics?.occupancy_rate?.toFixed(1) || 0}%</p>
              {trends && trends.occupancyChange !== 0 && (
                <div className={`flex items-center text-xs ${trends.occupancyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.occupancyChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trends.occupancyChange).toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Review Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{latestMetrics?.review_score?.toFixed(1) || 0}</p>
              {trends && trends.reviewScoreChange !== 0 && (
                <div className={`flex items-center text-xs ${trends.reviewScoreChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.reviewScoreChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trends.reviewScoreChange).toFixed(1)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Revenue (30d)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">₾{(latestMetrics?.total_revenue || 0).toLocaleString()}</p>
              {trends && trends.revenueChange !== 0 && (
                <div className={`flex items-center text-xs ${trends.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.revenueChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  ₾{Math.abs(trends.revenueChange).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        {pendingTasks && pendingTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Pending Approvals
              </h4>
              <Badge variant="secondary">{pendingTasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.description?.substring(0, 50)}...</p>
                  </div>
                  <Badge 
                    variant={task.priority === 'urgent' || task.priority === 'high' ? 'destructive' : 'secondary'}
                    className="ml-2"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations && (recommendations.recommendations.length > 0 || recommendations.alerts.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.alerts.slice(0, 2).map((alert, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">{alert.title}</p>
                    <p className="text-xs text-red-700 dark:text-red-300">{alert.description}</p>
                  </div>
                </div>
              ))}
              {recommendations.recommendations.slice(0, 2).map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{rec.title}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">{rec.description}</p>
                    {rec.estimatedImpact && (
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mt-1">
                        💰 {rec.estimatedImpact}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Butler Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tasks Completed (30d)</p>
              <p className="text-lg font-bold">{stats.completed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Time Saved</p>
              <p className="text-lg font-bold">{stats.timeSaved.toFixed(1)}h</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setLocation('/reservations/automations')}
            className="flex-1"
            variant="default"
          >
            View All Tasks
          </Button>
          <Button 
            onClick={() => setLocation('/reservations/automations')}
            variant="outline"
            className="flex-1"
          >
            Butler Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
