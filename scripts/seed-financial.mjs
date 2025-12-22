import mysql from "mysql2/promise";

const financialRecords = [
  { month: "Nov 2025", year: 2025, monthNumber: 11, studios: 75, daysAvailable: 2250, daysOccupied: 1325, occupancyRate: "77.00", avgPrice: "40.00", totalRevenue: "52665.00", cleaningTech: "3332.00", marketing: "1904.00", salaries: "3000.00", utilities: "1284.00", totalExpenses: "9520.00", totalProfit: "36105.00", companyProfit: "4333.00", ownersProfit: "31772.00" },
  { month: "Oct 2025", year: 2025, monthNumber: 10, studios: 56, daysAvailable: 1736, daysOccupied: 1182, occupancyRate: "68.00", avgPrice: "52.00", totalRevenue: "61222.00", cleaningTech: "5639.00", marketing: "2537.00", salaries: "3000.00", utilities: "2921.00", totalExpenses: "14097.00", totalProfit: "47125.00", companyProfit: "7069.00", ownersProfit: "40056.00" },
  { month: "Sep 2025", year: 2025, monthNumber: 9, studios: 55, daysAvailable: 1650, daysOccupied: 1318, occupancyRate: "80.50", avgPrice: "87.00", totalRevenue: "114074.00", cleaningTech: "13860.00", marketing: "10286.00", salaries: "3000.00", utilities: "7774.00", totalExpenses: "34920.00", totalProfit: "79154.00", companyProfit: "12105.00", ownersProfit: "67049.00" },
  { month: "Aug 2025", year: 2025, monthNumber: 8, studios: 54, daysAvailable: 1674, daysOccupied: 1513, occupancyRate: "90.50", avgPrice: "144.00", totalRevenue: "218594.00", cleaningTech: "12816.00", marketing: "7282.00", salaries: "4000.00", utilities: "7062.00", totalExpenses: "31160.00", totalProfit: "187434.00", companyProfit: "28889.00", ownersProfit: "158545.00" },
  { month: "Jul 2025", year: 2025, monthNumber: 7, studios: 53, daysAvailable: 1643, daysOccupied: 1446, occupancyRate: "88.00", avgPrice: "121.00", totalRevenue: "175512.00", cleaningTech: "13592.00", marketing: "5051.00", salaries: "4000.00", utilities: "3913.00", totalExpenses: "26556.00", totalProfit: "148956.00", companyProfit: "17180.00", ownersProfit: "131776.00" },
  { month: "Jun 2025", year: 2025, monthNumber: 6, studios: 50, daysAvailable: 1500, daysOccupied: 1185, occupancyRate: "79.00", avgPrice: "85.00", totalRevenue: "100725.00", cleaningTech: "8660.00", marketing: "4300.00", salaries: "3500.00", utilities: "3200.00", totalExpenses: "19660.00", totalProfit: "81065.00", companyProfit: "12160.00", ownersProfit: "68905.00" },
  { month: "May 2025", year: 2025, monthNumber: 5, studios: 47, daysAvailable: 1457, daysOccupied: 1020, occupancyRate: "70.00", avgPrice: "65.00", totalRevenue: "66300.00", cleaningTech: "5100.00", marketing: "2800.00", salaries: "3000.00", utilities: "2400.00", totalExpenses: "13300.00", totalProfit: "53000.00", companyProfit: "7950.00", ownersProfit: "45050.00" },
  { month: "Apr 2025", year: 2025, monthNumber: 4, studios: 45, daysAvailable: 1350, daysOccupied: 810, occupancyRate: "60.00", avgPrice: "55.00", totalRevenue: "44550.00", cleaningTech: "4050.00", marketing: "2200.00", salaries: "2500.00", utilities: "1800.00", totalExpenses: "10550.00", totalProfit: "34000.00", companyProfit: "5100.00", ownersProfit: "28900.00" },
  { month: "Mar 2025", year: 2025, monthNumber: 3, studios: 42, daysAvailable: 1302, daysOccupied: 651, occupancyRate: "50.00", avgPrice: "48.00", totalRevenue: "31248.00", cleaningTech: "3255.00", marketing: "1800.00", salaries: "2000.00", utilities: "1500.00", totalExpenses: "8555.00", totalProfit: "22693.00", companyProfit: "3404.00", ownersProfit: "19289.00" },
  { month: "Feb 2025", year: 2025, monthNumber: 2, studios: 40, daysAvailable: 1120, daysOccupied: 560, occupancyRate: "50.00", avgPrice: "45.00", totalRevenue: "25200.00", cleaningTech: "2800.00", marketing: "1500.00", salaries: "1800.00", utilities: "1400.00", totalExpenses: "7500.00", totalProfit: "17700.00", companyProfit: "2655.00", ownersProfit: "15045.00" },
  { month: "Jan 2025", year: 2025, monthNumber: 1, studios: 38, daysAvailable: 1178, daysOccupied: 589, occupancyRate: "50.00", avgPrice: "42.00", totalRevenue: "24738.00", cleaningTech: "2945.00", marketing: "1200.00", salaries: "1700.00", utilities: "1350.00", totalExpenses: "7195.00", totalProfit: "17543.00", companyProfit: "2631.00", ownersProfit: "14912.00" },
  { month: "Dec 2024", year: 2024, monthNumber: 12, studios: 36, daysAvailable: 1116, daysOccupied: 636, occupancyRate: "57.00", avgPrice: "41.00", totalRevenue: "26775.00", cleaningTech: "2509.00", marketing: "500.00", salaries: "1500.00", utilities: "1449.00", totalExpenses: "5958.00", totalProfit: "20817.00", companyProfit: "5368.00", ownersProfit: "15449.00" },
  { month: "Nov 2024", year: 2024, monthNumber: 11, studios: 34, daysAvailable: 1020, daysOccupied: 632, occupancyRate: "60.20", avgPrice: "40.00", totalRevenue: "25102.00", cleaningTech: "2930.00", marketing: "1806.00", salaries: "1500.00", utilities: "1836.00", totalExpenses: "8072.00", totalProfit: "17030.00", companyProfit: "2596.00", ownersProfit: "14434.00" }
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("Clearing existing financial data...");
  await connection.execute("DELETE FROM financialData");
  
  console.log("Inserting new financial data (Nov 2024 - Nov 2025)...");
  
  for (const record of financialRecords) {
    await connection.execute(
      `INSERT INTO financialData (month, year, monthNumber, studios, daysAvailable, daysOccupied, occupancyRate, avgPrice, totalRevenue, cleaningTech, marketing, salaries, utilities, totalExpenses, totalProfit, companyProfit, ownersProfit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.month, record.year, record.monthNumber, record.studios, record.daysAvailable, record.daysOccupied, record.occupancyRate, record.avgPrice, record.totalRevenue, record.cleaningTech, record.marketing, record.salaries, record.utilities, record.totalExpenses, record.totalProfit, record.companyProfit, record.ownersProfit]
    );
    console.log(`  Inserted: ${record.month}`);
  }
  
  console.log("Done! Inserted", financialRecords.length, "records");
  await connection.end();
}

seed().catch(console.error);
