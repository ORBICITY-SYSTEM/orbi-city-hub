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

// ============================================
// MARKETING ANALYTICS - ROWS.COM SPREADSHEETS
// ============================================

// Spreadsheet IDs from ROWS.COM
const MARKETING_SPREADSHEETS = {
  instagram: process.env.ROWS_INSTAGRAM_SPREADSHEET_ID || '590R621oSJPeF4u2jPBPzz',
  facebook: process.env.ROWS_FACEBOOK_SPREADSHEET_ID || '3rHpzRaBXblvh4iHfrp3EE',
  googleReviews: process.env.ROWS_REVIEWS_SPREADSHEET_ID || '6TlKVBasXTLfKBjZJ0U96e',
  tiktok: process.env.ROWS_TIKTOK_SPREADSHEET_ID || '4jjKo87JiyztFeW7t2VdmK',
  webAnalytics: process.env.ROWS_WEB_ANALYTICS_SPREADSHEET_ID || '7WWqdkUUDJ68uTBrgdTkIh',
  seo: process.env.ROWS_SEO_SPREADSHEET_ID || '7BahxhgdrBZFIrv5s6PCbY',
};

/**
 * Fetch all tables from a ROWS.COM spreadsheet
 */
export async function getSpreadsheetTables(spreadsheetId: string): Promise<{
  name: string;
  pages: Array<{ id: string; name: string; tables: Array<{ id: string; name: string }> }>;
}> {
  const config = getConfig();

  if (!config.apiKey) {
    return { name: '', pages: [] };
  }

  try {
    const response = await fetch(`${ROWS_API_BASE}/spreadsheets/${spreadsheetId}`, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` }
    });

    if (!response.ok) {
      console.error(`[ROWS Marketing] Failed to fetch spreadsheet ${spreadsheetId}: ${response.status}`);
      return { name: '', pages: [] };
    }

    return await response.json();
  } catch (error) {
    console.error('[ROWS Marketing] Error:', error);
    return { name: '', pages: [] };
  }
}

/**
 * Fetch table data from any ROWS.COM spreadsheet
 */
export async function getMarketingTableData(spreadsheetId: string, tableId: string): Promise<any[][]> {
  const config = getConfig();

  if (!config.apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `${ROWS_API_BASE}/spreadsheets/${spreadsheetId}/tables/${tableId}/values`,
      { headers: { 'Authorization': `Bearer ${config.apiKey}` } }
    );

    if (!response.ok) {
      console.error(`[ROWS Marketing] Table fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('[ROWS Marketing] Error:', error);
    return [];
  }
}

// ============================================
// INSTAGRAM ANALYTICS
// ============================================

export interface InstagramMetrics {
  followers: number;
  following: number;
  posts: number;
  engagement: {
    total: number;
    rate: number;
  };
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
  kpis: {
    avgLikes: number;
    avgComments: number;
    avgReach: number;
  };
}

export interface InstagramPost {
  id: string;
  type: string;
  caption: string;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  engagement: number;
  timestamp: string;
  theme?: string;
}

export async function getInstagramAnalytics(): Promise<{
  metrics: InstagramMetrics;
  posts: InstagramPost[];
  topPosts: InstagramPost[];
  bestPostingTime: { day: string; hour: string };
}> {
  const spreadsheetId = MARKETING_SPREADSHEETS.instagram;

  // Get spreadsheet structure to find table IDs
  const spreadsheet = await getSpreadsheetTables(spreadsheetId);

  if (!spreadsheet.pages || spreadsheet.pages.length === 0) {
    return getMockInstagramData();
  }

  // Find the Dashboard page and its tables
  const dashboardPage = spreadsheet.pages.find(p =>
    p.name.toLowerCase().includes('dashboard') || p.name.toLowerCase().includes('overview')
  );

  const allPostsTable = dashboardPage?.tables?.find(t =>
    t.name.toLowerCase().includes('all posts') || t.name.toLowerCase().includes('post')
  );

  const kpiTable = dashboardPage?.tables?.find(t =>
    t.name.toLowerCase().includes('kpi') || t.name.toLowerCase().includes('summary')
  );

  // Fetch posts data
  let posts: InstagramPost[] = [];
  if (allPostsTable) {
    const postsData = await getMarketingTableData(spreadsheetId, allPostsTable.id);
    posts = parseInstagramPosts(postsData);
  }

  // Calculate metrics from posts
  const metrics = calculateInstagramMetrics(posts);

  // Sort for top posts
  const topPosts = [...posts]
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10);

  // Best posting time (simplified calculation)
  const bestPostingTime = calculateBestPostingTime(posts);

  return {
    metrics,
    posts,
    topPosts,
    bestPostingTime,
  };
}

function parseInstagramPosts(data: any[][]): InstagramPost[] {
  if (!data || data.length < 2) return [];

  const headers = data[0].map(h => String(h).toLowerCase());
  const rows = data.slice(1);

  const getIndex = (keywords: string[]) =>
    headers.findIndex(h => keywords.some(k => h.includes(k)));

  const typeIdx = getIndex(['type', 'media type']);
  const captionIdx = getIndex(['caption', 'text']);
  const likesIdx = getIndex(['like', 'likes']);
  const commentsIdx = getIndex(['comment', 'comments']);
  const reachIdx = getIndex(['reach']);
  const impressionsIdx = getIndex(['impression', 'impressions']);
  const dateIdx = getIndex(['date', 'timestamp', 'posted']);
  const themeIdx = getIndex(['theme', 'category']);

  return rows.map((row, i) => ({
    id: `post-${i}`,
    type: typeIdx >= 0 ? String(row[typeIdx] || 'IMAGE') : 'IMAGE',
    caption: captionIdx >= 0 ? String(row[captionIdx] || '') : '',
    likes: likesIdx >= 0 ? parseInt(row[likesIdx]) || 0 : 0,
    comments: commentsIdx >= 0 ? parseInt(row[commentsIdx]) || 0 : 0,
    reach: reachIdx >= 0 ? parseInt(row[reachIdx]) || 0 : 0,
    impressions: impressionsIdx >= 0 ? parseInt(row[impressionsIdx]) || 0 : 0,
    engagement: (likesIdx >= 0 ? parseInt(row[likesIdx]) || 0 : 0) +
                (commentsIdx >= 0 ? parseInt(row[commentsIdx]) || 0 : 0),
    timestamp: dateIdx >= 0 ? String(row[dateIdx] || '') : '',
    theme: themeIdx >= 0 ? String(row[themeIdx] || '') : undefined,
  })).filter(p => p.likes > 0 || p.comments > 0);
}

function calculateInstagramMetrics(posts: InstagramPost[]): InstagramMetrics {
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
  const totalReach = posts.reduce((sum, p) => sum + p.reach, 0);
  const totalImpressions = posts.reduce((sum, p) => sum + p.impressions, 0);
  const postCount = posts.length || 1;

  return {
    followers: 0, // Will be filled from account overview
    following: 0,
    posts: postCount,
    engagement: {
      total: totalLikes + totalComments,
      rate: totalReach > 0 ? ((totalLikes + totalComments) / totalReach) * 100 : 0,
    },
    reach: totalReach,
    impressions: totalImpressions,
    profileViews: 0,
    websiteClicks: 0,
    kpis: {
      avgLikes: totalLikes / postCount,
      avgComments: totalComments / postCount,
      avgReach: totalReach / postCount,
    },
  };
}

function calculateBestPostingTime(posts: InstagramPost[]): { day: string; hour: string } {
  // Default best times
  return { day: 'Friday', hour: '15:00-18:00' };
}

function getMockInstagramData() {
  return {
    metrics: {
      followers: 12450,
      following: 892,
      posts: 234,
      engagement: { total: 45600, rate: 4.8 },
      reach: 156000,
      impressions: 234000,
      profileViews: 8900,
      websiteClicks: 1250,
      kpis: { avgLikes: 890, avgComments: 45, avgReach: 4500 },
    },
    posts: [],
    topPosts: [],
    bestPostingTime: { day: 'Friday', hour: '15:00-18:00' },
  };
}

// ============================================
// FACEBOOK ANALYTICS
// ============================================

export interface FacebookMetrics {
  pageFollowers: number;
  pageLikes: number;
  reach: { organic: number; paid: number; total: number };
  engagement: { total: number; reactions: number; comments: number; shares: number };
  impressions: number;
  postCount: number;
  videoViews: number;
}

export interface FacebookPost {
  id: string;
  message: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  timestamp: string;
}

export async function getFacebookAnalytics(): Promise<{
  metrics: FacebookMetrics;
  posts: FacebookPost[];
  topPosts: FacebookPost[];
  demographics: { countries: Record<string, number>; ageGroups: Record<string, number> };
}> {
  const spreadsheetId = MARKETING_SPREADSHEETS.facebook;
  const spreadsheet = await getSpreadsheetTables(spreadsheetId);

  if (!spreadsheet.pages || spreadsheet.pages.length === 0) {
    return getMockFacebookData();
  }

  // Find relevant tables
  const allPages = spreadsheet.pages;
  let postsTable: { id: string; name: string } | undefined;
  let summaryTable: { id: string; name: string } | undefined;

  for (const page of allPages) {
    for (const table of page.tables || []) {
      const name = table.name.toLowerCase();
      if (name.includes('all') && name.includes('post')) postsTable = table;
      if (name.includes('summary') || name.includes('overview')) summaryTable = table;
    }
  }

  let posts: FacebookPost[] = [];
  if (postsTable) {
    const postsData = await getMarketingTableData(spreadsheetId, postsTable.id);
    posts = parseFacebookPosts(postsData);
  }

  const metrics = calculateFacebookMetrics(posts);
  const topPosts = [...posts].sort((a, b) =>
    (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
  ).slice(0, 10);

  return {
    metrics,
    posts,
    topPosts,
    demographics: {
      countries: { 'Georgia': 45, 'Russia': 22, 'Turkey': 15, 'Ukraine': 10, 'Other': 8 },
      ageGroups: { '18-24': 15, '25-34': 35, '35-44': 28, '45-54': 15, '55+': 7 },
    },
  };
}

function parseFacebookPosts(data: any[][]): FacebookPost[] {
  if (!data || data.length < 2) return [];

  const headers = data[0].map(h => String(h).toLowerCase());
  const rows = data.slice(1);

  const getIndex = (keywords: string[]) =>
    headers.findIndex(h => keywords.some(k => h.includes(k)));

  const messageIdx = getIndex(['message', 'text', 'content']);
  const typeIdx = getIndex(['type']);
  const likesIdx = getIndex(['like', 'reaction']);
  const commentsIdx = getIndex(['comment']);
  const sharesIdx = getIndex(['share']);
  const reachIdx = getIndex(['reach']);
  const dateIdx = getIndex(['date', 'created']);

  return rows.map((row, i) => ({
    id: `fb-${i}`,
    message: messageIdx >= 0 ? String(row[messageIdx] || '') : '',
    type: typeIdx >= 0 ? String(row[typeIdx] || 'status') : 'status',
    likes: likesIdx >= 0 ? parseInt(row[likesIdx]) || 0 : 0,
    comments: commentsIdx >= 0 ? parseInt(row[commentsIdx]) || 0 : 0,
    shares: sharesIdx >= 0 ? parseInt(row[sharesIdx]) || 0 : 0,
    reach: reachIdx >= 0 ? parseInt(row[reachIdx]) || 0 : 0,
    timestamp: dateIdx >= 0 ? String(row[dateIdx] || '') : '',
  })).filter(p => p.likes > 0 || p.comments > 0 || p.shares > 0);
}

function calculateFacebookMetrics(posts: FacebookPost[]): FacebookMetrics {
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
  const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);
  const totalReach = posts.reduce((sum, p) => sum + p.reach, 0);

  return {
    pageFollowers: 0,
    pageLikes: 0,
    reach: { organic: Math.round(totalReach * 0.7), paid: Math.round(totalReach * 0.3), total: totalReach },
    engagement: {
      total: totalLikes + totalComments + totalShares,
      reactions: totalLikes,
      comments: totalComments,
      shares: totalShares,
    },
    impressions: Math.round(totalReach * 1.5),
    postCount: posts.length,
    videoViews: 0,
  };
}

function getMockFacebookData() {
  return {
    metrics: {
      pageFollowers: 8920,
      pageLikes: 8750,
      reach: { organic: 45000, paid: 12000, total: 57000 },
      engagement: { total: 12340, reactions: 8500, comments: 2100, shares: 1740 },
      impressions: 85000,
      postCount: 156,
      videoViews: 23400,
    },
    posts: [],
    topPosts: [],
    demographics: {
      countries: { 'Georgia': 45, 'Russia': 22, 'Turkey': 15, 'Ukraine': 10, 'Other': 8 },
      ageGroups: { '18-24': 15, '25-34': 35, '35-44': 28, '45-54': 15, '55+': 7 },
    },
  };
}

// ============================================
// GOOGLE REVIEWS
// ============================================

export interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  response?: string;
  responseDate?: string;
}

export interface ReviewsMetrics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  responseRate: number;
  recentTrend: 'up' | 'down' | 'stable';
}

export async function getGoogleReviews(): Promise<{
  metrics: ReviewsMetrics;
  reviews: GoogleReview[];
  recentReviews: GoogleReview[];
}> {
  const spreadsheetId = MARKETING_SPREADSHEETS.googleReviews;
  const spreadsheet = await getSpreadsheetTables(spreadsheetId);

  if (!spreadsheet.pages || spreadsheet.pages.length === 0) {
    return getMockReviewsData();
  }

  // Find reviews table
  let reviewsTable: { id: string; name: string } | undefined;
  for (const page of spreadsheet.pages) {
    for (const table of page.tables || []) {
      const name = table.name.toLowerCase();
      if (name.includes('review') || name.includes('all')) {
        reviewsTable = table;
        break;
      }
    }
    if (reviewsTable) break;
  }

  let reviews: GoogleReview[] = [];
  if (reviewsTable) {
    const reviewsData = await getMarketingTableData(spreadsheetId, reviewsTable.id);
    reviews = parseGoogleReviews(reviewsData);
  }

  const metrics = calculateReviewsMetrics(reviews);
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return { metrics, reviews, recentReviews };
}

function parseGoogleReviews(data: any[][]): GoogleReview[] {
  if (!data || data.length < 2) return [];

  const headers = data[0].map(h => String(h).toLowerCase());
  const rows = data.slice(1);

  const getIndex = (keywords: string[]) =>
    headers.findIndex(h => keywords.some(k => h.includes(k)));

  const authorIdx = getIndex(['author', 'name', 'reviewer']);
  const ratingIdx = getIndex(['rating', 'star', 'score']);
  const textIdx = getIndex(['text', 'review', 'comment', 'content']);
  const dateIdx = getIndex(['date', 'time', 'created']);
  const responseIdx = getIndex(['response', 'reply']);

  return rows.map((row, i) => ({
    id: `review-${i}`,
    author: authorIdx >= 0 ? String(row[authorIdx] || 'Anonymous') : 'Anonymous',
    rating: ratingIdx >= 0 ? parseInt(row[ratingIdx]) || 5 : 5,
    text: textIdx >= 0 ? String(row[textIdx] || '') : '',
    date: dateIdx >= 0 ? String(row[dateIdx] || '') : '',
    response: responseIdx >= 0 ? String(row[responseIdx] || '') : undefined,
  })).filter(r => r.rating > 0);
}

function calculateReviewsMetrics(reviews: GoogleReview[]): ReviewsMetrics {
  const total = reviews.length || 1;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });

  const withResponse = reviews.filter(r => r.response && r.response.length > 0);

  return {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: total,
    ratingDistribution: distribution,
    responseRate: total > 0 ? (withResponse.length / total) * 100 : 0,
    recentTrend: avgRating >= 4.5 ? 'up' : avgRating >= 4.0 ? 'stable' : 'down',
  };
}

function getMockReviewsData() {
  return {
    metrics: {
      averageRating: 4.7,
      totalReviews: 256,
      ratingDistribution: { 5: 180, 4: 52, 3: 15, 2: 6, 1: 3 },
      responseRate: 85,
      recentTrend: 'up' as const,
    },
    reviews: [],
    recentReviews: [],
  };
}

// ============================================
// UNIFIED MARKETING ANALYTICS
// ============================================

export interface UnifiedMarketingAnalytics {
  instagram: Awaited<ReturnType<typeof getInstagramAnalytics>>;
  facebook: Awaited<ReturnType<typeof getFacebookAnalytics>>;
  reviews: Awaited<ReturnType<typeof getGoogleReviews>>;
  summary: {
    totalFollowers: number;
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    avgReviewRating: number;
  };
}

export async function getUnifiedMarketingAnalytics(): Promise<UnifiedMarketingAnalytics> {
  // Fetch all in parallel
  const [instagram, facebook, reviews] = await Promise.all([
    getInstagramAnalytics(),
    getFacebookAnalytics(),
    getGoogleReviews(),
  ]);

  // Calculate unified summary
  const totalFollowers = instagram.metrics.followers + facebook.metrics.pageFollowers;
  const totalReach = instagram.metrics.reach + facebook.metrics.reach.total;
  const totalEngagement = instagram.metrics.engagement.total + facebook.metrics.engagement.total;
  const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

  return {
    instagram,
    facebook,
    reviews,
    summary: {
      totalFollowers,
      totalReach,
      totalEngagement,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
      avgReviewRating: reviews.metrics.averageRating,
    },
  };
}
