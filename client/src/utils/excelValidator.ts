import * as XLSX from 'xlsx';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedColumns: string[];
}

interface RequiredColumn {
  name: string;
  possibleNames: string[];
  description: string;
}

const REQUIRED_COLUMNS: RequiredColumn[] = [
  {
    name: 'room_number',
    possibleNames: ['ნომერი', 'room', 'room number', 'room_number', 'apartment', 'აპარტამენტი'],
    description: 'ოთახის ნომერი (ნომერი / Room)'
  },
  {
    name: 'check_in',
    possibleNames: ['შესვლა', 'check-in', 'check in', 'checkin', 'arrival', 'შესვლის თარიღი'],
    description: 'შესვლის თარიღი (შესვლა / Check-in)'
  },
  {
    name: 'check_out',
    possibleNames: ['გასვლა', 'check-out', 'check out', 'checkout', 'departure', 'გასვლის თარიღი'],
    description: 'გასვლის თარიღი (გასვლა / Check-out)'
  },
  {
    name: 'revenue',
    possibleNames: ['თანხა', 'revenue', 'amount', 'price', 'total', 'ღირებულება', 'ფასი'],
    description: 'თანხა (თანხა / Revenue)'
  }
];

/**
 * Validates Excel file structure for monthly analysis
 * Checks for required columns in both Georgian and English
 */
export async function validateExcelFile(file: File): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    detectedColumns: []
  };

  try {
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['xlsx', 'xls'].includes(fileExtension)) {
      result.isValid = false;
      result.errors.push('ფაილის ფორმატი არასწორია. გთხოვთ ატვირთოთ .xlsx ან .xls ფაილი');
      return result;
    }

    // Check file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      result.isValid = false;
      result.errors.push(`ფაილი ძალიან დიდია (${(file.size / 1024 / 1024).toFixed(2)}MB). მაქსიმალური ზომა: 20MB`);
      return result;
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Check if workbook has sheets
    if (workbook.SheetNames.length === 0) {
      result.isValid = false;
      result.errors.push('Excel ფაილი ცარიელია - არ არის არცერთი ფურცელი');
      return result;
    }

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON to get headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      result.isValid = false;
      result.errors.push('Excel ფაილი ცარიელია - არ არის მონაცემები');
      return result;
    }

    // Get headers (first row)
    const headers = (jsonData[0] as any[]).map(h => String(h || '').trim().toLowerCase());
    result.detectedColumns = jsonData[0] as string[];

    // Check for required columns
    const missingColumns: string[] = [];

    for (const requiredCol of REQUIRED_COLUMNS) {
      const found = requiredCol.possibleNames.some(possibleName => 
        headers.some(header => header.includes(possibleName.toLowerCase()))
      );

      if (!found) {
        missingColumns.push(requiredCol.description);
      }
    }

    if (missingColumns.length > 0) {
      result.isValid = false;
      result.errors.push('ფაილში აკლია საჭირო სვეტები:');
      missingColumns.forEach(col => {
        result.errors.push(`  ❌ ${col}`);
      });
    }

    // Check if there's at least one data row
    if (jsonData.length < 2) {
      result.warnings.push('ფაილში არ არის მონაცემები (მხოლოდ სათაურები)');
    }

    // Additional validation - check for nights/duration column
    const hasNights = headers.some(h => 
      h.includes('ხანგრძლივობა') || 
      h.includes('nights') || 
      h.includes('duration') ||
      h.includes('ღამეები')
    );

    if (!hasNights) {
      result.warnings.push('არ მოიძებნა "ღამეების" სვეტი - სისტემა დაითვლის ავტომატურად Check-in და Check-out თარიღებიდან');
    }

    // Check for channel/source column
    const hasChannel = headers.some(h => 
      h.includes('წყარო') || 
      h.includes('channel') || 
      h.includes('source') ||
      h.includes('არხ') ||
      h.includes('platform')
    );

    if (!hasChannel) {
      result.warnings.push('არ მოიძებნა "არხის" სვეტი - არხების ანალიზი შეზღუდული იქნება');
    }

    // Check for building/block column
    const hasBuilding = headers.some(h => 
      h.includes('ბლოკი') || 
      h.includes('building') || 
      h.includes('block')
    );

    if (!hasBuilding) {
      result.warnings.push('არ მოიძებნა "ბლოკის" სვეტი - ბლოკების მიხედვით ანალიზი შეზღუდული იქნება');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`ფაილის წაკითხვისას მოხდა შეცდომა: ${error instanceof Error ? error.message : 'უცნობი შეცდომა'}`);
  }

  return result;
}

/**
 * Format validation result for display in toast
 */
export function formatValidationMessage(result: ValidationResult): string {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push('❌ შეცდომები:\n' + result.errors.join('\n'));
  }

  if (result.warnings.length > 0) {
    messages.push('⚠️ გაფრთხილებები:\n' + result.warnings.join('\n'));
  }

  return messages.join('\n\n');
}
