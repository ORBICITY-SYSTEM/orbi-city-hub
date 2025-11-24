import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  parseFinancialReport,
  calculateFinancialKPIs,
  findFastestGrowingExpense,
  calculateRevenuePerStudio,
} from "../_core/financeDataParser";

export const financeRouter = router({
  // Get P&L Overview data
  getPLOverview: protectedProcedure.query(async () => {
    const data = await parseFinancialReport();
    const kpis = calculateFinancialKPIs(data);
    
    return {
      summary: data.summary,
      kpis,
    };
  }),

  // Get Cost Analysis data
  getCostAnalysis: protectedProcedure.query(async () => {
    const data = await parseFinancialReport();
    const fastestGrowing = findFastestGrowingExpense(data);
    
    // Calculate total expenses by category
    const totalByCategory = data.costBreakdown.reduce(
      (acc, month) => ({
        cleaning: acc.cleaning + month.cleaning,
        marketing: acc.marketing + month.marketing,
        salaries: acc.salaries + month.salaries,
        utilities: acc.utilities + month.utilities,
      }),
      { cleaning: 0, marketing: 0, salaries: 0, utilities: 0 }
    );
    
    return {
      costBreakdown: data.costBreakdown,
      totalByCategory,
      fastestGrowing,
    };
  }),

  // Get Studio Performance data
  getStudioPerformance: protectedProcedure.query(async () => {
    const data = await parseFinancialReport();
    const revenuePerStudio = calculateRevenuePerStudio(data);
    
    return {
      studioGrowth: data.studioGrowth,
      revenuePerStudio,
    };
  }),

  // Finance AI Q&A
  financeQuery: protectedProcedure
    .input(
      z.object({
        question: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await parseFinancialReport();
      const kpis = calculateFinancialKPIs(data);
      
      // Build context for AI
      const context = `
Financial Data Summary (Oct 2024 - Sep 2025):
- Total Annual Revenue: ₾${kpis.totalAnnualRevenue.toLocaleString()}
- Total Annual Expenses: ₾${kpis.totalAnnualExpenses.toLocaleString()}
- Total Annual Profit: ₾${kpis.totalAnnualProfit.toLocaleString()}
- Average Profit Margin: ${kpis.avgProfitMargin}%
- ROI: ${kpis.roi}%
- Revenue Growth: ${kpis.revenueGrowth}%

Monthly Data:
${data.summary.map(m => `${m.month}: Revenue ₾${m.totalRevenue.toLocaleString()}, Profit ₾${m.totalProfit.toLocaleString()}, Margin ${m.profitMargin}%`).join('\n')}

Studio Growth:
${data.studioGrowth.map(s => `${s.month}: ${s.studioCount} studios, ${s.occupancyRate}% occupancy`).join('\n')}

User Question: ${input.question}
`;
      
      // Return context for AI agent to process
      return {
        context,
        data,
        kpis,
      };
    }),

  // Upload new financial report
  uploadFinancialReport: protectedProcedure
    .input(
      z.object({
        fileData: z.string(), // Base64 encoded Excel file
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // In production, save to S3 and update database
      // For now, return success
      return {
        success: true,
        message: `File ${input.fileName} uploaded successfully`,
      };
    }),
});
