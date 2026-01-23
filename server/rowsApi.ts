/**
 * Instagram Analytics API
 *
 * Data Flow Priority:
 * 1. ROWS.COM API (if Enterprise plan available)
 * 2. Google Sheets (synced from ROWS.COM via n8n/automation)
 * 3. Mock data (fallback for demo)
 *
 * ROWS.COM handles Instagram/Facebook integrations,
 * data is synced to Google Sheets for reliable reading.
 */

import {
  getInstagramMetrics as getGoogleSheetsMetrics,
  getInstagramPosts as getGoogleSheetsPosts,
  getInstagramDashboard as getGoogleSheetsDashboard,
  clearCache as clearGoogleSheetsCache,
} from './services/googleSheetsInstagramService';

// ============================================================================
// TYPES
// ============================================================================

export interface InstagramMetrics {
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
  lastUpdated: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  timestamp: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
}

// ============================================================================
// ROWS.COM API (Primary - requires Enterprise plan for data access)
// ============================================================================

interface RowsSpreadsheet {
  id: string;
  name: string;
}

interface RowsTable {
  id: string;
  name: string;
}

let cachedSpreadsheets: RowsSpreadsheet[] | null = null;

async function fetchFromRowsApi(endpoint: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.ROWS_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'ROWS_API_KEY not configured' };
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function listRowsSpreadsheets(): Promise<RowsSpreadsheet[]> {
  if (cachedSpreadsheets) return cachedSpreadsheets;

  const result = await fetchFromRowsApi('https://api.rows.com/v1/spreadsheets');

  if (result.success && result.data?.items) {
    const spreadsheets: RowsSpreadsheet[] = result.data.items.map((s: any) => ({
      id: s.id,
      name: s.name || 'Untitled',
    }));
    cachedSpreadsheets = spreadsheets;
    return spreadsheets;
  }

  return [];
}

async function getRowsSpreadsheetInfo(spreadsheetId: string): Promise<{ pages: RowsTable[] } | null> {
  const result = await fetchFromRowsApi(`https://api.rows.com/v1/spreadsheets/${spreadsheetId}`);

  if (result.success && result.data?.pages) {
    return {
      pages: result.data.pages.map((p: any) => ({ id: p.id, name: p.name })),
    };
  }

  return null;
}

async function getRowsTableData(spreadsheetId: string, tableId: string): Promise<any[][] | null> {
  const result = await fetchFromRowsApi(
    `https://api.rows.com/v1/spreadsheets/${spreadsheetId}/tables/${tableId}/values`
  );

  if (result.success && result.data?.values) {
    return result.data.values;
  }

  // ROWS.COM API returns 404 for data access without Enterprise plan
  console.log('[ROWS API] Data access returned 404 - Enterprise plan required');
  return null;
}

async function tryRowsComApi(): Promise<{
  success: boolean;
  metrics?: InstagramMetrics;
  posts?: InstagramPost[];
  source: string;
}> {
  console.log('[Instagram API] Trying ROWS.COM API...');

  // Find Instagram spreadsheet
  const spreadsheets = await listRowsSpreadsheets();
  const instagramSpreadsheet = spreadsheets.find(s =>
    s.name.toLowerCase().includes('instagram')
  );

  if (!instagramSpreadsheet) {
    console.log('[Instagram API] No Instagram spreadsheet found in ROWS.COM');
    return { success: false, source: 'rows_not_found' };
  }

  console.log(`[Instagram API] Found spreadsheet: ${instagramSpreadsheet.name}`);

  // Get spreadsheet structure
  const info = await getRowsSpreadsheetInfo(instagramSpreadsheet.id);
  if (!info || info.pages.length === 0) {
    return { success: false, source: 'rows_no_pages' };
  }

  console.log(`[Instagram API] Found ${info.pages.length} pages`);

  // Try to get data from first page
  const firstPage = info.pages[0];
  const data = await getRowsTableData(instagramSpreadsheet.id, firstPage.id);

  if (!data) {
    // This is expected without Enterprise plan
    return { success: false, source: 'rows_no_data_access' };
  }

  // Parse the data if we got it
  // (This code path only works with Enterprise plan)
  console.log('[Instagram API] Successfully got data from ROWS.COM!');
  return {
    success: true,
    metrics: parseRowsMetrics(data),
    posts: parseRowsPosts(data),
    source: 'rows_api',
  };
}

function parseRowsMetrics(data: any[][]): InstagramMetrics {
  // Parse based on ROWS.COM data structure
  // Headers in first row, data in subsequent rows
  if (!data || data.length < 2) {
    return getDefaultMetrics();
  }

  const headers = data[0].map(h => String(h).toLowerCase());
  const row = data[1];

  const getValue = (keywords: string[]): number => {
    const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
    return idx >= 0 ? parseInt(row[idx]) || 0 : 0;
  };

  return {
    followers: getValue(['follower']),
    following: getValue(['following']),
    posts: getValue(['post', 'media']),
    engagement: getValue(['engagement']),
    reach: getValue(['reach']),
    impressions: getValue(['impression']),
    profileViews: getValue(['profile', 'view']),
    websiteClicks: getValue(['website', 'click']),
    lastUpdated: new Date().toISOString(),
  };
}

function parseRowsPosts(data: any[][]): InstagramPost[] {
  if (!data || data.length < 2) return [];

  const headers = data[0].map(h => String(h).toLowerCase());

  return data.slice(1).map((row, i) => {
    const getIdx = (keywords: string[]) =>
      headers.findIndex(h => keywords.some(k => h.includes(k)));

    return {
      id: `post-${i}`,
      caption: row[getIdx(['caption', 'text'])] || '',
      mediaUrl: row[getIdx(['media', 'url', 'image'])] || '',
      likes: parseInt(row[getIdx(['like'])]) || 0,
      comments: parseInt(row[getIdx(['comment'])]) || 0,
      shares: parseInt(row[getIdx(['share'])]) || 0,
      reach: parseInt(row[getIdx(['reach'])]) || 0,
      timestamp: row[getIdx(['date', 'time', 'posted'])] || new Date().toISOString(),
      mediaType: 'IMAGE' as const,
    };
  }).filter(p => p.likes > 0 || p.comments > 0);
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

function getDefaultMetrics(): InstagramMetrics {
  return {
    followers: 12543,
    following: 856,
    posts: 324,
    engagement: 4.2,
    reach: 45000,
    impressions: 128000,
    profileViews: 2340,
    websiteClicks: 567,
    lastUpdated: new Date().toISOString(),
  };
}

function getDefaultPosts(limit: number): InstagramPost[] {
  const posts: InstagramPost[] = [
    { id: '1', caption: 'Amazing sea view! 🌊 #Batumi #OrbiCity', mediaUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', likes: 234, comments: 18, shares: 12, reach: 3420, timestamp: new Date(Date.now() - 86400000).toISOString(), mediaType: 'IMAGE' },
    { id: '2', caption: 'Sunset vibes 🌅 #Sunset #Batumi', mediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', likes: 456, comments: 32, shares: 24, reach: 5200, timestamp: new Date(Date.now() - 172800000).toISOString(), mediaType: 'IMAGE' },
    { id: '3', caption: 'Perfect vacation ✨ #Vacation #Hotel', mediaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', likes: 189, comments: 15, shares: 8, reach: 2800, timestamp: new Date(Date.now() - 259200000).toISOString(), mediaType: 'IMAGE' },
    { id: '4', caption: 'Georgian hospitality 🏨 #Hotel #Georgia', mediaUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', likes: 312, comments: 28, shares: 16, reach: 4100, timestamp: new Date(Date.now() - 345600000).toISOString(), mediaType: 'IMAGE' },
    { id: '5', caption: 'Morning view ☀️ #MorningView', mediaUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', likes: 523, comments: 45, shares: 31, reach: 6800, timestamp: new Date(Date.now() - 432000000).toISOString(), mediaType: 'IMAGE' },
    { id: '6', caption: 'Beach life 🏖️ #Beach #Summer', mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', likes: 287, comments: 22, shares: 14, reach: 3900, timestamp: new Date(Date.now() - 518400000).toISOString(), mediaType: 'IMAGE' },
  ];
  return posts.slice(0, limit);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get Instagram metrics
 * Priority: ROWS.COM API → Google Sheets → Mock data
 */
export async function getInstagramMetricsFromRows(): Promise<{
  success: boolean;
  data?: InstagramMetrics;
  error?: string;
  source?: string;
}> {
  console.log('[Instagram API] Fetching metrics...');

  // 1. Try ROWS.COM API first
  const rowsResult = await tryRowsComApi();
  if (rowsResult.success && rowsResult.metrics) {
    console.log('[Instagram API] ✓ Data from ROWS.COM API');
    return { success: true, data: rowsResult.metrics, source: 'rows_api' };
  }

  // 2. Try Google Sheets (synced from ROWS.COM)
  console.log('[Instagram API] ROWS.COM unavailable, trying Google Sheets...');
  const gsResult = await getGoogleSheetsMetrics();

  if (gsResult.source === 'google_sheets') {
    console.log('[Instagram API] ✓ Data from Google Sheets');
    return { success: true, data: gsResult.data, source: 'google_sheets' };
  }

  // 3. Fall back to mock data
  console.log('[Instagram API] Using mock data');
  return { success: true, data: gsResult.data || getDefaultMetrics(), source: 'mock' };
}

/**
 * Get Instagram posts
 * Priority: ROWS.COM API → Google Sheets → Mock data
 */
export async function getInstagramPostsFromRows(limit: number = 9): Promise<{
  success: boolean;
  posts?: InstagramPost[];
  error?: string;
  source?: string;
}> {
  console.log(`[Instagram API] Fetching posts (limit: ${limit})...`);

  // 1. Try ROWS.COM API first
  const rowsResult = await tryRowsComApi();
  if (rowsResult.success && rowsResult.posts && rowsResult.posts.length > 0) {
    console.log('[Instagram API] ✓ Posts from ROWS.COM API');
    return { success: true, posts: rowsResult.posts.slice(0, limit), source: 'rows_api' };
  }

  // 2. Try Google Sheets
  console.log('[Instagram API] ROWS.COM unavailable, trying Google Sheets...');
  const gsResult = await getGoogleSheetsPosts(limit);

  if (gsResult.source === 'google_sheets') {
    console.log('[Instagram API] ✓ Posts from Google Sheets');
    return { success: true, posts: gsResult.posts, source: 'google_sheets' };
  }

  // 3. Fall back to mock data
  console.log('[Instagram API] Using mock posts');
  return { success: true, posts: gsResult.posts || getDefaultPosts(limit), source: 'mock' };
}

/**
 * Get full Instagram dashboard
 */
export async function getInstagramDashboardFromRows(): Promise<{
  success: boolean;
  data?: {
    metrics: InstagramMetrics;
    posts: InstagramPost[];
    demographics: any;
  };
  error?: string;
  source?: string;
}> {
  const [metricsResult, postsResult] = await Promise.all([
    getInstagramMetricsFromRows(),
    getInstagramPostsFromRows(9),
  ]);

  return {
    success: true,
    data: {
      metrics: metricsResult.data!,
      posts: postsResult.posts!,
      demographics: {
        ageRanges: [
          { range: '18-24', percentage: 15 },
          { range: '25-34', percentage: 35 },
          { range: '35-44', percentage: 28 },
          { range: '45-54', percentage: 14 },
          { range: '55+', percentage: 8 },
        ],
        genderSplit: { male: 42, female: 56, other: 2 },
        topLocations: [
          { city: 'Tbilisi', country: 'Georgia', percentage: 25 },
          { city: 'Moscow', country: 'Russia', percentage: 18 },
          { city: 'Istanbul', country: 'Turkey', percentage: 12 },
        ],
      },
    },
    source: metricsResult.source,
  };
}

/**
 * Get data source status
 */
export async function getSpreadsheetInfo(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const spreadsheets = await listRowsSpreadsheets();
  const hasRowsApi = spreadsheets.length > 0;
  const hasGoogleSheets = !!process.env.GOOGLE_SHEETS_INSTAGRAM_URL;

  return {
    success: true,
    data: {
      rowsApi: {
        configured: !!process.env.ROWS_API_KEY,
        connected: hasRowsApi,
        spreadsheets: spreadsheets.length,
        note: 'Data access requires Enterprise plan',
      },
      googleSheets: {
        configured: hasGoogleSheets,
        url: hasGoogleSheets ? 'Configured' : 'Not configured',
        note: 'Synced from ROWS.COM via n8n',
      },
      recommendation: hasRowsApi
        ? 'Use ROWS.COM integrations → sync to Google Sheets → read from Sheets'
        : 'Configure ROWS.COM for Instagram integration',
    },
  };
}

/**
 * Clear all caches
 */
export function clearInstagramCache(): void {
  cachedSpreadsheets = null;
  clearGoogleSheetsCache();
  console.log('[Instagram API] Cache cleared');
}
