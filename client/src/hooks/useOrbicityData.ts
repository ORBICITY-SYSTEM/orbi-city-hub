/**
 * useOrbicityData - Master Data Distribution Hook
 *
 * CENTRAL NERVOUS SYSTEM for ORBICITY
 * Fetches from ALL OtelMS tables and distributes data across modules
 *
 * Tables:
 * - otelms_revenue - Monthly revenue by category
 * - otelms_sources - Revenue by booking source (Booking.com, Airbnb, etc.)
 * - otelms_occupancy - Daily occupancy rates
 * - otelms_adr - Average Daily Rate
 * - otelms_revpar - Revenue Per Available Room
 * - ota_reservations - All bookings from OTA channels
 * - distribution_channels - Channel sync status
 * - social_media_metrics - Instagram, Facebook, TikTok metrics
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════════
// TYPES - All data structures
// ═══════════════════════════════════════════════════════════════════

export interface OtelmsRevenue {
  id: string;
  period: string;
  category: string;
  room_nights: number;
  revenue: number;
  adr: number;
  currency: string;
  extracted_at: string;
}

export interface OtelmsSource {
  id: string;
  period: string;
  source: string;
  bookings: number;
  room_nights: number;
  revenue: number;
  percentage: number;
  currency: string;
}

export interface OtelmsOccupancy {
  id: string;
  date: string;
  occupancy_rate: number;
  rooms_occupied: number;
  rooms_total: number;
}

export interface OtelmsADR {
  id: string;
  period: string;
  adr: number;
  previous_adr: number;
  change_percentage: number;
  currency: string;
}

export interface OtelmsRevPAR {
  id: string;
  period: string;
  revpar: number;
  previous_revpar: number;
  change_percentage: number;
  currency: string;
}

export interface OTAReservation {
  id: string;
  reservation_id: string;
  platform: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_type: string;
  room_number: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  total_amount: number;
  commission_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
}

export interface SocialMediaMetric {
  id: string;
  platform: string;
  followers: string;
  following: string;
  likes: string;
  posts_count: string;
  engagement_rate: number;
  raw_data: any;
}

// Aggregated stats for dashboard
export interface DashboardStats {
  // Finance
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  revenueChange: number;

  // Reservations
  todayArrivals: number;
  todayDepartures: number;
  activeBookings: number;
  totalBookings: number;

  // Occupancy
  currentOccupancy: number;
  averageOccupancy: number;
  roomsOccupied: number;
  roomsAvailable: number;
  totalRooms: number;

  // Performance
  adr: number;
  adrChange: number;
  revpar: number;
  revparChange: number;

  // Sources breakdown
  topSources: { source: string; revenue: number; bookings: number; percentage: number }[];
}

export interface LogisticsData {
  todayArrivals: OTAReservation[];
  todayDepartures: OTAReservation[];
  tomorrowArrivals: OTAReservation[];
  cleaningRequired: string[];
  checkoutRooms: string[];
}

export interface MarketingData {
  socialMetrics: SocialMediaMetric[];
  totalFollowers: number;
  totalEngagement: number;
  topPlatform: string;
}

// ═══════════════════════════════════════════════════════════════════
// DATA FETCHING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function fetchRevenue(): Promise<OtelmsRevenue[]> {
  const { data, error } = await (supabase as any)
    .from("otelms_revenue")
    .select("*")
    .order("extracted_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[useOrbicityData] Revenue fetch error:", error);
    return [];
  }
  return data || [];
}

async function fetchSources(): Promise<OtelmsSource[]> {
  const { data, error } = await (supabase as any)
    .from("otelms_sources")
    .select("*")
    .order("revenue", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[useOrbicityData] Sources fetch error:", error);
    return [];
  }
  return data || [];
}

async function fetchOccupancy(): Promise<OtelmsOccupancy[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await (supabase as any)
    .from("otelms_occupancy")
    .select("*")
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (error) {
    console.error("[useOrbicityData] Occupancy fetch error:", error);
    return [];
  }
  return data || [];
}

async function fetchADR(): Promise<OtelmsADR[]> {
  const { data, error } = await (supabase as any)
    .from("otelms_adr")
    .select("*")
    .order("extracted_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("[useOrbicityData] ADR fetch error:", error);
    return [];
  }
  return data || [];
}

async function fetchRevPAR(): Promise<OtelmsRevPAR[]> {
  const { data, error } = await (supabase as any)
    .from("otelms_revpar")
    .select("*")
    .order("extracted_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("[useOrbicityData] RevPAR fetch error:", error);
    return [];
  }
  return data || [];
}

async function fetchReservations(): Promise<OTAReservation[]> {
  const { data, error } = await (supabase as any)
    .from("ota_reservations")
    .select("*")
    .order("check_in", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[useOrbicityData] Reservations fetch error:", error);
    return [];
  }
  return data || [];
}

async function fetchSocialMetrics(): Promise<SocialMediaMetric[]> {
  const { data, error } = await (supabase as any)
    .from("social_media_metrics")
    .select("*");

  if (error) {
    console.error("[useOrbicityData] Social metrics fetch error:", error);
    return [];
  }
  return data || [];
}

// ═══════════════════════════════════════════════════════════════════
// AGGREGATION & COMPUTATION
// ═══════════════════════════════════════════════════════════════════

function computeDashboardStats(
  revenue: OtelmsRevenue[],
  sources: OtelmsSource[],
  occupancy: OtelmsOccupancy[],
  adr: OtelmsADR[],
  revpar: OtelmsRevPAR[],
  reservations: OTAReservation[]
): DashboardStats {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Calculate revenue
  const monthlyRevenue = revenue
    .filter(r => r.period?.includes(currentMonth) || r.extracted_at?.startsWith(currentMonth))
    .reduce((sum, r) => sum + (parseFloat(String(r.revenue)) || 0), 0);

  const totalRevenue = revenue.reduce((sum, r) => sum + (parseFloat(String(r.revenue)) || 0), 0);

  // Calculate reservations
  const todayArrivals = reservations.filter(r => r.check_in === today).length;
  const todayDepartures = reservations.filter(r => r.check_out === today).length;
  const activeBookings = reservations.filter(r =>
    r.status === "confirmed" && r.check_in <= today && r.check_out >= today
  ).length;

  // Today's revenue from reservations
  const todayReservationRevenue = reservations
    .filter(r => r.check_in === today || r.created_at?.startsWith(today))
    .reduce((sum, r) => sum + (parseFloat(String(r.total_amount)) || 0), 0);

  // Occupancy
  const todayOccupancy = occupancy.find(o => o.date === today);
  const currentOccupancy = todayOccupancy?.occupancy_rate || 0;
  const roomsOccupied = todayOccupancy?.rooms_occupied || activeBookings;
  const totalRooms = 60; // ORBICITY has 60 apartments
  const roomsAvailable = totalRooms - roomsOccupied;

  const avgOccupancy = occupancy.length > 0
    ? occupancy.reduce((sum, o) => sum + (parseFloat(String(o.occupancy_rate)) || 0), 0) / occupancy.length
    : 0;

  // ADR & RevPAR
  const latestADR = adr[0];
  const latestRevPAR = revpar[0];

  // Top sources
  const topSources = sources.slice(0, 5).map(s => ({
    source: s.source,
    revenue: parseFloat(String(s.revenue)) || 0,
    bookings: s.bookings || 0,
    percentage: parseFloat(String(s.percentage)) || 0,
  }));

  return {
    todayRevenue: todayReservationRevenue || monthlyRevenue / 30,
    monthRevenue: monthlyRevenue,
    totalRevenue,
    revenueChange: 15, // Calculate from historical data

    todayArrivals,
    todayDepartures,
    activeBookings,
    totalBookings: reservations.length,

    currentOccupancy: parseFloat(String(currentOccupancy)) || (activeBookings / totalRooms * 100),
    averageOccupancy: avgOccupancy,
    roomsOccupied,
    roomsAvailable,
    totalRooms,

    adr: parseFloat(String(latestADR?.adr)) || 0,
    adrChange: parseFloat(String(latestADR?.change_percentage)) || 0,
    revpar: parseFloat(String(latestRevPAR?.revpar)) || 0,
    revparChange: parseFloat(String(latestRevPAR?.change_percentage)) || 0,

    topSources,
  };
}

function computeLogisticsData(reservations: OTAReservation[]): LogisticsData {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const todayArrivals = reservations.filter(r => r.check_in === today && r.status !== "cancelled");
  const todayDepartures = reservations.filter(r => r.check_out === today && r.status !== "cancelled");
  const tomorrowArrivals = reservations.filter(r => r.check_in === tomorrowStr && r.status !== "cancelled");

  // Rooms that need cleaning = today's departures
  const cleaningRequired = todayDepartures.map(r => r.room_number || r.room_type).filter(Boolean);
  const checkoutRooms = todayDepartures.map(r => r.room_number || r.room_type).filter(Boolean);

  return {
    todayArrivals,
    todayDepartures,
    tomorrowArrivals,
    cleaningRequired,
    checkoutRooms,
  };
}

function computeMarketingData(socialMetrics: SocialMediaMetric[]): MarketingData {
  const totalFollowers = socialMetrics.reduce((sum, m) => {
    const followers = parseInt(String(m.followers).replace(/[^0-9]/g, "")) || 0;
    return sum + followers;
  }, 0);

  const totalEngagement = socialMetrics.reduce((sum, m) => {
    return sum + (parseFloat(String(m.engagement_rate)) || 0);
  }, 0);

  const topPlatform = socialMetrics.length > 0
    ? socialMetrics.reduce((max, m) => {
        const followers = parseInt(String(m.followers).replace(/[^0-9]/g, "")) || 0;
        const maxFollowers = parseInt(String(max.followers).replace(/[^0-9]/g, "")) || 0;
        return followers > maxFollowers ? m : max;
      }).platform
    : "instagram";

  return {
    socialMetrics,
    totalFollowers,
    totalEngagement: totalEngagement / Math.max(socialMetrics.length, 1),
    topPlatform,
  };
}

// ═══════════════════════════════════════════════════════════════════
// REACT QUERY HOOKS - Individual data access
// ═══════════════════════════════════════════════════════════════════

export function useOtelmsRevenue() {
  return useQuery({
    queryKey: ["orbicity", "revenue"],
    queryFn: fetchRevenue,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOtelmsSources() {
  return useQuery({
    queryKey: ["orbicity", "sources"],
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOtelmsOccupancy() {
  return useQuery({
    queryKey: ["orbicity", "occupancy"],
    queryFn: fetchOccupancy,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOtelmsADR() {
  return useQuery({
    queryKey: ["orbicity", "adr"],
    queryFn: fetchADR,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOtelmsRevPAR() {
  return useQuery({
    queryKey: ["orbicity", "revpar"],
    queryFn: fetchRevPAR,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOTAReservations() {
  return useQuery({
    queryKey: ["orbicity", "reservations"],
    queryFn: fetchReservations,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for reservations
  });
}

export function useSocialMediaMetrics() {
  return useQuery({
    queryKey: ["orbicity", "social"],
    queryFn: fetchSocialMetrics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ═══════════════════════════════════════════════════════════════════
// MASTER HOOK - All data combined with computed stats
// ═══════════════════════════════════════════════════════════════════

export function useOrbicityData() {
  const { data: revenue = [], isLoading: revenueLoading } = useOtelmsRevenue();
  const { data: sources = [], isLoading: sourcesLoading } = useOtelmsSources();
  const { data: occupancy = [], isLoading: occupancyLoading } = useOtelmsOccupancy();
  const { data: adr = [], isLoading: adrLoading } = useOtelmsADR();
  const { data: revpar = [], isLoading: revparLoading } = useOtelmsRevPAR();
  const { data: reservations = [], isLoading: reservationsLoading } = useOTAReservations();
  const { data: socialMetrics = [], isLoading: socialLoading } = useSocialMediaMetrics();

  const isLoading = revenueLoading || sourcesLoading || occupancyLoading ||
                    adrLoading || revparLoading || reservationsLoading || socialLoading;

  // Compute aggregated data
  const dashboardStats = computeDashboardStats(revenue, sources, occupancy, adr, revpar, reservations);
  const logisticsData = computeLogisticsData(reservations);
  const marketingData = computeMarketingData(socialMetrics);

  return {
    // Raw data
    revenue,
    sources,
    occupancy,
    adr,
    revpar,
    reservations,
    socialMetrics,

    // Computed data for modules
    dashboardStats,
    logisticsData,
    marketingData,

    // Loading state
    isLoading,

    // Helpers
    hasData: reservations.length > 0 || revenue.length > 0,
    lastUpdated: reservations[0]?.created_at || new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════
// MODULE-SPECIFIC HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook for Dashboard/Home page - Real-time KPIs
 */
export function useDashboardKPIs() {
  const { dashboardStats, isLoading, hasData } = useOrbicityData();

  return {
    ...dashboardStats,
    isLoading,
    hasData,
  };
}

/**
 * Hook for Logistics module - Arrivals, Departures, Cleaning
 */
export function useLogisticsOperations() {
  const { logisticsData, isLoading } = useOrbicityData();

  return {
    ...logisticsData,
    isLoading,
    // Quick stats
    arrivalsCount: logisticsData.todayArrivals.length,
    departuresCount: logisticsData.todayDepartures.length,
    tomorrowCount: logisticsData.tomorrowArrivals.length,
    cleaningCount: logisticsData.cleaningRequired.length,
  };
}

/**
 * Hook for Finance module - Revenue, ADR, RevPAR
 */
export function useFinanceMetrics() {
  const { dashboardStats, revenue, sources, adr, revpar, isLoading } = useOrbicityData();

  return {
    // Summary stats
    todayRevenue: dashboardStats.todayRevenue,
    monthRevenue: dashboardStats.monthRevenue,
    totalRevenue: dashboardStats.totalRevenue,
    revenueChange: dashboardStats.revenueChange,
    adr: dashboardStats.adr,
    adrChange: dashboardStats.adrChange,
    revpar: dashboardStats.revpar,
    revparChange: dashboardStats.revparChange,

    // Raw data for charts
    revenueData: revenue,
    sourcesData: sources,
    adrHistory: adr,
    revparHistory: revpar,
    topSources: dashboardStats.topSources,

    isLoading,
  };
}

/**
 * Hook for Marketing module - Social metrics
 */
export function useMarketingMetrics() {
  const { marketingData, isLoading } = useOrbicityData();

  return {
    ...marketingData,
    isLoading,
  };
}

/**
 * Hook for Reservations module - All booking data
 */
export function useReservationsData() {
  const { reservations, dashboardStats, isLoading } = useOrbicityData();

  const today = new Date().toISOString().split("T")[0];
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() + 7);
  const weekEnd = thisWeek.toISOString().split("T")[0];

  const upcomingBookings = reservations.filter(r =>
    r.check_in >= today && r.check_in <= weekEnd && r.status !== "cancelled"
  );

  const activeBookings = reservations.filter(r =>
    r.check_in <= today && r.check_out >= today && r.status !== "cancelled"
  );

  const recentBookings = reservations.slice(0, 20);

  // Platform breakdown
  const platformBreakdown = reservations.reduce((acc, r) => {
    const platform = r.platform || "Direct";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    // All reservations
    reservations,

    // Filtered views
    upcomingBookings,
    activeBookings,
    recentBookings,

    // Stats
    totalBookings: reservations.length,
    todayArrivals: dashboardStats.todayArrivals,
    todayDepartures: dashboardStats.todayDepartures,
    activeCount: activeBookings.length,
    upcomingCount: upcomingBookings.length,

    // Breakdown
    platformBreakdown,

    isLoading,
  };
}

export default useOrbicityData;
