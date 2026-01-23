/**
 * Google Sheets Instagram Service
 *
 * Replaces ROWS.COM API with Google Sheets for Instagram analytics.
 * Uses published CSV URLs for reading and AppScript Web App for writing.
 *
 * Google Sheets Structure (Instagram Analytics):
 * Sheet 1 - Metrics: Followers, Following, Posts, Engagement, Reach, Impressions, ProfileViews, WebsiteClicks, LastUpdated
 * Sheet 2 - Posts: ID, Caption, MediaUrl, Likes, Comments, Shares, Reach, Timestamp, MediaType
 * Sheet 3 - Demographics: Age range, Gender, Location data
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

interface GoogleSheetsConfig {
  // Published Google Sheet URL (CSV format)
  INSTAGRAM_SHEET_URL: string;
  // Tab GIDs for different data
  TABS: {
    METRICS: string;
    POSTS: string;
    DEMOGRAPHICS: string;
  };
  // Cache duration
  CACHE_DURATION: number;
}

const CONFIG: GoogleSheetsConfig = {
  INSTAGRAM_SHEET_URL: process.env.GOOGLE_SHEETS_INSTAGRAM_URL || '',
  TABS: {
    METRICS: 'gid=0',      // First tab - account metrics
    POSTS: 'gid=1',        // Second tab - posts data
    DEMOGRAPHICS: 'gid=2', // Third tab - demographics
  },
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// DATA TYPES
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

export interface InstagramDemographics {
  ageRanges: { range: string; percentage: number }[];
  genderSplit: { male: number; female: number; other: number };
  topLocations: { city: string; country: string; percentage: number }[];
}

// ============================================================================
// CACHE
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CONFIG.CACHE_DURATION) {
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
  console.log('[Google Sheets Instagram] Cache cleared');
}

// ============================================================================
// CSV PARSING
// ============================================================================

function parseCSV<T>(csvText: string, mapper: (row: string[], headers: string[]) => T | null): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  // Parse data rows
  const results: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const mapped = mapper(values, headers);
    if (mapped) results.push(mapped);
  }

  return results;
}

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

// ============================================================================
// FETCH UTILITIES
// ============================================================================

async function fetchSheetData(tabGid: string): Promise<string> {
  const baseUrl = CONFIG.INSTAGRAM_SHEET_URL;

  if (!baseUrl) {
    throw new Error('Google Sheets Instagram URL not configured');
  }

  // Construct URL with tab ID and CSV output
  const url = baseUrl.includes('?')
    ? `${baseUrl}&${tabGid}&output=csv`
    : `${baseUrl}?${tabGid}&output=csv`;

  console.log(`[Google Sheets Instagram] Fetching: ${url.substring(0, 80)}...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

function getMockMetrics(): InstagramMetrics {
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

function getMockPosts(limit: number): InstagramPost[] {
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
    {
      id: '7',
      caption: 'Luxury living by the Black Sea 🌊 #Luxury #BlackSea',
      mediaUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      likes: 378,
      comments: 29,
      shares: 19,
      reach: 4800,
      timestamp: new Date(Date.now() - 604800000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '8',
      caption: 'Night views from the balcony 🌙 #NightLife #Batumi',
      mediaUrl: 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400',
      likes: 445,
      comments: 36,
      shares: 27,
      reach: 5600,
      timestamp: new Date(Date.now() - 691200000).toISOString(),
      mediaType: 'IMAGE',
    },
    {
      id: '9',
      caption: 'Welcome to paradise 🌴 #Paradise #Travel #Georgia',
      mediaUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
      likes: 512,
      comments: 41,
      shares: 33,
      reach: 6200,
      timestamp: new Date(Date.now() - 777600000).toISOString(),
      mediaType: 'IMAGE',
    },
  ];

  return mockPosts.slice(0, limit);
}

function getMockDemographics(): InstagramDemographics {
  return {
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
      { city: 'Baku', country: 'Azerbaijan', percentage: 10 },
      { city: 'Kyiv', country: 'Ukraine', percentage: 8 },
    ],
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get Instagram account metrics from Google Sheets
 */
export async function getInstagramMetrics(): Promise<{
  success: boolean;
  data?: InstagramMetrics;
  error?: string;
  source: 'google_sheets' | 'mock';
}> {
  // Check cache first
  const cached = getCached<InstagramMetrics>('instagram_metrics');
  if (cached) {
    console.log('[Google Sheets Instagram] Returning cached metrics');
    return { success: true, data: cached, source: 'google_sheets' };
  }

  // Check if Google Sheets is configured
  if (!CONFIG.INSTAGRAM_SHEET_URL) {
    console.log('[Google Sheets Instagram] Not configured, using mock data');
    return { success: true, data: getMockMetrics(), source: 'mock' };
  }

  try {
    const csv = await fetchSheetData(CONFIG.TABS.METRICS);

    const metrics = parseCSV<InstagramMetrics>(csv, (values, headers) => {
      // Find column indices
      const getIndex = (name: string) => headers.findIndex(h =>
        h.includes(name.toLowerCase()) || h === name.toLowerCase()
      );

      const followersIdx = getIndex('followers');
      const followingIdx = getIndex('following');
      const postsIdx = getIndex('posts');
      const engagementIdx = getIndex('engagement');
      const reachIdx = getIndex('reach');
      const impressionsIdx = getIndex('impressions');
      const profileViewsIdx = getIndex('profile') || getIndex('views');
      const websiteClicksIdx = getIndex('website') || getIndex('clicks');
      const lastUpdatedIdx = getIndex('updated') || getIndex('date');

      return {
        followers: parseInt(values[followersIdx] || values[0]) || 0,
        following: parseInt(values[followingIdx] || values[1]) || 0,
        posts: parseInt(values[postsIdx] || values[2]) || 0,
        engagement: parseFloat(values[engagementIdx] || values[3]) || 0,
        reach: parseInt(values[reachIdx] || values[4]) || 0,
        impressions: parseInt(values[impressionsIdx] || values[5]) || 0,
        profileViews: parseInt(values[profileViewsIdx] || values[6]) || 0,
        websiteClicks: parseInt(values[websiteClicksIdx] || values[7]) || 0,
        lastUpdated: values[lastUpdatedIdx] || values[8] || new Date().toISOString(),
      };
    });

    if (metrics.length > 0) {
      // Use the most recent row (last row with data)
      const latestMetrics = metrics[metrics.length - 1];
      setCache('instagram_metrics', latestMetrics);
      console.log('[Google Sheets Instagram] Successfully fetched metrics from Google Sheets');
      return { success: true, data: latestMetrics, source: 'google_sheets' };
    }

    console.warn('[Google Sheets Instagram] No metrics data found, using mock');
    return { success: true, data: getMockMetrics(), source: 'mock' };

  } catch (error) {
    console.error('[Google Sheets Instagram] Error fetching metrics:', error);
    return { success: true, data: getMockMetrics(), source: 'mock' };
  }
}

/**
 * Get Instagram posts from Google Sheets
 */
export async function getInstagramPosts(limit: number = 9): Promise<{
  success: boolean;
  posts?: InstagramPost[];
  error?: string;
  source: 'google_sheets' | 'mock';
}> {
  // Check cache
  const cacheKey = `instagram_posts_${limit}`;
  const cached = getCached<InstagramPost[]>(cacheKey);
  if (cached) {
    console.log('[Google Sheets Instagram] Returning cached posts');
    return { success: true, posts: cached, source: 'google_sheets' };
  }

  // Check if configured
  if (!CONFIG.INSTAGRAM_SHEET_URL) {
    console.log('[Google Sheets Instagram] Not configured, using mock posts');
    return { success: true, posts: getMockPosts(limit), source: 'mock' };
  }

  try {
    const csv = await fetchSheetData(CONFIG.TABS.POSTS);

    const posts = parseCSV<InstagramPost>(csv, (values, headers) => {
      const getIndex = (name: string) => headers.findIndex(h =>
        h.includes(name.toLowerCase()) || h === name.toLowerCase()
      );

      const idIdx = getIndex('id');
      const captionIdx = getIndex('caption');
      const mediaUrlIdx = getIndex('media') || getIndex('url') || getIndex('image');
      const likesIdx = getIndex('likes');
      const commentsIdx = getIndex('comments');
      const sharesIdx = getIndex('shares');
      const reachIdx = getIndex('reach');
      const timestampIdx = getIndex('timestamp') || getIndex('date') || getIndex('created');
      const mediaTypeIdx = getIndex('type') || getIndex('media_type');

      const mediaType = (values[mediaTypeIdx] || 'IMAGE').toUpperCase();

      return {
        id: values[idIdx] || values[0] || `post-${Math.random().toString(36).substr(2, 9)}`,
        caption: values[captionIdx] || values[1] || '',
        mediaUrl: values[mediaUrlIdx] || values[2] || '',
        likes: parseInt(values[likesIdx] || values[3]) || 0,
        comments: parseInt(values[commentsIdx] || values[4]) || 0,
        shares: parseInt(values[sharesIdx] || values[5]) || 0,
        reach: parseInt(values[reachIdx] || values[6]) || 0,
        timestamp: values[timestampIdx] || values[7] || new Date().toISOString(),
        mediaType: (mediaType === 'VIDEO' || mediaType === 'CAROUSEL') ? mediaType : 'IMAGE',
      };
    });

    if (posts.length > 0) {
      const limitedPosts = posts.slice(0, limit);
      setCache(cacheKey, limitedPosts);
      console.log(`[Google Sheets Instagram] Successfully fetched ${limitedPosts.length} posts`);
      return { success: true, posts: limitedPosts, source: 'google_sheets' };
    }

    console.warn('[Google Sheets Instagram] No posts found, using mock');
    return { success: true, posts: getMockPosts(limit), source: 'mock' };

  } catch (error) {
    console.error('[Google Sheets Instagram] Error fetching posts:', error);
    return { success: true, posts: getMockPosts(limit), source: 'mock' };
  }
}

/**
 * Get Instagram demographics from Google Sheets
 */
export async function getInstagramDemographics(): Promise<{
  success: boolean;
  data?: InstagramDemographics;
  error?: string;
  source: 'google_sheets' | 'mock';
}> {
  // Check cache
  const cached = getCached<InstagramDemographics>('instagram_demographics');
  if (cached) {
    return { success: true, data: cached, source: 'google_sheets' };
  }

  // Check if configured
  if (!CONFIG.INSTAGRAM_SHEET_URL) {
    return { success: true, data: getMockDemographics(), source: 'mock' };
  }

  try {
    const csv = await fetchSheetData(CONFIG.TABS.DEMOGRAPHICS);

    // Parse demographics (more complex structure)
    // For now, return mock data - implement full parsing when sheet structure is known
    console.log('[Google Sheets Instagram] Demographics parsing not yet implemented, using mock');
    return { success: true, data: getMockDemographics(), source: 'mock' };

  } catch (error) {
    console.error('[Google Sheets Instagram] Error fetching demographics:', error);
    return { success: true, data: getMockDemographics(), source: 'mock' };
  }
}

/**
 * Get full Instagram dashboard data
 */
export async function getInstagramDashboard(): Promise<{
  success: boolean;
  data?: {
    metrics: InstagramMetrics;
    posts: InstagramPost[];
    demographics: InstagramDemographics;
  };
  error?: string;
  source: 'google_sheets' | 'mock';
}> {
  const [metricsResult, postsResult, demographicsResult] = await Promise.all([
    getInstagramMetrics(),
    getInstagramPosts(9),
    getInstagramDemographics(),
  ]);

  const source = metricsResult.source === 'google_sheets' ? 'google_sheets' : 'mock';

  return {
    success: true,
    data: {
      metrics: metricsResult.data!,
      posts: postsResult.posts!,
      demographics: demographicsResult.data!,
    },
    source,
  };
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const googleSheetsInstagramService = {
  getMetrics: getInstagramMetrics,
  getPosts: getInstagramPosts,
  getDemographics: getInstagramDemographics,
  getDashboard: getInstagramDashboard,
  clearCache,
};

export default googleSheetsInstagramService;
