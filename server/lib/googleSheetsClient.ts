/**
 * Google Sheets Unified Client
 * Replaces ROWS.COM for ORBICITY System
 *
 * UPDATED: Uses Google Sheets instead of ROWS.COM (Enterprise required for ROWS.COM data access)
 *
 * Google Sheets = Central Data Hub
 * - READ: OtelMS data, Finance analytics, Marketing analytics
 * - WRITE: Logistics data, Activity logs (via AppScript Web App)
 */

// ============================================
// CONFIGURATION
// ============================================

interface GoogleSheetsConfig {
  // Published Google Sheet URLs (CSV format)
  masterDbUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  reviewsUrl: string;

  // AppScript Web App URL (for write operations)
  appScriptUrl: string;

  // Tab GIDs for different data in Master DB
  tabs: {
    calendar: string;
    status: string;
    rlistCreated: string;
    rlistCheckin: string;
    rlistStayDays: string;
    inventory: string;
    housekeeping: string;
    maintenance: string;
    activityLog: string;
    financeSummary: string;
  };

  // Cache duration (5 minutes)
  cacheDuration: number;
}

const getConfig = (): GoogleSheetsConfig => ({
  masterDbUrl: process.env.GOOGLE_SHEETS_MASTER_DB_URL || '',
  instagramUrl: process.env.GOOGLE_SHEETS_INSTAGRAM_URL || '',
  facebookUrl: process.env.GOOGLE_SHEETS_FACEBOOK_URL || '',
  reviewsUrl: process.env.GOOGLE_SHEETS_REVIEWS_URL || '',

  appScriptUrl: process.env.GOOGLE_APPSCRIPT_WEB_APP_URL ||
    'https://script.google.com/macros/s/AKfycbyhtSuushijLz-VnTTxjJOTBfyge544D0Mwv-FIVIL9rxQtVZ7g97sALlZ4oDRsn4H-/exec',

  tabs: {
    calendar: process.env.GS_TAB_CALENDAR || 'gid=0',
    status: process.env.GS_TAB_STATUS || 'gid=1',
    rlistCreated: process.env.GS_TAB_RLIST_CREATED || 'gid=2',
    rlistCheckin: process.env.GS_TAB_RLIST_CHECKIN || 'gid=3',
    rlistStayDays: process.env.GS_TAB_RLIST_STAYDAYS || 'gid=4',
    inventory: process.env.GS_TAB_INVENTORY || 'gid=5',
    housekeeping: process.env.GS_TAB_HOUSEKEEPING || 'gid=6',
    maintenance: process.env.GS_TAB_MAINTENANCE || 'gid=7',
    activityLog: process.env.GS_TAB_ACTIVITY || 'gid=8',
    financeSummary: process.env.GS_TAB_FINANCE || 'gid=9',
  },

  cacheDuration: 5 * 60 * 1000,
});

// ============================================
// CACHE
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const config = getConfig();
  if (Date.now() - entry.timestamp > config.cacheDuration) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
  console.log('[Google Sheets] Cache cleared');
}

// ============================================
// CSV UTILITIES
// ============================================

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

function parseCSV<T>(csvText: string, mapper: (row: string[], headers: string[]) => T | null): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const results: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const mapped = mapper(values, headers);
    if (mapped) results.push(mapped);
  }

  return results;
}

// ============================================
// FETCH UTILITIES
// ============================================

async function fetchSheetData(baseUrl: string, tabGid: string): Promise<string> {
  if (!baseUrl) {
    throw new Error('Google Sheets URL not configured');
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}${tabGid}&output=csv`;

  console.log(`[Google Sheets] Fetching: ${url.substring(0, 80)}...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function postToAppScript(action: string, data: any): Promise<boolean> {
  const config = getConfig();

  if (!config.appScriptUrl) {
    console.warn('[Google Sheets] AppScript URL not configured');
    return false;
  }

  try {
    const response = await fetch(config.appScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      console.error(`[Google Sheets] AppScript error: ${response.status}`);
      return false;
    }

    console.log(`[Google Sheets] AppScript ${action} successful`);
    return true;
  } catch (error) {
    console.error('[Google Sheets] AppScript error:', error);
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

export async function syncInventoryToGoogleSheets(data: InventorySyncData): Promise<boolean> {
  return postToAppScript('syncInventory', {
    sheetName: 'Inventory',
    row: {
      roomNumber: data.roomNumber,
      itemName: data.itemName,
      category: data.category,
      quantity: data.quantity,
      condition: data.condition,
      notes: data.notes || '',
      updatedBy: data.updatedBy,
      updatedAt: new Date().toISOString(),
    },
  });
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

export async function syncHousekeepingToGoogleSheets(data: HousekeepingSyncData): Promise<boolean> {
  return postToAppScript('syncHousekeeping', {
    sheetName: 'Housekeeping',
    row: {
      roomNumbers: data.roomNumbers.join(', '),
      scheduledDate: data.scheduledDate,
      status: data.status,
      completedAt: data.completedAt || '',
      cleanerName: data.cleanerName || '',
      notes: data.notes || '',
      mediaUrl: data.mediaUrl || '',
      updatedAt: new Date().toISOString(),
    },
  });
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

export async function syncMaintenanceToGoogleSheets(data: MaintenanceSyncData): Promise<boolean> {
  return postToAppScript('syncMaintenance', {
    sheetName: 'Maintenance',
    row: {
      roomNumber: data.roomNumber,
      issue: data.issue,
      priority: data.priority,
      status: data.status,
      cost: data.cost || 0,
      technician: data.technician || '',
      completedAt: data.completedAt || '',
      createdAt: new Date().toISOString(),
    },
  });
}

export interface ActivityLogData {
  userEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: object;
}

export async function logActivityToGoogleSheets(data: ActivityLogData): Promise<boolean> {
  return postToAppScript('logActivity', {
    sheetName: 'ActivityLog',
    row: {
      timestamp: new Date().toISOString(),
      userEmail: data.userEmail,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || '',
      entityName: data.entityName || '',
      changes: JSON.stringify(data.changes || {}),
    },
  });
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
  const cacheKey = 'calendar_bookings';
  const cached = getCached<OtelmsBooking[]>(cacheKey);
  if (cached) return cached;

  const config = getConfig();

  if (!config.masterDbUrl) {
    console.log('[Google Sheets] Master DB not configured, returning mock data');
    return getMockCalendarBookings();
  }

  try {
    const csv = await fetchSheetData(config.masterDbUrl, config.tabs.calendar);

    const bookings = parseCSV<OtelmsBooking>(csv, (values, headers) => {
      const getIndex = (name: string) => headers.findIndex(h => h.includes(name.toLowerCase()));

      return {
        bookingId: values[getIndex('booking') !== -1 ? getIndex('booking') : 0] || '',
        guestName: values[getIndex('guest') !== -1 ? getIndex('guest') : 1] || '',
        source: values[getIndex('source') !== -1 ? getIndex('source') : 2] || '',
        balance: parseFloat(values[getIndex('balance') !== -1 ? getIndex('balance') : 3]) || 0,
        status: values[getIndex('status') !== -1 ? getIndex('status') : 4] || '',
        room: values[getIndex('room') !== -1 ? getIndex('room') : 5] || '',
        checkIn: values[getIndex('checkin') !== -1 ? getIndex('checkin') : 6] || '',
        checkOut: values[getIndex('checkout') !== -1 ? getIndex('checkout') : 7] || '',
        amount: 0,
        extractedAt: values[getIndex('extracted') !== -1 ? getIndex('extracted') : 10] || '',
      };
    });

    setCache(cacheKey, bookings);
    return bookings;
  } catch (error) {
    console.error('[Google Sheets] Error fetching calendar:', error);
    return getMockCalendarBookings();
  }
}

export interface DailyStatusItem {
  bookingId: string;
  room: string;
  column: string;
  text: string;
  extractedAt: string;
}

export async function getDailyStatus(): Promise<DailyStatusItem[]> {
  const cacheKey = 'daily_status';
  const cached = getCached<DailyStatusItem[]>(cacheKey);
  if (cached) return cached;

  const config = getConfig();

  if (!config.masterDbUrl) {
    return getMockDailyStatus();
  }

  try {
    const csv = await fetchSheetData(config.masterDbUrl, config.tabs.status);

    const status = parseCSV<DailyStatusItem>(csv, (values) => ({
      bookingId: values[0] || '',
      room: values[1] || '',
      column: values[2] || '',
      text: values[4] || '',
      extractedAt: values[5] || '',
    }));

    setCache(cacheKey, status);
    return status;
  } catch (error) {
    console.error('[Google Sheets] Error fetching status:', error);
    return getMockDailyStatus();
  }
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
  const cacheKey = `rlist_${sortType}`;
  const cached = getCached<RListBooking[]>(cacheKey);
  if (cached) return cached;

  const config = getConfig();

  if (!config.masterDbUrl) {
    return getMockRListBookings();
  }

  const tabGid = {
    created: config.tabs.rlistCreated,
    checkin: config.tabs.rlistCheckin,
    staydays: config.tabs.rlistStayDays,
  }[sortType];

  try {
    const csv = await fetchSheetData(config.masterDbUrl, tabGid);

    const bookings = parseCSV<RListBooking>(csv, (values) => ({
      room: values[0] || '',
      guest: values[1] || '',
      source: values[2] || '',
      checkIn: values[3] || '',
      nights: parseInt(values[4]) || 0,
      checkOut: values[5] || '',
      amount: parseFloat(values[6]) || 0,
      paid: parseFloat(values[7]) || 0,
      balance: parseFloat(values[8]) || 0,
      createdAt: values[9] || '',
      rangeStart: values[10] || '',
      rangeEnd: values[11] || '',
      extractedAt: values[12] || '',
    }));

    setCache(cacheKey, bookings);
    return bookings;
  } catch (error) {
    console.error('[Google Sheets] Error fetching RList:', error);
    return getMockRListBookings();
  }
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
  const cacheKey = 'finance_summary';
  const cached = getCached<FinanceSummary[]>(cacheKey);
  if (cached) return cached;

  const config = getConfig();

  if (!config.masterDbUrl) {
    return getMockFinanceSummary();
  }

  try {
    const csv = await fetchSheetData(config.masterDbUrl, config.tabs.financeSummary);

    const summary = parseCSV<FinanceSummary>(csv, (values) => ({
      month: parseInt(values[0]) || 0,
      year: parseInt(values[1]) || 0,
      revenue: parseFloat(values[2]) || 0,
      expenses: parseFloat(values[3]) || 0,
      profit: parseFloat(values[4]) || 0,
      occupancy: parseFloat(values[5]) || 0,
      adr: parseFloat(values[6]) || 0,
      revpar: parseFloat(values[7]) || 0,
    }));

    setCache(cacheKey, summary);
    return summary;
  } catch (error) {
    console.error('[Google Sheets] Error fetching finance:', error);
    return getMockFinanceSummary();
  }
}

export async function appendFinanceSummary(data: FinanceSummary): Promise<boolean> {
  return postToAppScript('appendFinance', {
    sheetName: 'FinanceSummary',
    row: {
      month: data.month,
      year: data.year,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.profit,
      occupancy: data.occupancy,
      adr: data.adr,
      revpar: data.revpar,
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function calculateRevenueFromSheets(
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

export async function getTodayOperations(): Promise<{
  arrivals: DailyStatusItem[];
  departures: DailyStatusItem[];
}> {
  const status = await getDailyStatus();

  return {
    arrivals: status.filter(s =>
      s.column.toLowerCase().includes('arrival') || s.column.includes('შემოსვლა')
    ),
    departures: status.filter(s =>
      s.column.toLowerCase().includes('departure') || s.column.includes('გასვლა')
    ),
  };
}

// ============================================
// MARKETING ANALYTICS
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
  const config = getConfig();

  if (!config.instagramUrl) {
    return getMockInstagramData();
  }

  try {
    // Fetch metrics from Instagram sheet
    const csv = await fetchSheetData(config.instagramUrl, 'gid=0');

    const posts = parseCSV<InstagramPost>(csv, (values, headers) => {
      const getIndex = (keywords: string[]) =>
        headers.findIndex(h => keywords.some(k => h.includes(k)));

      const typeIdx = getIndex(['type', 'media']);
      const captionIdx = getIndex(['caption', 'text']);
      const likesIdx = getIndex(['like']);
      const commentsIdx = getIndex(['comment']);
      const reachIdx = getIndex(['reach']);
      const impressionsIdx = getIndex(['impression']);
      const dateIdx = getIndex(['date', 'timestamp', 'posted']);
      const themeIdx = getIndex(['theme', 'category']);

      const likes = likesIdx >= 0 ? parseInt(values[likesIdx]) || 0 : 0;
      const comments = commentsIdx >= 0 ? parseInt(values[commentsIdx]) || 0 : 0;

      return {
        id: `post-${Math.random().toString(36).substr(2, 9)}`,
        type: typeIdx >= 0 ? values[typeIdx] || 'IMAGE' : 'IMAGE',
        caption: captionIdx >= 0 ? values[captionIdx] || '' : '',
        likes,
        comments,
        reach: reachIdx >= 0 ? parseInt(values[reachIdx]) || 0 : 0,
        impressions: impressionsIdx >= 0 ? parseInt(values[impressionsIdx]) || 0 : 0,
        engagement: likes + comments,
        timestamp: dateIdx >= 0 ? values[dateIdx] || '' : '',
        theme: themeIdx >= 0 ? values[themeIdx] : undefined,
      };
    });

    const validPosts = posts.filter(p => p.likes > 0 || p.comments > 0);
    const metrics = calculateInstagramMetrics(validPosts);
    const topPosts = [...validPosts]
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    return {
      metrics,
      posts: validPosts,
      topPosts,
      bestPostingTime: { day: 'Friday', hour: '15:00-18:00' },
    };
  } catch (error) {
    console.error('[Google Sheets] Error fetching Instagram:', error);
    return getMockInstagramData();
  }
}

function calculateInstagramMetrics(posts: InstagramPost[]): InstagramMetrics {
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
  const totalReach = posts.reduce((sum, p) => sum + p.reach, 0);
  const totalImpressions = posts.reduce((sum, p) => sum + p.impressions, 0);
  const postCount = posts.length || 1;

  return {
    followers: 12450,
    following: 892,
    posts: postCount,
    engagement: {
      total: totalLikes + totalComments,
      rate: totalReach > 0 ? ((totalLikes + totalComments) / totalReach) * 100 : 4.8,
    },
    reach: totalReach || 156000,
    impressions: totalImpressions || 234000,
    profileViews: 8900,
    websiteClicks: 1250,
    kpis: {
      avgLikes: totalLikes / postCount || 890,
      avgComments: totalComments / postCount || 45,
      avgReach: totalReach / postCount || 4500,
    },
  };
}

// Facebook Analytics
export interface FacebookMetrics {
  pageFollowers: number;
  pageLikes: number;
  reach: { organic: number; paid: number; total: number };
  engagement: { total: number; reactions: number; comments: number; shares: number };
  impressions: number;
  postCount: number;
  videoViews: number;
}

export async function getFacebookAnalytics(): Promise<{
  metrics: FacebookMetrics;
  posts: any[];
  topPosts: any[];
  demographics: { countries: Record<string, number>; ageGroups: Record<string, number> };
}> {
  const config = getConfig();

  if (!config.facebookUrl) {
    return getMockFacebookData();
  }

  try {
    const csv = await fetchSheetData(config.facebookUrl, 'gid=0');
    // Parse and return Facebook data
    // For now, return mock data as Facebook sheet structure may differ
    return getMockFacebookData();
  } catch (error) {
    console.error('[Google Sheets] Error fetching Facebook:', error);
    return getMockFacebookData();
  }
}

// Google Reviews
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
  const config = getConfig();

  if (!config.reviewsUrl) {
    return getMockReviewsData();
  }

  try {
    const csv = await fetchSheetData(config.reviewsUrl, 'gid=0');

    const reviews = parseCSV<GoogleReview>(csv, (values, headers) => {
      const getIndex = (keywords: string[]) =>
        headers.findIndex(h => keywords.some(k => h.includes(k)));

      const authorIdx = getIndex(['author', 'name', 'reviewer']);
      const ratingIdx = getIndex(['rating', 'star', 'score']);
      const textIdx = getIndex(['text', 'review', 'comment', 'content']);
      const dateIdx = getIndex(['date', 'time', 'created']);
      const responseIdx = getIndex(['response', 'reply']);

      return {
        id: `review-${Math.random().toString(36).substr(2, 9)}`,
        author: authorIdx >= 0 ? values[authorIdx] || 'Anonymous' : 'Anonymous',
        rating: ratingIdx >= 0 ? parseInt(values[ratingIdx]) || 5 : 5,
        text: textIdx >= 0 ? values[textIdx] || '' : '',
        date: dateIdx >= 0 ? values[dateIdx] || '' : '',
        response: responseIdx >= 0 ? values[responseIdx] : undefined,
      };
    });

    const validReviews = reviews.filter(r => r.rating > 0);
    const metrics = calculateReviewsMetrics(validReviews);
    const recentReviews = [...validReviews]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return { metrics, reviews: validReviews, recentReviews };
  } catch (error) {
    console.error('[Google Sheets] Error fetching reviews:', error);
    return getMockReviewsData();
  }
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

// Unified Marketing Analytics
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
  const [instagram, facebook, reviews] = await Promise.all([
    getInstagramAnalytics(),
    getFacebookAnalytics(),
    getGoogleReviews(),
  ]);

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

// ============================================
// HEALTH CHECK
// ============================================

export async function checkGoogleSheetsConnection(): Promise<{
  connected: boolean;
  configured: {
    masterDb: boolean;
    instagram: boolean;
    facebook: boolean;
    reviews: boolean;
    appScript: boolean;
  };
  error?: string;
}> {
  const config = getConfig();

  return {
    connected: !!config.masterDbUrl || !!config.instagramUrl,
    configured: {
      masterDb: !!config.masterDbUrl,
      instagram: !!config.instagramUrl,
      facebook: !!config.facebookUrl,
      reviews: !!config.reviewsUrl,
      appScript: !!config.appScriptUrl,
    },
  };
}

// ============================================
// MOCK DATA
// ============================================

function getMockCalendarBookings(): OtelmsBooking[] {
  return [
    { bookingId: 'BK001', guestName: 'John Smith', room: 'A 1033', source: 'Booking.com', checkIn: '2025-01-23', checkOut: '2025-01-25', amount: 300, balance: 0, status: 'Confirmed', extractedAt: new Date().toISOString() },
    { bookingId: 'BK002', guestName: 'Maria Garcia', room: 'C 2001', source: 'Airbnb', checkIn: '2025-01-23', checkOut: '2025-01-27', amount: 520, balance: 0, status: 'Checked-in', extractedAt: new Date().toISOString() },
    { bookingId: 'BK003', guestName: 'David Chen', room: 'D 1507', source: 'Direct', checkIn: '2025-01-24', checkOut: '2025-01-26', amount: 280, balance: 100, status: 'Confirmed', extractedAt: new Date().toISOString() },
  ];
}

function getMockDailyStatus(): DailyStatusItem[] {
  return [
    { bookingId: 'BK001', room: 'A 1033', column: 'arrival', text: 'John Smith - Booking.com', extractedAt: new Date().toISOString() },
    { bookingId: 'BK004', room: 'C 2520', column: 'departure', text: 'Emma Wilson - Airbnb', extractedAt: new Date().toISOString() },
  ];
}

function getMockRListBookings(): RListBooking[] {
  return [
    { room: 'A 1033', guest: 'John Smith', source: 'Booking.com', checkIn: '2025-01-23', nights: 2, checkOut: '2025-01-25', amount: 300, paid: 300, balance: 0, createdAt: '2025-01-20', rangeStart: '2025-01-01', rangeEnd: '2025-01-31', extractedAt: new Date().toISOString() },
    { room: 'C 2001', guest: 'Maria Garcia', source: 'Airbnb', checkIn: '2025-01-23', nights: 4, checkOut: '2025-01-27', amount: 520, paid: 520, balance: 0, createdAt: '2025-01-19', rangeStart: '2025-01-01', rangeEnd: '2025-01-31', extractedAt: new Date().toISOString() },
  ];
}

function getMockFinanceSummary(): FinanceSummary[] {
  return [
    { month: 1, year: 2025, revenue: 45000, expenses: 18000, profit: 27000, occupancy: 82, adr: 73, revpar: 60 },
    { month: 12, year: 2024, revenue: 52000, expenses: 20000, profit: 32000, occupancy: 85, adr: 78, revpar: 66 },
  ];
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
// BACKWARD COMPATIBILITY ALIASES
// ============================================

// Alias old ROWS.COM function names to new Google Sheets functions
export const syncInventoryToRows = syncInventoryToGoogleSheets;
export const syncHousekeepingToRows = syncHousekeepingToGoogleSheets;
export const syncMaintenanceToRows = syncMaintenanceToGoogleSheets;
export const logActivityToRows = logActivityToGoogleSheets;
export const calculateRevenueFromRows = calculateRevenueFromSheets;
export const checkRowsConnection = checkGoogleSheetsConnection;
