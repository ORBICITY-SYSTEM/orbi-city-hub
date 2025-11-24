/**
 * Reservation Conflict Detection & Availability Logic
 * Used by AI Agent and Excel upload validation
 */

export interface Reservation {
  id?: number;
  roomNumber: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: "confirmed" | "pending" | "checked_out";
  price: number;
  source: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    newBooking: Reservation;
    existingBooking: Reservation;
    overlapDays: number;
  }>;
}

export interface AvailabilityQuery {
  startDate: Date;
  endDate: Date;
  roomNumber?: string; // Optional: check specific room
}

export interface AvailabilityResult {
  available: boolean;
  availableRooms: string[];
  occupiedRooms: string[];
  totalRooms: number;
  occupancyRate: number;
}

/**
 * Check if two date ranges overlap
 */
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Calculate overlap days between two date ranges
 */
export function calculateOverlapDays(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): number {
  if (!datesOverlap(start1, end1, start2, end2)) return 0;
  
  const overlapStart = start1 > start2 ? start1 : start2;
  const overlapEnd = end1 < end2 ? end1 : end2;
  
  const days = Math.ceil(
    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return days;
}

/**
 * Detect conflicts between new bookings and existing reservations
 */
export function detectConflicts(
  newBookings: Reservation[],
  existingReservations: Reservation[]
): ConflictResult {
  const conflicts: ConflictResult["conflicts"] = [];

  for (const newBooking of newBookings) {
    for (const existing of existingReservations) {
      // Only check same room
      if (newBooking.roomNumber !== existing.roomNumber) continue;
      
      // Skip if existing booking is checked out
      if (existing.status === "checked_out") continue;

      // Check for overlap
      if (
        datesOverlap(
          newBooking.checkIn,
          newBooking.checkOut,
          existing.checkIn,
          existing.checkOut
        )
      ) {
        const overlapDays = calculateOverlapDays(
          newBooking.checkIn,
          newBooking.checkOut,
          existing.checkIn,
          existing.checkOut
        );

        conflicts.push({
          newBooking,
          existingBooking: existing,
          overlapDays,
        });
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Check room availability for a date range
 */
export function checkAvailability(
  query: AvailabilityQuery,
  existingReservations: Reservation[],
  allRoomNumbers: string[] = Array.from({ length: 60 }, (_, i) => String(501 + i))
): AvailabilityResult {
  const { startDate, endDate, roomNumber } = query;

  // Filter to only active reservations (not checked out)
  const activeReservations = existingReservations.filter(
    r => r.status !== "checked_out"
  );

  // If specific room requested
  if (roomNumber) {
    const isOccupied = activeReservations.some(
      r =>
        r.roomNumber === roomNumber &&
        datesOverlap(startDate, endDate, r.checkIn, r.checkOut)
    );

    return {
      available: !isOccupied,
      availableRooms: isOccupied ? [] : [roomNumber],
      occupiedRooms: isOccupied ? [roomNumber] : [],
      totalRooms: 1,
      occupancyRate: isOccupied ? 100 : 0,
    };
  }

  // Check all rooms
  const occupiedRooms = new Set<string>();

  for (const reservation of activeReservations) {
    if (datesOverlap(startDate, endDate, reservation.checkIn, reservation.checkOut)) {
      occupiedRooms.add(reservation.roomNumber);
    }
  }

  const availableRooms = allRoomNumbers.filter(
    room => !occupiedRooms.has(room)
  );

  return {
    available: availableRooms.length > 0,
    availableRooms,
    occupiedRooms: Array.from(occupiedRooms),
    totalRooms: allRoomNumbers.length,
    occupancyRate: (occupiedRooms.size / allRoomNumbers.length) * 100,
  };
}

/**
 * Parse natural language date query (simple version)
 * Example: "10-15 Aug", "August 10-15", "10 Aug to 15 Aug"
 */
export function parseNaturalDateQuery(query: string): {
  startDate: Date | null;
  endDate: Date | null;
} {
  const currentYear = new Date().getFullYear();
  
  // Pattern: "10-15 Aug" or "Aug 10-15"
  const pattern1 = /(\d{1,2})-(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
  const match1 = query.match(pattern1);
  
  if (match1) {
    const [, day1, day2, month] = match1;
    const monthIndex = new Date(`${month} 1`).getMonth();
    
    return {
      startDate: new Date(currentYear, monthIndex, parseInt(day1)),
      endDate: new Date(currentYear, monthIndex, parseInt(day2)),
    };
  }

  // Pattern: "10 Aug to 15 Aug"
  const pattern2 = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+to\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
  const match2 = query.match(pattern2);
  
  if (match2) {
    const [, day1, month1, day2, month2] = match2;
    const monthIndex1 = new Date(`${month1} 1`).getMonth();
    const monthIndex2 = new Date(`${month2} 1`).getMonth();
    
    return {
      startDate: new Date(currentYear, monthIndex1, parseInt(day1)),
      endDate: new Date(currentYear, monthIndex2, parseInt(day2)),
    };
  }

  return { startDate: null, endDate: null };
}

/**
 * Generate human-readable conflict message
 */
export function formatConflictMessage(conflict: ConflictResult["conflicts"][0]): string {
  const { newBooking, existingBooking, overlapDays } = conflict;
  
  return (
    `⚠️ Conflict detected for Room ${newBooking.roomNumber}:\n` +
    `New booking: ${newBooking.guestName} (${formatDate(newBooking.checkIn)} - ${formatDate(newBooking.checkOut)})\n` +
    `Existing booking: ${existingBooking.guestName} (${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)})\n` +
    `Overlap: ${overlapDays} day(s)`
  );
}

/**
 * Format date as "MMM DD, YYYY"
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate availability summary for AI response
 */
export function formatAvailabilitySummary(result: AvailabilityResult, query: AvailabilityQuery): string {
  const { startDate, endDate } = query;
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  if (!result.available) {
    return (
      `❌ No rooms available for ${dateRange}.\n` +
      `All ${result.totalRooms} rooms are occupied (${result.occupancyRate.toFixed(1)}% occupancy).`
    );
  }

  if (result.availableRooms.length === result.totalRooms) {
    return `✅ All ${result.totalRooms} rooms are available for ${dateRange}!`;
  }

  return (
    `✅ ${result.availableRooms.length} room(s) available for ${dateRange}:\n` +
    `Available: ${result.availableRooms.slice(0, 10).join(", ")}${result.availableRooms.length > 10 ? "..." : ""}\n` +
    `Occupancy: ${result.occupancyRate.toFixed(1)}%`
  );
}
