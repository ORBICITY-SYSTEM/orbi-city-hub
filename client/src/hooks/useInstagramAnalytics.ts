import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async (dateRange?: DateRange): Promise<InstagramData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use any type since tables aren't in generated types yet
      const client = supabase as any;

      // Build metrics query with date filter
      let metricsQuery = client
        .from('instagram_daily_metrics')
        .select('*')
        .order('date', { ascending: false });

      if (dateRange?.from) {
        metricsQuery = metricsQuery.gte('date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        metricsQuery = metricsQuery.lte('date', dateRange.to.toISOString().split('T')[0]);
      }

      // Build posts query with date filter
      let postsQuery = client
        .from('instagram_posts')
        .select('*')
        .order('post_date', { ascending: false });

      if (dateRange?.from) {
        postsQuery = postsQuery.gte('post_date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        postsQuery = postsQuery.lte('post_date', dateRange.to.toISOString().split('T')[0]);
      }

      // Get latest summary
      const summaryQuery = client
        .from('instagram_summary')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get weekly stats
      let weeklyQuery = client
        .from('instagram_weekly_stats')
        .select('*')
        .order('week_starting', { ascending: false });

      // Execute all queries in parallel
      const [metricsResult, postsResult, summaryResult, weeklyResult] = await Promise.all([
        metricsQuery,
        postsQuery,
        summaryQuery,
        weeklyQuery,
      ]);

      if (metricsResult.error) {
        console.error('Metrics fetch error:', metricsResult.error);
        throw new Error(metricsResult.error.message);
      }

      if (postsResult.error) {
        console.error('Posts fetch error:', postsResult.error);
        throw new Error(postsResult.error.message);
      }

      if (summaryResult.error) {
        console.error('Summary fetch error:', summaryResult.error);
        throw new Error(summaryResult.error.message);
      }

      if (weeklyResult.error) {
        console.error('Weekly stats fetch error:', weeklyResult.error);
        // Don't throw, just log - weekly stats might not exist yet
      }

      const result: InstagramData = {
        metrics: (metricsResult.data || []) as InstagramMetric[],
        posts: (postsResult.data || []) as InstagramPost[],
        summary: summaryResult.data as InstagramSummary | null,
        weeklyStats: (weeklyResult.data || []) as InstagramWeeklyStats[],
      };

      setData(result);
      setIsLoading(false);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'უცნობი შეცდომა';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

    // Trigger sync from Rows.com
    const syncFromRows = useCallback(async (): Promise<boolean> => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke(
          'dynamic-endpoint',
          { body: { action: 'sync' } }
        );

      if (invokeError) {
        console.error('Sync error:', invokeError);
        return false;
      }

      // Check for API-level errors in response
      if (data?.error) {
        console.error('Sync API error:', data.error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Sync error:', err);
      return false;
    }
  }, []);

    // Test Rows.com connection (1 lightweight request)
    const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke(
          'clever-endpoint'
        );

      if (invokeError) {
        const msg = invokeError.message || 'Edge function error';
        return { success: false, message: msg };
      }

      if (data?.error) {
        return { success: false, message: data.error };
      }

      return { 
        success: true, 
        message: data?.message || 'კავშირი წარმატებულია!' 
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'უცნობი შეცდომა';
      return { success: false, message: msg };
    }
  }, []);

  return { data, isLoading, error, fetchData, syncFromRows, testConnection, reset };
}
