/**
 * Live Visitors Widget - Supabase Integrated
 * Displays real-time visitor statistics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealTimeMetrics } from "@/hooks/useMarketingAnalytics";
import { Users, Eye } from "lucide-react";

export function LiveVisitorsWidget() {
  const { data, isLoading, error } = useRealTimeMetrics();

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Live Visitors
          </CardTitle>
          <CardDescription>Real-time website traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            Live Visitors
          </CardTitle>
          <CardDescription>Real-time website traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load data.
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeUsers = data?.activeUsers || 0;
  const pageViews = data?.pageViews || 0;
  const topPages = data?.topPages || [];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Live Visitors
        </CardTitle>
        <CardDescription>Real-time website traffic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Users */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Active Now</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
        </div>

        {/* Page Views */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Page Views</span>
          </div>
          <div className="text-xl font-semibold">{pageViews}</div>
        </div>

        {/* Top Pages */}
        {topPages.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">Top Pages</div>
            <div className="space-y-1">
              {topPages.slice(0, 3).map((page: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 text-muted-foreground">{page.path}</span>
                  <span className="font-medium ml-2">{page.active}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Auto-refreshes every 30s • Supabase
        </div>
      </CardContent>
    </Card>
  );
}
