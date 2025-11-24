import { and, between, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { bookings, transactions, channelPerformance } from "../drizzle/schema";

/**
 * CEO Dashboard Database Queries
 * Real-time data for KPIs, revenue, occupancy, and analytics
 */

/**
 * Get total revenue for current month
 */
export async function getCurrentMonthRevenue() {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "revenue"),
        between(transactions.transactionDate, startOfMonth, endOfMonth)
      )
    );

  return result[0]?.total ? Math.round(result[0].total / 100) : 0; // Convert from tetri to GEL
}

/**
 * Get previous month revenue for comparison
 */
export async function getPreviousMonthRevenue() {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "revenue"),
        between(transactions.transactionDate, startOfPrevMonth, endOfPrevMonth)
      )
    );

  return result[0]?.total ? Math.round(result[0].total / 100) : 0;
}

/**
 * Calculate occupancy rate for current month
 * Formula: (Total nights booked / Total available nights) * 100
 */
export async function getCurrentMonthOccupancy() {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get all bookings that overlap with current month
  const bookingsList = await db
    .select()
    .from(bookings)
    .where(
      and(
        lte(bookings.checkIn, endOfMonth),
        gte(bookings.checkOut, startOfMonth),
        sql`${bookings.status} IN ('confirmed', 'checked_in', 'checked_out')`
      )
    );

  // Calculate total nights booked
  let totalNightsBooked = 0;
  bookingsList.forEach((booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    
    // Adjust dates to month boundaries
    const effectiveCheckIn = checkIn < startOfMonth ? startOfMonth : checkIn;
    const effectiveCheckOut = checkOut > endOfMonth ? endOfMonth : checkOut;
    
    const nights = Math.ceil((effectiveCheckOut.getTime() - effectiveCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    totalNightsBooked += nights;
  });

  // Total available nights = 60 rooms * days in month
  const daysInMonth = endOfMonth.getDate();
  const totalAvailableNights = 60 * daysInMonth;

  const occupancyRate = totalAvailableNights > 0 ? (totalNightsBooked / totalAvailableNights) * 100 : 0;
  return Math.round(occupancyRate);
}

/**
 * Get previous month occupancy for comparison
 */
export async function getPreviousMonthOccupancy() {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const bookingsList = await db
    .select()
    .from(bookings)
    .where(
      and(
        lte(bookings.checkIn, endOfPrevMonth),
        gte(bookings.checkOut, startOfPrevMonth),
        sql`${bookings.status} IN ('confirmed', 'checked_in', 'checked_out')`
      )
    );

  let totalNightsBooked = 0;
  bookingsList.forEach((booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    
    const effectiveCheckIn = checkIn < startOfPrevMonth ? startOfPrevMonth : checkIn;
    const effectiveCheckOut = checkOut > endOfPrevMonth ? endOfPrevMonth : checkOut;
    
    const nights = Math.ceil((effectiveCheckOut.getTime() - effectiveCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    totalNightsBooked += nights;
  });

  const daysInPrevMonth = endOfPrevMonth.getDate();
  const totalAvailableNights = 60 * daysInPrevMonth;

  const occupancyRate = totalAvailableNights > 0 ? (totalNightsBooked / totalAvailableNights) * 100 : 0;
  return Math.round(occupancyRate);
}

/**
 * Get average rating from channel performance data
 */
export async function getAverageRating() {
  const db = await getDb();
  if (!db) return { current: 0, previous: 0 };

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  // Current month average
  const currentResult = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${channelPerformance.averageRating}), 0)`,
    })
    .from(channelPerformance)
    .where(eq(channelPerformance.month, currentMonth));

  // Previous month average
  const prevResult = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${channelPerformance.averageRating}), 0)`,
    })
    .from(channelPerformance)
    .where(eq(channelPerformance.month, prevMonth));

  return {
    current: currentResult[0]?.avgRating ? currentResult[0].avgRating / 10 : 0,
    previous: prevResult[0]?.avgRating ? prevResult[0].avgRating / 10 : 0,
  };
}

/**
 * Get revenue breakdown by channel for current month
 */
export async function getRevenueByChannel() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const channelData = await db
    .select()
    .from(channelPerformance)
    .where(eq(channelPerformance.month, currentMonth));

  const totalRevenue = channelData.reduce((sum, ch) => sum + (ch.revenue || 0), 0);

  return channelData.map((ch) => ({
    channel: ch.channel,
    revenue: Math.round((ch.revenue || 0) / 100), // Convert from tetri to GEL
    percentage: totalRevenue > 0 ? Math.round(((ch.revenue || 0) / totalRevenue) * 100) : 0,
  }));
}

/**
 * Get monthly overview statistics
 */
export async function getMonthlyOverview() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Current month bookings
  const currentBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.bookedAt, startOfMonth),
        lte(bookings.bookedAt, endOfMonth)
      )
    );

  // Previous month bookings
  const prevBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.bookedAt, startOfPrevMonth),
        lte(bookings.bookedAt, endOfPrevMonth)
      )
    );

  // Calculate average stay
  const totalNights = currentBookings.reduce((sum, b) => {
    const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  const avgStay = currentBookings.length > 0 ? totalNights / currentBookings.length : 0;

  const prevTotalNights = prevBookings.reduce((sum, b) => {
    const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  const prevAvgStay = prevBookings.length > 0 ? prevTotalNights / prevBookings.length : 0;

  // Calculate average price
  const totalPrice = currentBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const avgPrice = currentBookings.length > 0 ? totalPrice / currentBookings.length / 100 : 0;

  const prevTotalPrice = prevBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const prevAvgPrice = prevBookings.length > 0 ? prevTotalPrice / prevBookings.length / 100 : 0;

  // Calculate cancellation rate
  const cancelledCount = currentBookings.filter(b => b.status === 'cancelled').length;
  const cancellationRate = currentBookings.length > 0 ? (cancelledCount / currentBookings.length) * 100 : 0;

  const prevCancelledCount = prevBookings.filter(b => b.status === 'cancelled').length;
  const prevCancellationRate = prevBookings.length > 0 ? (prevCancelledCount / prevBookings.length) * 100 : 0;

  return {
    totalBookings: currentBookings.length,
    prevTotalBookings: prevBookings.length,
    avgStay: Math.round(avgStay * 10) / 10,
    prevAvgStay: Math.round(prevAvgStay * 10) / 10,
    avgPrice: Math.round(avgPrice),
    prevAvgPrice: Math.round(prevAvgPrice),
    cancellationRate: Math.round(cancellationRate * 10) / 10,
    prevCancellationRate: Math.round(prevCancellationRate * 10) / 10,
  };
}
