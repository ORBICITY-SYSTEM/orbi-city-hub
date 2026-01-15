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

const SAFE_MODE = true;

const SAMPLE_DATA: InstagramData = {
  metrics: [
    {
      id: "m1",
      date: "2026-01-07",
      reach: 9500,
      accounts_engaged: 1800,
      likes: 700,
      comments: 120,
      shares: 85,
      follows: 40,
      profile_links_taps: 55,
      views: 12000,
      total_interactions: 945,
    },
    {
      id: "m2",
      date: "2026-01-06",
      reach: 8200,
      accounts_engaged: 1500,
      likes: 620,
      comments: 90,
      shares: 60,
      follows: 32,
      profile_links_taps: 48,
      views: 10500,
      total_interactions: 802,
    },
    {
      id: "m3",
      date: "2026-01-05",
      reach: 6875,
      accounts_engaged: 1300,
      likes: 540,
      comments: 75,
      shares: 45,
      follows: 28,
      profile_links_taps: 42,
      views: 9800,
      total_interactions: 688,
    },
  ],
  posts: [
    {
      id: "p1",
      post_url: "https://instagram.com/p/demo1",
      post_date: "2026-01-06",
      created_time: "2026-01-06T10:00:00Z",
      caption: "ვიზუალური ალბომი — ახალი წელი ბათუმში",
      likes: 180,
      reach: 5200,
      comments: 36,
      saved: 22,
      follows: 12,
      media_type: "IMAGE",
      watch_time_ms: null,
      theme: "Holiday",
      media_url: null,
    },
    {
      id: "p2",
      post_url: "https://instagram.com/p/demo2",
      post_date: "2026-01-05",
      created_time: "2026-01-05T15:30:00Z",
      caption: "ვიდეო რიცხვებით — საუკეთესო მომენტები",
      likes: 165,
      reach: 4300,
      comments: 28,
      saved: 19,
      follows: 10,
      media_type: "VIDEO",
      watch_time_ms: 320000,
      theme: "Highlights",
      media_url: null,
    },
  ],
  summary: {
    id: "s1",
    synced_at: "2026-01-07T12:00:00Z",
    time_frame: "all_time",
    posts_count: 2,
    total_reach: 24575,
    total_likes: 345,
    total_comments: 75,
    total_saved: 41,
    total_follows: 75,
    avg_reach_per_post: 5120,
    engagement_rate: 4.8,
  },
  weeklyStats: [
    {
      id: "w1",
      week_starting: "2025-12-29",
      posts_count: 3,
      reach: 15000,
      likes: 520,
      comments: 90,
      saved: 48,
      follows: 30,
      avg_reach_per_post: 5000,
      engagement_rate: 5.2,
    },
    {
      id: "w2",
      week_starting: "2025-12-22",
      posts_count: 2,
      reach: 9575,
      likes: 345,
      comments: 60,
      saved: 32,
      follows: 20,
      avg_reach_per_post: 4788,
      engagement_rate: 4.5,
    },
  ],
};

export function useInstagramAnalytics(): UseInstagramAnalyticsReturn {
  const [data, setData] = useState<InstagramData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();
  const syncMutation = trpc.instagram.syncFromRows.useMutation();
  const testMutation = trpc.instagram.testConnection.useMutation();

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async (dateRange?: DateRange): Promise<InstagramData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (SAFE_MODE) {
        setData(SAMPLE_DATA);
        setIsLoading(false);
        return SAMPLE_DATA;
      }

      const from = dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined;
      const to = dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined;
      const input = from || to ? { from, to } : undefined;

      const result = await utils.instagram.getDashboard.fetch(input);

      setData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "უცნობი შეცდომა";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [utils.instagram.getDashboard]);

  const syncFromRows = useCallback(async (): Promise<boolean> => {
    try {
      if (SAFE_MODE) return true;
      const result = await syncMutation.mutateAsync();
      return Boolean(result?.success);
    } catch (err) {
      console.error("Sync error:", err);
      return false;
    }
  }, [syncMutation]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (SAFE_MODE) return { success: true, message: "Safe mode enabled" };
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
