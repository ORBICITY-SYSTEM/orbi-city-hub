/**
 * CSV Export Utility
 * Provides functions to export dashboard data to CSV format
 */

export interface CEODashboardData {
  kpis: {
    revenue: number;
    revenueChange: number;
    occupancy: number;
    occupancyChange: number;
    rating: number;
    ratingChange: number;
    aiTasks: number;
    aiTasksChange: number;
  };
  revenueByChannel: Array<{
    channel: string;
    amount: number;
    percentage: number;
  }>;
  monthlyOverview: {
    totalBookings: number;
    bookingsChange: number;
    avgStay: number;
    avgStayChange: string;
    avgPrice: number;
    avgPriceChange: number;
    cancellationRate: number;
    cancellationRateChange: number;
  };
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: string[][]): string {
  return data
    .map(row =>
      row
        .map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export CEO Dashboard data to CSV
 */
export function exportCEODashboardToCSV(data: CEODashboardData): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `orbi-city-ceo-dashboard-${timestamp}.csv`;
  
  const csvData: string[][] = [];
  
  // Header
  csvData.push(['ORBI City Hub - CEO Dashboard Export']);
  csvData.push([`Generated: ${new Date().toLocaleString()}`]);
  csvData.push([]);
  
  // KPIs Section
  csvData.push(['KEY PERFORMANCE INDICATORS']);
  csvData.push(['Metric', 'Value', 'Change vs Last Month']);
  csvData.push(['Revenue', `${data.kpis.revenue.toLocaleString()} ₾`, `${data.kpis.revenueChange > 0 ? '+' : ''}${data.kpis.revenueChange}%`]);
  csvData.push(['Occupancy', `${data.kpis.occupancy}%`, `${data.kpis.occupancyChange > 0 ? '+' : ''}${data.kpis.occupancyChange}%`]);
  csvData.push(['Rating', `${data.kpis.rating}/10`, `${data.kpis.ratingChange > 0 ? '+' : ''}${data.kpis.ratingChange}`]);
  csvData.push(['AI Tasks Completed', `${data.kpis.aiTasks}`, `${data.kpis.aiTasksChange > 0 ? '+' : ''}${data.kpis.aiTasksChange}`]);
  csvData.push([]);
  
  // Revenue by Channel Section
  csvData.push(['REVENUE BY CHANNEL']);
  csvData.push(['Channel', 'Amount (₾)', 'Percentage']);
  data.revenueByChannel.forEach(channel => {
    csvData.push([
      channel.channel,
      channel.amount.toLocaleString(),
      `${channel.percentage}%`
    ]);
  });
  csvData.push([]);
  
  // Monthly Overview Section
  csvData.push(['MONTHLY OVERVIEW (November 2025)']);
  csvData.push(['Metric', 'Value', 'Change vs October']);
  csvData.push(['Total Bookings', `${data.monthlyOverview.totalBookings}`, `${data.monthlyOverview.bookingsChange > 0 ? '+' : ''}${data.monthlyOverview.bookingsChange}%`]);
  csvData.push(['Average Stay', `${data.monthlyOverview.avgStay} nights`, data.monthlyOverview.avgStayChange]);
  csvData.push(['Average Price', `${data.monthlyOverview.avgPrice} ₾`, `${data.monthlyOverview.avgPriceChange > 0 ? '+' : ''}${data.monthlyOverview.avgPriceChange}%`]);
  csvData.push(['Cancellation Rate', `${data.monthlyOverview.cancellationRate}%`, `${data.monthlyOverview.cancellationRateChange}%`]);
  
  const csvContent = convertToCSV(csvData);
  downloadCSV(csvContent, filename);
}
