import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export interface InstagramMetric {
  id: string;
  date: string;
  reach: number | null;
  accounts_engaged: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  follows: number | null;
  profile_links_taps: number | null;
  views: number | null;
  total_interactions: number | null;
}

export interface InstagramPost {
  id: string;
  post_url: string | null;
  post_date: string | null;
  created_time: string | null;
  caption: string | null;
  likes: number | null;
  reach: number | null;
  comments: number | null;
  saved: number | null;
  follows: number | null;
  media_type: string | null;
  watch_time_ms: number | null;
  theme: string | null;
  media_url: string | null;
}

export interface InstagramSummary {
  id: string;
  synced_at: string;
  time_frame: string | null;
  posts_count: number | null;
  total_reach: number | null;
  total_likes: number | null;
  total_comments: number | null;
  total_saved: number | null;
  total_follows: number | null;
  avg_reach_per_post: number | null;
  engagement_rate: number | null;
}

export interface InstagramWeeklyStats {
  id: string;
  week_starting: string;
  posts_count: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  saved: number | null;
  follows: number | null;
  avg_reach_per_post: number | null;
  engagement_rate: number | null;
}

export interface InstagramData {
  metrics: InstagramMetric[];
  posts: InstagramPost[];
  summary: InstagramSummary | null;
  weeklyStats: InstagramWeeklyStats[];
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface UseInstagramAnalyticsReturn {
  data: InstagramData | null;
  isLoading: boolean;
  error: string | null;
  fetchData: (dateRange?: DateRange) => Promise<InstagramData | null>;
  syncFromRows: () => Promise<boolean>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  reset: () => void;
}

export function useInstagramAnalytics(): UseInstagramAnalyticsReturn {
  const [data, setData] = useState<InstagramData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();
  const syncMutation = trpc.instagram.syncFromRows.useMutation();
  const testMutation = trpc.instagram.testConnection.useMutation();
  const dashboardQuery = trpc.instagram.getDashboard;

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async (dateRange?: DateRange): Promise<InstagramData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const from = dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined;
      const to = dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined;
      const input = from || to ? { from, to } : undefined;

      const result = await dashboardQuery.fetch(input);

      setData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "უცნობი შეცდომა";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [dashboardQuery, utils.instagram.getDashboard]);

  const syncFromRows = useCallback(async (): Promise<boolean> => {
    try {
      const result = await syncMutation.mutateAsync();
      return Boolean(result?.success);
    } catch (err) {
      console.error("Sync error:", err);
      return false;
    }
  }, [syncMutation]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await testMutation.mutateAsync();
      return {
        success: Boolean(result?.success),
        message: result?.message || "Connection test completed",
      };
    } catch (err) {
      console.error("Test connection error:", err);
      return {
        success: false,
        message: err instanceof Error ? err.message : "Connection test failed",
      };
    }
  }, [testMutation]);

  return { data, isLoading, error, fetchData, syncFromRows, testConnection, reset };
}
