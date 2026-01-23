/**
 * ROWS.COM API Integration
 * Fetches Instagram analytics data from ROWS.COM spreadsheet
 */

interface RowsApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface InstagramMetrics {
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

interface InstagramPost {
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

interface RowsSpreadsheet {
  id: string;
  name: string;
}

interface RowsTable {
  id: string;
  name: string;
}

// Cache for discovered spreadsheets and tables
let cachedSpreadsheets: RowsSpreadsheet[] | null = null;
let cachedTables: Map<string, RowsTable[]> = new Map();

// Extract spreadsheet ID from ROWS.COM URL
function extractSpreadsheetId(url: string): string | null {
  // URL format: https://rows.com/groot-e50ad778/my-spreadsheets/instagram-page-analytics-dashboard-590R621oSJPeF4u2jPBPzz/29d39fdc-47ac-40e3-9862-5f3d836ea8a2/edit
  // The UUID after the spreadsheet name is the actual spreadsheet ID for the API
  const uuidMatch = url.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  // Fallback to old method (short ID)
  const shortIdMatch = url.match(/my-spreadsheets\/[^\/]+-([A-Za-z0-9]+)\//);
  return shortIdMatch ? shortIdMatch[1] : null;
}

// Build ROWS.COM API URL
function buildRowsApiUrl(spreadsheetId?: string, tableId?: string, valuesOnly?: boolean): string {
  if (!spreadsheetId) {
    return 'https://api.rows.com/v1/spreadsheets';
  }
  // For single spreadsheet info
  if (!tableId) {
    return `https://api.rows.com/v1/spreadsheets/${spreadsheetId}`;
  }
  // For table/page values - use v1 with values endpoint (GET)
  if (valuesOnly) {
    return `https://api.rows.com/v1/spreadsheets/${spreadsheetId}/tables/${tableId}/values`;
  }
  // For tables list - not a separate endpoint, use spreadsheet endpoint
  return `https://api.rows.com/v1/spreadsheets/${spreadsheetId}`;
}

/**
 * Fetch data from ROWS.COM API
 */
async function fetchFromRows(endpoint: string, usePost: boolean = false): Promise<RowsApiResponse> {
  const apiKey = process.env.ROWS_API_KEY;
  console.log(`[ROWS API] ${usePost ? 'POST' : 'GET'}: ${endpoint}`);

  if (!apiKey) {
    console.warn('[ROWS API] API key not configured');
    return { success: false, error: 'ROWS_API_KEY not configured' };
  }

  // Log partial key for debugging
  const keyPreview = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`[ROWS API] Using key: ${keyPreview}`);

  try {
    const response = await fetch(endpoint, {
      method: usePost ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ROWS API] Error ${response.status}: ${errorText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    console.log(`[ROWS API] Success! Data keys: ${Object.keys(data).join(', ')}`);
    return { success: true, data };
  } catch (error) {
    console.error('[ROWS API] Fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * List all available spreadsheets
 */
async function listSpreadsheets(): Promise<RowsSpreadsheet[]> {
  if (cachedSpreadsheets) {
    return cachedSpreadsheets;
  }

  const apiUrl = buildRowsApiUrl();
  console.log(`[ROWS API] Listing all spreadsheets: ${apiUrl}`);

  const result = await fetchFromRows(apiUrl);

  // ROWS.COM API returns 'items' not 'spreadsheets'
  const spreadsheets = result.data?.items || result.data?.spreadsheets;
  if (result.success && spreadsheets && Array.isArray(spreadsheets)) {
    cachedSpreadsheets = spreadsheets.map((s: any) => ({
      id: s.id,
      name: s.name || s.title || 'Untitled'
    }));
    console.log(`[ROWS API] Found ${cachedSpreadsheets.length} spreadsheets:`,
      cachedSpreadsheets.map(s => `${s.name} (${s.id})`).join(', '));
    return cachedSpreadsheets;
  }

  console.warn('[ROWS API] Could not list spreadsheets. Response:', JSON.stringify(result.data));
  return [];
}

/**
 * List all tables in a spreadsheet
 */
async function listTables(spreadsheetId: string): Promise<RowsTable[]> {
  if (cachedTables.has(spreadsheetId)) {
    return cachedTables.get(spreadsheetId)!;
  }

  // Get spreadsheet info which includes tables
  const apiUrl = buildRowsApiUrl(spreadsheetId);
  console.log(`[ROWS API] Fetching spreadsheet info for tables: ${apiUrl}`);

  const result = await fetchFromRows(apiUrl);

  if (result.success && result.data) {
    console.log(`[ROWS API] Spreadsheet data keys: ${Object.keys(result.data).join(', ')}`);

    // Tables might be in result.data.pages (ROWS.COM uses "pages" for sheets/tables)
    const tables = result.data.pages || result.data.tables || result.data.sheets || result.data.items;

    if (tables && Array.isArray(tables)) {
      const tableList = tables.map((t: any) => ({
        id: t.id || t.name,
        name: t.name || t.title || 'Untitled'
      }));
      cachedTables.set(spreadsheetId, tableList);
      console.log(`[ROWS API] Found ${tableList.length} pages/tables:`,
        tableList.map((t: RowsTable) => `${t.name} (${t.id})`).join(', '));
      return tableList;
    }

    // If no explicit tables/pages array, log more details
    console.log(`[ROWS API] No tables/pages array found. Full response:`, JSON.stringify(result.data).substring(0, 500));

    // Try using the first/default table (often Table1 or similar)
    const defaultTables: RowsTable[] = [
      { id: 'Table1', name: 'Table1' },
      { id: 'Sheet1', name: 'Sheet1' },
      { id: '0', name: 'Default' },
    ];
    cachedTables.set(spreadsheetId, defaultTables);
    return defaultTables;
  }

  console.warn('[ROWS API] Could not get spreadsheet info:', result.error);
  return [];
}

/**
 * Find spreadsheet by name pattern
 */
async function findSpreadsheet(namePattern: string): Promise<RowsSpreadsheet | null> {
  const spreadsheets = await listSpreadsheets();
  const pattern = namePattern.toLowerCase();

  const found = spreadsheets.find(s =>
    s.name.toLowerCase().includes(pattern) ||
    s.name.toLowerCase().includes('instagram')
  );

  if (found) {
    console.log(`[ROWS API] Found spreadsheet matching "${namePattern}": ${found.name} (${found.id})`);
  }

  return found || null;
}

/**
 * Find table by name pattern
 */
async function findTable(spreadsheetId: string, namePattern: string): Promise<RowsTable | null> {
  const tables = await listTables(spreadsheetId);
  const pattern = namePattern.toLowerCase();

  const found = tables.find(t =>
    t.name.toLowerCase().includes(pattern)
  );

  if (found) {
    console.log(`[ROWS API] Found table matching "${namePattern}": ${found.name} (${found.id})`);
  }

  return found || null;
}

/**
 * Get spreadsheet metadata (tables list)
 */
export async function getSpreadsheetInfo(): Promise<RowsApiResponse> {
  const spreadsheetUrl = process.env.ROWS_INSTAGRAM_SPREADSHEET_URL;

  if (!spreadsheetUrl) {
    return { success: false, error: 'ROWS_INSTAGRAM_SPREADSHEET_URL not configured' };
  }

  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    return { success: false, error: 'Could not extract spreadsheet ID from URL' };
  }

  const apiUrl = buildRowsApiUrl(spreadsheetId);
  console.log(`[ROWS API] Fetching spreadsheet info: ${apiUrl}`);

  return fetchFromRows(apiUrl);
}

/**
 * Get Instagram metrics from ROWS.COM
 */
export async function getInstagramMetricsFromRows(): Promise<{
  success: boolean;
  data?: InstagramMetrics;
  error?: string;
}> {
  const spreadsheetUrl = process.env.ROWS_INSTAGRAM_SPREADSHEET_URL;

  if (!spreadsheetUrl) {
    console.warn('[ROWS API] Using mock data - ROWS_INSTAGRAM_SPREADSHEET_URL not configured');
    return {
      success: true,
      data: getMockInstagramMetrics(),
    };
  }

  try {
    // Step 1: Try to discover spreadsheets via API
    console.log('[ROWS API] Attempting to discover Instagram spreadsheet...');
    let spreadsheetId: string | null = null;

    // First, try listing all spreadsheets to find the Instagram one
    const spreadsheets = await listSpreadsheets();
    if (spreadsheets.length > 0) {
      const instagramSpreadsheet = spreadsheets.find(s =>
        s.name.toLowerCase().includes('instagram')
      );
      if (instagramSpreadsheet) {
        spreadsheetId = instagramSpreadsheet.id;
        console.log(`[ROWS API] Found Instagram spreadsheet via API: ${instagramSpreadsheet.name}`);
      } else {
        // Use first spreadsheet as fallback
        spreadsheetId = spreadsheets[0].id;
        console.log(`[ROWS API] Using first spreadsheet: ${spreadsheets[0].name}`);
      }
    }

    // If API listing failed, extract from URL
    if (!spreadsheetId) {
      spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
      console.log(`[ROWS API] Extracted spreadsheet ID from URL: ${spreadsheetId}`);
    }

    if (!spreadsheetId) {
      console.error('[ROWS API] Could not determine spreadsheet ID');
      return {
        success: true,
        data: getMockInstagramMetrics(),
      };
    }

    // Step 2: List tables in the spreadsheet
    const tables = await listTables(spreadsheetId);
    if (tables.length === 0) {
      console.warn('[ROWS API] No tables found in spreadsheet');
      return {
        success: true,
        data: getMockInstagramMetrics(),
      };
    }

    // Step 3: Try to fetch data from relevant tables
    const tableNames = ['metrics', 'overview', 'summary', 'instagram', 'data', 'sheet'];

    for (const tableName of tableNames) {
      const table = tables.find(t => t.name.toLowerCase().includes(tableName));
      if (table) {
        // Use GET for v1 values endpoint
        const apiUrl = buildRowsApiUrl(spreadsheetId, table.id, true);
        console.log(`[ROWS API] Trying to fetch values from table ${table.name}:`, apiUrl);
        const result = await fetchFromRows(apiUrl, false);

        if (result.success && result.data) {
          console.log(`[ROWS API] Got data from table ${table.name}:`, Object.keys(result.data));
          const metrics = parseCellsData(result.data) || parseMetricsData(result.data);
          if (metrics) {
            console.log('[ROWS API] Successfully fetched metrics from table:', table.name);
            return { success: true, data: metrics };
          }
        }
      }
    }

    // If no specific table found, try the first table
    if (tables.length > 0) {
      const firstTable = tables[0];
      const apiUrl = buildRowsApiUrl(spreadsheetId, firstTable.id, true);
      console.log(`[ROWS API] Trying first table ${firstTable.name}:`, apiUrl);
      const result = await fetchFromRows(apiUrl, false);

      if (result.success && result.data) {
        console.log(`[ROWS API] Got data from first table:`, Object.keys(result.data));
        const metrics = parseCellsData(result.data) || parseMetricsData(result.data);
        if (metrics) {
          console.log('[ROWS API] Successfully fetched metrics from first table:', firstTable.name);
          return { success: true, data: metrics };
        }
      }
    }

    // Fallback to mock data
    console.warn('[ROWS API] Could not fetch metrics from any table, using mock data');
    return {
      success: true,
      data: getMockInstagramMetrics(),
    };

  } catch (error) {
    console.error('[ROWS API] Error fetching metrics:', error);
    return {
      success: true,
      data: getMockInstagramMetrics(),
    };
  }
}

/**
 * Get Instagram posts from ROWS.COM
 */
export async function getInstagramPostsFromRows(limit: number = 9): Promise<{
  success: boolean;
  posts?: InstagramPost[];
  error?: string;
}> {
  const spreadsheetUrl = process.env.ROWS_INSTAGRAM_SPREADSHEET_URL;

  if (!spreadsheetUrl) {
    return {
      success: true,
      posts: getMockInstagramPosts(limit),
    };
  }

  try {
    // Step 1: Discover spreadsheet
    let spreadsheetId: string | null = null;
    const spreadsheets = await listSpreadsheets();

    if (spreadsheets.length > 0) {
      const instagramSpreadsheet = spreadsheets.find(s =>
        s.name.toLowerCase().includes('instagram')
      );
      spreadsheetId = instagramSpreadsheet?.id || spreadsheets[0].id;
    }

    if (!spreadsheetId) {
      spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    }

    if (!spreadsheetId) {
      return {
        success: true,
        posts: getMockInstagramPosts(limit),
      };
    }

    // Step 2: List tables
    const tables = await listTables(spreadsheetId);
    if (tables.length === 0) {
      return {
        success: true,
        posts: getMockInstagramPosts(limit),
      };
    }

    // Step 3: Try to fetch from posts-related tables
    const tableNames = ['posts', 'content', 'media', 'feed'];

    for (const tableName of tableNames) {
      const table = tables.find(t => t.name.toLowerCase().includes(tableName));
      if (table) {
        const apiUrl = buildRowsApiUrl(spreadsheetId, table.id, true);
        const result = await fetchFromRows(apiUrl, false);

        if (result.success && result.data) {
          const posts = parsePostsData(result.data, limit);
          if (posts && posts.length > 0) {
            console.log('[ROWS API] Successfully fetched posts from table:', table.name);
            return { success: true, posts };
          }
        }
      }
    }

    // Fallback to mock data
    return {
      success: true,
      posts: getMockInstagramPosts(limit),
    };

  } catch (error) {
    console.error('[ROWS API] Error fetching posts:', error);
    return {
      success: true,
      posts: getMockInstagramPosts(limit),
    };
  }
}

/**
 * Parse metrics data from ROWS.COM response
 */
function parseMetricsData(data: any): InstagramMetrics | null {
  try {
    // ROWS.COM returns data in rows/columns format
    // Adjust parsing based on actual data structure
    if (data.rows && data.rows.length > 0) {
      const row = data.rows[0];
      return {
        followers: parseInt(row.followers || row.Followers || '0'),
        following: parseInt(row.following || row.Following || '0'),
        posts: parseInt(row.posts || row.Posts || row.media_count || '0'),
        engagement: parseFloat(row.engagement || row.Engagement || row.engagement_rate || '0'),
        reach: parseInt(row.reach || row.Reach || '0'),
        impressions: parseInt(row.impressions || row.Impressions || '0'),
        profileViews: parseInt(row.profile_views || row.profileViews || '0'),
        websiteClicks: parseInt(row.website_clicks || row.websiteClicks || '0'),
        lastUpdated: row.updated_at || row.lastUpdated || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('[ROWS API] Error parsing metrics:', error);
    return null;
  }
}

/**
 * Parse cells data from ROWS.COM v1beta1 response
 * The cells endpoint returns an array of arrays with cell values
 */
function parseCellsData(data: any): InstagramMetrics | null {
  try {
    console.log('[ROWS API] Parsing cells data:', JSON.stringify(data).substring(0, 500));

    // Cells API returns array of arrays (rows x columns)
    // First row is typically headers
    if (data.values && Array.isArray(data.values) && data.values.length > 1) {
      const headers = data.values[0];
      const dataRow = data.values[1]; // First data row

      console.log('[ROWS API] Headers:', headers);
      console.log('[ROWS API] Data row:', dataRow);

      // Create object from headers and values
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        rowData[header.toLowerCase()] = dataRow[index];
      });

      return {
        followers: parseInt(rowData.followers || rowData['follower count'] || '0'),
        following: parseInt(rowData.following || '0'),
        posts: parseInt(rowData.posts || rowData['media count'] || rowData['post count'] || '0'),
        engagement: parseFloat(rowData.engagement || rowData['engagement rate'] || '0'),
        reach: parseInt(rowData.reach || '0'),
        impressions: parseInt(rowData.impressions || '0'),
        profileViews: parseInt(rowData['profile views'] || rowData.profile_views || '0'),
        websiteClicks: parseInt(rowData['website clicks'] || rowData.website_clicks || '0'),
        lastUpdated: rowData['updated at'] || rowData.updated_at || new Date().toISOString(),
      };
    }

    // Alternative format: direct key-value pairs
    if (data.cells && Array.isArray(data.cells)) {
      console.log('[ROWS API] Found cells array:', data.cells.length);
      // Parse cells format
      const cellData: Record<string, any> = {};
      data.cells.forEach((cell: any) => {
        if (cell.key && cell.value !== undefined) {
          cellData[cell.key.toLowerCase()] = cell.value;
        }
      });

      if (Object.keys(cellData).length > 0) {
        return {
          followers: parseInt(cellData.followers || '0'),
          following: parseInt(cellData.following || '0'),
          posts: parseInt(cellData.posts || '0'),
          engagement: parseFloat(cellData.engagement || '0'),
          reach: parseInt(cellData.reach || '0'),
          impressions: parseInt(cellData.impressions || '0'),
          profileViews: parseInt(cellData['profile views'] || '0'),
          websiteClicks: parseInt(cellData['website clicks'] || '0'),
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[ROWS API] Error parsing cells data:', error);
    return null;
  }
}

/**
 * Parse posts data from ROWS.COM response
 */
function parsePostsData(data: any, limit: number): InstagramPost[] | null {
  try {
    if (data.rows && data.rows.length > 0) {
      return data.rows.slice(0, limit).map((row: any, index: number) => ({
        id: row.id || row.post_id || `post-${index}`,
        caption: row.caption || row.Caption || '',
        mediaUrl: row.media_url || row.mediaUrl || row.image_url || '',
        likes: parseInt(row.likes || row.Likes || '0'),
        comments: parseInt(row.comments || row.Comments || '0'),
        shares: parseInt(row.shares || row.Shares || '0'),
        reach: parseInt(row.reach || row.Reach || '0'),
        timestamp: row.timestamp || row.created_at || row.date || new Date().toISOString(),
        mediaType: (row.media_type || row.type || 'IMAGE').toUpperCase() as 'IMAGE' | 'VIDEO' | 'CAROUSEL',
      }));
    }
    return null;
  } catch (error) {
    console.error('[ROWS API] Error parsing posts:', error);
    return null;
  }
}

/**
 * Mock data for development/fallback
 */
function getMockInstagramMetrics(): InstagramMetrics {
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

function getMockInstagramPosts(limit: number): InstagramPost[] {
  const mockPosts: InstagramPost[] = [
    {
      id: '1',
      caption: 'Amazing sea view from our apartments! 🌊 #Batumi #SeaView #OrbiCity',
      mediaUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
      likes: 234,
      comments: 18,
      shares: 12,
      reach: 3420,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '2',
      caption: 'Sunset vibes at Orbi City 🌅 #Sunset #Batumi #Travel',
      mediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      likes: 456,
      comments: 32,
      shares: 24,
      reach: 5200,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '3',
      caption: 'Your perfect vacation starts here ✨ #Vacation #Hotel #Batumi',
      mediaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      likes: 189,
      comments: 15,
      shares: 8,
      reach: 2800,
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '4',
      caption: 'Modern comfort meets Georgian hospitality 🏨 #Hotel #Georgia',
      mediaUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      likes: 312,
      comments: 28,
      shares: 16,
      reach: 4100,
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '5',
      caption: 'Wake up to this view every morning ☀️ #MorningView #Batumi',
      mediaUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      likes: 523,
      comments: 45,
      shares: 31,
      reach: 6800,
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '6',
      caption: 'Beach life at its finest 🏖️ #Beach #Summer #Batumi',
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      likes: 287,
      comments: 22,
      shares: 14,
      reach: 3900,
      timestamp: new Date(Date.now() - 518400000).toISOString(),
      mediaType: 'IMAGE',
    },
  ];

  return mockPosts.slice(0, limit);
}

export { InstagramMetrics, InstagramPost };
