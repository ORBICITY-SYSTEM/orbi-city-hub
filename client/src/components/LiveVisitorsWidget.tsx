import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, Eye } from "lucide-react";
import { useEffect } from "react";

/**
 * Live Visitors Widget
 * 
 * Displays real-time visitor statistics from Google Analytics 4
 * Auto-refreshes every 30 seconds to show current active users
 */
export function LiveVisitorsWidget() {
  const { data, isLoading, error, refetch } = trpc.googleAnalytics.getRealTimeMetrics.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Manual refresh on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

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
            Failed to load data. Please check GA4 configuration.
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
              {topPages.slice(0, 3).map((page, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 text-muted-foreground">{page.page}</span>
                  <span className="font-medium ml-2">{page.activeUsers}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Auto-refreshes every 30s
        </div>
      </CardContent>
    </Card>
  );
}
