/**
 * GoogleSheetsService.ts
 * 
 * ORBI City Hub - PowerStack Architecture
 * 
 * This service connects the React frontend directly to Google Sheets,
 * eliminating the need for a traditional backend server.
 * 
 * Architecture:
 * - Google Sheets = Database
 * - Google Apps Script = API Layer
 * - This Service = Frontend Adapter
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Google Sheets Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet named "Orbi_City_Master_DB"
 * 2. Publish it: File → Share → Publish to web → CSV
 * 3. Copy the published URL and paste below
 * 4. For AppScript Web App, deploy as web app and paste URL below
 */
export const SHEETS_CONFIG = {
  // Published Google Sheet URLs (CSV format)
  MASTER_DB_URL: import.meta.env.VITE_GOOGLE_SHEETS_MASTER_DB || '',
  
  // Individual tab URLs (append ?gid=TAB_ID to base URL)
  TABS: {
    RESERVATIONS: 'gid=0',           // Tab 1: OTELMS Reservations
    FINANCIAL_SUMMARY: 'gid=1',      // Tab 2: Financial Data
    UNIT_PERFORMANCE: 'gid=2',       // Tab 3: 60 Apartments Performance
    HOUSEKEEPING: 'gid=3',           // Tab 4: Logistics/Cleaning Status
    REVIEWS: 'gid=4',                // Tab 5: Reviews Data
    OCCUPANCY: 'gid=5',              // Tab 6: Occupancy by Month
  },
  
  // Google Apps Script Web App URL (for write operations)
  APPSCRIPT_WEB_APP_URL: import.meta.env.VITE_APPSCRIPT_WEB_APP_URL || '',
  
  // Cache duration in milliseconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// DATA TYPES
// ============================================================================

export interface Reservation {
  id: string;
  roomNumber: string;
  guestName: string;
  source: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  paid: number;
  balance: number;
  createdAt: string;
}

export interface FinancialSummary {
  month: string;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  adr: number; // Average Daily Rate
  revPAR: number; // Revenue Per Available Room
}

export interface UnitPerformance {
  unitId: string;
  unitName: string;
  block: string;
  inceptionDate: string;
  totalNights: number;
  occupiedNights: number;
  occupancyRate: number;
  totalRevenue: number;
  adr: number;
  roi: number;
  rank: number;
}

export interface HousekeepingUnit {
  unitId: string;
  unitName: string;
  status: 'clean' | 'dirty' | 'in_progress' | 'maintenance';
  lastCleaned: string;
  nextCheckIn: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OccupancyData {
  month: string;
  day: number;
  occupancyPercent: number;
  year: number;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > SHEETS_CONFIG.CACHE_DURATION) {
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
}

// ============================================================================
// CSV PARSING UTILITIES
// ============================================================================

function parseCSV<T>(csvText: string, mapper: (row: string[]) => T): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Skip header row
  const dataRows = lines.slice(1);
  
  return dataRows.map(line => {
    // Handle quoted values with commas inside
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
    
    return mapper(values);
  });
}

// ============================================================================
// FETCH UTILITIES
// ============================================================================

async function fetchSheetData(tabGid: string): Promise<string> {
  const baseUrl = SHEETS_CONFIG.MASTER_DB_URL;
  if (!baseUrl) {
    throw new Error('Google Sheets URL not configured. Set VITE_GOOGLE_SHEETS_MASTER_DB in environment.');
  }
  
  const url = `${baseUrl}&${tabGid}&output=csv`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
  }
  
  return response.text();
}

// ============================================================================
// DEMO DATA (Fallback when Sheets not configured)
// ============================================================================

function generateDemoReservations(): Reservation[] {
  const sources = ['Booking.com', 'Airbnb.com', 'Expedia', 'Direct', 'Agoda'];
  const rooms = ['A 1033', 'A 1301', 'A 1806', 'C 2520', 'C 2529', 'C 2609', 'C 3421', 'C 3611', 'D 3727'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `RES-${1000 + i}`,
    roomNumber: rooms[i % rooms.length],
    guestName: `Guest ${i + 1}`,
    source: sources[i % sources.length],
    checkIn: new Date(2025, 11, 20 + (i % 10)).toISOString().split('T')[0],
    checkOut: new Date(2025, 11, 21 + (i % 10) + Math.floor(Math.random() * 5)).toISOString().split('T')[0],
    nights: 1 + Math.floor(Math.random() * 7),
    amount: 50 + Math.floor(Math.random() * 150),
    paid: Math.random() > 0.3 ? 50 + Math.floor(Math.random() * 150) : 0,
    balance: Math.random() > 0.3 ? 0 : -(50 + Math.floor(Math.random() * 100)),
    createdAt: new Date().toISOString(),
  }));
}

function generateDemoFinancials(): FinancialSummary[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, i) => ({
    month,
    year: 2025,
    totalRevenue: 80000 + Math.floor(Math.random() * 60000),
    totalExpenses: 30000 + Math.floor(Math.random() * 20000),
    netProfit: 40000 + Math.floor(Math.random() * 40000),
    occupancyRate: 34 + Math.floor(Math.random() * 50),
    adr: 40 + Math.floor(Math.random() * 100),
    revPAR: 20 + Math.floor(Math.random() * 80),
  }));
}

function generateDemoUnitPerformance(): UnitPerformance[] {
  const blocks = ['A', 'C', 'D'];
  const units: UnitPerformance[] = [];
  
  // Generate 60 apartments
  for (let i = 0; i < 60; i++) {
    const block = blocks[i % 3];
    const floor = Math.floor(i / 3) + 10;
    const unitNum = `${floor}${(i % 10).toString().padStart(2, '0')}`;
    
    const inceptionDate = new Date(2024, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
    const daysSinceInception = Math.floor((Date.now() - inceptionDate.getTime()) / (1000 * 60 * 60 * 24));
    const occupiedNights = Math.floor(daysSinceInception * (0.3 + Math.random() * 0.5));
    const totalRevenue = occupiedNights * (50 + Math.floor(Math.random() * 100));
    
    units.push({
      unitId: `${block}-${unitNum}`,
      unitName: `${block} ${unitNum}`,
      block,
      inceptionDate: inceptionDate.toISOString().split('T')[0],
      totalNights: daysSinceInception,
      occupiedNights,
      occupancyRate: Math.round((occupiedNights / daysSinceInception) * 100),
      totalRevenue,
      adr: Math.round(totalRevenue / occupiedNights) || 0,
      roi: Math.round((totalRevenue / 50000) * 100), // Assuming $50k investment
      rank: 0,
    });
  }
  
  // Sort by ROI and assign ranks
  units.sort((a, b) => b.roi - a.roi);
  units.forEach((unit, index) => {
    unit.rank = index + 1;
  });
  
  return units;
}

function generateDemoHousekeeping(): HousekeepingUnit[] {
  const statuses: HousekeepingUnit['status'][] = ['clean', 'dirty', 'in_progress', 'maintenance'];
  const priorities: HousekeepingUnit['priority'][] = ['high', 'medium', 'low'];
  const cleaners = ['Nino', 'Mariam', 'Giorgi', 'Tamar', 'Unassigned'];
  
  return Array.from({ length: 60 }, (_, i) => {
    const block = ['A', 'C', 'D'][i % 3];
    const floor = Math.floor(i / 3) + 10;
    const unitNum = `${floor}${(i % 10).toString().padStart(2, '0')}`;
    
    return {
      unitId: `${block}-${unitNum}`,
      unitName: `${block} ${unitNum}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastCleaned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextCheckIn: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: cleaners[Math.floor(Math.random() * cleaners.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    };
  });
}

// ============================================================================
// PUBLIC API - DATA FETCHING
// ============================================================================

/**
 * Fetch all reservations from Google Sheets
 */
export async function getReservations(): Promise<Reservation[]> {
  const cacheKey = 'reservations';
  const cached = getCached<Reservation[]>(cacheKey);
  if (cached) return cached;
  
  try {
    if (!SHEETS_CONFIG.MASTER_DB_URL) {
      console.log('📊 Using demo data - Google Sheets not configured');
      return generateDemoReservations();
    }
    
    const csv = await fetchSheetData(SHEETS_CONFIG.TABS.RESERVATIONS);
    const data = parseCSV(csv, (row) => ({
      id: row[0] || '',
      roomNumber: row[1] || '',
      guestName: row[2] || '',
      source: row[3] || '',
      checkIn: row[4] || '',
      checkOut: row[5] || '',
      nights: parseInt(row[6]) || 0,
      amount: parseFloat(row[7]) || 0,
      paid: parseFloat(row[8]) || 0,
      balance: parseFloat(row[9]) || 0,
      createdAt: row[10] || '',
    }));
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    return generateDemoReservations();
  }
}

/**
 * Fetch financial summary from Google Sheets
 */
export async function getFinancialSummary(): Promise<FinancialSummary[]> {
  const cacheKey = 'financials';
  const cached = getCached<FinancialSummary[]>(cacheKey);
  if (cached) return cached;
  
  try {
    if (!SHEETS_CONFIG.MASTER_DB_URL) {
      return generateDemoFinancials();
    }
    
    const csv = await fetchSheetData(SHEETS_CONFIG.TABS.FINANCIAL_SUMMARY);
    const data = parseCSV(csv, (row) => ({
      month: row[0] || '',
      year: parseInt(row[1]) || 2025,
      totalRevenue: parseFloat(row[2]) || 0,
      totalExpenses: parseFloat(row[3]) || 0,
      netProfit: parseFloat(row[4]) || 0,
      occupancyRate: parseFloat(row[5]) || 0,
      adr: parseFloat(row[6]) || 0,
      revPAR: parseFloat(row[7]) || 0,
    }));
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch financials:', error);
    return generateDemoFinancials();
  }
}

/**
 * Fetch unit performance data (60 apartments with Inception Date logic)
 */
export async function getUnitPerformance(): Promise<UnitPerformance[]> {
  const cacheKey = 'unitPerformance';
  const cached = getCached<UnitPerformance[]>(cacheKey);
  if (cached) return cached;
  
  try {
    if (!SHEETS_CONFIG.MASTER_DB_URL) {
      return generateDemoUnitPerformance();
    }
    
    const csv = await fetchSheetData(SHEETS_CONFIG.TABS.UNIT_PERFORMANCE);
    const data = parseCSV(csv, (row) => ({
      unitId: row[0] || '',
      unitName: row[1] || '',
      block: row[2] || '',
      inceptionDate: row[3] || '',
      totalNights: parseInt(row[4]) || 0,
      occupiedNights: parseInt(row[5]) || 0,
      occupancyRate: parseFloat(row[6]) || 0,
      totalRevenue: parseFloat(row[7]) || 0,
      adr: parseFloat(row[8]) || 0,
      roi: parseFloat(row[9]) || 0,
      rank: parseInt(row[10]) || 0,
    }));
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch unit performance:', error);
    return generateDemoUnitPerformance();
  }
}

/**
 * Fetch housekeeping status for all units
 */
export async function getHousekeepingStatus(): Promise<HousekeepingUnit[]> {
  const cacheKey = 'housekeeping';
  const cached = getCached<HousekeepingUnit[]>(cacheKey);
  if (cached) return cached;
  
  try {
    if (!SHEETS_CONFIG.MASTER_DB_URL) {
      return generateDemoHousekeeping();
    }
    
    const csv = await fetchSheetData(SHEETS_CONFIG.TABS.HOUSEKEEPING);
    const data = parseCSV(csv, (row) => ({
      unitId: row[0] || '',
      unitName: row[1] || '',
      status: (row[2] as HousekeepingUnit['status']) || 'clean',
      lastCleaned: row[3] || '',
      nextCheckIn: row[4] || '',
      assignedTo: row[5] || '',
      priority: (row[6] as HousekeepingUnit['priority']) || 'medium',
    }));
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch housekeeping:', error);
    return generateDemoHousekeeping();
  }
}

// ============================================================================
// PUBLIC API - WRITE OPERATIONS (via AppScript Web App)
// ============================================================================

/**
 * Update housekeeping status via AppScript Web App
 */
export async function updateHousekeepingStatus(
  unitId: string, 
  status: HousekeepingUnit['status']
): Promise<boolean> {
  const webAppUrl = SHEETS_CONFIG.APPSCRIPT_WEB_APP_URL;
  
  if (!webAppUrl) {
    console.log('📝 Demo mode - AppScript not configured');
    // Update local cache for demo
    const cached = getCached<HousekeepingUnit[]>('housekeeping');
    if (cached) {
      const updated = cached.map(unit => 
        unit.unitId === unitId ? { ...unit, status } : unit
      );
      setCache('housekeeping', updated);
    }
    return true;
  }
  
  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateHousekeeping',
        unitId,
        status,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update status');
    }
    
    // Clear cache to force refresh
    cache.delete('housekeeping');
    return true;
  } catch (error) {
    console.error('Failed to update housekeeping status:', error);
    return false;
  }
}

/**
 * Sync data from OTELMS (triggers AppScript function)
 */
export async function triggerOtelmsSync(): Promise<boolean> {
  const webAppUrl = SHEETS_CONFIG.APPSCRIPT_WEB_APP_URL;
  
  if (!webAppUrl) {
    console.log('📝 Demo mode - AppScript not configured');
    return true;
  }
  
  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'syncOtelMS',
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger sync');
    }
    
    // Clear all caches
    clearCache();
    return true;
  } catch (error) {
    console.error('Failed to trigger OTELMS sync:', error);
    return false;
  }
}

// ============================================================================
// AGGREGATION UTILITIES
// ============================================================================

/**
 * Calculate dashboard KPIs from raw data
 */
export async function getDashboardKPIs() {
  const [reservations, financials, units, housekeeping] = await Promise.all([
    getReservations(),
    getFinancialSummary(),
    getUnitPerformance(),
    getHousekeepingStatus(),
  ]);
  
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.checkIn === today);
  
  const totalRevenue = financials.reduce((sum, f) => sum + f.totalRevenue, 0);
  const avgOccupancy = financials.reduce((sum, f) => sum + f.occupancyRate, 0) / financials.length;
  const avgADR = financials.reduce((sum, f) => sum + f.adr, 0) / financials.length;
  
  const dirtyUnits = housekeeping.filter(h => h.status === 'dirty').length;
  const cleanUnits = housekeeping.filter(h => h.status === 'clean').length;
  
  return {
    todayCheckIns: todayReservations.length,
    todayRevenue: todayReservations.reduce((sum, r) => sum + r.amount, 0),
    totalRevenue,
    avgOccupancy: Math.round(avgOccupancy),
    avgADR: Math.round(avgADR),
    totalUnits: units.length,
    topPerformer: units[0]?.unitName || 'N/A',
    dirtyUnits,
    cleanUnits,
    pendingTasks: dirtyUnits,
  };
}

// ============================================================================
// EXPORT DEFAULT SERVICE OBJECT
// ============================================================================

const GoogleSheetsService = {
  // Configuration
  config: SHEETS_CONFIG,
  
  // Data fetching
  getReservations,
  getFinancialSummary,
  getUnitPerformance,
  getHousekeepingStatus,
  getDashboardKPIs,
  
  // Write operations
  updateHousekeepingStatus,
  triggerOtelmsSync,
  
  // Cache management
  clearCache,
};

export default GoogleSheetsService;
