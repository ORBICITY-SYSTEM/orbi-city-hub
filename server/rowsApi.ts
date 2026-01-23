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
function buildRowsApiUrl(spreadsheetId: string, tableName?: string): string {
  const base = `https://api.rows.com/v1/spreadsheets/${spreadsheetId}`;
  if (tableName) {
    return `${base}/tables/${encodeURIComponent(tableName)}/values`;
  }
  return base;
}

/**
 * Fetch data from ROWS.COM API
 */
async function fetchFromRows(endpoint: string): Promise<RowsApiResponse> {
  const apiKey = process.env.ROWS_API_KEY;
  console.log(`[ROWS API] Fetching: ${endpoint}`);

  if (!apiKey) {
    console.warn('[ROWS API] API key not configured');
    return { success: false, error: 'ROWS_API_KEY not configured' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
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

  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  console.log(`[ROWS API] Extracted spreadsheet ID: ${spreadsheetId} from URL: ${spreadsheetUrl}`);
  if (!spreadsheetId) {
    return { success: false, error: 'Could not extract spreadsheet ID' };
  }

  // Try to fetch from "Metrics" or "Overview" table
  const tableNames = ['Metrics', 'Overview', 'Summary', 'Instagram'];

  for (const tableName of tableNames) {
    const apiUrl = buildRowsApiUrl(spreadsheetId, tableName);
    const result = await fetchFromRows(apiUrl);

    if (result.success && result.data) {
      const metrics = parseMetricsData(result.data);
      if (metrics) {
        return { success: true, data: metrics };
      }
    }
  }

  // Fallback to mock data if API fails
  console.warn('[ROWS API] Could not fetch metrics, using mock data');
  return {
    success: true,
    data: getMockInstagramMetrics(),
  };
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

  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    return { success: false, error: 'Could not extract spreadsheet ID' };
  }

  // Try to fetch from "Posts" table
  const tableNames = ['Posts', 'Content', 'Media'];

  for (const tableName of tableNames) {
    const apiUrl = buildRowsApiUrl(spreadsheetId, tableName);
    const result = await fetchFromRows(apiUrl);

    if (result.success && result.data) {
      const posts = parsePostsData(result.data, limit);
      if (posts && posts.length > 0) {
        return { success: true, posts };
      }
    }
  }

  // Fallback to mock data
  return {
    success: true,
    posts: getMockInstagramPosts(limit),
  };
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
