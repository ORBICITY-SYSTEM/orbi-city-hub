/**
 * useDemoMode.ts
 * 
 * Demo Toggle Pattern for Hybrid Architecture
 * 
 * USAGE:
 * - VITE_USE_DEMO_DATA=false → Legacy Node/MySQL backend (hub.orbicitybatumi.com)
 * - VITE_USE_DEMO_DATA=true  → Google Sheets PowerStack (demo.orbicitybatumi.com)
 * 
 * This allows safe A/B deployment without touching the production backend.
 */

/**
 * Check if demo mode is enabled via environment variable
 */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_USE_DEMO_DATA === 'true';
}

/**
 * Hook for accessing demo mode state
 */
export function useDemoMode() {
  const isDemo = isDemoMode();
  
  return {
    isDemo,
    mode: isDemo ? 'powerstack' : 'legacy',
    dataSource: isDemo ? 'Google Sheets' : 'MySQL Database',
    badge: isDemo ? 'PowerStack Demo' : 'Production',
  };
}

/**
 * Conditional data fetcher - uses appropriate backend based on mode
 * 
 * @param legacyFetcher - Function that fetches from tRPC/Node backend
 * @param demoFetcher - Function that fetches from Google Sheets
 */
export async function fetchWithMode<T>(
  legacyFetcher: () => Promise<T>,
  demoFetcher: () => Promise<T>
): Promise<T> {
  if (isDemoMode()) {
    return demoFetcher();
  }
  return legacyFetcher();
}

/**
 * React hook for conditional data fetching
 */
export function useConditionalFetch<T>(
  legacyHook: () => { data: T | undefined; isLoading: boolean; error: Error | null },
  demoHook: () => { data: T | null; isLoading: boolean; error: Error | null }
) {
  const isDemo = isDemoMode();
  
  // Call both hooks but only use the appropriate one
  // This is required by React's rules of hooks
  const legacyResult = legacyHook();
  const demoResult = demoHook();
  
  if (isDemo) {
    return {
      data: demoResult.data,
      isLoading: demoResult.isLoading,
      error: demoResult.error,
      source: 'powerstack' as const,
    };
  }
  
  return {
    data: legacyResult.data,
    isLoading: legacyResult.isLoading,
    error: legacyResult.error,
    source: 'legacy' as const,
  };
}

export default useDemoMode;
