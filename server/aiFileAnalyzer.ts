/**
 * AI File Analyzer - Intelligent Data Distribution System
 * Analyzes uploaded files and auto-distributes data to appropriate modules
 */

import { invokeLLM } from "./_core/llm";
import * as XLSX from "xlsx";

// Training data from Orbi City Financial Report
const TRAINING_DATA = `
You are an intelligent data analyzer for ORBI City Hub - a hotel management system with 55 studios.

Your task is to analyze uploaded Excel/PDF files and intelligently distribute data to the correct modules:

## Module Categories:

### 1. FINANCE MODULE
Keywords: revenue, income, earnings, profit, loss, expense, cost, salary, payment, financial
Data types: Total Revenue, Monthly Revenue, Expenses, Profit, ROI, Margins
Example fields: "Total Revenue", "ჯამური შემოსავალი", "Expenses", "ხარჯები", "Profit", "მოგება"

### 2. MARKETING MODULE  
Keywords: occupancy, booking rate, conversion, leads, campaigns, channels, OTA
Data types: Occupancy %, Average Price, Booking Rate, Channel Performance
Example fields: "Occupancy %", "დაკავებულობა", "Avg Price", "საშუალო ფასი", "Booking.com", "Airbnb"

### 3. RESERVATIONS MODULE
Keywords: bookings, reservations, guests, check-in, check-out, nights, stays
Data types: Total Bookings, Active Guests, Days Occupied, Guest Names
Example fields: "Days Occupied", "დაკავებული დღეები", "Bookings", "ჯავშნები", "Guests", "სტუმრები"

### 4. LOGISTICS MODULE
Keywords: studios, rooms, apartments, inventory, housekeeping, maintenance, cleaning
Data types: Studio Count, Room Status, Inventory Items, Maintenance Tasks
Example fields: "Studios", "სტუდიოები", "Rooms", "ოთახები", "Cleaning", "დალაგება"

## Data Distribution Rules:

1. **Multi-module data**: Some data belongs to multiple modules
   - "Occupancy %" → Marketing (primary) + Finance (secondary)
   - "Days Occupied" → Reservations (primary) + Marketing (secondary)
   - "Total Revenue" → Finance (primary) + CEO Dashboard (secondary)

2. **Georgian language support**: Recognize Georgian field names
   - "შემოსავალი" = Revenue → Finance
   - "დაკავებულობა" = Occupancy → Marketing  
   - "ჯავშნები" = Bookings → Reservations
   - "სტუდიოები" = Studios → Logistics

3. **Time-series data**: Monthly/yearly breakdowns
   - Detect date columns (Month, თვე, Date, თარიღი)
   - Create time-series entries for each month
   - Link to appropriate dashboard charts

4. **Calculated fields**: Derive additional metrics
   - Profit Margin = (Profit / Revenue) × 100
   - Average Daily Rate = Revenue / Days Occupied
   - RevPAR = Revenue / Available Days

## Output Format:

Return JSON with this structure:
{
  "fileType": "financial_report" | "booking_list" | "inventory_sheet" | "unknown",
  "confidence": 0.0-1.0,
  "summary": "Brief description of file content",
  "distributions": [
    {
      "module": "finance" | "marketing" | "reservations" | "logistics",
      "category": "revenue" | "expenses" | "occupancy" | "bookings" | "inventory",
      "data": {
        "fieldName": "Total Revenue",
        "value": 920505,
        "unit": "₾",
        "period": "Oct 2024 - Sep 2025"
      },
      "confidence": 0.0-1.0
    }
  ],
  "suggestions": [
    {
      "action": "create_dashboard_widget" | "update_chart" | "create_alert",
      "module": "finance",
      "description": "Add revenue trend chart for last 12 months"
    }
  ]
}

## Example Analysis:

Input Excel with columns: "Month", "Total Revenue", "Occupancy %", "Days Occupied"

Output:
{
  "fileType": "financial_report",
  "confidence": 0.95,
  "summary": "Monthly financial report with revenue, occupancy, and booking data for 12 months",
  "distributions": [
    {
      "module": "finance",
      "category": "revenue",
      "data": {
        "fieldName": "Total Revenue",
        "value": 920505,
        "unit": "₾",
        "period": "Oct 2024 - Sep 2025"
      },
      "confidence": 0.98
    },
    {
      "module": "marketing",
      "category": "occupancy",
      "data": {
        "fieldName": "Occupancy %",
        "value": 80.5,
        "unit": "%",
        "period": "Sep 2025"
      },
      "confidence": 0.95
    },
    {
      "module": "reservations",
      "category": "bookings",
      "data": {
        "fieldName": "Days Occupied",
        "value": 1318,
        "unit": "days",
        "period": "Sep 2025"
      },
      "confidence": 0.92
    }
  ],
  "suggestions": [
    {
      "action": "update_chart",
      "module": "finance",
      "description": "Update revenue trend chart with new monthly data"
    },
    {
      "action": "create_alert",
      "module": "marketing",
      "description": "Occupancy dropped below 85% - consider promotional campaign"
    }
  ]
}

Now analyze the uploaded file and provide the distribution plan.
`;

export interface FileAnalysisResult {
  fileType: "financial_report" | "booking_list" | "inventory_sheet" | "unknown";
  confidence: number;
  summary: string;
  distributions: Array<{
    module: "finance" | "marketing" | "reservations" | "logistics";
    category: string;
    data: {
      fieldName: string;
      value: number | string;
      unit?: string;
      period?: string;
    };
    confidence: number;
  }>;
  suggestions: Array<{
    action: "create_dashboard_widget" | "update_chart" | "create_alert";
    module: string;
    description: string;
  }>;
}

/**
 * Parse Excel file and extract data
 */
export async function parseExcelFile(filePath: string): Promise<string> {
  try {
    const workbook = XLSX.readFile(filePath);
    let content = "";

    // Extract data from all sheets
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      content += `\n\n=== Sheet: ${sheetName} ===\n`;
      content += JSON.stringify(jsonData.slice(0, 20), null, 2); // First 20 rows
    });

    return content;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error("Failed to parse Excel file");
  }
}

/**
 * Analyze file with AI and get distribution plan
 */
export async function analyzeFileWithAI(
  fileContent: string,
  fileName: string
): Promise<FileAnalysisResult> {
  try {
    const prompt = `${TRAINING_DATA}

File name: ${fileName}

File content (first 20 rows of each sheet):
${fileContent}

Analyze this file and provide the distribution plan in JSON format.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert data analyst. Always respond with valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "file_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              fileType: {
                type: "string",
                enum: ["financial_report", "booking_list", "inventory_sheet", "unknown"],
              },
              confidence: { type: "number" },
              summary: { type: "string" },
              distributions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    module: {
                      type: "string",
                      enum: ["finance", "marketing", "reservations", "logistics"],
                    },
                    category: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        fieldName: { type: "string" },
                        value: { type: ["number", "string"] },
                        unit: { type: "string" },
                        period: { type: "string" },
                      },
                      required: ["fieldName", "value"],
                      additionalProperties: false,
                    },
                    confidence: { type: "number" },
                  },
                  required: ["module", "category", "data", "confidence"],
                  additionalProperties: false,
                },
              },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: {
                      type: "string",
                      enum: ["create_dashboard_widget", "update_chart", "create_alert"],
                    },
                    module: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["action", "module", "description"],
                  additionalProperties: false,
                },
              },
            },
            required: ["fileType", "confidence", "summary", "distributions", "suggestions"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing file with AI:", error);
    throw new Error("Failed to analyze file");
  }
}

/**
 * Main entry point: Analyze uploaded file and get distribution plan
 */
export async function analyzeUploadedFile(
  filePath: string,
  fileName: string
): Promise<FileAnalysisResult> {
  // Parse Excel file
  const fileContent = await parseExcelFile(filePath);

  // Analyze with AI
  const analysis = await analyzeFileWithAI(fileContent, fileName);

  return analysis;
}
