/**
 * useDistributionChannels - Supabase hook for distribution channels
 * Fetches channel data from distribution_channels table
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DistributionChannel {
  id: string;
  channel_id: string;
  name: string;
  name_ka: string | null;
  category: "ota" | "social" | "website" | "pms";
  logo_code: string | null;
  brand_color: string | null;
  listing_url: string | null;
  extranet_url: string | null;
  status: "active" | "coming_soon" | "paused" | "disconnected";
  api_status: "healthy" | "degraded" | "down" | "unknown";
  last_sync_at: string | null;
  sync_interval_minutes: number;
  bookings_today: number;
  bookings_month: number;
  revenue_today: number;
  revenue_month: number;
  has_credentials: boolean;
  credentials_note: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Transform Supabase data to component format
export interface ChannelForUI {
  id: string;
  name: string;
  nameKa: string;
  category: "ota" | "social" | "pms" | "website" | "coming_soon";
  logo: string;
  color: string;
  status: "connected" | "warning" | "error" | "syncing" | "coming_soon";
  lastSync: string;
  nextSync: string;
  syncProgress?: number;
  bookingsToday: number;
  revenue24h: number;
  listingUrl: string;
  extranetUrl: string;
  apiStatus: "healthy" | "degraded" | "down" | "unknown";
}

// Color mapping from brand_color hex to Tailwind class
const getColorClass = (brandColor: string | null, logoCode: string | null): string => {
  const colorMap: Record<string, string> = {
    "#003580": "bg-blue-700",      // Booking.com
    "#FF5A5F": "bg-pink-500",      // Airbnb
    "#5392F9": "bg-blue-500",      // Agoda
    "#FFCC00": "bg-yellow-500",    // Expedia
    "#34E0A1": "bg-emerald-500",   // TripAdvisor
    "#FF6B00": "bg-orange-500",    // Ostrovok
    "#FF4444": "bg-red-500",       // Sutochno
    "#2E7D32": "bg-green-700",     // Bronevik
    "#6A1B9A": "bg-purple-700",    // Tvil
    "#F15B2A": "bg-orange-600",    // Hostelworld
    "#00BCD4": "bg-cyan-500",      // OtelMS
    "#1877F2": "bg-blue-600",      // Facebook
    "#E4405F": "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400", // Instagram
    "#000000": "bg-black",         // TikTok
    "#FF0000": "bg-red-600",       // YouTube
    "#10B981": "bg-emerald-500",   // Website
    "#FC3F1D": "bg-red-500",       // Yandex
    "#C4161C": "bg-red-700",       // HRS
    "#2577E3": "bg-blue-600",      // Trip.com
    "#00897B": "bg-teal-600",      // Cbooking
  };

  if (brandColor && colorMap[brandColor]) {
    return colorMap[brandColor];
  }

  // Fallback based on logo code
  const logoFallback: Record<string, string> = {
    "B": "bg-blue-700",
    "A": "bg-pink-500",
    "AG": "bg-blue-500",
    "E": "bg-yellow-500",
    "TA": "bg-emerald-500",
    "OS": "bg-orange-500",
    "S": "bg-red-500",
    "BR": "bg-green-700",
    "TV": "bg-purple-700",
    "HW": "bg-orange-600",
    "O": "bg-cyan-500",
    "FB": "bg-blue-600",
    "IG": "bg-pink-600",
    "TT": "bg-black",
    "YT": "bg-red-600",
    "W": "bg-emerald-500",
    "Y": "bg-red-500",
    "HRS": "bg-red-700",
    "TR": "bg-blue-600",
    "CB": "bg-teal-600",
  };

  return logoFallback[logoCode || ""] || "bg-slate-600";
};

// Format last sync time
const formatLastSync = (lastSyncAt: string | null): string => {
  if (!lastSyncAt) return "—";

  const now = new Date();
  const syncTime = new Date(lastSyncAt);
  const diffMs = now.getTime() - syncTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return syncTime.toLocaleDateString();
};

// Format next sync time
const formatNextSync = (lastSyncAt: string | null, intervalMins: number): string => {
  if (!lastSyncAt || intervalMins <= 0) return "—";

  const syncTime = new Date(lastSyncAt);
  const nextSync = new Date(syncTime.getTime() + intervalMins * 60000);
  const now = new Date();
  const diffMs = nextSync.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins <= 0) return "now";
  if (diffMins < 60) return `in ${diffMins} min`;
  return `in ${Math.floor(diffMins / 60)} hr`;
};

// Map status from DB to UI
const mapStatus = (
  dbStatus: string,
  apiStatus: string
): "connected" | "warning" | "error" | "syncing" | "coming_soon" => {
  if (dbStatus === "coming_soon") return "coming_soon";
  if (dbStatus === "disconnected" || apiStatus === "down") return "error";
  if (dbStatus === "paused" || apiStatus === "degraded") return "warning";
  return "connected";
};

// Transform DB channel to UI format
const transformChannel = (channel: DistributionChannel): ChannelForUI => {
  return {
    id: channel.channel_id,
    name: channel.name,
    nameKa: channel.name_ka || channel.name,
    category: channel.status === "coming_soon" ? "coming_soon" : channel.category,
    logo: channel.logo_code || channel.channel_id.substring(0, 2).toUpperCase(),
    color: getColorClass(channel.brand_color, channel.logo_code),
    status: mapStatus(channel.status, channel.api_status),
    lastSync: formatLastSync(channel.last_sync_at),
    nextSync: formatNextSync(channel.last_sync_at, channel.sync_interval_minutes),
    bookingsToday: channel.bookings_today || 0,
    revenue24h: channel.revenue_today || 0,
    listingUrl: channel.listing_url || "",
    extranetUrl: channel.extranet_url || "",
    apiStatus: channel.api_status,
  };
};

export function useDistributionChannels() {
  const [channels, setChannels] = useState<ChannelForUI[]>([]);
  const [rawChannels, setRawChannels] = useState<DistributionChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("distribution_channels")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setRawChannels(data as DistributionChannel[]);
        setChannels(data.map(transformChannel));
      }
    } catch (err) {
      console.error("[useDistributionChannels] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch channels");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update channel status (for sync operations)
  const updateChannelStatus = useCallback(
    async (channelId: string, updates: Partial<DistributionChannel>) => {
      try {
        const { error: updateError } = await supabase
          .from("distribution_channels")
          .update({
            ...updates,
            last_sync_at: new Date().toISOString(),
          })
          .eq("channel_id", channelId);

        if (updateError) throw updateError;

        // Refresh channels after update
        await fetchChannels();
        return true;
      } catch (err) {
        console.error("[useDistributionChannels] Update error:", err);
        return false;
      }
    },
    [fetchChannels]
  );

  // Update bookings/revenue for a channel
  const updateChannelStats = useCallback(
    async (
      channelId: string,
      stats: { bookings_today?: number; revenue_today?: number }
    ) => {
      return updateChannelStatus(channelId, stats);
    },
    [updateChannelStatus]
  );

  // Initial fetch
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = supabase
      .channel("distribution_channels_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "distribution_channels" },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchChannels]);

  // Computed values
  const otaChannels = channels.filter((c) => c.category === "ota");
  const socialChannels = channels.filter((c) => c.category === "social");
  const pmsChannels = channels.filter((c) => c.category === "pms");
  const websiteChannels = channels.filter((c) => c.category === "website");
  const comingSoonChannels = channels.filter((c) => c.category === "coming_soon");
  const activeChannels = channels.filter((c) => c.category !== "coming_soon");
  const connectedCount = activeChannels.filter(
    (c) => c.status === "connected" || c.status === "syncing"
  ).length;
  const totalBookings = otaChannels.reduce((sum, c) => sum + c.bookingsToday, 0);
  const totalRevenue = otaChannels.reduce((sum, c) => sum + c.revenue24h, 0);

  return {
    // Data
    channels,
    rawChannels,
    otaChannels,
    socialChannels,
    pmsChannels,
    websiteChannels,
    comingSoonChannels,
    activeChannels,

    // Stats
    connectedCount,
    totalBookings,
    totalRevenue,

    // State
    isLoading,
    error,

    // Actions
    refetch: fetchChannels,
    updateChannelStatus,
    updateChannelStats,
    setChannels,
  };
}

export default useDistributionChannels;
