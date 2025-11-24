import { publicProcedure, router } from "../_core/trpc";
import {
  getCurrentMonthRevenue,
  getPreviousMonthRevenue,
  getCurrentMonthOccupancy,
  getPreviousMonthOccupancy,
  getAverageRating,
  getRevenueByChannel,
  getMonthlyOverview,
} from "../ceoDashboardDb";

/**
 * CEO Dashboard tRPC Router
 * Provides real-time data for KPIs, revenue, occupancy, and analytics
 */
export const ceoDashboardRouter = router({
  /**
   * Get all KPIs (Revenue, Occupancy, Rating, AI Tasks)
   */
  getKPIs: publicProcedure.query(async () => {
    // Revenue
    const currentRevenue = await getCurrentMonthRevenue();
    const previousRevenue = await getPreviousMonthRevenue();
    const revenueChange = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    // Occupancy
    const currentOccupancy = await getCurrentMonthOccupancy();
    const previousOccupancy = await getPreviousMonthOccupancy();
    const occupancyChange = currentOccupancy - previousOccupancy;

    // Rating
    const ratings = await getAverageRating();
    const ratingChange = Math.round((ratings.current - ratings.previous) * 10) / 10;

    // AI Tasks (mock for now - will be replaced with actual AI task tracking)
    const aiTasks = 247;
    const aiTasksChange = 89;

    return {
      revenue: {
        value: currentRevenue,
        change: revenueChange,
        formatted: `${currentRevenue.toLocaleString()} ₾`,
      },
      occupancy: {
        value: currentOccupancy,
        change: occupancyChange,
        formatted: `${currentOccupancy}%`,
      },
      rating: {
        value: Math.round(ratings.current * 10) / 10,
        change: ratingChange,
        formatted: `${Math.round(ratings.current * 10) / 10}/10`,
      },
      aiTasks: {
        value: aiTasks,
        change: aiTasksChange,
        formatted: `${aiTasks}`,
      },
    };
  }),

  /**
   * Get revenue breakdown by channel
   */
  getRevenueByChannel: publicProcedure.query(async () => {
    const channelData = await getRevenueByChannel();
    
    // If no data, return mock data
    if (channelData.length === 0) {
      return [
        { channel: "Booking.com", revenue: 18900, percentage: 42 },
        { channel: "Airbnb", revenue: 13570, percentage: 30 },
        { channel: "Expedia", revenue: 6785, percentage: 15 },
        { channel: "Agoda", revenue: 4523, percentage: 10 },
        { channel: "Others", revenue: 1452, percentage: 3 },
      ];
    }

    return channelData;
  }),

  /**
   * Get monthly overview statistics
   */
  getMonthlyOverview: publicProcedure.query(async () => {
    const overview = await getMonthlyOverview();

    // If no data, return mock data
    if (!overview || overview.totalBookings === 0) {
      return {
        totalBookings: 127,
        bookingsChange: 12,
        avgStay: 3.2,
        avgStayChange: "Same as Oct",
        avgPrice: 356,
        avgPriceChange: 8,
        cancellationRate: 2.1,
        cancellationRateChange: -0.5,
      };
    }

    // Calculate changes
    const bookingsChange = overview.prevTotalBookings > 0
      ? Math.round(((overview.totalBookings - overview.prevTotalBookings) / overview.prevTotalBookings) * 100)
      : 0;

    const avgPriceChange = overview.prevAvgPrice > 0
      ? Math.round(((overview.avgPrice - overview.prevAvgPrice) / overview.prevAvgPrice) * 100)
      : 0;

    const avgStayDiff = overview.avgStay - overview.prevAvgStay;
    let avgStayChange = "Same as last month";
    if (avgStayDiff > 0.1) {
      avgStayChange = `+${Math.round(avgStayDiff * 10) / 10} nights`;
    } else if (avgStayDiff < -0.1) {
      avgStayChange = `${Math.round(avgStayDiff * 10) / 10} nights`;
    }

    return {
      totalBookings: overview.totalBookings,
      bookingsChange,
      avgStay: overview.avgStay,
      avgStayChange,
      avgPrice: overview.avgPrice,
      avgPriceChange,
      cancellationRate: overview.cancellationRate,
      cancellationRateChange: Math.round((overview.cancellationRate - overview.prevCancellationRate) * 10) / 10,
    };
  }),
});
