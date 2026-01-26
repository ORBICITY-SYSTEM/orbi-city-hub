/**
 * OtelMS Data Hook - Supabase Integration
 * Replaces rows.com API for OtelMS/finance data
 *
 * Tables used:
 * - bookings
 * - ota_reservations
 * - otelms_revenue
 * - otelms_sources
 * - otelms_occupancy
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPES
// ============================================

export interface OtelmsBooking {
  bookingId: string;
  guestName: string;
  room: string;
  source: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  balance: number;
  status: string;
  extractedAt: string;
}

export interface DailyStatusItem {
  bookingId: string;
  room: string;
  column: string;
  text: string;
  extractedAt: string;
}

export interface RListBooking {
  room: string;
  guest: string;
  source: string;
  checkIn: string;
  nights: number;
  checkOut: string;
  amount: number;
  paid: number;
  balance: number;
  createdAt: string;
}

export interface ConnectionStatus {
  connected: boolean;
  spreadsheetId: string;
  tablesConfigured: string[];
  error?: string;
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  try {
    // Check if we can query bookings table
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (error) {
      return {
        connected: false,
        spreadsheetId: "",
        tablesConfigured: [],
        error: error.message,
      };
    }

    // Check available tables
    const tablesConfigured = [];

    const { error: otaError } = await (supabase as any)
      .from("ota_reservations")
      .select("*", { count: "exact", head: true });
    if (!otaError) tablesConfigured.push("ota_reservations");

    const { error: revenueError } = await (supabase as any)
      .from("otelms_revenue")
      .select("*", { count: "exact", head: true });
    if (!revenueError) tablesConfigured.push("otelms_revenue");

    const { error: sourcesError } = await (supabase as any)
      .from("otelms_sources")
      .select("*", { count: "exact", head: true });
    if (!sourcesError) tablesConfigured.push("otelms_sources");

    tablesConfigured.push("bookings");

    return {
      connected: true,
      spreadsheetId: "Supabase",
      tablesConfigured,
    };
  } catch (error) {
    return {
      connected: false,
      spreadsheetId: "",
      tablesConfigured: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function fetchCalendarBookings(): Promise<OtelmsBooking[]> {
  // First try ota_reservations
  const { data: otaData, error: otaError } = await (supabase as any)
    .from("ota_reservations")
    .select("*")
    .order("check_in", { ascending: false })
    .limit(100);

  if (otaData && !otaError && otaData.length > 0) {
    return otaData.map((r: any) => ({
      bookingId: r.reservation_id || r.id,
      guestName: r.guest_name || "Unknown",
      room: r.room_type || "-",
      source: r.platform || "Direct",
      checkIn: r.check_in || "",
      checkOut: r.check_out || "",
      amount: parseFloat(r.total_amount) || 0,
      balance: parseFloat(r.total_amount) - (parseFloat(r.commission_amount) || 0),
      status: r.status || "confirmed",
      extractedAt: r.extracted_at || r.created_at || "",
    }));
  }

  // Fallback to bookings table
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .order("checkin", { ascending: false })
    .limit(100);

  if (bookingsData && !bookingsError) {
    return bookingsData.map((r: any) => ({
      bookingId: r.confirmation_code || r.id,
      guestName: r.guest_name || "Unknown",
      room: r.room_number || "-",
      source: r.channel || "Direct",
      checkIn: r.checkin || "",
      checkOut: r.checkout || "",
      amount: parseFloat(r.amount) || 0,
      balance: 0,
      status: r.cancelled ? "cancelled" : "confirmed",
      extractedAt: r.created_at || "",
    }));
  }

  return [];
}

async function fetchTodayOperations(): Promise<{
  arrivals: DailyStatusItem[];
  departures: DailyStatusItem[];
}> {
  const today = new Date().toISOString().split("T")[0];

  // Try ota_reservations first
  const { data: arrivalsData } = await (supabase as any)
    .from("ota_reservations")
    .select("*")
    .eq("check_in", today);

  const { data: departuresData } = await (supabase as any)
    .from("ota_reservations")
    .select("*")
    .eq("check_out", today);

  const arrivals: DailyStatusItem[] = (arrivalsData || []).map((r: any) => ({
    bookingId: r.reservation_id || r.id,
    room: r.room_type || "-",
    column: "arrival",
    text: r.guest_name || "Guest",
    extractedAt: r.extracted_at || "",
  }));

  const departures: DailyStatusItem[] = (departuresData || []).map((r: any) => ({
    bookingId: r.reservation_id || r.id,
    room: r.room_type || "-",
    column: "departure",
    text: r.guest_name || "Guest",
    extractedAt: r.extracted_at || "",
  }));

  // Also check bookings table
  const { data: bookingArrivals } = await supabase
    .from("bookings")
    .select("*")
    .eq("checkin", today);

  const { data: bookingDepartures } = await supabase
    .from("bookings")
    .select("*")
    .eq("checkout", today);

  (bookingArrivals || []).forEach((r: any) => {
    arrivals.push({
      bookingId: r.confirmation_code || r.id,
      room: r.room_number || "-",
      column: "arrival",
      text: r.guest_name || "Guest",
      extractedAt: r.created_at || "",
    });
  });

  (bookingDepartures || []).forEach((r: any) => {
    departures.push({
      bookingId: r.confirmation_code || r.id,
      room: r.room_number || "-",
      column: "departure",
      text: r.guest_name || "Guest",
      extractedAt: r.created_at || "",
    });
  });

  return { arrivals, departures };
}

async function fetchRListBookings(
  sortType: "created" | "checkin" | "staydays" = "checkin"
): Promise<RListBooking[]> {
  const orderColumn =
    sortType === "created" ? "created_at" : sortType === "checkin" ? "check_in" : "check_in";

  // Try ota_reservations first
  const { data: otaData, error: otaError } = await (supabase as any)
    .from("ota_reservations")
    .select("*")
    .order(orderColumn, { ascending: false })
    .limit(100);

  if (otaData && !otaError && otaData.length > 0) {
    return otaData.map((r: any) => {
      const checkIn = new Date(r.check_in);
      const checkOut = new Date(r.check_out);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      return {
        room: r.room_type || "-",
        guest: r.guest_name || "Unknown",
        source: r.platform || "Direct",
        checkIn: r.check_in || "",
        nights: nights || 0,
        checkOut: r.check_out || "",
        amount: parseFloat(r.total_amount) || 0,
        paid: parseFloat(r.total_amount) - (parseFloat(r.commission_amount) || 0),
        balance: parseFloat(r.commission_amount) || 0,
        createdAt: r.created_at || "",
      };
    });
  }

  // Fallback to bookings table
  const bookingsOrderColumn =
    sortType === "created" ? "created_at" : sortType === "checkin" ? "checkin" : "checkin";

  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .order(bookingsOrderColumn, { ascending: false })
    .limit(100);

  if (bookingsData && !bookingsError) {
    return bookingsData.map((r: any) => ({
      room: r.room_number || "-",
      guest: r.guest_name || "Unknown",
      source: r.channel || "Direct",
      checkIn: r.checkin || "",
      nights: r.nights || 0,
      checkOut: r.checkout || "",
      amount: parseFloat(r.amount) || 0,
      paid: parseFloat(r.amount) || 0,
      balance: 0,
      createdAt: r.created_at || "",
    }));
  }

  return [];
}

// ============================================
// REACT QUERY HOOKS
// ============================================

export function useOtelmsConnection() {
  return useQuery({
    queryKey: ["otelms", "connection"],
    queryFn: checkSupabaseConnection,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCalendarBookings() {
  return useQuery({
    queryKey: ["otelms", "calendar"],
    queryFn: fetchCalendarBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTodayOperations() {
  return useQuery({
    queryKey: ["otelms", "today"],
    queryFn: fetchTodayOperations,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useRListBookings(sortType: "created" | "checkin" | "staydays" = "checkin") {
  return useQuery({
    queryKey: ["otelms", "rlist", sortType],
    queryFn: () => fetchRListBookings(sortType),
    staleTime: 2 * 60 * 1000,
  });
}
