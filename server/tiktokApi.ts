/**
 * TikTok Analytics API Integration
 * Fetches video performance metrics and trending sounds
 */

export interface TikTokInsights {
  accountId: string;
  username: string;
  followers: number;
  following: number;
  videoCount: number;
  totalLikes: number;
  totalViews: number;
  totalShares: number;
  avgEngagementRate: number;
  profileViews: number;
}

export interface TikTokVideo {
  id: string;
  caption: string;
  videoUrl: string;
  coverUrl: string;
  createTime: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  duration: number;
  engagementRate: number;
  soundName?: string;
  soundUrl?: string;
}

export interface TikTokTrendingSound {
  id: string;
  title: string;
  author: string;
  duration: number;
  useCount: number;
  trending: boolean;
  category: string;
}

export interface TikTokAudience {
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
 * Fetch TikTok account insights
 */
export async function getTikTokInsights(
  accountId?: string
): Promise<{
  success: boolean;
  data?: TikTokInsights;
  error?: string;
}> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    console.warn('[TikTok API] Using mock data - configure TIKTOK_ACCESS_TOKEN and account ID');
    return {
      success: true,
      data: getMockTikTokInsights(),
    };
  }

  try {
    // In production, this would call TikTok Business API
    // const response = await fetch(
    //   `https://business-api.tiktok.com/open_api/v1.3/user/info/?access_token=${accessToken}`
    // );
    // const data = await response.json();

    return {
      success: true,
      data: getMockTikTokInsights(),
    };
  } catch (error) {
    console.error('[TikTok API] Error fetching insights:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch TikTok top videos
 */
export async function getTikTokTopVideos(
  accountId?: string,
  limit: number = 12
): Promise<{
  success: boolean;
  videos?: TikTokVideo[];
  error?: string;
}> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    console.warn('[TikTok API] Using mock data');
    return {
      success: true,
      videos: getMockTikTokVideos(),
    };
  }

  try {
    // In production:
    // const response = await fetch(
    //   `https://business-api.tiktok.com/open_api/v1.3/video/list/?access_token=${accessToken}&count=${limit}`
    // );

    return {
      success: true,
      videos: getMockTikTokVideos(),
    };
  } catch (error) {
    console.error('[TikTok API] Error fetching videos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch TikTok trending sounds
 */
export async function getTikTokTrendingSounds(): Promise<{
  success: boolean;
  sounds?: TikTokTrendingSound[];
  error?: string;
}> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      success: true,
      sounds: getMockTrendingSounds(),
    };
  }

  try {
    return {
      success: true,
      sounds: getMockTrendingSounds(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch TikTok audience demographics
 */
export async function getTikTokAudience(
  accountId?: string
): Promise<{
  success: boolean;
  data?: TikTokAudience;
  error?: string;
}> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken || !accountId) {
    return {
      success: true,
      data: getMockTikTokAudience(),
    };
  }

  try {
    return {
      success: true,
      data: getMockTikTokAudience(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Mock data for development
function getMockTikTokInsights(): TikTokInsights {
  return {
    accountId: 'orbi_city_batumi',
    username: '@orbi_city_batumi',
    followers: 24500,
    following: 156,
    videoCount: 89,
    totalLikes: 456780,
    totalViews: 2345670,
    totalShares: 12340,
    avgEngagementRate: 8.5,
    profileViews: 34560,
  };
}

function getMockTikTokVideos(): TikTokVideo[] {
  return [
    {
      id: '1',
      caption: 'Stunning Black Sea sunset from ORBI City 🌅 #Batumi #LuxuryApartments #GeorgiaTourism',
      videoUrl: 'https://example.com/video1.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      createTime: '2025-01-22T18:30:00Z',
      views: 125600,
      likes: 12450,
      comments: 456,
      shares: 234,
      saves: 567,
      duration: 15,
      engagementRate: 10.5,
      soundName: 'Summer Vibes - Original Sound',
      soundUrl: 'https://example.com/sound1.mp3',
    },
    {
      id: '2',
      caption: 'Room tour! Modern luxury in the heart of Batumi 🏙️ #ORBICity #Aparthotel',
      videoUrl: 'https://example.com/video2.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      createTime: '2025-01-20T14:00:00Z',
      views: 98700,
      likes: 9870,
      comments: 345,
      shares: 178,
      saves: 445,
      duration: 30,
      engagementRate: 11.2,
      soundName: 'Luxury Life - Trending',
      soundUrl: 'https://example.com/sound2.mp3',
    },
    {
      id: '3',
      caption: 'Pool day at ORBI City! Who wants to join? 🏊‍♀️☀️ #BatumiLife #SummerVibes',
      videoUrl: 'https://example.com/video3.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      createTime: '2025-01-18T12:00:00Z',
      views: 156800,
      likes: 15680,
      comments: 678,
      shares: 345,
      saves: 789,
      duration: 20,
      engagementRate: 11.8,
      soundName: 'Pool Party Mix',
      soundUrl: 'https://example.com/sound3.mp3',
    },
  ];
}

function getMockTrendingSounds(): TikTokTrendingSound[] {
  return [
    {
      id: '1',
      title: 'Summer Vibes - Original Sound',
      author: 'DJ Sunset',
      duration: 30,
      useCount: 1234567,
      trending: true,
      category: 'Music',
    },
    {
      id: '2',
      title: 'Luxury Life - Trending',
      author: 'Lifestyle Beats',
      duration: 45,
      useCount: 987654,
      trending: true,
      category: 'Lifestyle',
    },
    {
      id: '3',
      title: 'Pool Party Mix',
      author: 'Summer Sounds',
      duration: 60,
      useCount: 765432,
      trending: true,
      category: 'Party',
    },
    {
      id: '4',
      title: 'Travel Vibes',
      author: 'Wanderlust Music',
      duration: 30,
      useCount: 654321,
      trending: true,
      category: 'Travel',
    },
    {
      id: '5',
      title: 'Batumi Nights',
      author: 'Georgian Beats',
      duration: 40,
      useCount: 543210,
      trending: false,
      category: 'Local',
    },
  ];
}

function getMockTikTokAudience(): TikTokAudience {
  return {
    totalFollowers: 24500,
    demographics: {
      age: {
        '13-17': 2450,
        '18-24': 9800,
        '25-34': 7350,
        '35-44': 3675,
        '45+': 1225,
      },
      gender: {
        male: 10780,
        female: 13720,
      },
      country: {
        Georgia: 14700,
        Russia: 4900,
        Turkey: 2450,
        Ukraine: 1225,
        Other: 1225,
      },
      city: {
        Batumi: 8575,
        Tbilisi: 3675,
        Moscow: 2450,
        Istanbul: 1470,
        Other: 8330,
      },
    },
    activeHours: {
      '0-3': 490,
      '3-6': 245,
      '6-9': 1470,
      '9-12': 3675,
      '12-15': 4900,
      '15-18': 7350,
      '18-21': 4900,
      '21-24': 1470,
    },
    activeDays: {
      Monday: 2940,
      Tuesday: 3185,
      Wednesday: 3430,
      Thursday: 3675,
      Friday: 4165,
      Saturday: 4410,
      Sunday: 2695,
    },
  };
}
