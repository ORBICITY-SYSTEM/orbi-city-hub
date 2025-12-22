/**
 * Google Sheet Service - OtelMS Manual Data Bridge
 * 
 * This service provides a bridge between the UI and the OtelMS_Master_Data Google Sheet.
 * Currently using mock data that matches the expected Sheet structure.
 * 
 * Sheet Structure (OtelMS_Master_Data):
 * A: Reservation ID
 * B: Guest Name
 * C: Check-in
 * D: Check-out
 * E: Room Number (101-2060)
 * F: Source (Booking, Expedia, etc.)
 * G: Total Price (GEL)
 * H: Status (Confirmed/Checked-in)
 * 
 * @connect Google Sheets API when ready
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

export interface DashboardStats {
  totalRevenue: number;
  averageDailyRate: number;
  occupancyRate: number;
  activeBookings: number;
  channelDistribution: {
    channel: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }[];
}

// Mock Reservations Data - Simulates OtelMS_Master_Data Google Sheet
const MOCK_RESERVATIONS: Reservation[] = [
  // Current Week Bookings
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
  // Additional bookings for realistic stats
  { reservationId: 'RES-2024-011', guestName: 'Thomas White', checkIn: '2024-12-24', checkOut: '2024-12-27', roomNumber: '1301', source: 'Booking.com', totalPrice: 450, status: 'Confirmed' },
  { reservationId: 'RES-2024-012', guestName: 'Jennifer Davis', checkIn: '2024-12-21', checkOut: '2024-12-23', roomNumber: '901', source: 'Expedia', totalPrice: 280, status: 'Checked-out' },
  { reservationId: 'RES-2024-013', guestName: 'Christopher Martin', checkIn: '2024-12-25', checkOut: '2024-12-30', roomNumber: '2102', source: 'Booking.com', totalPrice: 750, status: 'Confirmed' },
  { reservationId: 'RES-2024-014', guestName: 'Amanda Clark', checkIn: '2024-12-23', checkOut: '2024-12-26', roomNumber: '1405', source: 'Airbnb', totalPrice: 540, status: 'Confirmed' },
  { reservationId: 'RES-2024-015', guestName: 'Daniel Rodriguez', checkIn: '2024-12-22', checkOut: '2024-12-24', roomNumber: '1008', source: 'Direct', totalPrice: 340, status: 'Checked-in' },
  { reservationId: 'RES-2024-016', guestName: 'Michelle Lewis', checkIn: '2024-12-26', checkOut: '2024-12-29', roomNumber: '1906', source: 'Booking.com', totalPrice: 510, status: 'Confirmed' },
  { reservationId: 'RES-2024-017', guestName: 'Kevin Walker', checkIn: '2024-12-21', checkOut: '2024-12-26', roomNumber: '2003', source: 'Expedia', totalPrice: 700, status: 'Checked-in' },
  { reservationId: 'RES-2024-018', guestName: 'Stephanie Hall', checkIn: '2024-12-24', checkOut: '2024-12-27', roomNumber: '1207', source: 'Airbnb', totalPrice: 480, status: 'Confirmed' },
  { reservationId: 'RES-2024-019', guestName: 'Brian Young', checkIn: '2024-12-22', checkOut: '2024-12-25', roomNumber: '1503', source: 'Booking.com', totalPrice: 450, status: 'Checked-in' },
  { reservationId: 'RES-2024-020', guestName: 'Nicole King', checkIn: '2024-12-23', checkOut: '2024-12-28', roomNumber: '2106', source: 'Direct', totalPrice: 850, status: 'Confirmed' },
  { reservationId: 'RES-2024-021', guestName: 'Jason Scott', checkIn: '2024-12-25', checkOut: '2024-12-27', roomNumber: '1109', source: 'Airbnb', totalPrice: 340, status: 'Confirmed' },
  // More for channel distribution
  { reservationId: 'RES-2024-022', guestName: 'Rachel Green', checkIn: '2024-12-20', checkOut: '2024-12-22', roomNumber: '802', source: 'Booking.com', totalPrice: 280, status: 'Checked-out' },
  { reservationId: 'RES-2024-023', guestName: 'Mark Johnson', checkIn: '2024-12-21', checkOut: '2024-12-24', roomNumber: '1404', source: 'Booking.com', totalPrice: 420, status: 'Checked-in' },
  { reservationId: 'RES-2024-024', guestName: 'Emily Brown', checkIn: '2024-12-22', checkOut: '2024-12-26', roomNumber: '1706', source: 'Booking.com', totalPrice: 560, status: 'Confirmed' },
  { reservationId: 'RES-2024-025', guestName: 'Alex Turner', checkIn: '2024-12-23', checkOut: '2024-12-25', roomNumber: '1205', source: 'Booking.com', totalPrice: 280, status: 'Confirmed' },
];

/**
 * Fetch all reservations from the Google Sheet (mock)
 * @connect Replace with actual Google Sheets API call
 */
export async function fetchReservations(): Promise<Reservation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: Replace with actual Google Sheets API call
  // const response = await sheets.spreadsheets.values.get({
  //   spreadsheetId: 'OtelMS_Master_Data_ID',
  //   range: 'Sheet1!A2:H',
  // });
  
  return MOCK_RESERVATIONS;
}

/**
 * Get reservations for a specific date range
 */
export async function getReservationsByDateRange(
  startDate: string,
  endDate: string
): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  
  return reservations.filter(r => {
    const checkIn = new Date(r.checkIn);
    const checkOut = new Date(r.checkOut);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return (checkIn >= start && checkIn <= end) || 
           (checkOut >= start && checkOut <= end) ||
           (checkIn <= start && checkOut >= end);
  });
}

/**
 * Get reservations by channel source
 */
export async function getReservationsByChannel(
  channel: Reservation['source']
): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  return reservations.filter(r => r.source === channel);
}

/**
 * Calculate dashboard statistics from reservations
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const reservations = await fetchReservations();
  
  // Calculate total revenue
  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalPrice, 0);
  
  // Calculate average daily rate
  const averageDailyRate = Math.round(totalRevenue / reservations.length);
  
  // Calculate occupancy (assuming 60 total rooms)
  const totalRooms = 60;
  const activeBookings = reservations.filter(
    r => r.status === 'Checked-in' || r.status === 'Confirmed'
  ).length;
  const occupancyRate = Math.round((activeBookings / totalRooms) * 100);
  
  // Calculate channel distribution
  const channels = ['Booking.com', 'Airbnb', 'Expedia', 'Direct'] as const;
  const channelDistribution = channels.map(channel => {
    const channelReservations = reservations.filter(r => r.source === channel);
    const channelRevenue = channelReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const bookings = channelReservations.length;
    const percentage = Math.round((bookings / reservations.length) * 100);
    
    return {
      channel,
      bookings,
      revenue: channelRevenue,
      percentage,
    };
  });
  
  return {
    totalRevenue,
    averageDailyRate,
    occupancyRate,
    activeBookings,
    channelDistribution,
  };
}

/**
 * Get today's check-ins
 */
export async function getTodayCheckIns(): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  const today = new Date().toISOString().split('T')[0];
  
  return reservations.filter(r => r.checkIn === today);
}

/**
 * Get today's check-outs
 */
export async function getTodayCheckOuts(): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  const today = new Date().toISOString().split('T')[0];
  
  return reservations.filter(r => r.checkOut === today);
}

/**
 * Search reservations by guest name
 */
export async function searchReservations(query: string): Promise<Reservation[]> {
  const reservations = await fetchReservations();
  const lowerQuery = query.toLowerCase();
  
  return reservations.filter(r => 
    r.guestName.toLowerCase().includes(lowerQuery) ||
    r.reservationId.toLowerCase().includes(lowerQuery) ||
    r.roomNumber.includes(query)
  );
}

// Export service object for easy import
export const googleSheetService = {
  fetchReservations,
  getReservationsByDateRange,
  getReservationsByChannel,
  getDashboardStats,
  getTodayCheckIns,
  getTodayCheckOuts,
  searchReservations,
};

export default googleSheetService;
