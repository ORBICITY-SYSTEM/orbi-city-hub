import * as XLSX from 'xlsx';

export interface MonthlyFinancialData {
  month: string;
  year: number;
  monthNumber: number;
  studios: number;
  daysAvailable: number;
  daysOccupied: number;
  occupancyRate: number;
  avgPrice: number;
  totalRevenue: number;
  cleaningTech: number;
  marketing: number;
  salaries: number;
  utilities: number;
  totalExpenses: number;
  totalProfit: number;
  companyProfit: number;
  ownersProfit: number;
}

const monthMap: Record<string, number> = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
};

function parseMonthYear(monthStr: string): { month: string; year: number; monthNumber: number } {
  // "September 2025" -> { month: "September 2025", year: 2025, monthNumber: 9 }
  const parts = monthStr.trim().split(' ');
  const monthName = parts[0];
  const year = parseInt(parts[1]);
  const monthNumber = monthMap[monthName] || 1;
  
  return { month: monthStr, year, monthNumber };
}

function parsePercentage(value: any): number {
  if (typeof value === 'string') {
    return parseFloat(value.replace('%', ''));
  }
  if (typeof value === 'number') {
    return value > 1 ? value : value * 100; // Convert 0.805 to 80.5
  }
  return 0;
}

export function parseFinancialExcel(buffer: Buffer): MonthlyFinancialData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = 'Monthly Details';
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in Excel file`);
  }

  // Convert to JSON (skip first 2 rows - headers)
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  const results: MonthlyFinancialData[] = [];
  
  // Start from row 3 (index 3) - data rows
  for (let i = 3; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[0]) continue; // Skip empty rows
    
    const monthData = parseMonthYear(row[0]);
    
    results.push({
      month: monthData.month,
      year: monthData.year,
      monthNumber: monthData.monthNumber,
      studios: parseInt(row[1]) || 0,
      daysAvailable: parseInt(row[2]) || 0,
      daysOccupied: parseInt(row[3]) || 0,
      occupancyRate: parsePercentage(row[4]),
      avgPrice: parseFloat(row[5]) || 0,
      totalRevenue: parseFloat(row[6]) || 0,
      cleaningTech: parseFloat(row[7]) || 0,
      marketing: parseFloat(row[8]) || 0,
      salaries: parseFloat(row[9]) || 0,
      utilities: parseFloat(row[10]) || 0,
      totalExpenses: parseFloat(row[11]) || 0,
      totalProfit: parseFloat(row[12]) || 0,
      companyProfit: parseFloat(row[13]) || 0,
      ownersProfit: parseFloat(row[14]) || 0,
    });
  }
  
  return results;
}
