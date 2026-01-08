/**
 * useGoogleSheets.ts
 * 
 * Custom React hooks for fetching data from Google Sheets
 * Part of the PowerStack architecture
 */

import { useState, useEffect, useCallback } from 'react';
import GoogleSheetsService, {
  Reservation,
  FinancialSummary,
  UnitPerformance,
  HousekeepingUnit,
} from '@/lib/GoogleSheetsService';

// ============================================================================
// GENERIC HOOK FOR SHEETS DATA
// ============================================================================

interface UseGoogleSheetsResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useGoogleSheetsData<T>(
  fetcher: () => Promise<T>,
  refreshInterval?: number
): UseGoogleSheetsResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// SPECIFIC HOOKS
// ============================================================================

/**
 * Hook for fetching reservations
 */
export function useReservations(refreshInterval = 60000) {
  return useGoogleSheetsData<Reservation[]>(
    GoogleSheetsService.getReservations,
    refreshInterval
  );
}

/**
 * Hook for fetching financial summary
 */
export function useFinancialSummary(refreshInterval = 60000) {
  return useGoogleSheetsData<FinancialSummary[]>(
    GoogleSheetsService.getFinancialSummary,
    refreshInterval
  );
}

/**
 * Hook for fetching unit performance (60 apartments)
 */
export function useUnitPerformance(refreshInterval = 60000) {
  return useGoogleSheetsData<UnitPerformance[]>(
    GoogleSheetsService.getUnitPerformance,
    refreshInterval
  );
}

/**
 * Hook for fetching housekeeping status
 */
export function useHousekeeping(refreshInterval = 30000) {
  return useGoogleSheetsData<HousekeepingUnit[]>(
    GoogleSheetsService.getHousekeepingStatus,
    refreshInterval
  );
}

/**
 * Hook for fetching dashboard KPIs
 */
export function useDashboardKPIs(refreshInterval = 30000) {
  return useGoogleSheetsData(
    GoogleSheetsService.getDashboardKPIs,
    refreshInterval
  );
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

interface UseMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for updating housekeeping status
 */
export function useUpdateHousekeeping(): UseMutationResult<
  { unitId: string; status: HousekeepingUnit['status'] },
  boolean
> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (input: { unitId: string; status: HousekeepingUnit['status'] }) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await GoogleSheetsService.updateHousekeepingStatus(
        input.unitId,
        input.status
      );
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

/**
 * Hook for triggering OTELMS sync
 */
export function useTriggerSync(): UseMutationResult<void, boolean> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await GoogleSheetsService.triggerOtelmsSync();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

// ============================================================================
// COMPUTED DATA HOOKS
// ============================================================================

/**
 * Hook for getting top performing units
 */
export function useTopPerformers(limit = 10) {
  const { data: units, ...rest } = useUnitPerformance();
  
  const topPerformers = units
    ? units.slice(0, limit)
    : null;

  return { data: topPerformers, ...rest };
}

/**
 * Hook for getting housekeeping summary
 */
export function useHousekeepingSummary() {
  const { data: housekeeping, ...rest } = useHousekeeping();

  const summary = housekeeping
    ? {
        total: housekeeping.length,
        clean: housekeeping.filter(h => h.status === 'clean').length,
        dirty: housekeeping.filter(h => h.status === 'dirty').length,
        inProgress: housekeeping.filter(h => h.status === 'in_progress').length,
        maintenance: housekeeping.filter(h => h.status === 'maintenance').length,
        highPriority: housekeeping.filter(h => h.priority === 'high').length,
      }
    : null;

  return { data: summary, housekeeping, ...rest };
}

/**
 * Hook for getting financial metrics
 */
export function useFinancialMetrics() {
  const { data: financials, ...rest } = useFinancialSummary();

  const metrics = financials
    ? {
        totalRevenue: financials.reduce((sum, f) => sum + f.totalRevenue, 0),
        totalExpenses: financials.reduce((sum, f) => sum + f.totalExpenses, 0),
        totalProfit: financials.reduce((sum, f) => sum + f.netProfit, 0),
        avgOccupancy: Math.round(
          financials.reduce((sum, f) => sum + f.occupancyRate, 0) / financials.length
        ),
        avgADR: Math.round(
          financials.reduce((sum, f) => sum + f.adr, 0) / financials.length
        ),
        avgRevPAR: Math.round(
          financials.reduce((sum, f) => sum + f.revPAR, 0) / financials.length
        ),
        monthlyData: financials,
      }
    : null;

  return { data: metrics, ...rest };
}

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export default {
  useReservations,
  useFinancialSummary,
  useUnitPerformance,
  useHousekeeping,
  useDashboardKPIs,
  useUpdateHousekeeping,
  useTriggerSync,
  useTopPerformers,
  useHousekeepingSummary,
  useFinancialMetrics,
};
