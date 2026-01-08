import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { financialData } from "../../drizzle/schema";
import { desc } from "drizzle-orm";

export const financeRouter = router({
  getSummary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalRevenue: 920505,
        totalExpenses: 200319,
        netProfit: 720186,
        profitMargin: 78.2,
        companyShare: 110477,
        companyPercent: 15.3,
        ownersShare: 609709,
        ownersPercent: 84.7,
      };
    }

    const data = await db.select().from(financialData).orderBy(desc(financialData.year), desc(financialData.monthNumber));
    
    if (data.length === 0) {
      return {
        totalRevenue: 920505,
        totalExpenses: 200319,
        netProfit: 720186,
        profitMargin: 78.2,
        companyShare: 110477,
        companyPercent: 15.3,
        ownersShare: 609709,
        ownersPercent: 84.7,
      };
    }

    const totalRevenue = data.reduce((sum, row) => sum + parseFloat(row.totalRevenue.toString()), 0);
    const totalExpenses = data.reduce((sum, row) => sum + parseFloat(row.totalExpenses.toString()), 0);
    const netProfit = totalRevenue - totalExpenses;
    const companyShare = data.reduce((sum, row) => sum + parseFloat(row.companyProfit.toString()), 0);
    const ownersShare = data.reduce((sum, row) => sum + parseFloat(row.ownersProfit.toString()), 0);

    return {
      totalRevenue: Math.round(totalRevenue),
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      companyShare: Math.round(companyShare),
      companyPercent: netProfit > 0 ? (companyShare / netProfit) * 100 : 0,
      ownersShare: Math.round(ownersShare),
      ownersPercent: netProfit > 0 ? (ownersShare / netProfit) * 100 : 0,
    };
  }),

  getMonthlyData: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return mockMonthlyData;
    }

    try {
      const data = await db.select().from(financialData).orderBy(desc(financialData.year), desc(financialData.monthNumber));
    
      if (data.length === 0) {
        return mockMonthlyData;
      }

      return data.map(row => ({
      month: row.month,
      studios: row.studios,
      daysAvailable: row.daysAvailable,
      daysOccupied: row.daysOccupied,
      occupancyRate: parseFloat(row.occupancyRate.toString()),
      avgPrice: Math.round(parseFloat(row.avgPrice.toString())),
      totalRevenue: Math.round(parseFloat(row.totalRevenue.toString())),
      cleaningTech: Math.round(parseFloat(row.cleaningTech.toString())),
      marketing: Math.round(parseFloat(row.marketing.toString())),
      salaries: Math.round(parseFloat(row.salaries.toString())),
      utilities: Math.round(parseFloat(row.utilities.toString())),
      totalExpenses: Math.round(parseFloat(row.totalExpenses.toString())),
      totalProfit: Math.round(parseFloat(row.totalProfit.toString())),
      companyProfit: Math.round(parseFloat(row.companyProfit.toString())),
      ownersProfit: Math.round(parseFloat(row.ownersProfit.toString())),
      }));
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return mockMonthlyData;
    }
  }),
});

const mockMonthlyData = [
  {
    month: "September 2025",
    studios: 55,
    daysAvailable: 1637,
    daysOccupied: 1318,
    occupancyRate: 80.5,
    avgPrice: 87,
    totalRevenue: 114074,
    cleaningTech: 13860,
    marketing: 10286,
    salaries: 3000,
    utilities: 7774,
    totalExpenses: 34920,
    totalProfit: 79154,
    companyProfit: 12105,
    ownersProfit: 67049,
  },
  {
    month: "August 2025",
    studios: 54,
    daysAvailable: 1671,
    daysOccupied: 1513,
    occupancyRate: 90.5,
    avgPrice: 144,
    totalRevenue: 218594,
    cleaningTech: 12816,
    marketing: 7282,
    salaries: 4000,
    utilities: 7062,
    totalExpenses: 31160,
    totalProfit: 187434,
    companyProfit: 28889,
    ownersProfit: 158545,
  },
  {
    month: "July 2025",
    studios: 53,
    daysAvailable: 1643,
    daysOccupied: 1446,
    occupancyRate: 88,
    avgPrice: 121,
    totalRevenue: 175512,
    cleaningTech: 13592,
    marketing: 5051,
    salaries: 4000,
    utilities: 3913,
    totalExpenses: 26556,
    totalProfit: 148956,
    companyProfit: 17180,
    ownersProfit: 131776,
  },
];
