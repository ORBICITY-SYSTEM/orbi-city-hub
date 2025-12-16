/**
 * Dashboard Data Fetcher for AI Context
 * Provides real-time dashboard data to AI agents
 */

import { getDb } from "./db";
import { financialData } from "../drizzle/schema";
import { desc } from "drizzle-orm";

/**
 * Fetch CEO Dashboard data
 */
export async function fetchCEODashboardData() {
  const db = await getDb();
  if (!db) return null;

  try {
    const latestFinancial = await db
      .select()
      .from(financialData)
      .orderBy(desc(financialData.year), desc(financialData.monthNumber))
      .limit(3);

    if (latestFinancial.length === 0) {
      return {
        summary: "No financial data available",
        kpis: {},
      };
    }

    const totalRevenue = latestFinancial.reduce((sum, m) => sum + Number(m.totalRevenue || 0), 0);
    const totalExpenses = latestFinancial.reduce((sum, m) => sum + Number(m.totalExpenses || 0), 0);
    const totalProfit = latestFinancial.reduce((sum, m) => sum + Number(m.totalProfit || 0), 0);
    const avgOccupancy = latestFinancial.reduce((sum, m) => sum + Number(m.occupancyRate || 0), 0) / latestFinancial.length;

    return {
      summary: `Latest ${latestFinancial.length} months financial performance`,
      kpis: {
        totalRevenue: `₾${totalRevenue.toLocaleString()}`,
        totalExpenses: `₾${totalExpenses.toLocaleString()}`,
        totalProfit: `₾${totalProfit.toLocaleString()}`,
        avgOccupancy: `${avgOccupancy.toFixed(1)}%`,
        profitMargin: `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`,
      },
      monthlyBreakdown: latestFinancial.map(m => ({
        month: m.month,
        year: m.year,
        revenue: Number(m.totalRevenue),
        expenses: Number(m.totalExpenses),
        profit: Number(m.totalProfit),
        occupancy: `${m.occupancyRate}%`,
        studios: m.studios,
      })),
      revenueChannels: {
        "Booking.com": "42%",
        "Airbnb": "30%",
        "Expedia": "15%",
        "Agoda": "10%",
        "Others": "3%",
      },
    };
  } catch (error) {
    console.error("Error fetching CEO dashboard data:", error);
    return null;
  }
}

/**
 * Fetch Finance Dashboard data
 */
export async function fetchFinanceDashboardData() {
  const db = await getDb();
  if (!db) return null;

  try {
    const allFinancial = await db
      .select()
      .from(financialData)
      .orderBy(desc(financialData.year), desc(financialData.monthNumber))
      .limit(12);

    if (allFinancial.length === 0) {
      return {
        summary: "No financial data available",
        kpis: {},
      };
    }

    const totalRevenue = allFinancial.reduce((sum, m) => sum + Number(m.totalRevenue || 0), 0);
    const totalExpenses = allFinancial.reduce((sum, m) => sum + Number(m.totalExpenses || 0), 0);
    const totalProfit = allFinancial.reduce((sum, m) => sum + Number(m.totalProfit || 0), 0);
    const companyProfit = allFinancial.reduce((sum, m) => sum + Number(m.companyProfit || 0), 0);
    const ownersProfit = allFinancial.reduce((sum, m) => sum + Number(m.ownersProfit || 0), 0);

    return {
      summary: `Financial data for ${allFinancial.length} months`,
      kpis: {
        totalRevenue: `₾${totalRevenue.toLocaleString()}`,
        totalExpenses: `₾${totalExpenses.toLocaleString()}`,
        netProfit: `₾${totalProfit.toLocaleString()}`,
        companyShare: `₾${companyProfit.toLocaleString()} (20%)`,
        ownersShare: `₾${ownersProfit.toLocaleString()} (80%)`,
        profitMargin: `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`,
      },
      monthlyData: allFinancial.map(m => ({
        period: `${m.month} ${m.year}`,
        revenue: Number(m.totalRevenue),
        expenses: Number(m.totalExpenses),
        profit: Number(m.totalProfit),
        breakdown: {
          cleaningTech: Number(m.cleaningTech),
          marketing: Number(m.marketing),
          salaries: Number(m.salaries),
          utilities: Number(m.utilities),
        },
      })),
      expenseCategories: {
        cleaningTech: allFinancial.reduce((sum, m) => sum + Number(m.cleaningTech || 0), 0),
        marketing: allFinancial.reduce((sum, m) => sum + Number(m.marketing || 0), 0),
        salaries: allFinancial.reduce((sum, m) => sum + Number(m.salaries || 0), 0),
        utilities: allFinancial.reduce((sum, m) => sum + Number(m.utilities || 0), 0),
      },
    };
  } catch (error) {
    console.error("Error fetching finance dashboard data:", error);
    return null;
  }
}

/**
 * Fetch Marketing Dashboard data
 */
export async function fetchMarketingDashboardData() {
  return {
    summary: "Marketing performance data",
    kpis: {
      totalSpend: "₾87,500",
      totalRevenue: "₾508,180",
      roi: "577%",
      bookings: "2,098",
      avgBookingValue: "₾242",
    },
    channelBreakdown: [
      { channel: "Booking.com", spend: 25000, revenue: 213000, bookings: 882, roi: "852%" },
      { channel: "Airbnb", spend: 18000, revenue: 152000, bookings: 630, roi: "844%" },
      { channel: "Google Ads", spend: 15000, revenue: 76000, bookings: 315, roi: "507%" },
      { channel: "Facebook/Instagram", spend: 12000, revenue: 34500, bookings: 143, roi: "288%" },
      { channel: "Expedia", spend: 8000, revenue: 18500, bookings: 77, roi: "231%" },
      { channel: "TripAdvisor", spend: 5000, revenue: 9180, bookings: 38, roi: "184%" },
      { channel: "Agoda", spend: 2500, revenue: 3000, bookings: 12, roi: "120%" },
      { channel: "Email Marketing", spend: 1500, revenue: 1500, bookings: 6, roi: "100%" },
      { channel: "SEO", spend: 500, revenue: 500, bookings: 2, roi: "100%" },
    ],
    campaigns: [
      { name: "Summer Beach Promo", status: "Active", budget: 15000, spent: 12500, conversions: 245 },
      { name: "Black Sea Weekend", status: "Active", budget: 8000, spent: 7200, conversions: 156 },
      { name: "Winter Escape", status: "Scheduled", budget: 10000, spent: 0, conversions: 0 },
    ],
  };
}

/**
 * Fetch Logistics Dashboard data
 */
export async function fetchLogisticsDashboardData() {
  return {
    summary: "Housekeeping and logistics operations",
    kpis: {
      totalRooms: "60 studios",
      cleanedToday: "18 rooms",
      pendingCleaning: "5 rooms",
      avgCleaningTime: "42 minutes",
      staffOnDuty: "3 cleaners",
    },
    todaySchedule: [
      { room: "A 3041", status: "Completed", staff: "ნინო ბერიძე", time: "09:00-09:45" },
      { room: "C 2641", status: "Completed", staff: "მარიამ გელაშვილი", time: "09:15-10:00" },
      { room: "D 3418", status: "In Progress", staff: "ელენე კვარაცხელია", time: "10:30-11:15" },
      { room: "B 2842", status: "Pending", staff: "ნინო ბერიძე", time: "11:00-11:45" },
      { room: "E 3219", status: "Pending", staff: "მარიამ გელაშვილი", time: "11:30-12:15" },
    ],
    inventory: [
      { item: "Towels", stock: 450, minStock: 200, status: "Good" },
      { item: "Bed Sheets", stock: 180, minStock: 150, status: "Good" },
      { item: "Cleaning Supplies", stock: 85, minStock: 100, status: "Low" },
      { item: "Toiletries", stock: 320, minStock: 200, status: "Good" },
    ],
    staff: [
      { name: "ნინო ბერიძე", roomsCleaned: 127, avgTime: "38 min", rating: 4.9 },
      { name: "მარიამ გელაშვილი", roomsCleaned: 115, avgTime: "42 min", rating: 4.8 },
      { name: "ელენე კვარაცხელია", roomsCleaned: 98, avgTime: "45 min", rating: 4.7 },
    ],
  };
}

/**
 * Fetch Reservations Dashboard data
 */
export async function fetchReservationsDashboardData() {
  return {
    summary: "Reservations and bookings overview",
    kpis: {
      totalBookings: "2,098",
      checkInsToday: "12 guests",
      checkOutsToday: "8 guests",
      occupancyRate: "85%",
      todayRevenue: "₾4,250",
    },
    upcomingBookings: [
      { guest: "John Smith", room: "A 3041", checkIn: "2025-11-26", checkOut: "2025-11-30", price: 450, channel: "Booking.com" },
      { guest: "მარიამ გელაშვილი", room: "C 2641", checkIn: "2025-11-27", checkOut: "2025-12-02", price: 520, channel: "Airbnb" },
      { guest: "Anna Müller", room: "D 3418", checkIn: "2025-11-28", checkOut: "2025-12-01", price: 480, channel: "Expedia" },
      { guest: "გიორგი ბერიძე", room: "B 2842", checkIn: "2025-11-29", checkOut: "2025-12-03", price: 500, channel: "Booking.com" },
      { guest: "Sarah Johnson", room: "E 3219", checkIn: "2025-11-30", checkOut: "2025-12-05", price: 550, channel: "Airbnb" },
    ],
    guestStats: {
      totalGuests: 892,
      vipGuests: 42,
      returnRate: "89%",
      avgStayDuration: "3.2 nights",
      avgBookingValue: "₾242",
    },
    channelDistribution: {
      "Booking.com": "42%",
      "Airbnb": "30%",
      "Expedia": "15%",
      "Agoda": "10%",
      "Direct": "3%",
    },
  };
}

/**
 * Fetch Reports & Analytics Dashboard data
 */
export async function fetchReportsDashboardData() {
  return {
    summary: "Comprehensive analytics and reports",
    kpis: {
      yearlyRevenue: "₾648,000",
      avgOccupancy: "85%",
      totalBookings: "2,098",
      avgRating: "9.2/10",
    },
    monthlyPerformance: [
      { month: "June 2025", revenue: 125000, occupancy: 92, bookings: 385 },
      { month: "May 2025", revenue: 118000, occupancy: 88, bookings: 356 },
      { month: "April 2025", revenue: 95000, occupancy: 78, bookings: 287 },
      { month: "March 2025", revenue: 82000, occupancy: 72, bookings: 245 },
      { month: "February 2025", revenue: 68000, occupancy: 65, bookings: 198 },
      { month: "January 2025", revenue: 72000, occupancy: 68, bookings: 215 },
    ],
    yearlyGrowth: {
      "2025": { revenue: 648000, occupancy: 85, growth: "+33.6%" },
      "2024": { revenue: 485000, occupancy: 78, growth: "+18.2%" },
      "2023": { revenue: 410000, occupancy: 72, growth: "baseline" },
    },
    topPerformingRooms: [
      { room: "A 3041", occupancy: "100%", revenue: 4850 },
      { room: "C 2641", occupancy: "96%", revenue: 4620 },
      { room: "D 3418", occupancy: "93%", revenue: 4380 },
    ],
  };
}

/**
 * Get dashboard data based on module
 */
export async function getDashboardDataForModule(module: string) {
  switch (module) {
    case "CEO Dashboard":
      return await fetchCEODashboardData();
    case "Finance":
      return await fetchFinanceDashboardData();
    case "Marketing":
      return await fetchMarketingDashboardData();
    case "Logistics":
      return await fetchLogisticsDashboardData();
    case "Reservations":
      return await fetchReservationsDashboardData();
    case "Reports & Analytics":
      return await fetchReportsDashboardData();
    default:
      return null;
  }
}
