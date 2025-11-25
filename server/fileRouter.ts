import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { parseExcelFile, parseCSVFile, exportToExcel, exportToCSV, validateImportData, transformExcelToObjects } from "./fileImportExport";
import { storagePut } from "./storage";

export const fileRouter = router({
  /**
   * Upload and parse Excel/CSV file
   */
  uploadAndParse: protectedProcedure
    .input(z.object({
      fileUrl: z.string(),
      fileType: z.enum(['excel', 'csv']),
      dataType: z.enum(['reservations', 'finance', 'marketing', 'logistics']),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Fetch file from URL
        const response = await fetch(input.fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Parse based on file type
        let data: any[];
        if (input.fileType === 'excel') {
          data = await parseExcelFile(buffer);
        } else {
          data = await parseCSVFile(buffer);
        }
        
        // Validate based on data type
        let requiredColumns: string[] = [];
        switch (input.dataType) {
          case 'reservations':
            requiredColumns = ['Guest Name', 'Room', 'Check In', 'Check Out', 'Price'];
            break;
          case 'finance':
            requiredColumns = ['Date', 'Category', 'Amount', 'Description'];
            break;
          case 'marketing':
            requiredColumns = ['Channel', 'Campaign', 'Spend', 'Revenue'];
            break;
          case 'logistics':
            requiredColumns = ['Date', 'Room', 'Staff', 'Status'];
            break;
        }
        
        const validation = validateImportData(data, requiredColumns);
        
        return {
          success: validation.valid,
          data: validation.valid ? data : null,
          errors: validation.errors,
          rowCount: data.length - 1, // Exclude header
        };
      } catch (error) {
        console.error('File upload and parse error:', error);
        return {
          success: false,
          data: null,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          rowCount: 0,
        };
      }
    }),

  /**
   * Export data to Excel
   */
  exportToExcel: protectedProcedure
    .input(z.object({
      data: z.array(z.record(z.string(), z.any())),
      fileName: z.string(),
      sheetName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const excelBuffer = exportToExcel(input.data, input.sheetName || 'Sheet1');
        
        // Upload to S3
        const fileKey = `exports/${ctx.user.id}/${input.fileName}-${Date.now()}.xlsx`;
        const { url } = await storagePut(fileKey, excelBuffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return {
          success: true,
          url,
          fileName: `${input.fileName}.xlsx`,
        };
      } catch (error) {
        console.error('Excel export error:', error);
        throw new Error('Failed to export to Excel');
      }
    }),

  /**
   * Export data to CSV
   */
  exportToCSV: protectedProcedure
    .input(z.object({
      data: z.array(z.record(z.string(), z.any())),
      fileName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const csvString = exportToCSV(input.data);
        const csvBuffer = Buffer.from(csvString, 'utf-8');
        
        // Upload to S3
        const fileKey = `exports/${ctx.user.id}/${input.fileName}-${Date.now()}.csv`;
        const { url } = await storagePut(fileKey, csvBuffer, 'text/csv');
        
        return {
          success: true,
          url,
          fileName: `${input.fileName}.csv`,
        };
      } catch (error) {
        console.error('CSV export error:', error);
        throw new Error('Failed to export to CSV');
      }
    }),

  /**
   * Get sample template for import
   */
  getSampleTemplate: publicProcedure
    .input(z.object({
      dataType: z.enum(['reservations', 'finance', 'marketing', 'logistics']),
      format: z.enum(['excel', 'csv']),
    }))
    .query(async ({ input }) => {
      let sampleData: any[] = [];
      
      switch (input.dataType) {
        case 'reservations':
          sampleData = [
            { 'Guest Name': 'John Smith', 'Room': 'A 3041', 'Check In': '2025-11-26', 'Check Out': '2025-11-30', 'Price': 450, 'Channel': 'Booking.com' },
            { 'Guest Name': 'მარიამ გელაშვილი', 'Room': 'C 2641', 'Check In': '2025-11-27', 'Check Out': '2025-12-02', 'Price': 520, 'Channel': 'Airbnb' },
          ];
          break;
        case 'finance':
          sampleData = [
            { 'Date': '2025-11-01', 'Category': 'Revenue', 'Amount': 15000, 'Description': 'Booking.com payment' },
            { 'Date': '2025-11-05', 'Category': 'Expense', 'Amount': 3000, 'Description': 'Cleaning supplies' },
          ];
          break;
        case 'marketing':
          sampleData = [
            { 'Channel': 'Booking.com', 'Campaign': 'Summer 2025', 'Spend': 5000, 'Revenue': 25000, 'Bookings': 45 },
            { 'Channel': 'Airbnb', 'Campaign': 'Winter 2025', 'Spend': 3000, 'Revenue': 18000, 'Bookings': 32 },
          ];
          break;
        case 'logistics':
          sampleData = [
            { 'Date': '2025-11-26', 'Room': 'A 3041', 'Staff': 'ნინო ბერიძე', 'Status': 'Completed', 'Duration': '45 min' },
            { 'Date': '2025-11-26', 'Room': 'C 2641', 'Staff': 'მარიამ გელაშვილი', 'Status': 'In Progress', 'Duration': '30 min' },
          ];
          break;
      }
      
      if (input.format === 'excel') {
        const buffer = exportToExcel(sampleData, input.dataType);
        return {
          data: buffer.toString('base64'),
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      } else {
        const csv = exportToCSV(sampleData);
        return {
          data: Buffer.from(csv).toString('base64'),
          contentType: 'text/csv',
        };
      }
    }),
});
