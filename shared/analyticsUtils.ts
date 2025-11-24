/**
 * ORBI City Hub - Advanced Analytics Utilities
 * Revenue management, forecasting, and business intelligence
 */

export interface RevenueData {
  date: Date;
  revenue: number;
  occupancy: number;
  roomsSold: number;
  totalRooms: number;
}

export interface ChannelPerformance {
  channel: string;
  revenue: number;
  bookings: number;
  commission: number;
  netRevenue: number;
  share: number;
}

/**
 * Calculate RevPAR (Revenue Per Available Room)
 * RevPAR = Total Room Revenue / Total Available Rooms
 * or
 * RevPAR = ADR × Occupancy Rate
 */
export function calculateRevPAR(
  totalRevenue: number,
  totalRooms: number,
  days: number = 1
): number {
  const availableRooms = totalRooms * days;
  return totalRevenue / availableRooms;
}

/**
 * Calculate ADR (Average Daily Rate)
 * ADR = Total Room Revenue / Number of Rooms Sold
 */
export function calculateADR(totalRevenue: number, roomsSold: number): number {
  if (roomsSold === 0) return 0;
  return totalRevenue / roomsSold;
}

/**
 * Calculate Occupancy Rate
 * Occupancy Rate = Rooms Sold / Total Available Rooms
 */
export function calculateOccupancy(
  roomsSold: number,
  totalRooms: number,
  days: number = 1
): number {
  const availableRooms = totalRooms * days;
  return roomsSold / availableRooms;
}

/**
 * Calculate TRevPAR (Total Revenue Per Available Room)
 * Includes all revenue sources, not just room revenue
 */
export function calculateTRevPAR(
  totalRevenue: number,
  totalRooms: number,
  days: number = 1
): number {
  const availableRooms = totalRooms * days;
  return totalRevenue / availableRooms;
}

/**
 * Calculate GOPPAR (Gross Operating Profit Per Available Room)
 * GOPPAR = Gross Operating Profit / Total Available Rooms
 */
export function calculateGOPPAR(
  revenue: number,
  operatingExpenses: number,
  totalRooms: number,
  days: number = 1
): number {
  const grossProfit = revenue - operatingExpenses;
  const availableRooms = totalRooms * days;
  return grossProfit / availableRooms;
}

/**
 * Calculate Channel Attribution (which channel contributes most)
 */
export function calculateChannelAttribution(
  channels: ChannelPerformance[]
): ChannelPerformance[] {
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
  
  return channels.map(ch => ({
    ...ch,
    share: ch.revenue / totalRevenue,
    netRevenue: ch.revenue * (1 - ch.commission)
  })).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Simple Moving Average for trend forecasting
 */
export function calculateMovingAverage(
  data: number[],
  period: number = 7
): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * Linear regression for revenue forecasting
 */
export function forecastRevenue(
  historicalData: RevenueData[],
  daysAhead: number = 30
): { date: Date; forecastedRevenue: number; confidence: number }[] {
  // Extract revenue values
  const revenues = historicalData.map(d => d.revenue);
  const n = revenues.length;
  
  // Calculate linear regression (y = mx + b)
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += revenues[i];
    sumXY += i * revenues[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate forecast
  const forecast = [];
  const lastDate = historicalData[historicalData.length - 1].date;
  
  for (let i = 1; i <= daysAhead; i++) {
    const forecastedRevenue = slope * (n + i) + intercept;
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    
    // Confidence decreases with distance from historical data
    const confidence = Math.max(0.5, 1 - (i / daysAhead) * 0.5);
    
    forecast.push({
      date,
      forecastedRevenue: Math.max(0, forecastedRevenue),
      confidence
    });
  }
  
  return forecast;
}

/**
 * Calculate seasonality index
 */
export function calculateSeasonalityIndex(
  monthlyData: { month: number; revenue: number }[]
): { month: number; index: number }[] {
  const avgRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0) / monthlyData.length;
  
  return monthlyData.map(d => ({
    month: d.month,
    index: d.revenue / avgRevenue
  }));
}

/**
 * Calculate booking pace (how fast rooms are being booked)
 */
export function calculateBookingPace(
  currentBookings: number,
  lastYearBookings: number
): {
  pace: number;
  pacePercentage: number;
  status: 'ahead' | 'on-track' | 'behind';
} {
  const pace = currentBookings - lastYearBookings;
  const pacePercentage = lastYearBookings > 0 
    ? (pace / lastYearBookings) * 100 
    : 0;
  
  let status: 'ahead' | 'on-track' | 'behind';
  if (pacePercentage > 5) status = 'ahead';
  else if (pacePercentage < -5) status = 'behind';
  else status = 'on-track';
  
  return { pace, pacePercentage, status };
}

/**
 * Calculate optimal price using demand-based pricing
 */
export function calculateOptimalPrice(
  basePrice: number,
  occupancyRate: number,
  daysUntilCheckIn: number,
  seasonalityIndex: number = 1.0
): {
  recommendedPrice: number;
  adjustment: number;
  reason: string;
} {
  let adjustment = 1.0;
  let reason = 'Base price';
  
  // Occupancy-based adjustment
  if (occupancyRate > 0.80) {
    adjustment *= 1.20;
    reason = 'High occupancy (+20%)';
  } else if (occupancyRate > 0.70) {
    adjustment *= 1.10;
    reason = 'Good occupancy (+10%)';
  } else if (occupancyRate < 0.40) {
    adjustment *= 0.85;
    reason = 'Low occupancy (-15%)';
  }
  
  // Lead time adjustment
  if (daysUntilCheckIn < 3) {
    adjustment *= 1.10;
    reason += ', Last-minute (+10%)';
  } else if (daysUntilCheckIn > 60) {
    adjustment *= 0.95;
    reason += ', Early booking (-5%)';
  }
  
  // Seasonality adjustment
  adjustment *= seasonalityIndex;
  if (seasonalityIndex > 1.2) {
    reason += ', Peak season';
  } else if (seasonalityIndex < 0.8) {
    reason += ', Low season';
  }
  
  const recommendedPrice = Math.round(basePrice * adjustment);
  
  return {
    recommendedPrice,
    adjustment: (adjustment - 1) * 100,
    reason
  };
}

/**
 * Calculate competitor price index
 */
export function calculateCompetitorIndex(
  ourPrice: number,
  competitorPrices: number[]
): {
  index: number;
  position: 'below' | 'competitive' | 'above';
  avgCompetitorPrice: number;
} {
  const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
  const index = ourPrice / avgCompetitorPrice;
  
  let position: 'below' | 'competitive' | 'above';
  if (index < 0.95) position = 'below';
  else if (index > 1.05) position = 'above';
  else position = 'competitive';
  
  return { index, position, avgCompetitorPrice };
}

/**
 * Calculate length of stay (LOS) distribution
 */
export function analyzeLengthOfStay(
  bookings: { lengthOfStay: number }[]
): {
  average: number;
  median: number;
  distribution: { los: number; count: number; percentage: number }[];
} {
  const losValues = bookings.map(b => b.lengthOfStay).sort((a, b) => a - b);
  const average = losValues.reduce((a, b) => a + b, 0) / losValues.length;
  const median = losValues[Math.floor(losValues.length / 2)];
  
  // Calculate distribution
  const losCount = new Map<number, number>();
  losValues.forEach(los => {
    losCount.set(los, (losCount.get(los) || 0) + 1);
  });
  
  const distribution = Array.from(losCount.entries())
    .map(([los, count]) => ({
      los,
      count,
      percentage: (count / losValues.length) * 100
    }))
    .sort((a, b) => b.count - a.count);
  
  return { average, median, distribution };
}

/**
 * Calculate cancellation rate and revenue impact
 */
export function analyzeCancellations(
  totalBookings: number,
  cancelledBookings: number,
  lostRevenue: number
): {
  cancellationRate: number;
  revenueImpact: number;
  averageLostPerCancellation: number;
} {
  const cancellationRate = (cancelledBookings / totalBookings) * 100;
  const averageLostPerCancellation = cancelledBookings > 0 
    ? lostRevenue / cancelledBookings 
    : 0;
  
  return {
    cancellationRate,
    revenueImpact: lostRevenue,
    averageLostPerCancellation
  };
}

/**
 * Generate heatmap data for occupancy visualization
 */
export function generateOccupancyHeatmap(
  data: { date: Date; occupancy: number }[]
): { day: number; week: number; occupancy: number }[] {
  return data.map((d, index) => ({
    day: d.date.getDay(),
    week: Math.floor(index / 7),
    occupancy: d.occupancy
  }));
}
