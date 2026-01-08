/**
 * Mock Sheet Service - Frontend Data Bridge
 * 
 * This service provides mock data that matches the OtelMS_Master_Data Google Sheet structure.
 * Used when the real Google Sheet connection is not available.
 * 
 * @connect Replace with actual Google Sheets API when ready
 */

export interface Reservation {
  reservationId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  source: 'Booking.com' | 'Airbnb' | 'Expedia' | 'Direct' | 'Google' | 'TripAdvisor';
  totalPrice: number;
  status: 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
}

export interface DashboardKPIs {
  totalRevenue: number;
  revenueChange: number;
  averageDailyRate: number;
  adrChange: number;
  occupancyRate: number;
  occupancyChange: number;
  activeBookings: number;
  bookingsChange: number;
}

export interface ChannelStats {
  channel: string;
  bookings: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface LiveEvent {
  id: number;
  type: 'booking' | 'checkin' | 'checkout' | 'review' | 'housekeeping' | 'alert';
  message: string;
  amount?: string;
  time: string;
  channel: string;
  priority: 'high' | 'medium' | 'low';
}

// Mock KPI Data - Matches PowerStack Dashboard
const MOCK_KPIS: DashboardKPIs = {
  totalRevenue: 45000,
  revenueChange: 12.5,
  averageDailyRate: 125,
  adrChange: 8.3,
  occupancyRate: 78,
  occupancyChange: 5.2,
  activeBookings: 47,
  bookingsChange: 15,
};

// Mock Channel Distribution
const MOCK_CHANNELS: ChannelStats[] = [
  { channel: 'Booking.com', bookings: 21, revenue: 18500, percentage: 45, color: 'blue' },
  { channel: 'Airbnb', bookings: 13, revenue: 11200, percentage: 28, color: 'rose' },
  { channel: 'Expedia', bookings: 7, revenue: 6300, percentage: 15, color: 'yellow' },
  { channel: 'Direct', bookings: 6, revenue: 9000, percentage: 12, color: 'green' },
];

// Mock Live Events
const MOCK_LIVE_EVENTS: LiveEvent[] = [
  { id: 1, type: 'booking', message: 'New Booking from Booking.com - Apt 2104', amount: '+₾450', time: '2 min ago', channel: 'Booking.com', priority: 'high' },
  { id: 2, type: 'review', message: 'Guest Review received on Expedia', amount: '⭐⭐⭐', time: '8 min ago', channel: 'Expedia', priority: 'medium' },
  { id: 3, type: 'housekeeping', message: 'Housekeeping marked Room 1505 as Clean', time: '15 min ago', channel: 'Telegram Bot', priority: 'low' },
  { id: 4, type: 'checkin', message: 'Guest Check-in: Room 405 - Sarah Johnson', time: '32 min ago', channel: 'Direct', priority: 'medium' },
  { id: 5, type: 'booking', message: 'New Booking from Airbnb - Apt 1802', amount: '+₾680', time: '1 hour ago', channel: 'Airbnb', priority: 'high' },
  { id: 6, type: 'review', message: 'New 5-star Review on Google', amount: '⭐⭐⭐⭐⭐', time: '1.5 hours ago', channel: 'Google', priority: 'high' },
  { id: 7, type: 'checkout', message: 'Guest Check-out: Room 312 - Michael Chen', time: '2 hours ago', channel: 'Booking.com', priority: 'low' },
  { id: 8, type: 'alert', message: 'Maintenance request: AC issue in Room 2201', time: '3 hours ago', channel: 'System', priority: 'high' },
];

// Mock Reservations - Full list
const MOCK_RESERVATIONS: Reservation[] = [
  { reservationId: 'RES-2024-001', guestName: 'John Smith', checkIn: '2024-12-21', checkOut: '2024-12-25', roomNumber: '2104', source: 'Booking.com', totalPrice: 450, status: 'Checked-in' },
  { reservationId: 'RES-2024-002', guestName: 'Maria Garcia', checkIn: '2024-12-22', checkOut: '2024-12-27', roomNumber: '1802', source: 'Airbnb', totalPrice: 680, status: 'Confirmed' },
  { reservationId: 'RES-2024-003', guestName: 'David Chen', checkIn: '2024-12-24', checkOut: '2024-12-26', roomNumber: '1505', source: 'Expedia', totalPrice: 280, status: 'Confirmed' },
  { reservationId: 'RES-2024-004', guestName: 'Emma Wilson', checkIn: '2024-12-20', checkOut: '2024-12-23', roomNumber: '405', source: 'Direct', totalPrice: 390, status: 'Checked-out' },
  { reservationId: 'RES-2024-005', guestName: 'James Brown', checkIn: '2024-12-25', checkOut: '2024-12-28', roomNumber: '2201', source: 'Booking.com', totalPrice: 420, status: 'Confirmed' },
  { reservationId: 'RES-2024-006', guestName: 'Sarah Johnson', checkIn: '2024-12-22', checkOut: '2024-12-24', roomNumber: '1903', source: 'Airbnb', totalPrice: 320, status: 'Checked-in' },
  { reservationId: 'RES-2024-007', guestName: 'Michael Lee', checkIn: '2024-12-23', checkOut: '2024-12-28', roomNumber: '1601', source: 'Booking.com', totalPrice: 750, status: 'Confirmed' },
  { reservationId: 'RES-2024-008', guestName: 'Anna Petrov', checkIn: '2024-12-21', checkOut: '2024-12-24', roomNumber: '1102', source: 'Expedia', totalPrice: 420, status: 'Checked-in' },
  { reservationId: 'RES-2024-009', guestName: 'Robert Taylor', checkIn: '2024-12-26', checkOut: '2024-12-29', roomNumber: '2005', source: 'Direct', totalPrice: 510, status: 'Confirmed' },
  { reservationId: 'RES-2024-010', guestName: 'Lisa Anderson', checkIn: '2024-12-22', checkOut: '2024-12-25', roomNumber: '1704', source: 'Airbnb', totalPrice: 480, status: 'Checked-in' },
  { reservationId: 'RES-2024-011', guestName: 'Thomas White', checkIn: '2024-12-24', checkOut: '2024-12-27', roomNumber: '1301', source: 'Booking.com', totalPrice: 450, status: 'Confirmed' },
  { reservationId: 'RES-2024-012', guestName: 'Jennifer Davis', checkIn: '2024-12-21', checkOut: '2024-12-23', roomNumber: '901', source: 'Expedia', totalPrice: 280, status: 'Checked-out' },
  { reservationId: 'RES-2024-013', guestName: 'Christopher Martin', checkIn: '2024-12-25', checkOut: '2024-12-30', roomNumber: '2102', source: 'Booking.com', totalPrice: 750, status: 'Confirmed' },
  { reservationId: 'RES-2024-014', guestName: 'Amanda Clark', checkIn: '2024-12-23', checkOut: '2024-12-26', roomNumber: '1405', source: 'Airbnb', totalPrice: 540, status: 'Confirmed' },
  { reservationId: 'RES-2024-015', guestName: 'Daniel Rodriguez', checkIn: '2024-12-22', checkOut: '2024-12-24', roomNumber: '1008', source: 'Direct', totalPrice: 340, status: 'Checked-in' },
];

// Weekly Revenue Data
const MOCK_WEEKLY_REVENUE = [
  { day: 'Mon', revenue: 5200, bookings: 6 },
  { day: 'Tue', revenue: 6800, bookings: 8 },
  { day: 'Wed', revenue: 7500, bookings: 9 },
  { day: 'Thu', revenue: 6200, bookings: 7 },
  { day: 'Fri', revenue: 8900, bookings: 11 },
  { day: 'Sat', revenue: 9400, bookings: 12 },
  { day: 'Sun', revenue: 7000, bookings: 8 },
];

/**
 * Get Dashboard KPIs
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_KPIS;
}

/**
 * Get Channel Distribution Stats
 */
export async function getChannelStats(): Promise<ChannelStats[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_CHANNELS;
}

/**
 * Get Live Events Feed
 */
export async function getLiveEvents(): Promise<LiveEvent[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_LIVE_EVENTS;
}

/**
 * Get All Reservations
 */
export async function getReservations(): Promise<Reservation[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_RESERVATIONS;
}

/**
 * Get Weekly Revenue Data
 */
export async function getWeeklyRevenue() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_WEEKLY_REVENUE;
}

/**
 * Get Today's Check-ins
 */
export async function getTodayCheckIns(): Promise<Reservation[]> {
  const reservations = await getReservations();
  // For demo, return first 3 confirmed reservations
  return reservations.filter(r => r.status === 'Confirmed').slice(0, 3);
}

/**
 * Get Today's Check-outs
 */
export async function getTodayCheckOuts(): Promise<Reservation[]> {
  const reservations = await getReservations();
  return reservations.filter(r => r.status === 'Checked-out');
}

/**
 * Search Reservations
 */
export async function searchReservations(query: string): Promise<Reservation[]> {
  const reservations = await getReservations();
  const lowerQuery = query.toLowerCase();
  
  return reservations.filter(r => 
    r.guestName.toLowerCase().includes(lowerQuery) ||
    r.reservationId.toLowerCase().includes(lowerQuery) ||
    r.roomNumber.includes(query)
  );
}

// Export service object
export const mockSheetService = {
  getDashboardKPIs,
  getChannelStats,
  getLiveEvents,
  getReservations,
  getWeeklyRevenue,
  getTodayCheckIns,
  getTodayCheckOuts,
  searchReservations,
};

export default mockSheetService;
