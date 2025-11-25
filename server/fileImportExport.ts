import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract data
 * Supports .xlsx, .xls, .csv formats
 */
export async function parseExcelFile(fileBuffer: Buffer): Promise<any[]> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null,
      blankrows: false
    });
    
    return data as any[];
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error('Failed to parse Excel file');
  }
}

/**
 * Parse CSV file and extract data
 */
export async function parseCSVFile(fileBuffer: Buffer): Promise<any[]> {
  try {
    const csvString = fileBuffer.toString('utf-8');
    const workbook = XLSX.read(csvString, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    });
    
    return data as any[];
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error('Failed to parse CSV file');
  }
}

/**
 * Export data to Excel format
 */
export function exportToExcel(data: any[], sheetName: string = 'Sheet1'): Buffer {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });
    
    return excelBuffer as Buffer;
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to export to Excel');
  }
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[]): string {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return csv;
  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('Failed to export to CSV');
  }
}

/**
 * Validate Excel/CSV structure for specific data types
 */
export function validateImportData(
  data: any[],
  requiredColumns: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || data.length === 0) {
    errors.push('File is empty');
    return { valid: false, errors };
  }
  
  const headers = data[0] as string[];
  
  // Check if all required columns exist
  for (const col of requiredColumns) {
    if (!headers.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }
  
  if (data.length < 2) {
    errors.push('No data rows found (only headers)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Transform Excel data to typed objects
 */
export function transformExcelToObjects<T>(
  data: any[],
  columnMapping: Record<string, keyof T>
): T[] {
  if (data.length < 2) return [];
  
  const headers = data[0] as string[];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const mappedKey = columnMapping[header];
      if (mappedKey) {
        obj[mappedKey] = row[index];
      }
    });
    
    return obj as T;
  });
}
