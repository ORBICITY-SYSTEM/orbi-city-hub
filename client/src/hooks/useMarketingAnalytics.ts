/**
 * Marketing Analytics Hook - Supabase Integration
 * Replaces rows.com API for social media and reviews data
 *
 * Tables used:
 * - social_media_metrics
 * - guest_reviews / ota_reviews
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPES
// ============================================

export interface InstagramMetrics {
  followers: number;
  following: number;
  posts: number;
  engagement: {
    total: number;
    rate: number;
  };
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
  kpis: {
    avgLikes: number;
    avgComments: number;
    avgReach: number;
  };
}

export interface InstagramPost {
  id: string;
  type: string;
  caption: string;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  engagement: number;
  timestamp: string;
  theme?: string;
}

export interface FacebookMetrics {
  pageFollowers: number;
  pageLikes: number;
  reach: { organic: number; paid: number; total: number };
  engagement: { total: number; reactions: number; comments: number; shares: number };
  impressions: number;
  postCount: number;
  videoViews: number;
}

export interface FacebookPost {
  id: string;
  message: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  timestamp: string;
}

export interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  response?: string;
  responseDate?: string;
}

export interface ReviewsMetrics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  responseRate: number;
  recentTrend: "up" | "down" | "stable";
}

export interface UnifiedMarketingAnalytics {
  instagram: {
    metrics: InstagramMetrics;
    posts: InstagramPost[];
    topPosts: InstagramPost[];
    bestPostingTime: { day: string; hour: string };
  };
  facebook: {
    metrics: FacebookMetrics;
    posts: FacebookPost[];
    topPosts: FacebookPost[];
    demographics: { countries: Record<string, number>; ageGroups: Record<string, number> };
  };
  reviews: {
    metrics: ReviewsMetrics;
    reviews: GoogleReview[];
    recentReviews: GoogleReview[];
  };
  summary: {
    totalFollowers: number;
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    avgReviewRating: number;
  };
}

// ============================================
// DEFAULT DATA (zeros - no mock data!)
// ============================================

function getDefaultInstagramMetrics(): InstagramMetrics {
  return {
    followers: 0,
    following: 0,
    posts: 0,
    engagement: { total: 0, rate: 0 },
    reach: 0,
    impressions: 0,
    profileViews: 0,
    websiteClicks: 0,
    kpis: { avgLikes: 0, avgComments: 0, avgReach: 0 },
  };
}

function getDefaultFacebookMetrics(): FacebookMetrics {
  return {
    pageFollowers: 0,
    pageLikes: 0,
    reach: { organic: 0, paid: 0, total: 0 },
    engagement: { total: 0, reactions: 0, comments: 0, shares: 0 },
    impressions: 0,
    postCount: 0,
    videoViews: 0,
  };
}

function getDefaultReviewsMetrics(): ReviewsMetrics {
  return {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    responseRate: 0,
    recentTrend: "stable",
  };
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

async function fetchInstagramData(): Promise<{
  metrics: InstagramMetrics;
  posts: InstagramPost[];
  topPosts: InstagramPost[];
  bestPostingTime: { day: string; hour: string };
}> {
  // Try to get from social_media_metrics table
  // Using any type because this is a custom table
  const { data, error } = await (supabase as any)
    .from("social_media_metrics")
    .select("*")
    .eq("platform", "instagram")
    .maybeSingle();

  if (error || !data) {
    console.log("[Marketing] Instagram: Using default data");
    return {
      metrics: getDefaultInstagramMetrics(),
      posts: [],
      topPosts: [],
      bestPostingTime: { day: "Friday", hour: "15:00-18:00" },
    };
  }

  // Parse raw_data if available - NO MOCK DATA, only real values or zeros
  const rawData = data.raw_data as any || {};
  const followers = parseInt(data.followers || "0") || rawData.followers || 0;
  const following = parseInt(data.following || "0") || rawData.following || 0;
  const posts = parseInt(data.posts_count || "0") || rawData.posts || 0;
  const likes = parseInt(data.likes || "0") || rawData.likes || 0;

  const metrics: InstagramMetrics = {
    followers,
    following,
    posts,
    engagement: {
      total: likes,
      rate: rawData.engagement_rate || 0
    },
    reach: rawData.reach || 0,
    impressions: rawData.impressions || 0,
    profileViews: rawData.profile_views || 0,
    websiteClicks: rawData.website_clicks || 0,
    kpis: {
      avgLikes: rawData.avg_likes || 0,
      avgComments: rawData.avg_comments || 0,
      avgReach: rawData.avg_reach || 0,
    },
  };

  return {
    metrics,
    posts: rawData.posts_data || [],
    topPosts: rawData.top_posts || [],
    bestPostingTime: rawData.best_posting_time || { day: "Friday", hour: "15:00-18:00" },
  };
}

async function fetchFacebookData(): Promise<{
  metrics: FacebookMetrics;
  posts: FacebookPost[];
  topPosts: FacebookPost[];
  demographics: { countries: Record<string, number>; ageGroups: Record<string, number> };
}> {
  const { data, error } = await (supabase as any)
    .from("social_media_metrics")
    .select("*")
    .eq("platform", "facebook")
    .maybeSingle();

  if (error || !data) {
    console.log("[Marketing] Facebook: Using default data");
    return {
      metrics: getDefaultFacebookMetrics(),
      posts: [],
      topPosts: [],
      demographics: {
        countries: {},
        ageGroups: {},
      },
    };
  }

  // Parse raw_data - NO MOCK DATA, only real values or zeros
  const rawData = data.raw_data as any || {};
  const followers = parseInt(data.followers || "0") || rawData.followers || 0;
  const likes = parseInt(data.likes || "0") || rawData.likes || 0;

  const metrics: FacebookMetrics = {
    pageFollowers: followers,
    pageLikes: likes,
    reach: rawData.reach || { organic: 0, paid: 0, total: 0 },
    engagement: rawData.engagement || { total: 0, reactions: 0, comments: 0, shares: 0 },
    impressions: rawData.impressions || 0,
    postCount: parseInt(data.posts_count || "0") || rawData.post_count || 0,
    videoViews: rawData.video_views || 0,
  };

  return {
    metrics,
    posts: rawData.posts_data || [],
    topPosts: rawData.top_posts || [],
    demographics: rawData.demographics || {
      countries: {},
      ageGroups: {},
    },
  };
}

async function fetchReviewsData(): Promise<{
  metrics: ReviewsMetrics;
  reviews: GoogleReview[];
  recentReviews: GoogleReview[];
}> {
  // First try ota_reviews (for OTA channel reviews)
  const { data: otaReviews, error: otaError } = await (supabase as any)
    .from("ota_reviews")
    .select("*")
    .order("review_date", { ascending: false })
    .limit(50);

  // Also try guest_reviews
  const { data: guestReviews, error: guestError } = await (supabase as any)
    .from("guest_reviews")
    .select("*")
    .order("review_date", { ascending: false })
    .limit(50);

  const allReviews: GoogleReview[] = [];

  // Parse OTA reviews
  if (otaReviews && !otaError) {
    otaReviews.forEach((r: any) => {
      allReviews.push({
        id: r.id,
        author: r.guest_name || "Anonymous",
        rating: parseFloat(r.rating) || 5,
        text: r.positive_text || r.negative_text || "",
        date: r.review_date || "",
        response: r.response_text,
        responseDate: r.response_date,
      });
    });
  }

  // Parse guest reviews
  if (guestReviews && !guestError) {
    guestReviews.forEach((r: any) => {
      allReviews.push({
        id: r.id,
        author: r.guest_name || "Anonymous",
        rating: r.stars || 5,
        text: r.review_body || "",
        date: r.review_date || "",
        response: r.ai_generated_reply,
      });
    });
  }

  if (allReviews.length === 0) {
    console.log("[Marketing] Reviews: Using default data");
    return {
      metrics: getDefaultReviewsMetrics(),
      reviews: [],
      recentReviews: [],
    };
  }

  // Calculate metrics
  const total = allReviews.length;
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / total;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allReviews.forEach((r) => {
    const rating = Math.round(r.rating);
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  const withResponse = allReviews.filter((r) => r.response && r.response.length > 0);

  const metrics: ReviewsMetrics = {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: total,
    ratingDistribution: distribution,
    responseRate: total > 0 ? (withResponse.length / total) * 100 : 0,
    recentTrend: avgRating >= 4.5 ? "up" : avgRating >= 4.0 ? "stable" : "down",
  };

  return {
    metrics,
    reviews: allReviews,
    recentReviews: allReviews.slice(0, 10),
  };
}

async function fetchUnifiedMarketingAnalytics(): Promise<UnifiedMarketingAnalytics> {
  const [instagram, facebook, reviews] = await Promise.all([
    fetchInstagramData(),
    fetchFacebookData(),
    fetchReviewsData(),
  ]);

  const totalFollowers = instagram.metrics.followers + facebook.metrics.pageFollowers;
  const totalReach = instagram.metrics.reach + facebook.metrics.reach.total;
  const totalEngagement = instagram.metrics.engagement.total + facebook.metrics.engagement.total;
  const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

  return {
    instagram,
    facebook,
    reviews,
    summary: {
      totalFollowers,
      totalReach,
      totalEngagement,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
      avgReviewRating: reviews.metrics.averageRating,
    },
  };
}

// ============================================
// REACT QUERY HOOKS
// ============================================

export function useUnifiedMarketingAnalytics() {
  return useQuery({
    queryKey: ["marketing", "unified"],
    queryFn: fetchUnifiedMarketingAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useInstagramAnalytics() {
  return useQuery({
    queryKey: ["marketing", "instagram"],
    queryFn: fetchInstagramData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacebookAnalytics() {
  return useQuery({
    queryKey: ["marketing", "facebook"],
    queryFn: fetchFacebookData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoogleReviews() {
  return useQuery({
    queryKey: ["marketing", "reviews"],
    queryFn: fetchReviewsData,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// COMBINED SOCIAL MEDIA STATS (for SocialMedia.tsx)
// ============================================

export interface CombinedSocialStats {
  totalFollowers: number;
  totalReach: number;
  totalEngagement: number;
  totalPosts: number;
  platforms: {
    facebook: { followers: number; reach: number; engagement: number };
    instagram: { followers: number; reach: number; engagement: number };
    tiktok: { followers: number; views: number; engagement: number };
  };
}

async function fetchCombinedStats(): Promise<{ data: CombinedSocialStats }> {
  const { data: metrics } = await (supabase as any)
    .from("social_media_metrics")
    .select("*");

  const instagram = metrics?.find((m: any) => m.platform === "instagram");
  const facebook = metrics?.find((m: any) => m.platform === "facebook");
  const tiktok = metrics?.find((m: any) => m.platform === "tiktok");

  // NO MOCK DATA - only real values or zeros
  const igFollowers = parseInt(instagram?.followers || "0") || 0;
  const fbFollowers = parseInt(facebook?.followers || "0") || 0;
  const ttFollowers = parseInt(tiktok?.followers || "0") || 0;

  const igRawData = instagram?.raw_data as any || {};
  const fbRawData = facebook?.raw_data as any || {};
  const ttRawData = tiktok?.raw_data as any || {};

  return {
    data: {
      totalFollowers: igFollowers + fbFollowers + ttFollowers,
      totalReach: (igRawData.reach || 0) + (fbRawData.reach?.total || 0) + (ttRawData.reach || 0),
      totalEngagement: (igRawData.engagement?.total || 0) + (fbRawData.engagement?.total || 0) + (ttRawData.engagement?.total || 0),
      totalPosts: parseInt(instagram?.posts_count || "0") + parseInt(facebook?.posts_count || "0") + parseInt(tiktok?.posts_count || "0"),
      platforms: {
        facebook: { followers: fbFollowers, reach: fbRawData.reach?.total || 0, engagement: fbRawData.engagement?.total || 0 },
        instagram: { followers: igFollowers, reach: igRawData.reach || 0, engagement: igRawData.engagement?.total || 0 },
        tiktok: { followers: ttFollowers, views: ttRawData.video_views || 0, engagement: ttRawData.engagement?.total || 0 },
      },
    },
  };
}

export function useCombinedSocialStats() {
  return useQuery({
    queryKey: ["social", "combined"],
    queryFn: fetchCombinedStats,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// TIKTOK DATA
// ============================================

export interface TikTokInsights {
  followers: number;
  following: number;
  likes: number;
  videoViews: number;
  profileViews: number;
  engagement: { total: number; rate: number };
}

export interface TikTokVideo {
  id: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createTime: string;
}

async function fetchTikTokInsights(): Promise<TikTokInsights> {
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("*")
    .eq("platform", "tiktok")
    .maybeSingle();

  // NO MOCK DATA - only real values or zeros
  if (!data) {
    return {
      followers: 0,
      following: 0,
      likes: 0,
      videoViews: 0,
      profileViews: 0,
      engagement: { total: 0, rate: 0 },
    };
  }

  const rawData = data.raw_data as any || {};
  return {
    followers: parseInt(data.followers || "0") || 0,
    following: parseInt(data.following || "0") || 0,
    likes: parseInt(data.likes || "0") || 0,
    videoViews: rawData.video_views || 0,
    profileViews: rawData.profile_views || 0,
    engagement: rawData.engagement || { total: 0, rate: 0 },
  };
}

async function fetchTikTokVideos(limit: number = 12): Promise<TikTokVideo[]> {
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("raw_data")
    .eq("platform", "tiktok")
    .maybeSingle();

  const rawData = data?.raw_data as any;
  return rawData?.videos || [];
}

async function fetchTikTokTrendingSounds(): Promise<{ name: string; uses: number }[]> {
  // NO MOCK DATA - return empty until API integration
  return [];
}

export function useTikTokInsights() {
  return useQuery({
    queryKey: ["social", "tiktok", "insights"],
    queryFn: fetchTikTokInsights,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTikTokVideos(limit: number = 12) {
  return useQuery({
    queryKey: ["social", "tiktok", "videos", limit],
    queryFn: () => fetchTikTokVideos(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTikTokTrendingSounds() {
  return useQuery({
    queryKey: ["social", "tiktok", "sounds"],
    queryFn: fetchTikTokTrendingSounds,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// INSTAGRAM POSTS & AUDIENCE
// ============================================

async function fetchInstagramPosts(limit: number = 9): Promise<InstagramPost[]> {
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("raw_data")
    .eq("platform", "instagram")
    .maybeSingle();

  const rawData = data?.raw_data as any;
  return (rawData?.posts_data || []).slice(0, limit);
}

async function fetchInstagramAudience(): Promise<{
  countries: Record<string, number>;
  ageGroups: Record<string, number>;
  genderSplit: { male: number; female: number };
}> {
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("raw_data")
    .eq("platform", "instagram")
    .maybeSingle();

  // NO MOCK DATA - return empty or real data only
  const rawData = data?.raw_data as any;
  return rawData?.audience || {
    countries: {},
    ageGroups: {},
    genderSplit: { male: 0, female: 0 },
  };
}

export function useInstagramPosts(limit: number = 9) {
  return useQuery({
    queryKey: ["social", "instagram", "posts", limit],
    queryFn: () => fetchInstagramPosts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstagramAudience() {
  return useQuery({
    queryKey: ["social", "instagram", "audience"],
    queryFn: fetchInstagramAudience,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// FACEBOOK POSTS & AUDIENCE
// ============================================

async function fetchFacebookPosts(limit: number = 10): Promise<FacebookPost[]> {
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("raw_data")
    .eq("platform", "facebook")
    .maybeSingle();

  const rawData = data?.raw_data as any;
  return (rawData?.posts_data || []).slice(0, limit);
}

async function fetchFacebookAudience(): Promise<{
  countries: Record<string, number>;
  ageGroups: Record<string, number>;
}> {
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("raw_data")
    .eq("platform", "facebook")
    .maybeSingle();

  // NO MOCK DATA - return empty or real data only
  const rawData = data?.raw_data as any;
  return rawData?.demographics || {
    countries: {},
    ageGroups: {},
  };
}

export function useFacebookPosts(limit: number = 10) {
  return useQuery({
    queryKey: ["social", "facebook", "posts", limit],
    queryFn: () => fetchFacebookPosts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacebookAudience() {
  return useQuery({
    queryKey: ["social", "facebook", "audience"],
    queryFn: fetchFacebookAudience,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// GOOGLE ANALYTICS (Real-time & Historical)
// ============================================

export interface GoogleAnalyticsData {
  activeUsers: number;
  pageViews: number;
  pageviews: number; // alias
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { path: string; views: number; avgTime?: number }[];
  topCountries: { country: string; users: number }[];
  trafficSources: { source: string; sessions: number; percentage: number }[];
}

async function fetchGoogleAnalytics(): Promise<GoogleAnalyticsData> {
  // Try to get from Supabase if we have analytics data stored
  const { data } = await (supabase as any)
    .from("social_media_metrics")
    .select("raw_data")
    .eq("platform", "google_analytics")
    .maybeSingle();

  if (data?.raw_data) {
    return data.raw_data as GoogleAnalyticsData;
  }

  // NO MOCK DATA - return zeros until API integration
  return {
    activeUsers: 0,
    pageViews: 0,
    pageviews: 0,
    sessions: 0,
    users: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    topCountries: [],
    trafficSources: [],
  };
}

async function fetchRealTimeMetrics(): Promise<{
  activeUsers: number;
  pageViews: number;
  topPages: { path: string; active: number }[];
}> {
  // NO MOCK DATA - return zeros until GA4 real-time API integration
  return {
    activeUsers: 0,
    pageViews: 0,
    topPages: [],
  };
}

export function useGoogleAnalytics() {
  return useQuery({
    queryKey: ["analytics", "google"],
    queryFn: fetchGoogleAnalytics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRealTimeMetrics() {
  return useQuery({
    queryKey: ["analytics", "realtime"],
    queryFn: fetchRealTimeMetrics,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000,
  });
}

// ============================================
// GOOGLE BUSINESS / REVIEWS
// ============================================

export function useGoogleBusinessReviews(limit: number = 100) {
  return useQuery({
    queryKey: ["reviews", "google", limit],
    queryFn: async () => {
      const reviews = await fetchReviewsData();
      return {
        reviews: reviews.reviews.slice(0, limit),
        stats: reviews.metrics,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoogleBusinessStats() {
  return useQuery({
    queryKey: ["reviews", "stats"],
    queryFn: async () => {
      const data = await fetchReviewsData();
      return data.metrics;
    },
    staleTime: 5 * 60 * 1000,
  });
}
