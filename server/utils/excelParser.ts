/**
 * Excel Parser Stub - PowerStack Refactor
 * 
 * This is a stub replacement for the legacy Excel parser.
 * The actual parsing logic has been moved to _LEGACY_ARCHIVE.
 * 
 * This stub provides fallback functionality to prevent build errors
 * while we transition to the Google Sheet data bridge.
 * 
 * @deprecated Use googleSheetService instead
 */

export interface ExcelData {
  sheetName: string;
  headers: string[];
  rows: any[][];
  totalRows: number;
}

/**
 * Parse Excel from URL - Stub implementation
 * @deprecated Use Google Sheet service instead
 */
export async function parseExcelFromUrl(
  fileUrl: string,
  fileName: string
): Promise<ExcelData[]> {
  console.warn('[ExcelParser] DEPRECATED: parseExcelFromUrl called. Use Google Sheet service instead.');
  
  // Return empty data structure
  return [{
    sheetName: 'Sheet1',
    headers: ['Note'],
    rows: [['Excel parsing is deprecated. Please use Google Sheet integration.']],
    totalRows: 1,
  }];
}

/**
 * Format Excel data for AI - Stub implementation
 * @deprecated Use Google Sheet service instead
 */
export function formatExcelForAI(
  excelData: ExcelData[],
  maxRows: number = 30
): string {
  console.warn('[ExcelParser] DEPRECATED: formatExcelForAI called. Use Google Sheet service instead.');
  
  return `[Excel Data - Deprecated]
Note: Excel parsing has been deprecated in the PowerStack refactor.
Please use the Google Sheet integration (OtelMS_Master_Data) for data access.

For AI analysis, data should be fetched from:
- Google Sheets API (when connected)
- mockSheetService (for demo mode)

Contact: PowerStack HotelOS Team`;
}

/**
 * Get Excel summary - Stub implementation
 * @deprecated Use Google Sheet service instead
 */
export function getExcelSummary(excelData: ExcelData[]): string {
  console.warn('[ExcelParser] DEPRECATED: getExcelSummary called. Use Google Sheet service instead.');
  
  return 'Excel parsing deprecated. Use Google Sheet service.';
}

export default {
  parseExcelFromUrl,
  formatExcelForAI,
  getExcelSummary,
};
