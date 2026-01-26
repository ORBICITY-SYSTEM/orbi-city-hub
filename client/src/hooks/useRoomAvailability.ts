/**
 * Room Availability Hook - Supabase Integration
 * Fetches room type availability data for the OtelMS-style calendar
 *
 * Tables used:
 * - room_types (or falls back to hardcoded types)
 * - room_availability (date-based availability per room type)
 * - bookings (to calculate occupancy)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoomType {
  id: string;
  name: string;
  nameKa?: string;
  totalRooms: number;
}

export interface RoomAvailabilityData {
  roomTypes: RoomType[];
  availability: Record<string, Record<string, number>>; // roomTypeId -> date -> available
}

// Default room types matching OtelMS structure
const DEFAULT_ROOM_TYPES: RoomType[] = [
  { id: "suite-sea", name: "Suite with Sea view", nameKa: "სუიტა ზღვის ხედით", totalRooms: 15 },
  { id: "deluxe-sea", name: "Delux suite with sea view", nameKa: "დელუქს სუიტა ზღვის ხედით", totalRooms: 28 },
  { id: "superior-sea", name: "Superior Suite with Sea View", nameKa: "სუპერიორ სუიტა ზღვის ხედით", totalRooms: 5 },
  { id: "family", name: "Interconnected Family Room", nameKa: "ოჯახის ინტერკონექტ ოთახი", totalRooms: 3 },
  { id: "overbooking", name: "Overbooking", nameKa: "ზედმეტი ჯავშანი", totalRooms: 3 },
];

async function fetchRoomAvailability(
  startDate: Date,
  daysCount: number
): Promise<RoomAvailabilityData> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysCount);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Try to fetch room types from Supabase
  let roomTypes = DEFAULT_ROOM_TYPES;

  try {
    const { data: roomTypesData, error: roomTypesError } = await (supabase as any)
      .from("room_types")
      .select("*");

    if (roomTypesData && !roomTypesError && roomTypesData.length > 0) {
      roomTypes = roomTypesData.map((rt: any) => ({
        id: rt.id || rt.type_id,
        name: rt.name || rt.type_name,
        nameKa: rt.name_ka || rt.name_ge,
        totalRooms: rt.total_rooms || rt.count || 10,
      }));
    }
  } catch (e) {
    // Use default room types
  }

  // Try to fetch room availability from Supabase
  const availability: Record<string, Record<string, number>> = {};

  try {
    const { data: availData, error: availError } = await (supabase as any)
      .from("room_availability")
      .select("*")
      .gte("date", startStr)
      .lte("date", endStr);

    if (availData && !availError) {
      availData.forEach((row: any) => {
        const roomTypeId = row.room_type_id || row.room_type;
        const date = row.date;
        const available = row.available || row.available_rooms || 0;

        if (!availability[roomTypeId]) {
          availability[roomTypeId] = {};
        }
        availability[roomTypeId][date] = available;
      });
    }
  } catch (e) {
    // Will use fallback demo data
  }

  // If no availability data, try to calculate from bookings
  if (Object.keys(availability).length === 0) {
    try {
      // Get bookings in date range
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .or(`checkin.gte.${startStr},checkout.lte.${endStr}`);

      if (bookingsData && bookingsData.length > 0) {
        // Calculate availability from bookings
        roomTypes.forEach((roomType) => {
          availability[roomType.id] = {};

          // Generate dates
          const current = new Date(startDate);
          for (let i = 0; i < daysCount; i++) {
            const dateStr = current.toISOString().split("T")[0];

            // Count bookings for this room type on this date
            const bookedCount = bookingsData.filter((booking: any) => {
              const checkIn = booking.checkin || booking.check_in;
              const checkOut = booking.checkout || booking.check_out;
              return (
                checkIn <= dateStr &&
                checkOut > dateStr &&
                (booking.room_type === roomType.name ||
                  booking.unit_code?.includes(roomType.id))
              );
            }).length;

            availability[roomType.id][dateStr] = Math.max(
              0,
              roomType.totalRooms - bookedCount
            );
            current.setDate(current.getDate() + 1);
          }
        });
      }
    } catch (e) {
      // Fallback to demo data
    }
  }

  // Generate demo data if nothing found
  if (Object.keys(availability).length === 0) {
    roomTypes.forEach((roomType) => {
      availability[roomType.id] = {};
      const current = new Date(startDate);

      for (let i = 0; i < daysCount; i++) {
        const dateStr = current.toISOString().split("T")[0];
        const dayOfWeek = current.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Generate realistic availability
        const baseOccupancy = isWeekend ? 0.65 : 0.35;
        const monthFactor = current.getMonth() >= 5 && current.getMonth() <= 8 ? 0.2 : 0; // Higher in summer
        const variance = (Math.random() - 0.5) * 0.2;
        const occupancy = Math.min(0.95, Math.max(0, baseOccupancy + monthFactor + variance));
        const available = Math.round(roomType.totalRooms * (1 - occupancy));

        availability[roomType.id][dateStr] = available;
        current.setDate(current.getDate() + 1);
      }
    });
  }

  return {
    roomTypes,
    availability,
  };
}

export function useRoomAvailability(startDate: Date, daysCount: number = 21) {
  return useQuery({
    queryKey: ["room-availability", startDate.toISOString().split("T")[0], daysCount],
    queryFn: () => fetchRoomAvailability(startDate, daysCount),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to sync availability from OtelMS Python scraper
export function useSyncRoomAvailability() {
  return useQuery({
    queryKey: ["room-availability-sync-status"],
    queryFn: async () => {
      // Check when the last sync happened
      try {
        const { data, error } = await (supabase as any)
          .from("room_availability")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          return {
            lastSync: new Date(data[0].created_at),
            isStale: Date.now() - new Date(data[0].created_at).getTime() > 6 * 60 * 60 * 1000, // 6 hours
          };
        }
      } catch (e) {
        // Ignore
      }

      return {
        lastSync: null,
        isStale: true,
      };
    },
    staleTime: 60 * 1000,
  });
}
