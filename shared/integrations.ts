/**
 * Integrations Registry
 * 
 * Central registry of all available integrations for ORBI City Hub
 * Used in the Integrations Marketplace page
 */

export type IntegrationCategory = 'pms' | 'ota' | 'payment' | 'marketing' | 'email' | 'analytics';
export type IntegrationStatus = 'available' | 'requires_setup' | 'coming_soon';
export type SetupTime = '10 min' | '30 min' | '1 day' | '1 week';
export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  setupTime: SetupTime;
  planTier: PlanTier;
  features: string[];
  demoUrl?: string;
  icon: string;
  description: string;
}

export const integrations: Integration[] = [
  // ✅ AVAILABLE (Already Integrated)
  {
    id: 'gmail',
    name: 'Gmail Inbox AI',
    category: 'email',
    status: 'available',
    setupTime: '10 min',
    planTier: 'starter',
    description: 'AI-powered email management with automatic categorization and sentiment analysis',
    features: [
      'AI categorization (10 categories: bookings, questions, payments, etc.)',
      'Sentiment analysis (positive, neutral, negative)',
      'Priority detection (urgent, high, normal, low)',
      'Multi-language support (Georgian, English, Russian)',
      'Automatic booking extraction from emails'
    ],
    demoUrl: '/email-management',
    icon: '📧'
  },
  {
    id: 'booking_com',
    name: 'Booking.com Automation',
    category: 'ota',
    status: 'available',
    setupTime: '1 day',
    planTier: 'starter',
    description: 'Automated scraping and sync of Booking.com reservations and performance data',
    features: [
      'Daily automated scraping with scheduler',
      'Booking sync to database',
      'Performance reports generation',
      'CAPTCHA and cookie handling',
      'JSON export of daily reports'
    ],
    demoUrl: '/marketing',
    icon: '🏨'
  },
  {
    id: 'finance_dashboard',
    name: 'Finance Analytics',
    category: 'analytics',
    status: 'available',
    setupTime: '10 min',
    planTier: 'starter',
    description: 'Real-time financial analytics with Excel/CSV import and Chart.js visualizations',
    features: [
      'Real data from Excel imports (₾920,505 total revenue)',
      '12 months historical data tracking',
      '7 Chart.js visualizations',
      'Month/period filters',
      'Excel/CSV export functionality'
    ],
    demoUrl: '/finance',
    icon: '💰'
  },
  
  // 🔒 REQUIRES SETUP (Integration exists, needs credentials)
  {
    id: 'otelms',
    name: 'OTELMS PMS',
    category: 'pms',
    status: 'requires_setup',
    setupTime: '1 week',
    planTier: 'pro',
    description: 'Property Management System integration for real-time reservation sync',
    features: [
      'Real-time reservation synchronization',
      'Guest profile management',
      'Room inventory tracking',
      'Check-in/check-out automation',
      'Housekeeping task management'
    ],
    icon: '🏢'
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    category: 'analytics',
    status: 'requires_setup',
    setupTime: '10 min',
    planTier: 'pro',
    description: 'Website traffic and conversion tracking with Google Analytics 4',
    features: [
      'Real-time visitor tracking',
      'Conversion funnel analysis',
      'Traffic source breakdown',
      'Custom event tracking',
      'E-commerce tracking'
    ],
    icon: '📊'
  },
  {
    id: 'facebook_instagram',
    name: 'Meta Business Suite',
    category: 'marketing',
    status: 'requires_setup',
    setupTime: '30 min',
    planTier: 'pro',
    description: 'Facebook and Instagram social media analytics and management',
    features: [
      'Follower growth tracking',
      'Engagement rate analysis',
      'Post performance metrics',
      'Best time to post recommendations',
      'Automated posting (coming soon)'
    ],
    icon: '📱'
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    category: 'ota',
    status: 'requires_setup',
    setupTime: '1 day',
    planTier: 'pro',
    description: 'Airbnb reservation sync and performance tracking',
    features: [
      'Reservation import via iCal feed',
      'Performance metrics tracking',
      'Review management',
      'Pricing sync',
      'Availability calendar sync'
    ],
    icon: '🏡'
  },
  {
    id: 'expedia',
    name: 'Expedia',
    category: 'ota',
    status: 'requires_setup',
    setupTime: '1 week',
    planTier: 'pro',
    description: 'Expedia Group channel manager integration',
    features: [
      'Multi-brand support (Expedia, Hotels.com, Vrbo)',
      'Real-time availability updates',
      'Rate and inventory management',
      'Booking notifications',
      'Performance analytics'
    ],
    icon: '✈️'
  },
  {
    id: 'tbc_pay',
    name: 'TBC Pay',
    category: 'payment',
    status: 'requires_setup',
    setupTime: '1 day',
    planTier: 'pro',
    description: 'Georgian payment gateway for online transactions',
    features: [
      'Secure GEL payment processing',
      'Visa/Mastercard support',
      'Recurring payments',
      'Refund management',
      'Transaction reporting'
    ],
    icon: '💳'
  },
  
  // 🟡 COMING SOON (Planned integrations)
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    status: 'coming_soon',
    setupTime: '1 day',
    planTier: 'enterprise',
    description: 'International payment processing with multi-currency support',
    features: [
      'Multi-currency support (USD, EUR, GBP, etc.)',
      'Subscription billing',
      'Payment links',
      'Fraud prevention',
      'Detailed analytics'
    ],
    icon: '💵'
  },
  {
    id: 'whatsapp_business',
    name: 'WhatsApp Business',
    category: 'marketing',
    status: 'coming_soon',
    setupTime: '30 min',
    planTier: 'enterprise',
    description: 'WhatsApp messaging for guest communication',
    features: [
      'Automated booking confirmations',
      'Guest messaging',
      'Template messages',
      'Chat analytics',
      'Multi-agent support'
    ],
    icon: '💬'
  },
  {
    id: 'agoda',
    name: 'Agoda',
    category: 'ota',
    status: 'coming_soon',
    setupTime: '1 week',
    planTier: 'enterprise',
    description: 'Agoda channel manager integration for Asian markets',
    features: [
      'Reservation sync',
      'Rate and availability management',
      'Review tracking',
      'Performance analytics',
      'Promotional campaigns'
    ],
    icon: '🌏'
  },
  {
    id: 'tripadvisor',
    name: 'TripAdvisor',
    category: 'marketing',
    status: 'coming_soon',
    setupTime: '30 min',
    planTier: 'enterprise',
    description: 'Review management and reputation tracking',
    features: [
      'Review monitoring',
      'Response management',
      'Rating analytics',
      'Competitor benchmarking',
      'Review request automation'
    ],
    icon: '⭐'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    status: 'coming_soon',
    setupTime: '30 min',
    planTier: 'enterprise',
    description: 'Email marketing and guest communication',
    features: [
      'Guest email campaigns',
      'Automated welcome emails',
      'Newsletter management',
      'A/B testing',
      'Campaign analytics'
    ],
    icon: '📮'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'analytics',
    status: 'coming_soon',
    setupTime: '1 day',
    planTier: 'enterprise',
    description: 'Connect with 5000+ apps via automation workflows',
    features: [
      'Custom workflow automation',
      'Multi-app integrations',
      'Trigger-based actions',
      'Data synchronization',
      'No-code automation'
    ],
    icon: '⚡'
  }
];

/**
 * Get integrations by category
 */
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return integrations.filter(i => i.category === category);
}

/**
 * Get integrations by status
 */
export function getIntegrationsByStatus(status: IntegrationStatus): Integration[] {
  return integrations.filter(i => i.status === status);
}

/**
 * Get integration by ID
 */
export function getIntegrationById(id: string): Integration | undefined {
  return integrations.find(i => i.id === id);
}

/**
 * Get integration statistics
 */
export function getIntegrationStats() {
  return {
    total: integrations.length,
    available: getIntegrationsByStatus('available').length,
    requiresSetup: getIntegrationsByStatus('requires_setup').length,
    comingSoon: getIntegrationsByStatus('coming_soon').length,
    byCategory: {
      pms: getIntegrationsByCategory('pms').length,
      ota: getIntegrationsByCategory('ota').length,
      payment: getIntegrationsByCategory('payment').length,
      marketing: getIntegrationsByCategory('marketing').length,
      email: getIntegrationsByCategory('email').length,
      analytics: getIntegrationsByCategory('analytics').length
    }
  };
}
