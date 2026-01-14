import { eq, and, gte, lte, like, or, desc } from "drizzle-orm";
import { getDb } from "./db";
import { reservations, InsertReservation, Reservation } from "../drizzle/schema";

// Create reservation
export async function createReservation(data: InsertReservation): Promise<Reservation> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(reservations).values(data);
  const insertId = Number((result as any).insertId);

  const created = await db.select().from(reservations).where(eq(reservations.id, insertId)).limit(1);
  
  if (created.length === 0) {
    throw new Error("Failed to create reservation");
  }

  return created[0];
}

// Get all reservations with optional filters
export async function getAllReservations(filters?: {
  status?: string;
  channel?: string;
  checkInFrom?: Date;
  checkInTo?: Date;
  search?: string;
}): Promise<Reservation[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  let query = db.select().from(reservations);

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(reservations.status, filters.status as any));
  }

  if (filters?.channel) {
    conditions.push(eq(reservations.channel, filters.channel as any));
  }

  if (filters?.checkInFrom) {
    conditions.push(gte(reservations.checkIn, filters.checkInFrom));
  }

  if (filters?.checkInTo) {
    conditions.push(lte(reservations.checkIn, filters.checkInTo));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(reservations.guestName, `%${filters.search}%`),
        like(reservations.bookingId, `%${filters.search}%`),
        like(reservations.guestEmail, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query.orderBy(desc(reservations.checkIn));

  return result;
}

// Get reservation by ID
export async function getReservationById(id: number): Promise<Reservation | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Get reservation by booking ID
export async function getReservationByBookingId(bookingId: string): Promise<Reservation | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(reservations).where(eq(reservations.bookingId, bookingId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Update reservation
export async function updateReservation(id: number, data: Partial<InsertReservation>): Promise<Reservation | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(reservations).set(data).where(eq(reservations.id, id));

  return getReservationById(id);
}

// Delete reservation
export async function deleteReservation(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(reservations).where(eq(reservations.id, id));

  return true;
}

// Get upcoming check-ins (next 7 days)
export async function getUpcomingCheckIns(days: number = 7): Promise<Reservation[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const result = await db
    .select()
    .from(reservations)
    .where(
      and(
        gte(reservations.checkIn, today),
        lte(reservations.checkIn, futureDate),
        eq(reservations.status, "confirmed")
      )
    )
    .orderBy(reservations.checkIn);

  return result;
}

// Get current guests (checked-in)
export async function getCurrentGuests(): Promise<Reservation[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const today = new Date();

  const result = await db
    .select()
    .from(reservations)
    .where(
      and(
        lte(reservations.checkIn, today),
        gte(reservations.checkOut, today),
        or(
          eq(reservations.status, "confirmed"),
          eq(reservations.status, "checked-in")
        )
      )
    )
    .orderBy(reservations.checkOut);

  return result;
}

// Get reservations by date range
export async function getReservationsByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db
    .select()
    .from(reservations)
    .where(
      and(
        gte(reservations.checkIn, startDate),
        lte(reservations.checkOut, endDate)
      )
    )
    .orderBy(reservations.checkIn);

  return result;
}

// Get statistics
export async function getReservationStats(): Promise<{
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  currentGuests: number;
  upcomingCheckIns: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      currentGuests: 0,
      upcomingCheckIns: 0,
    };
  }

  const all = await db.select().from(reservations);
  
  const confirmed = all.filter(r => r.status === "confirmed").length;
  const pending = all.filter(r => r.status === "pending").length;
  const cancelled = all.filter(r => r.status === "cancelled").length;

  const currentGuests = await getCurrentGuests();
  const upcomingCheckIns = await getUpcomingCheckIns(7);

  return {
    total: all.length,
    confirmed,
    pending,
    cancelled,
    currentGuests: currentGuests.length,
    upcomingCheckIns: upcomingCheckIns.length,
  };
}
