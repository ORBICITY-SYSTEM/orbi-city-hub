/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * POWERSTACK GOOGLE SHEET BRIDGE - React Frontend Service
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This service replaces all Supabase calls with Google AppScript API calls.
 * It fetches data from the DataBridge.gs AppScript backend.
 * 
 * USAGE:
 * ```typescript
 * import { sheetBridge } from '@/services/googleSheetBridge';
 * 
 * // Get dashboard data
 * const data = await sheetBridge.getDashboard();
 * 
 * // Get reservations
 * const reservations = await sheetBridge.getReservations({ status: 'Confirmed' });
 * ```
 * 
 * @author PowerStack Team
 * @version 2.0.0 (December 2024)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface KPIData {
  totalRevenue: number;
  revenueChange: number;
  averageDailyRate: number;
  adrChange: number;
  occupancyRate: number;
  occupancyChange: number;
  activeBookings: number;
  bookingsChange: number;
}

export interface ChannelData {
  channel: string;
  bookings: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface Reservation {
  reservationId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  source: string;
  totalPrice: number;
  status: string;
}

export interface RoomStatus {
  id: string;
  number: string;
  floor: number;
  status: 'clean' | 'dirty' | 'occupied' | 'maintenance';
  lastUpdated: string;
}

export interface LiveFeedEvent {
  id: number;
  type: 'booking' | 'review' | 'housekeeping' | 'checkin' | 'checkout';
  message: string;
  amount?: string;
  time: string;
  channel: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Review {
  id: number;
  guestName: string;
  platform: string;
  rating: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
}

export interface DashboardData {
  kpis: KPIData;
  channels: ChannelData[];
  liveFeed: LiveFeedEvent[];
  weeklyRevenue: { day: string; revenue: number; bookings: number }[];
  timestamp: string;
  source: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// AppScript Web App URL - Set this in .env as VITE_APPSCRIPT_DATA_BRIDGE_URL
const APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_DATA_BRIDGE_URL || '';

// Use demo data if no AppScript URL is configured
const USE_DEMO_DATA = !APPSCRIPT_URL || import.meta.env.VITE_USE_DEMO_DATA === 'true';

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA (Used when AppScript is not configured)
// ═══════════════════════════════════════════════════════════════════════════════

const DEMO_KPIS: KPIData = {
  totalRevenue: 45000,
  revenueChange: 12.5,
  averageDailyRate: 125,
  adrChange: 8.3,
  occupancyRate: 78,
  occupancyChange: 5.2,
  activeBookings: 47,
  bookingsChange: 15,
};

const DEMO_CHANNELS: ChannelData[] = [
  { channel: 'Booking.com', bookings: 21, revenue: 18500, percentage: 45, color: 'blue' },
  { channel: 'Airbnb', bookings: 13, revenue: 11200, percentage: 28, color: 'rose' },
  { channel: 'Expedia', bookings: 7, revenue: 6300, percentage: 15, color: 'yellow' },
  { channel: 'Direct', bookings: 6, revenue: 9000, percentage: 12, color: 'green' },
];

const DEMO_LIVE_FEED: LiveFeedEvent[] = [
  { id: 1, type: 'booking', message: 'New Booking from Booking.com - Apt 2104', amount: '+₾450', time: '2 min ago', channel: 'Booking.com', priority: 'high' },
  { id: 2, type: 'review', message: 'Guest Review received on Expedia', amount: '⭐⭐⭐', time: '8 min ago', channel: 'Expedia', priority: 'medium' },
  { id: 3, type: 'housekeeping', message: 'Housekeeping marked Room 1505 as Clean', time: '15 min ago', channel: 'Telegram Bot', priority: 'low' },
  { id: 4, type: 'checkin', message: 'Guest Check-in: Room 405 - Sarah Johnson', time: '32 min ago', channel: 'Direct', priority: 'medium' },
  { id: 5, type: 'booking', message: 'New Booking from Airbnb - Apt 1802', amount: '+₾680', time: '1 hour ago', channel: 'Airbnb', priority: 'high' },
  { id: 6, type: 'checkout', message: 'Guest Check-out: Room 1203 - James Wilson', time: '2 hours ago', channel: 'Booking.com', priority: 'low' },
];

const DEMO_WEEKLY_REVENUE = [
  { day: 'Mon', revenue: 5200, bookings: 6 },
  { day: 'Tue', revenue: 6800, bookings: 8 },
  { day: 'Wed', revenue: 7500, bookings: 9 },
  { day: 'Thu', revenue: 6200, bookings: 7 },
  { day: 'Fri', revenue: 8900, bookings: 11 },
  { day: 'Sat', revenue: 9400, bookings: 12 },
  { day: 'Sun', revenue: 7000, bookings: 8 },
];

const DEMO_RESERVATIONS: Reservation[] = [
  { reservationId: 'RES-2024-001', guestName: 'John Smith', checkIn: '2024-12-21', checkOut: '2024-12-25', roomNumber: '2104', source: 'Booking.com', totalPrice: 450, status: 'Checked-in' },
  { reservationId: 'RES-2024-002', guestName: 'Maria Garcia', checkIn: '2024-12-22', checkOut: '2024-12-27', roomNumber: '1802', source: 'Airbnb', totalPrice: 680, status: 'Confirmed' },
  { reservationId: 'RES-2024-003', guestName: 'David Chen', checkIn: '2024-12-24', checkOut: '2024-12-26', roomNumber: '1505', source: 'Expedia', totalPrice: 280, status: 'Confirmed' },
  { reservationId: 'RES-2024-004', guestName: 'Emma Wilson', checkIn: '2024-12-20', checkOut: '2024-12-23', roomNumber: '405', source: 'Direct', totalPrice: 390, status: 'Checked-out' },
  { reservationId: 'RES-2024-005', guestName: 'James Brown', checkIn: '2024-12-25', checkOut: '2024-12-28', roomNumber: '2201', source: 'Booking.com', totalPrice: 420, status: 'Confirmed' },
];

const DEMO_REVIEWS: Review[] = [
  { id: 1, guestName: 'Sarah Johnson', platform: 'Google', rating: 5, text: 'Amazing sea view and great service!', sentiment: 'positive', date: '2024-12-20' },
  { id: 2, guestName: 'Michael Chen', platform: 'Booking.com', rating: 3, text: 'Good location but room was a bit small.', sentiment: 'neutral', date: '2024-12-19' },
  { id: 3, guestName: 'Lisa Garcia', platform: 'Expedia', rating: 2, text: 'AC was not working properly.', sentiment: 'negative', date: '2024-12-18' },
  { id: 4, guestName: 'Robert Taylor', platform: 'Airbnb', rating: 5, text: 'Perfect stay! Will come back.', sentiment: 'positive', date: '2024-12-17' },
  { id: 5, guestName: 'Anna Petrov', platform: 'Google', rating: 4, text: 'Nice apartment, friendly staff.', sentiment: 'positive', date: '2024-12-16' },
];

function generateDemoHousekeeping(): RoomStatus[] {
  const rooms: RoomStatus[] = [];
  const statuses: RoomStatus['status'][] = ['clean', 'dirty', 'occupied', 'maintenance'];
  const distribution = [34, 10, 14, 2]; // 34 clean, 10 dirty, 14 occupied, 2 maintenance
  
  let statusIndex = 0;
  let statusCount = 0;
  
  for (let floor = 4; floor <= 21; floor++) {
    const apartmentsPerFloor = floor <= 10 ? 4 : 3;
    for (let apt = 1; apt <= apartmentsPerFloor && rooms.length < 60; apt++) {
      const roomNumber = `${floor}0${apt}`;
      
      while (statusCount >= distribution[statusIndex] && statusIndex < 3) {
        statusIndex++;
        statusCount = 0;
      }
      
      rooms.push({
        id: `room-${roomNumber}`,
        number: roomNumber,
        floor: floor,
        status: statuses[statusIndex],
        lastUpdated: new Date().toISOString(),
      });
      
      statusCount++;
    }
  }
  
  return rooms;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch data from AppScript or return demo data
 */
async function fetchFromAppScript<T>(action: string, params?: Record<string, string>): Promise<T> {
  if (USE_DEMO_DATA) {
    console.log(`[SheetBridge] Demo mode - returning mock data for action: ${action}`);
    return getDemoData(action) as T;
  }
  
  try {
    const url = new URL(APPSCRIPT_URL);
    url.searchParams.set('action', action);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    console.log(`[SheetBridge] Fetching from AppScript: ${action}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`AppScript request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[SheetBridge] Received data for ${action}:`, data);
    
    return data as T;
    
  } catch (error) {
    console.error(`[SheetBridge] Error fetching ${action}:`, error);
    console.log(`[SheetBridge] Falling back to demo data`);
    return getDemoData(action) as T;
  }
}

/**
 * Get demo data for a specific action
 */
function getDemoData(action: string): unknown {
  switch (action) {
    case 'dashboard':
      return {
        kpis: DEMO_KPIS,
        channels: DEMO_CHANNELS,
        liveFeed: DEMO_LIVE_FEED,
        weeklyRevenue: DEMO_WEEKLY_REVENUE,
        timestamp: new Date().toISOString(),
        source: 'Demo Mode',
      };
    case 'kpis':
      return DEMO_KPIS;
    case 'channels':
      return DEMO_CHANNELS;
    case 'liveFeed':
      return DEMO_LIVE_FEED;
    case 'reservations':
      return { reservations: DEMO_RESERVATIONS, total: DEMO_RESERVATIONS.length };
    case 'housekeeping':
      return generateDemoHousekeeping();
    case 'reviews':
      return { reviews: DEMO_REVIEWS, total: DEMO_REVIEWS.length, averageRating: 4.6, responseRate: 94 };
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTED SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const sheetBridge = {
  /**
   * Get complete dashboard data (all widgets in one call)
   */
  getDashboard: () => fetchFromAppScript<DashboardData>('dashboard'),
  
  /**
   * Get Key Performance Indicators
   */
  getKPIs: () => fetchFromAppScript<KPIData>('kpis'),
  
  /**
   * Get channel distribution statistics
   */
  getChannels: () => fetchFromAppScript<ChannelData[]>('channels'),
  
  /**
   * Get live feed events
   */
  getLiveFeed: () => fetchFromAppScript<LiveFeedEvent[]>('liveFeed'),
  
  /**
   * Get reservations with optional filters
   */
  getReservations: (params?: { status?: string; source?: string; startDate?: string; endDate?: string }) => 
    fetchFromAppScript<{ reservations: Reservation[]; total: number }>('reservations', params as Record<string, string>),
  
  /**
   * Get housekeeping status for all rooms
   */
  getHousekeeping: () => fetchFromAppScript<RoomStatus[]>('housekeeping'),
  
  /**
   * Get reviews with optional filters
   */
  getReviews: (params?: { platform?: string; sentiment?: string }) => 
    fetchFromAppScript<{ reviews: Review[]; total: number; averageRating: number; responseRate: number }>('reviews', params as Record<string, string>),
  
  /**
   * Check if the AppScript backend is healthy
   */
  healthCheck: () => fetchFromAppScript<{ status: string; timestamp: string; version: string }>('health'),
  
  /**
   * Check if we're in demo mode
   */
  isDemoMode: () => USE_DEMO_DATA,
};

// Default export
export default sheetBridge;
