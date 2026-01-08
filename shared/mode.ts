/**
 * Application Mode Detection
 * 
 * LIVE Mode: Real ORBI City Batumi operations (team.orbicitybatumi.com)
 * DEMO Mode: Sales showcase with sample data (demo.orbicitybatumi.com)
 * 
 * Frontend uses: import.meta.env.VITE_APP_MODE
 * Backend uses: process.env.APP_MODE
 */

export type AppMode = 'live' | 'demo';

/**
 * Get current application mode
 * Works in both frontend (Vite) and backend (Node.js) environments
 */
function detectAppMode(): AppMode {
  // Frontend (Vite) - check import.meta.env first
  if (typeof window !== 'undefined') {
    // @ts-ignore - Vite injects this at build time
    const viteMode = (import.meta as any)?.env?.VITE_APP_MODE;
    if (viteMode === 'demo') return 'demo';
    if (viteMode === 'live') return 'live';
  }
  
  // Backend (Node.js) - check process.env
  if (typeof process !== 'undefined' && process.env) {
    const nodeMode = process.env.APP_MODE;
    if (nodeMode === 'demo') return 'demo';
    if (nodeMode === 'live') return 'live';
  }
  
  // Default to live
  return 'live';
}

export const APP_MODE = detectAppMode();

export const isLiveMode = (): boolean => APP_MODE === 'live';
export const isDemoMode = (): boolean => APP_MODE === 'demo';

/**
 * Get mode-specific configuration
 */
export function getModeConfig() {
  return {
    mode: APP_MODE,
    isLive: isLiveMode(),
    isDemo: isDemoMode(),
    showSampleDataBadges: isDemoMode(),
    allowRealIntegrations: isLiveMode(),
    enableGuidedTour: isDemoMode(),
    databaseSource: isLiveMode() ? 'real' : 'fixtures',
  };
}

/**
 * Mode-specific feature flags
 */
export const MODE_FEATURES = {
  live: {
    realDatabase: true,
    realIntegrations: true,
    emailSync: true,
    bookingScraping: true,
    payments: true,
    aiAgents: true,
  },
  demo: {
    realDatabase: false,
    realIntegrations: false,
    emailSync: false,
    bookingScraping: false,
    payments: false,
    aiAgents: true, // AI works in demo too
  },
} as const;

/**
 * Check if a feature is enabled in current mode
 */
export function isFeatureEnabled(feature: keyof typeof MODE_FEATURES.live): boolean {
  return MODE_FEATURES[APP_MODE][feature];
}
