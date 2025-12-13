/**
 * Application Mode Detection
 * 
 * LIVE Mode: Real ORBI City Batumi operations (team.orbicitybatumi.com)
 * DEMO Mode: Sales showcase with sample data (demo.orbicitybatumi.com)
 */

export type AppMode = 'live' | 'demo';

export const APP_MODE = (process.env.APP_MODE || 'live') as AppMode;

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
    enableGuidedTour: isDemoMode()
  };
}
