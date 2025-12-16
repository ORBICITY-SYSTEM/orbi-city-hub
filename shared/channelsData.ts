/**
 * Distribution Channels Portfolio Data
 * Complete data structure for all ORBI City distribution channels
 */

export type ChannelCategory = "OTA" | "Social Media" | "Review Site" | "Direct Booking" | "Metasearch";

export type ChannelStatus = "connected" | "not_connected" | "coming_soon";

export interface Channel {
  id: string;
  name: string;
  category: ChannelCategory;
  url: string;
  logoUrl?: string;
  status: ChannelStatus;
  commissionRate: number; // percentage
  description: string;
  
  // Performance metrics
  metrics: {
    bookings: number;
    revenue: number; // in GEL
    commission: number; // in GEL
    roi: number; // percentage
    conversionRate: number; // percentage
    avgBookingValue: number; // in GEL
    monthlyGrowth: number; // percentage
  };
  
  // Connection info
  connection: {
    apiIntegrated: boolean;
    lastSync?: Date;
    syncFrequency?: string;
  };
  
  // Upgrade opportunities
  upgrades: {
    available: boolean;
    suggestions: string[];
    potentialSavings?: number; // in GEL
  };
  
  // Best practices
  bestPractices: string[];
  
  // AI insights
  insights: {
    type: "success" | "warning" | "info";
    message: string;
  }[];
}

export const CHANNELS: Channel[] = [
  {
    id: "facebook",
    name: "Facebook",
    category: "Social Media",
    url: "https://www.facebook.com/share/1D9xvSc6Dh/?mibextid=wwXIfr",
    status: "connected",
    commissionRate: 0,
    description: "Social media marketing and direct bookings through Facebook page",
    metrics: {
      bookings: 12,
      revenue: 4850,
      commission: 0,
      roi: 245,
      conversionRate: 3.2,
      avgBookingValue: 404,
      monthlyGrowth: 18
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Real-time"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Enable Facebook Messenger booking bot",
        "Set up Facebook Ads campaign for 15% more reach"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Post high-quality photos 3-4 times per week",
      "Respond to messages within 1 hour",
      "Use Facebook Stories for last-minute deals"
    ],
    insights: [
      { type: "success", message: "Engagement rate increased by 28% this month" },
      { type: "info", message: "Best posting time: 6-8 PM on weekdays" }
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Social Media",
    url: "https://www.instagram.com/orbi_city_sea_view_apartment",
    status: "connected",
    commissionRate: 0,
    description: "Visual storytelling and direct bookings through Instagram profile",
    metrics: {
      bookings: 18,
      revenue: 7240,
      commission: 0,
      roi: 312,
      conversionRate: 4.1,
      avgBookingValue: 402,
      monthlyGrowth: 22
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Real-time"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Upgrade to Instagram Shopping for direct bookings",
        "Launch Instagram Reels campaign for 40% more reach"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Use Instagram Stories daily with property highlights",
      "Post Reels showcasing sea views and amenities",
      "Engage with followers through polls and Q&A"
    ],
    insights: [
      { type: "success", message: "Follower growth: +245 this month" },
      { type: "success", message: "Story views increased by 35%" }
    ]
  },
  {
    id: "orbicitybatumi",
    name: "orbicitybatumi.com",
    category: "Direct Booking",
    url: "https://www.orbicitybatumi.com",
    status: "connected",
    commissionRate: 0,
    description: "Official website with direct booking engine - zero commission",
    metrics: {
      bookings: 28,
      revenue: 11340,
      commission: 0,
      roi: 485,
      conversionRate: 5.8,
      avgBookingValue: 405,
      monthlyGrowth: 15
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Real-time"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Add live chat for 25% higher conversion",
        "Implement dynamic pricing engine",
        "Add multi-language support (Russian, Turkish, Arabic)"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Offer 10% discount for direct bookings",
      "Optimize website speed (target < 2s load time)",
      "Add customer testimonials and reviews"
    ],
    insights: [
      { type: "success", message: "Highest ROI channel - zero commission!" },
      { type: "info", message: "Mobile traffic: 68% of total visitors" }
    ]
  },
  {
    id: "booking",
    name: "Booking.com",
    category: "OTA",
    url: "https://www.booking.com/hotel/ge/orbi-city-luxury-sea-view-apartm",
    status: "connected",
    commissionRate: 15,
    description: "World's leading OTA with highest booking volume",
    metrics: {
      bookings: 145,
      revenue: 58650,
      commission: 8798,
      roi: 168,
      conversionRate: 12.4,
      avgBookingValue: 405,
      monthlyGrowth: 8
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Every 30 minutes"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Upgrade to Genius Program - reduce commission to 12%",
        "Enable Booking.com Payments for faster payouts",
        "Add professional photos for 23% more bookings"
      ],
      potentialSavings: 1760
    },
    bestPractices: [
      "Maintain 9.0+ review score",
      "Respond to reviews within 24 hours",
      "Update availability in real-time"
    ],
    insights: [
      { type: "warning", message: "Commission rate is high - consider Genius upgrade" },
      { type: "success", message: "Top performing OTA by booking volume" }
    ]
  },
  {
    id: "agoda",
    name: "Agoda",
    category: "OTA",
    url: "https://www.agoda.com/batumi-orbi-siliy-twin-tower-sea-wiev/hotel",
    status: "connected",
    commissionRate: 18,
    description: "Leading OTA in Asian markets with strong presence in Georgia",
    metrics: {
      bookings: 67,
      revenue: 27135,
      commission: 4884,
      roi: 142,
      conversionRate: 9.8,
      avgBookingValue: 405,
      monthlyGrowth: 12
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Every hour"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Join Agoda Partner Perks program - reduce commission to 15%",
        "Enable instant confirmation for higher visibility"
      ],
      potentialSavings: 814
    },
    bestPractices: [
      "Offer competitive rates for Asian travelers",
      "Add Chinese language description",
      "Highlight proximity to attractions"
    ],
    insights: [
      { type: "info", message: "Strong performance in Chinese market" },
      { type: "warning", message: "Highest commission rate among OTAs" }
    ]
  },
  {
    id: "expedia",
    name: "Expedia",
    category: "OTA",
    url: "https://www.expedia.com/Batumi-Hotels-ORBI-CITY-Luxury-Sea-View-A",
    status: "connected",
    commissionRate: 15,
    description: "Major OTA with strong US and European customer base",
    metrics: {
      bookings: 52,
      revenue: 21060,
      commission: 3159,
      roi: 156,
      conversionRate: 8.2,
      avgBookingValue: 405,
      monthlyGrowth: 10
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Every hour"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Join Expedia Rewards program for better visibility",
        "Enable package deals (hotel + flight) for 30% more bookings"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Maintain high review ratings",
      "Offer flexible cancellation policies",
      "Update calendar 12+ months in advance"
    ],
    insights: [
      { type: "success", message: "Strong performance in US market" },
      { type: "info", message: "Average booking lead time: 45 days" }
    ]
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Social Media",
    url: "https://www.tiktok.com/@orbi.apartments.batumi",
    status: "connected",
    commissionRate: 0,
    description: "Viral video marketing reaching younger demographics",
    metrics: {
      bookings: 8,
      revenue: 3240,
      commission: 0,
      roi: 420,
      conversionRate: 2.1,
      avgBookingValue: 405,
      monthlyGrowth: 45
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Real-time"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Launch TikTok Ads campaign for 10x reach",
        "Partner with travel influencers",
        "Create viral challenge #ORBICityViews"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Post 3-5 short videos per week",
      "Use trending sounds and hashtags",
      "Show behind-the-scenes content"
    ],
    insights: [
      { type: "success", message: "Fastest growing channel - 45% monthly growth!" },
      { type: "info", message: "Best performing content: sea view sunsets" }
    ]
  },
  {
    id: "ostrovok",
    name: "ostrovok.ru",
    category: "OTA",
    url: "https://ostrovok.ru/hotel/georgia/batumi/mid13345479/hotel_orbi_c",
    status: "connected",
    commissionRate: 12,
    description: "Leading Russian OTA serving CIS markets",
    metrics: {
      bookings: 89,
      revenue: 36045,
      commission: 4325,
      roi: 178,
      conversionRate: 11.2,
      avgBookingValue: 405,
      monthlyGrowth: 6
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Every 2 hours"
    },
    upgrades: {
      available: false,
      suggestions: []
    },
    bestPractices: [
      "Maintain Russian language descriptions",
      "Offer flexible payment options",
      "Highlight visa-free travel for Russians"
    ],
    insights: [
      { type: "success", message: "Lowest commission among major OTAs" },
      { type: "info", message: "Peak season: July-August (Russian holidays)" }
    ]
  },
  {
    id: "sutochno",
    name: "sutochno.com",
    category: "OTA",
    url: "https://sutochno.com/front/searchapp/search?occupied=2025-10-24:2",
    status: "connected",
    commissionRate: 10,
    description: "Russian apartment rental platform",
    metrics: {
      bookings: 34,
      revenue: 13770,
      commission: 1377,
      roi: 195,
      conversionRate: 7.8,
      avgBookingValue: 405,
      monthlyGrowth: 14
    },
    connection: {
      apiIntegrated: false,
      lastSync: undefined,
      syncFrequency: "Manual updates"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Enable API integration for automatic updates",
        "Add more property photos (target: 30+ photos)"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Update availability manually twice per week",
      "Respond to inquiries in Russian",
      "Offer long-term stay discounts"
    ],
    insights: [
      { type: "warning", message: "No API integration - manual updates required" },
      { type: "success", message: "Lowest commission rate: 10%" }
    ]
  },
  {
    id: "airbnb",
    name: "Airbnb",
    category: "OTA",
    url: "https://www.airbnb.com/rooms/1455314718960040955",
    status: "connected",
    commissionRate: 14,
    description: "Global vacation rental marketplace",
    metrics: {
      bookings: 76,
      revenue: 30780,
      commission: 4309,
      roi: 162,
      conversionRate: 10.5,
      avgBookingValue: 405,
      monthlyGrowth: 9
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Real-time"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Become Superhost for better visibility",
        "Enable Instant Book for 40% more bookings",
        "Add guidebook for 5-star reviews"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Maintain 4.8+ rating",
      "Provide local recommendations",
      "Offer self check-in"
    ],
    insights: [
      { type: "info", message: "Average stay duration: 4.2 nights" },
      { type: "success", message: "Strong performance in European market" }
    ]
  },
  {
    id: "bronevik",
    name: "bronevik.com",
    category: "OTA",
    url: "https://bronevik.com/en/hotel/start?hotel_id=757157",
    status: "connected",
    commissionRate: 13,
    description: "Russian corporate travel booking platform",
    metrics: {
      bookings: 23,
      revenue: 9315,
      commission: 1211,
      roi: 152,
      conversionRate: 6.4,
      avgBookingValue: 405,
      monthlyGrowth: 11
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Every 4 hours"
    },
    upgrades: {
      available: false,
      suggestions: []
    },
    bestPractices: [
      "Offer corporate rates",
      "Provide invoices for business travelers",
      "Maintain flexible cancellation"
    ],
    insights: [
      { type: "info", message: "Focus on business travelers" },
      { type: "success", message: "High average booking value" }
    ]
  },
  {
    id: "tvil",
    name: "tvil.ru",
    category: "OTA",
    url: "https://tvil.ru/city/batumi/hotels/2062593/?[arrival]=2025-11-01",
    status: "connected",
    commissionRate: 11,
    description: "Russian hotel booking platform",
    metrics: {
      bookings: 19,
      revenue: 7695,
      commission: 846,
      roi: 165,
      conversionRate: 5.9,
      avgBookingValue: 405,
      monthlyGrowth: 7
    },
    connection: {
      apiIntegrated: false,
      lastSync: undefined,
      syncFrequency: "Manual updates"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Request API integration from tvil.ru",
        "Add virtual tour for better conversion"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Update prices weekly",
      "Add seasonal promotions",
      "Highlight unique features"
    ],
    insights: [
      { type: "warning", message: "Manual updates - consider API integration" },
      { type: "info", message: "Growing steadily in Russian market" }
    ]
  },
  {
    id: "hostelworld",
    name: "Hostelworld",
    category: "OTA",
    url: "https://www.hostelworld.com/pwa/hosteldetails.php/Orbi-City-Sea-v",
    status: "connected",
    commissionRate: 12,
    description: "Budget traveler and backpacker booking platform",
    metrics: {
      bookings: 15,
      revenue: 6075,
      commission: 729,
      roi: 148,
      conversionRate: 4.2,
      avgBookingValue: 405,
      monthlyGrowth: 16
    },
    connection: {
      apiIntegrated: false,
      lastSync: undefined,
      syncFrequency: "Manual updates"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Offer dorm-style pricing for budget travelers",
        "Add free walking tour partnership"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Target younger demographics (18-30)",
      "Highlight social atmosphere",
      "Offer group discounts"
    ],
    insights: [
      { type: "info", message: "Fastest growing segment: solo travelers" },
      { type: "success", message: "16% monthly growth" }
    ]
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Social Media",
    url: "https://www.youtube.com/@ORBIAPARTMENTS",
    status: "connected",
    commissionRate: 0,
    description: "Video marketing and virtual tours",
    metrics: {
      bookings: 5,
      revenue: 2025,
      commission: 0,
      roi: 385,
      conversionRate: 1.8,
      avgBookingValue: 405,
      monthlyGrowth: 25
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Real-time"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Create 360° virtual tour videos",
        "Launch YouTube Ads campaign",
        "Collaborate with travel vloggers"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Upload property tour videos",
      "Create neighborhood guides",
      "Add subtitles in multiple languages"
    ],
    insights: [
      { type: "success", message: "High engagement rate on video content" },
      { type: "info", message: "Average video watch time: 3:45 minutes" }
    ]
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    category: "Review Site",
    url: "https://www.tripadvisor.com/Hotel_Review-g297576-d27797353-Review",
    status: "connected",
    commissionRate: 12,
    description: "World's largest travel review and booking platform",
    metrics: {
      bookings: 31,
      revenue: 12555,
      commission: 1507,
      roi: 175,
      conversionRate: 8.9,
      avgBookingValue: 405,
      monthlyGrowth: 13
    },
    connection: {
      apiIntegrated: true,
      lastSync: new Date(),
      syncFrequency: "Every 6 hours"
    },
    upgrades: {
      available: true,
      suggestions: [
        "Upgrade to Premium listing for 2x visibility",
        "Enable TripAdvisor Instant Booking",
        "Add professional photos and videos"
      ],
      potentialSavings: 0
    },
    bestPractices: [
      "Respond to all reviews within 48 hours",
      "Maintain 4.5+ rating",
      "Encourage satisfied guests to leave reviews"
    ],
    insights: [
      { type: "success", message: "4.8/5 rating from 127 reviews" },
      { type: "info", message: "Reviews drive 35% of booking decisions" }
    ]
  }
];

// Coming Soon channels
export const COMING_SOON_CHANNELS = [
  {
    id: "yandex",
    name: "Yandex Travel",
    category: "OTA" as ChannelCategory,
    status: "coming_soon" as ChannelStatus,
    description: "Russian search engine's travel booking platform",
    estimatedLaunch: "Q1 2026"
  },
  {
    id: "hrs",
    name: "HRS",
    category: "OTA" as ChannelCategory,
    status: "coming_soon" as ChannelStatus,
    description: "Corporate hotel booking platform",
    estimatedLaunch: "Q1 2026"
  },
  {
    id: "tripcom",
    name: "Trip.com",
    category: "OTA" as ChannelCategory,
    status: "coming_soon" as ChannelStatus,
    description: "Leading Chinese OTA (formerly Ctrip)",
    estimatedLaunch: "Q2 2026"
  },
  {
    id: "cbooking",
    name: "Cbooking.ru",
    category: "OTA" as ChannelCategory,
    status: "coming_soon" as ChannelStatus,
    description: "Russian hotel booking platform",
    estimatedLaunch: "Q2 2026"
  }
];

// Helper functions
export function getChannelById(id: string): Channel | undefined {
  return CHANNELS.find(c => c.id === id);
}

export function getChannelsByCategory(category: ChannelCategory): Channel[] {
  return CHANNELS.filter(c => c.category === category);
}

export function getConnectedChannels(): Channel[] {
  return CHANNELS.filter(c => c.status === "connected");
}

export function getTotalMetrics() {
  return CHANNELS.reduce((acc, channel) => ({
    bookings: acc.bookings + channel.metrics.bookings,
    revenue: acc.revenue + channel.metrics.revenue,
    commission: acc.commission + channel.metrics.commission,
  }), { bookings: 0, revenue: 0, commission: 0 });
}

export function getTopPerformingChannels(limit: number = 5): Channel[] {
  return [...CHANNELS]
    .sort((a, b) => b.metrics.roi - a.metrics.roi)
    .slice(0, limit);
}
