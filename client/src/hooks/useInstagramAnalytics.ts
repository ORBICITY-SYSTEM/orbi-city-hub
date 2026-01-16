import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

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
      const from = dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined;
      const to = dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined;
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(
        `/api/rows/instagram-dashboard${params.toString() ? `?${params.toString()}` : ""}`,
        { credentials: "include" }
      );

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        const msg = text || "Non-JSON response from dashboard endpoint";
        setError(msg);
        setIsLoading(false);
        toast({
          title: "Rows error",
          description: msg,
          variant: "destructive",
        });
        return null;
      }

      if (!res.ok || json.error) {
        const msg = json?.error || `HTTP ${res.status}`;
        setError(msg);
        setIsLoading(false);
        toast({
          title: "Rows error",
          description: msg,
          variant: "destructive",
        });
        return null;
      }

      setData(json as InstagramData);
      setIsLoading(false);
      return json as InstagramData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "უცნობი შეცდომა";
      setError(errorMessage);
      setIsLoading(false);
      toast({
        title: "Rows fetch error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }, []);

  const syncFromRows = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/rows/instagram-dashboard?refresh=1", {
        credentials: "include",
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        const msg = text || "Non-JSON response from sync endpoint";
        toast({
          title: "Sync failed",
          description: msg,
          variant: "destructive",
        });
        return false;
      }
      if (!res.ok || json.error) {
        const msg = json?.error || `HTTP ${res.status}`;
        toast({
          title: "Sync failed",
          description: msg,
          variant: "destructive",
        });
        return false;
      }
      setData(json as InstagramData);
      return true;
    } catch (err) {
      console.error("Sync error:", err);
      toast({
        title: "Sync error",
        description: err instanceof Error ? err.message : "Unknown sync error",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/rows/instagram-dashboard", {
        credentials: "include",
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        const msg = text || "Non-JSON response from test endpoint";
        toast({
          title: "Connection test failed",
          description: msg,
          variant: "destructive",
        });
        return { success: false, message: msg };
      }
      if (!res.ok || json.error) {
        const msg = json?.error || `HTTP ${res.status}`;
        toast({
          title: "Connection test failed",
          description: msg,
          variant: "destructive",
        });
        return { success: false, message: msg };
      }
      toast({
        title: "Connection test successful",
        description: "Rows API reachable",
      });
      return { success: true, message: "Connection test successful" };
    } catch (err) {
      console.error("Test connection error:", err);
      return {
        success: false,
        message: err instanceof Error ? err.message : "Connection test failed",
      };
    }
  }, []);

  return { data, isLoading, error, fetchData, syncFromRows, testConnection, reset };
}
