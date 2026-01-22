/**
 * ROWS.COM Unified Client
 * Bidirectional sync for ORBICITY System
 *
 * ROWS.COM = Central Data Hub
 * - READ: OtelMS data, Finance analytics
 * - WRITE: Logistics data, Activity logs
 */

const ROWS_API_BASE = 'https://api.rows.com/v1';

// Configuration from environment
const getConfig = () => ({
  apiKey: process.env.ROWS_API_KEY || '',
  spreadsheetId: process.env.ROWS_SPREADSHEET_ID || '',
  tableIds: {
    // OtelMS tables (READ - populated by Python scraper)
    calendar: process.env.ROWS_CALENDAR_TABLE_ID || '',
    status: process.env.ROWS_STATUS_TABLE_ID || '',
    rlistCreated: process.env.ROWS_RLIST_CREATED_TABLE_ID || '',
    rlistCheckin: process.env.ROWS_RLIST_CHECKIN_TABLE_ID || '',
    rlistStayDays: process.env.ROWS_RLIST_CHECKOUT_TABLE_ID || '',

    // Logistics tables (WRITE - from app)
    inventory: process.env.ROWS_INVENTORY_TABLE_ID || '',
    housekeeping: process.env.ROWS_HOUSEKEEPING_TABLE_ID || '',
    maintenance: process.env.ROWS_MAINTENANCE_TABLE_ID || '',
    activityLog: process.env.ROWS_ACTIVITY_TABLE_ID || '',

    // Finance tables (READ/WRITE)
    financeSummary: process.env.ROWS_FINANCE_SUMMARY_TABLE_ID || '',
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function columnLetter(n: number): string {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result || 'A';
}

function getHeaders() {
  const config = getConfig();
  return {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

// ============================================
// CORE API FUNCTIONS
// ============================================

/**
 * Read data from a ROWS.COM table
 */
export async function readFromRows(tableId: string, range?: string): Promise<any[][]> {
  const config = getConfig();

  if (!config.apiKey || !config.spreadsheetId) {
    console.warn('[ROWS] API not configured, skipping read');
    return [];
  }

  if (!tableId) {
    console.warn('[ROWS] Table ID not provided');
    return [];
  }

  try {
    const url = range
      ? `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}/tables/${tableId}/values/${encodeURIComponent(range)}`
      : `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}/tables/${tableId}/values`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` }
    });

    if (!response.ok) {
      console.error(`[ROWS] Read failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('[ROWS] Read error:', error);
    return [];
  }
}

/**
 * Append rows to a ROWS.COM table
 */
export async function appendToRows(tableId: string, rows: any[][]): Promise<boolean> {
  const config = getConfig();

  if (!config.apiKey || !config.spreadsheetId) {
    console.warn('[ROWS] API not configured, skipping write');
    return false;
  }

  if (!tableId) {
    console.warn('[ROWS] Table ID not provided');
    return false;
  }

  if (!rows || rows.length === 0) {
    return true; // Nothing to write
  }

  try {
    const width = Math.max(...rows.map(r => r.length));
    const range = `A:${columnLetter(width)}`;

    const url = `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}/tables/${tableId}/values/${encodeURIComponent(range)}:append`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ values: rows })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ROWS] Append failed: ${response.status} - ${errorText}`);
      return false;
    }

    console.log(`[ROWS] Successfully appended ${rows.length} rows to table ${tableId}`);
    return true;
  } catch (error) {
    console.error('[ROWS] Append error:', error);
    return false;
  }
}

// ============================================
// LOGISTICS WRITE FUNCTIONS
// ============================================

export interface InventorySyncData {
  roomNumber: string;
  itemName: string;
  category: string;
  quantity: number;
  condition: string;
  notes?: string;
  updatedBy: string;
}

export async function syncInventoryToRows(data: InventorySyncData): Promise<boolean> {
  const config = getConfig();
  const row = [
    data.roomNumber,
    data.itemName,
    data.category,
    data.quantity.toString(),
    data.condition,
    new Date().toISOString(),
    data.notes || '',
    data.updatedBy,
  ];

  return appendToRows(config.tableIds.inventory, [row]);
}

export interface HousekeepingSyncData {
  roomNumbers: string[];
  scheduledDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  cleanerName?: string;
  notes?: string;
  mediaUrl?: string;
}

export async function syncHousekeepingToRows(data: HousekeepingSyncData): Promise<boolean> {
  const config = getConfig();
  const row = [
    data.roomNumbers.join(', '),
    data.scheduledDate,
    data.status,
    data.completedAt || '',
    data.cleanerName || '',
    data.notes || '',
    data.mediaUrl || '',
    new Date().toISOString(),
  ];

  return appendToRows(config.tableIds.housekeeping, [row]);
}

export interface MaintenanceSyncData {
  roomNumber: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  cost?: number;
  technician?: string;
  completedAt?: string;
}

export async function syncMaintenanceToRows(data: MaintenanceSyncData): Promise<boolean> {
  const config = getConfig();
  const row = [
    data.roomNumber,
    data.issue,
    data.priority,
    data.status,
    data.cost?.toString() || '',
    new Date().toISOString(),
    data.completedAt || '',
    data.technician || '',
  ];

  return appendToRows(config.tableIds.maintenance, [row]);
}

export interface ActivityLogData {
  userEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: object;
}

export async function logActivityToRows(data: ActivityLogData): Promise<boolean> {
  const config = getConfig();
  const row = [
    new Date().toISOString(),
    data.userEmail,
    data.action,
    data.entityType,
    data.entityId || '',
    data.entityName || '',
    JSON.stringify(data.changes || {}),
  ];

  return appendToRows(config.tableIds.activityLog, [row]);
}

// ============================================
// OTELMS READ FUNCTIONS
// ============================================

export interface OtelmsBooking {
  bookingId: string;
  guestName: string;
  room: string;
  source: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  balance: number;
  status: string;
  extractedAt: string;
}

export async function getCalendarBookings(): Promise<OtelmsBooking[]> {
  const config = getConfig();
  const rows = await readFromRows(config.tableIds.calendar);

  // Skip header row if present
  const dataRows = rows.length > 0 && rows[0][0] === 'booking_id' ? rows.slice(1) : rows;

  return dataRows.map(row => ({
    bookingId: row[0] || '',
    guestName: row[1] || '',
    source: row[2] || '',
    balance: parseFloat(row[3]) || 0,
    status: row[4] || '',
    room: row[5] || '', // resid
    checkIn: row[6] || '',
    checkOut: row[7] || '',
    amount: 0, // Not in calendar scrape
    extractedAt: row[10] || '',
  }));
}

export interface DailyStatusItem {
  bookingId: string;
  room: string;
  column: string; // arrival/departure
  text: string;
  extractedAt: string;
}

export async function getDailyStatus(): Promise<DailyStatusItem[]> {
  const config = getConfig();
  const rows = await readFromRows(config.tableIds.status);

  const dataRows = rows.length > 0 && rows[0][0] === 'booking_id' ? rows.slice(1) : rows;

  return dataRows.map(row => ({
    bookingId: row[0] || '',
    room: row[1] || '',
    column: row[2] || '',
    href: row[3] || '',
    text: row[4] || '',
    extractedAt: row[5] || '',
  }));
}

export interface RListBooking {
  room: string;
  guest: string;
  source: string;
  checkIn: string;
  nights: number;
  checkOut: string;
  amount: number;
  paid: number;
  balance: number;
  createdAt: string;
  rangeStart: string;
  rangeEnd: string;
  extractedAt: string;
}

export async function getRListBookings(sortType: 'created' | 'checkin' | 'staydays' = 'created'): Promise<RListBooking[]> {
  const config = getConfig();
  const tableId = {
    created: config.tableIds.rlistCreated,
    checkin: config.tableIds.rlistCheckin,
    staydays: config.tableIds.rlistStayDays,
  }[sortType];

  const rows = await readFromRows(tableId);
  const dataRows = rows.length > 0 && rows[0][0] === 'room' ? rows.slice(1) : rows;

  return dataRows.map(row => ({
    room: row[0] || '',
    guest: row[1] || '',
    source: row[2] || '',
    checkIn: row[3] || '',
    nights: parseInt(row[4]) || 0,
    checkOut: row[5] || '',
    amount: parseFloat(row[6]) || 0,
    paid: parseFloat(row[7]) || 0,
    balance: parseFloat(row[8]) || 0,
    createdAt: row[9] || '',
    rangeStart: row[10] || '',
    rangeEnd: row[11] || '',
    extractedAt: row[12] || '',
  }));
}

// ============================================
// FINANCE FUNCTIONS
// ============================================

export interface FinanceSummary {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  occupancy: number;
  adr: number;
  revpar: number;
}

export async function getFinanceSummary(): Promise<FinanceSummary[]> {
  const config = getConfig();
  const rows = await readFromRows(config.tableIds.financeSummary);

  const dataRows = rows.length > 0 && rows[0][0] === 'month' ? rows.slice(1) : rows;

  return dataRows.map(row => ({
    month: parseInt(row[0]) || 0,
    year: parseInt(row[1]) || 0,
    revenue: parseFloat(row[2]) || 0,
    expenses: parseFloat(row[3]) || 0,
    profit: parseFloat(row[4]) || 0,
    occupancy: parseFloat(row[5]) || 0,
    adr: parseFloat(row[6]) || 0,
    revpar: parseFloat(row[7]) || 0,
  }));
}

export async function appendFinanceSummary(data: FinanceSummary): Promise<boolean> {
  const config = getConfig();
  const row = [
    data.month.toString(),
    data.year.toString(),
    data.revenue.toString(),
    data.expenses.toString(),
    data.profit.toString(),
    data.occupancy.toString(),
    data.adr.toString(),
    data.revpar.toString(),
    new Date().toISOString(),
  ];

  return appendToRows(config.tableIds.financeSummary, [row]);
}

// ============================================
// AGGREGATION FUNCTIONS
// ============================================

/**
 * Calculate revenue from RList bookings
 */
export async function calculateRevenueFromRows(
  startDate: string,
  endDate: string
): Promise<{
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  bySource: Record<string, number>;
}> {
  const bookings = await getRListBookings('created');

  const filtered = bookings.filter(b => {
    const checkIn = new Date(b.checkIn);
    return checkIn >= new Date(startDate) && checkIn <= new Date(endDate);
  });

  const bySource: Record<string, number> = {};
  let totalRevenue = 0;

  for (const booking of filtered) {
    totalRevenue += booking.amount;
    bySource[booking.source] = (bySource[booking.source] || 0) + booking.amount;
  }

  return {
    totalRevenue,
    totalBookings: filtered.length,
    averageBookingValue: filtered.length > 0 ? totalRevenue / filtered.length : 0,
    bySource,
  };
}

/**
 * Get today's arrivals and departures
 */
export async function getTodayOperations(): Promise<{
  arrivals: DailyStatusItem[];
  departures: DailyStatusItem[];
}> {
  const status = await getDailyStatus();

  return {
    arrivals: status.filter(s => s.column.toLowerCase().includes('arrival') || s.column.includes('შემოსვლა')),
    departures: status.filter(s => s.column.toLowerCase().includes('departure') || s.column.includes('გასვლა')),
  };
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkRowsConnection(): Promise<{
  connected: boolean;
  spreadsheetId: string;
  tablesConfigured: string[];
  error?: string;
}> {
  const config = getConfig();

  if (!config.apiKey || !config.spreadsheetId) {
    return {
      connected: false,
      spreadsheetId: '',
      tablesConfigured: [],
      error: 'ROWS_API_KEY or ROWS_SPREADSHEET_ID not configured'
    };
  }

  try {
    const url = `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` }
    });

    if (!response.ok) {
      return {
        connected: false,
        spreadsheetId: config.spreadsheetId,
        tablesConfigured: [],
        error: `API returned ${response.status}`
      };
    }

    const configuredTables = Object.entries(config.tableIds)
      .filter(([_, id]) => id)
      .map(([name]) => name);

    return {
      connected: true,
      spreadsheetId: config.spreadsheetId,
      tablesConfigured: configuredTables,
    };
  } catch (error) {
    return {
      connected: false,
      spreadsheetId: config.spreadsheetId,
      tablesConfigured: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
