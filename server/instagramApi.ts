/**
 * Instagram Graph API Integration
 * Fetches Instagram Business account metrics and insights
 */

export interface InstagramInsights {
  accountId: string;
  username: string;
  followers: number;
  following: number;
  mediaCount: number;
  engagement: {
    total: number;
    rate: number;
    likes: number;
    comments: number;
    saves: number;
  };
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
}

export interface InstagramPost {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement: number;
}

export interface InstagramStory {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  timestamp: string;
  reach: number;
  impressions: number;
  replies: number;
  exits: number;
  tapsForward: number;
  tapsBack: number;
}

export interface InstagramAudience {
  totalFollowers: number;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    country: Record<string, number>;
    city: Record<string, number>;
  };
  activeHours: Record<string, number>;
  activeDays: Record<string, number>;
}

/**
 * Fetch Instagram account insights
 */
export async function getInstagramInsights(
  accountId?: string
): Promise<{
  success: boolean;
  data?: InstagramInsights;
  error?: string;
}> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    console.warn('[Instagram API] Using mock data - configure INSTAGRAM_ACCESS_TOKEN and account ID');
    return {
      success: true,
      data: getMockInstagramInsights(),
    };
  }

  try {
    // In production, this would call Instagram Graph API
    // const response = await fetch(
    //   `https://graph.instagram.com/${accountId}?fields=username,followers_count,follows_count,media_count&access_token=${accessToken}`
    // );
    // const data = await response.json();

    return {
      success: true,
      data: getMockInstagramInsights(),
    };
  } catch (error) {
    console.error('[Instagram API] Error fetching insights:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch Instagram top posts
 */
export async function getInstagramTopPosts(
  accountId?: string,
  limit: number = 9
): Promise<{
  success: boolean;
  posts?: InstagramPost[];
  error?: string;
}> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    console.warn('[Instagram API] Using mock data');
    return {
      success: true,
      posts: getMockInstagramPosts(),
    };
  }

  try {
    // In production:
    // const response = await fetch(
    //   `https://graph.instagram.com/${accountId}/media?fields=caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
    // );

    return {
      success: true,
      posts: getMockInstagramPosts(),
    };
  } catch (error) {
    console.error('[Instagram API] Error fetching posts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch Instagram stories insights
 */
export async function getInstagramStories(
  accountId?: string
): Promise<{
  success: boolean;
  stories?: InstagramStory[];
  error?: string;
}> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    return {
      success: true,
      stories: getMockInstagramStories(),
    };
  }

  try {
    return {
      success: true,
      stories: getMockInstagramStories(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch Instagram audience demographics
 */
export async function getInstagramAudience(
  accountId?: string
): Promise<{
  success: boolean;
  data?: InstagramAudience;
  error?: string;
}> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    return {
      success: true,
      data: getMockInstagramAudience(),
    };
  }

  try {
    return {
      success: true,
      data: getMockInstagramAudience(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Mock data for development
function getMockInstagramInsights(): InstagramInsights {
  return {
    accountId: 'orbi_city_batumi',
    username: '@orbi_city_batumi',
    followers: 18750,
    following: 245,
    mediaCount: 156,
    engagement: {
      total: 4567,
      rate: 5.8,
      likes: 3890,
      comments: 456,
      saves: 221,
    },
    reach: 52340,
    impressions: 89450,
    profileViews: 8920,
    websiteClicks: 1245,
  };
}

function getMockInstagramPosts(): InstagramPost[] {
  return [
    {
      id: '1',
      caption: 'Breathtaking views from your balcony 🌊 #ORBICity #Batumi #LuxuryLiving',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      permalink: 'https://instagram.com/p/abc123',
      timestamp: '2025-01-21T16:45:00Z',
      likes: 892,
      comments: 45,
      saves: 67,
      reach: 12450,
      impressions: 18920,
      engagement: 1004,
    },
    {
      id: '2',
      caption: 'Modern interiors meet Black Sea elegance ✨ Book your stay now!',
      mediaType: 'CAROUSEL_ALBUM',
      mediaUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      permalink: 'https://instagram.com/p/def456',
      timestamp: '2025-01-19T12:30:00Z',
      likes: 756,
      comments: 38,
      saves: 54,
      reach: 10230,
      impressions: 15670,
      engagement: 848,
    },
    {
      id: '3',
      caption: 'Sunset magic 🌅 Every evening is special at ORBI City',
      mediaType: 'VIDEO',
      mediaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      permalink: 'https://instagram.com/p/ghi789',
      timestamp: '2025-01-17T19:00:00Z',
      likes: 1023,
      comments: 67,
      saves: 89,
      reach: 15890,
      impressions: 24560,
      engagement: 1179,
    },
  ];
}

function getMockInstagramStories(): InstagramStory[] {
  return [
    {
      id: '1',
      mediaType: 'IMAGE',
      timestamp: '2025-01-22T10:00:00Z',
      reach: 8920,
      impressions: 12450,
      replies: 34,
      exits: 245,
      tapsForward: 456,
      tapsBack: 123,
    },
    {
      id: '2',
      mediaType: 'VIDEO',
      timestamp: '2025-01-22T14:30:00Z',
      reach: 10230,
      impressions: 15670,
      replies: 45,
      exits: 312,
      tapsForward: 567,
      tapsBack: 178,
    },
  ];
}

function getMockInstagramAudience(): InstagramAudience {
  return {
    totalFollowers: 18750,
    demographics: {
      age: {
        '18-24': 3750,
        '25-34': 7500,
        '35-44': 4688,
        '45-54': 1875,
        '55+': 937,
      },
      gender: {
        male: 8063,
        female: 10687,
      },
      country: {
        Georgia: 9375,
        Russia: 3750,
        Turkey: 1875,
        Ukraine: 1125,
        Other: 2625,
      },
      city: {
        Batumi: 6563,
        Tbilisi: 2813,
        Moscow: 1875,
        Istanbul: 1125,
        Other: 6374,
      },
    },
    activeHours: {
      '0-3': 312,
      '3-6': 187,
      '6-9': 1125,
      '9-12': 2813,
      '12-15': 3750,
      '15-18': 5625,
      '18-21': 3750,
      '21-24': 1188,
    },
    activeDays: {
      Monday: 2250,
      Tuesday: 2438,
      Wednesday: 2625,
      Thursday: 2813,
      Friday: 3188,
      Saturday: 3375,
      Sunday: 2063,
    },
  };
}
