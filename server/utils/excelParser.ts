import * as XLSX from "xlsx";

/**
 * Excel Parser Utility
 * Parses Excel files and extracts data
 */

export interface ExcelSheet {
  name: string;
  data: any[][];
  headers: string[];
  rowCount: number;
  columnCount: number;
}

export interface ExcelParseResult {
  sheets: ExcelSheet[];
  totalSheets: number;
  fileName: string;
}

/**
 * Parse Excel file from URL
 */
export async function parseExcelFromUrl(fileUrl: string, fileName: string): Promise<ExcelParseResult> {
  try {
    // Fetch the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return parseExcelFromBuffer(Buffer.from(arrayBuffer), fileName);
  } catch (error) {
    console.error("[ExcelParser] Error fetching file:", error);
    throw new Error("Failed to fetch Excel file");
  }
}

/**
 * Parse Excel file from buffer
 */
export function parseExcelFromBuffer(buffer: Buffer, fileName: string): ExcelParseResult {
  try {
    // Read the workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheets: ExcelSheet[] = [];

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON (array of arrays)
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract headers (first row)
      const headers = data.length > 0 ? data[0].map(h => String(h || "")) : [];
      
      // Get dimensions
      const rowCount = data.length;
      const columnCount = headers.length;

      sheets.push({
        name: sheetName,
        data,
        headers,
        rowCount,
        columnCount,
      });
    }

    return {
      sheets,
      totalSheets: sheets.length,
      fileName,
    };
  } catch (error) {
    console.error("[ExcelParser] Error parsing Excel:", error);
    throw new Error("Failed to parse Excel file");
  }
}

/**
 * Convert Excel data to formatted text for AI
 */
export function formatExcelForAI(parseResult: ExcelParseResult, maxRows: number = 50): string {
  let output = `📊 Excel File: ${parseResult.fileName}\n`;
  output += `Total Sheets: ${parseResult.totalSheets}\n\n`;

  for (const sheet of parseResult.sheets) {
    output += `=== Sheet: ${sheet.name} ===\n`;
    output += `Rows: ${sheet.rowCount}, Columns: ${sheet.columnCount}\n\n`;

    if (sheet.headers.length > 0) {
      output += `Headers: ${sheet.headers.join(" | ")}\n`;
      output += "-".repeat(80) + "\n";
    }

    // Show first N rows
    const rowsToShow = Math.min(maxRows, sheet.data.length);
    for (let i = 1; i < rowsToShow; i++) { // Start from 1 to skip headers
      const row = sheet.data[i];
      if (row && row.length > 0) {
        output += row.join(" | ") + "\n";
      }
    }

    if (sheet.data.length > maxRows) {
      output += `\n... (${sheet.data.length - maxRows} more rows)\n`;
    }

    output += "\n\n";
  }

  return output;
}

/**
 * Extract summary statistics from Excel data
 */
export function getExcelSummary(parseResult: ExcelParseResult): string {
  let summary = `📊 **${parseResult.fileName}**\n\n`;
  summary += `**Total Sheets:** ${parseResult.totalSheets}\n\n`;

  for (const sheet of parseResult.sheets) {
    summary += `### ${sheet.name}\n`;
    summary += `- Rows: ${sheet.rowCount}\n`;
    summary += `- Columns: ${sheet.columnCount}\n`;
    
    if (sheet.headers.length > 0) {
      summary += `- Headers: ${sheet.headers.slice(0, 10).join(", ")}${sheet.headers.length > 10 ? "..." : ""}\n`;
    }
    
    summary += "\n";
  }

  return summary;
}
