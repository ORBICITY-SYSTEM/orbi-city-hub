/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * POWERSTACK DATA BRIDGE - Google AppScript Backend
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the CORE BACKEND ENGINE for PowerStack HotelOS.
 * It reads data from Google Sheets and serves it as JSON to the React frontend.
 * 
 * SHEET STRUCTURE (OtelMS_Master_Data):
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ A: Reservation ID | B: Guest Name | C: Check-in | D: Check-out             │
 * │ E: Room Number    | F: Source     | G: Total Price (GEL) | H: Status       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * DEPLOYMENT:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create new project: "OrbiHub_DataBridge"
 * 3. Paste this code
 * 4. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 5. Copy the URL and set it in .env as VITE_APPSCRIPT_DATA_BRIDGE_URL
 * 
 * @author PowerStack Team
 * @version 2.0.0 (December 2024)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Google Sheet ID for OtelMS_Master_Data
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE', // Replace with actual Sheet ID
  
  // Sheet names
  SHEETS: {
    RESERVATIONS: 'Reservations',
    FINANCIAL: 'Financial',
    HOUSEKEEPING: 'Housekeeping',
    REVIEWS: 'Reviews',
  },
  
  // Total apartments managed
  TOTAL_APARTMENTS: 60,
  
  // Demo mode (returns mock data if sheet is empty)
  DEMO_MODE: true,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT - HTTP GET HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle GET requests from the React frontend
 * @param {Object} e - Event object with query parameters
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  const action = e.parameter.action || 'dashboard';
  
  let response;
  
  try {
    switch (action) {
      case 'dashboard':
        response = getDashboardData();
        break;
      case 'reservations':
        response = getReservations(e.parameter);
        break;
      case 'kpis':
        response = getKPIs();
        break;
      case 'channels':
        response = getChannelDistribution();
        break;
      case 'housekeeping':
        response = getHousekeepingStatus();
        break;
      case 'reviews':
        response = getReviews(e.parameter);
        break;
      case 'liveFeed':
        response = getLiveFeed();
        break;
      case 'health':
        response = { status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' };
        break;
      default:
        response = { error: 'Unknown action', availableActions: ['dashboard', 'reservations', 'kpis', 'channels', 'housekeeping', 'reviews', 'liveFeed', 'health'] };
    }
  } catch (error) {
    response = { error: error.message, stack: error.stack };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests (for future write operations)
 * @param {Object} e - Event object with POST data
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  let response;
  
  try {
    switch (action) {
      case 'updateHousekeeping':
        response = updateHousekeepingStatus(data.roomNumber, data.status);
        break;
      case 'addReservation':
        response = addReservation(data.reservation);
        break;
      default:
        response = { error: 'Unknown POST action' };
    }
  } catch (error) {
    response = { error: error.message };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA FETCHING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get complete dashboard data (all widgets in one call)
 * @returns {Object} Dashboard data object
 */
function getDashboardData() {
  return {
    kpis: getKPIs(),
    channels: getChannelDistribution(),
    liveFeed: getLiveFeed(),
    weeklyRevenue: getWeeklyRevenue(),
    timestamp: new Date().toISOString(),
    source: 'AppScript DataBridge v2.0',
  };
}

/**
 * Get Key Performance Indicators
 * @returns {Object} KPI data
 */
function getKPIs() {
  const reservations = getReservationsFromSheet();
  
  if (reservations.length === 0 && CONFIG.DEMO_MODE) {
    return getDemoKPIs();
  }
  
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const activeBookings = reservations.filter(r => 
    r.status === 'Confirmed' || r.status === 'Checked-in'
  ).length;
  const occupancyRate = Math.round((activeBookings / CONFIG.TOTAL_APARTMENTS) * 100);
  const adr = activeBookings > 0 ? Math.round(totalRevenue / activeBookings) : 0;
  
  return {
    totalRevenue: totalRevenue,
    revenueChange: 12.5, // Calculate from historical data
    averageDailyRate: adr,
    adrChange: 8.3,
    occupancyRate: occupancyRate,
    occupancyChange: 5.2,
    activeBookings: activeBookings,
    bookingsChange: 15,
  };
}

/**
 * Get channel distribution statistics
 * @returns {Array} Channel stats array
 */
function getChannelDistribution() {
  const reservations = getReservationsFromSheet();
  
  if (reservations.length === 0 && CONFIG.DEMO_MODE) {
    return getDemoChannels();
  }
  
  const channels = {};
  const totalBookings = reservations.length;
  
  reservations.forEach(r => {
    const source = r.source || 'Direct';
    if (!channels[source]) {
      channels[source] = { bookings: 0, revenue: 0 };
    }
    channels[source].bookings++;
    channels[source].revenue += r.totalPrice || 0;
  });
  
  const colors = {
    'Booking.com': 'blue',
    'Airbnb': 'rose',
    'Expedia': 'yellow',
    'Direct': 'green',
    'Google': 'cyan',
  };
  
  return Object.entries(channels).map(([channel, data]) => ({
    channel: channel,
    bookings: data.bookings,
    revenue: data.revenue,
    percentage: Math.round((data.bookings / totalBookings) * 100),
    color: colors[channel] || 'gray',
  }));
}

/**
 * Get reservations from the Google Sheet
 * @param {Object} params - Filter parameters
 * @returns {Array} Reservations array
 */
function getReservations(params) {
  let reservations = getReservationsFromSheet();
  
  if (reservations.length === 0 && CONFIG.DEMO_MODE) {
    reservations = getDemoReservations();
  }
  
  // Apply filters
  if (params && params.status) {
    reservations = reservations.filter(r => r.status === params.status);
  }
  if (params && params.source) {
    reservations = reservations.filter(r => r.source === params.source);
  }
  if (params && params.startDate) {
    const start = new Date(params.startDate);
    reservations = reservations.filter(r => new Date(r.checkIn) >= start);
  }
  if (params && params.endDate) {
    const end = new Date(params.endDate);
    reservations = reservations.filter(r => new Date(r.checkOut) <= end);
  }
  
  return {
    reservations: reservations,
    total: reservations.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get housekeeping status for all rooms
 * @returns {Array} Room status array
 */
function getHousekeepingStatus() {
  // Try to read from Housekeeping sheet
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.HOUSEKEEPING);
    
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      return rows.map(row => ({
        roomNumber: row[0],
        floor: Math.floor(row[0] / 100),
        status: row[1] || 'clean',
        lastUpdated: row[2] || new Date().toISOString(),
      }));
    }
  } catch (e) {
    console.log('Housekeeping sheet not found, using demo data');
  }
  
  // Return demo data
  return getDemoHousekeeping();
}

/**
 * Get live feed events
 * @returns {Array} Live events array
 */
function getLiveFeed() {
  // In production, this would read from a log sheet
  // For now, return demo events
  return getDemoLiveFeed();
}

/**
 * Get weekly revenue data
 * @returns {Array} Weekly revenue array
 */
function getWeeklyRevenue() {
  // In production, calculate from reservations
  // For now, return demo data
  return [
    { day: 'Mon', revenue: 5200, bookings: 6 },
    { day: 'Tue', revenue: 6800, bookings: 8 },
    { day: 'Wed', revenue: 7500, bookings: 9 },
    { day: 'Thu', revenue: 6200, bookings: 7 },
    { day: 'Fri', revenue: 8900, bookings: 11 },
    { day: 'Sat', revenue: 9400, bookings: 12 },
    { day: 'Sun', revenue: 7000, bookings: 8 },
  ];
}

/**
 * Get reviews from sheet
 * @param {Object} params - Filter parameters
 * @returns {Object} Reviews data
 */
function getReviews(params) {
  // In production, read from Reviews sheet
  return {
    reviews: getDemoReviews(),
    total: 5,
    averageRating: 4.6,
    responseRate: 94,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHEET READING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Read reservations from the Google Sheet
 * @returns {Array} Parsed reservations
 */
function getReservationsFromSheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESERVATIONS);
    
    if (!sheet) {
      console.log('Reservations sheet not found');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Only headers or empty
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => ({
      reservationId: row[0],
      guestName: row[1],
      checkIn: formatDate(row[2]),
      checkOut: formatDate(row[3]),
      roomNumber: String(row[4]),
      source: row[5],
      totalPrice: Number(row[6]) || 0,
      status: row[7] || 'Confirmed',
    })).filter(r => r.reservationId); // Filter out empty rows
    
  } catch (error) {
    console.error('Error reading sheet:', error);
    return [];
  }
}

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
function formatDate(date) {
  if (!date) return '';
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Update housekeeping status for a room
 * @param {string} roomNumber - Room number
 * @param {string} status - New status (clean/dirty/occupied/maintenance)
 * @returns {Object} Result
 */
function updateHousekeepingStatus(roomNumber, status) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEETS.HOUSEKEEPING);
    
    if (!sheet) {
      // Create the sheet if it doesn't exist
      sheet = ss.insertSheet(CONFIG.SHEETS.HOUSEKEEPING);
      sheet.appendRow(['Room Number', 'Status', 'Last Updated']);
    }
    
    // Find the row for this room
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(roomNumber)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex > 0) {
      // Update existing row
      sheet.getRange(rowIndex, 2).setValue(status);
      sheet.getRange(rowIndex, 3).setValue(new Date());
    } else {
      // Add new row
      sheet.appendRow([roomNumber, status, new Date()]);
    }
    
    return { success: true, roomNumber: roomNumber, status: status };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add a new reservation
 * @param {Object} reservation - Reservation data
 * @returns {Object} Result
 */
function addReservation(reservation) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEETS.RESERVATIONS);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.RESERVATIONS);
      sheet.appendRow(['Reservation ID', 'Guest Name', 'Check-in', 'Check-out', 'Room Number', 'Source', 'Total Price', 'Status']);
    }
    
    const newId = 'RES-' + new Date().getTime();
    
    sheet.appendRow([
      newId,
      reservation.guestName,
      reservation.checkIn,
      reservation.checkOut,
      reservation.roomNumber,
      reservation.source || 'Direct',
      reservation.totalPrice || 0,
      reservation.status || 'Confirmed',
    ]);
    
    return { success: true, reservationId: newId };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA (Used when sheets are empty)
// ═══════════════════════════════════════════════════════════════════════════════

function getDemoKPIs() {
  return {
    totalRevenue: 45000,
    revenueChange: 12.5,
    averageDailyRate: 125,
    adrChange: 8.3,
    occupancyRate: 78,
    occupancyChange: 5.2,
    activeBookings: 47,
    bookingsChange: 15,
  };
}

function getDemoChannels() {
  return [
    { channel: 'Booking.com', bookings: 21, revenue: 18500, percentage: 45, color: 'blue' },
    { channel: 'Airbnb', bookings: 13, revenue: 11200, percentage: 28, color: 'rose' },
    { channel: 'Expedia', bookings: 7, revenue: 6300, percentage: 15, color: 'yellow' },
    { channel: 'Direct', bookings: 6, revenue: 9000, percentage: 12, color: 'green' },
  ];
}

function getDemoReservations() {
  return [
    { reservationId: 'RES-2024-001', guestName: 'John Smith', checkIn: '2024-12-21', checkOut: '2024-12-25', roomNumber: '2104', source: 'Booking.com', totalPrice: 450, status: 'Checked-in' },
    { reservationId: 'RES-2024-002', guestName: 'Maria Garcia', checkIn: '2024-12-22', checkOut: '2024-12-27', roomNumber: '1802', source: 'Airbnb', totalPrice: 680, status: 'Confirmed' },
    { reservationId: 'RES-2024-003', guestName: 'David Chen', checkIn: '2024-12-24', checkOut: '2024-12-26', roomNumber: '1505', source: 'Expedia', totalPrice: 280, status: 'Confirmed' },
    { reservationId: 'RES-2024-004', guestName: 'Emma Wilson', checkIn: '2024-12-20', checkOut: '2024-12-23', roomNumber: '405', source: 'Direct', totalPrice: 390, status: 'Checked-out' },
    { reservationId: 'RES-2024-005', guestName: 'James Brown', checkIn: '2024-12-25', checkOut: '2024-12-28', roomNumber: '2201', source: 'Booking.com', totalPrice: 420, status: 'Confirmed' },
  ];
}

function getDemoHousekeeping() {
  const rooms = [];
  const statuses = ['clean', 'dirty', 'occupied', 'maintenance'];
  const distribution = [34, 10, 14, 2]; // 34 clean, 10 dirty, 14 occupied, 2 maintenance
  
  let statusIndex = 0;
  let statusCount = 0;
  
  for (let floor = 4; floor <= 21; floor++) {
    const apartmentsPerFloor = floor <= 10 ? 4 : 3;
    for (let apt = 1; apt <= apartmentsPerFloor && rooms.length < 60; apt++) {
      const roomNumber = `${floor}0${apt}`;
      
      // Assign status based on distribution
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

function getDemoLiveFeed() {
  return [
    { id: 1, type: 'booking', message: 'New Booking from Booking.com - Apt 2104', amount: '+₾450', time: '2 min ago', channel: 'Booking.com', priority: 'high' },
    { id: 2, type: 'review', message: 'Guest Review received on Expedia', amount: '⭐⭐⭐', time: '8 min ago', channel: 'Expedia', priority: 'medium' },
    { id: 3, type: 'housekeeping', message: 'Housekeeping marked Room 1505 as Clean', time: '15 min ago', channel: 'Telegram Bot', priority: 'low' },
    { id: 4, type: 'checkin', message: 'Guest Check-in: Room 405 - Sarah Johnson', time: '32 min ago', channel: 'Direct', priority: 'medium' },
    { id: 5, type: 'booking', message: 'New Booking from Airbnb - Apt 1802', amount: '+₾680', time: '1 hour ago', channel: 'Airbnb', priority: 'high' },
  ];
}

function getDemoReviews() {
  return [
    { id: 1, guestName: 'Sarah Johnson', platform: 'Google', rating: 5, text: 'Amazing sea view and great service!', sentiment: 'positive', date: '2024-12-20' },
    { id: 2, guestName: 'Michael Chen', platform: 'Booking.com', rating: 3, text: 'Good location but room was a bit small.', sentiment: 'neutral', date: '2024-12-19' },
    { id: 3, guestName: 'Lisa Garcia', platform: 'Expedia', rating: 2, text: 'AC was not working properly.', sentiment: 'negative', date: '2024-12-18' },
    { id: 4, guestName: 'Robert Taylor', platform: 'Airbnb', rating: 5, text: 'Perfect stay! Will come back.', sentiment: 'positive', date: '2024-12-17' },
    { id: 5, guestName: 'Anna Petrov', platform: 'Google', rating: 4, text: 'Nice apartment, friendly staff.', sentiment: 'positive', date: '2024-12-16' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test function - run this to verify the script works
 */
function testDataBridge() {
  const dashboard = getDashboardData();
  console.log('Dashboard Data:', JSON.stringify(dashboard, null, 2));
  
  const kpis = getKPIs();
  console.log('KPIs:', JSON.stringify(kpis, null, 2));
  
  const channels = getChannelDistribution();
  console.log('Channels:', JSON.stringify(channels, null, 2));
}
