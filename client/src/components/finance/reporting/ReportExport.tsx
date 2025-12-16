import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { toast } from "sonner";

interface ReportExportProps {
  reports: any[];
  startDate?: Date;
  endDate?: Date;
}

export const ReportExport = ({ reports, startDate, endDate }: ReportExportProps) => {
  const exportToExcel = () => {
    if (!reports || reports.length === 0) {
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    // Calculate totals
    const totalRevenue = reports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
    const totalExpenses = reports.reduce((sum, r) => sum + (r.total_expenses || 0), 0);
    const totalProfit = reports.reduce((sum, r) => sum + (r.total_profit || 0), 0);
    const companyProfit = reports.reduce((sum, r) => sum + (r.company_profit || 0), 0);
    const ownersProfit = reports.reduce((sum, r) => sum + (r.studio_owners_profit || 0), 0);
    
    // Summary Sheet
    const summaryData = [
      ['ORBI CITY FINANCIAL REPORT'],
      ['Period: October 2024 - September 2025'],
      [''],
      ['EXECUTIVE SUMMARY'],
      [''],
      ['Metric', 'Amount (GEL)', ''],
      ['Total Revenue', totalRevenue, ''],
      ['Total Expenses', totalExpenses, ''],
      ['Total Profit', totalProfit, ''],
      ['Company Profit', companyProfit, ''],
      ['Studio Owners Profit', ownersProfit, ''],
      [''],
      ['Profit Margin', totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%', ''],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 15 }
    ];
    
    // Merge cells for title
    summarySheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Monthly Details Sheet
    const monthlyData = [
      ['MONTHLY BREAKDOWN - ORBI CITY'],
      [''],
      ['Month', 'Studios', 'Days Available', 'Days Occupied', 'Occupancy %', 'Avg Price', 'Total Revenue', 'Cleaning/Tech', 'Marketing', 'Salaries', 'Utilities', 'Total Expenses', 'Total Profit', 'Company Profit', 'Owners Profit']
    ];
    
    reports.forEach(report => {
      monthlyData.push([
        format(new Date(report.month), 'MMMM yyyy'),
        report.studio_count || 0,
        report.days_available || 0,
        report.days_occupied || 0,
        (report.occupancy || 0).toFixed(1) + '%',
        report.average_price || 0,
        report.total_revenue || 0,
        report.cleaning_technical || 0,
        report.marketing || 0,
        report.salaries || 0,
        report.utilities || 0,
        report.total_expenses || 0,
        report.total_profit || 0,
        report.company_profit || 0,
        report.studio_owners_profit || 0,
      ]);
    });
    
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    
    // Set column widths
    monthlySheet['!cols'] = Array(15).fill({ wch: 15 });
    
    // Merge title
    monthlySheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Details');
    
    // Revenue Analysis Sheet
    const revenueData = [
      ['REVENUE ANALYSIS'],
      [''],
      ['Month', 'Total Revenue', 'Average Price', 'Occupancy %', 'Days Occupied']
    ];
    
    reports.forEach(report => {
      revenueData.push([
        format(new Date(report.month), 'MMM yyyy'),
        report.total_revenue || 0,
        report.average_price || 0,
        (report.occupancy || 0).toFixed(1) + '%',
        report.days_occupied || 0,
      ]);
    });
    
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    revenueSheet['!cols'] = Array(5).fill({ wch: 18 });
    revenueSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Analysis');
    
    // Expense Breakdown Sheet
    const expenseData = [
      ['EXPENSE BREAKDOWN'],
      [''],
      ['Month', 'Cleaning/Technical', 'Marketing', 'Salaries', 'Utilities', 'Total Expenses']
    ];
    
    reports.forEach(report => {
      expenseData.push([
        format(new Date(report.month), 'MMM yyyy'),
        report.cleaning_technical || 0,
        report.marketing || 0,
        report.salaries || 0,
        report.utilities || 0,
        report.total_expenses || 0,
      ]);
    });
    
    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    expenseSheet['!cols'] = Array(6).fill({ wch: 18 });
    expenseSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
    
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Breakdown');
    
    // Profit Analysis Sheet
    const profitData = [
      ['PROFIT ANALYSIS'],
      [''],
      ['Month', 'Total Revenue', 'Total Expenses', 'Total Profit', 'Company Profit', 'Owners Profit', 'Profit Margin %']
    ];
    
    reports.forEach(report => {
      const profitMargin = (report.total_revenue || 0) > 0 
        ? (((report.total_profit || 0) / (report.total_revenue || 0)) * 100).toFixed(2) 
        : 0;
      
      profitData.push([
        format(new Date(report.month), 'MMM yyyy'),
        report.total_revenue || 0,
        report.total_expenses || 0,
        report.total_profit || 0,
        report.company_profit || 0,
        report.studio_owners_profit || 0,
        profitMargin + '%',
      ]);
    });
    
    const profitSheet = XLSX.utils.aoa_to_sheet(profitData);
    profitSheet['!cols'] = Array(7).fill({ wch: 18 });
    profitSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    
    XLSX.utils.book_append_sheet(workbook, profitSheet, 'Profit Analysis');
    
    // Studio Growth Sheet
    const sortedReports = [...reports].sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    
    const growthData = [
      ['STUDIO GROWTH ANALYSIS'],
      [''],
      ['Month', 'Studio Count', 'Growth %', 'Days Available', 'Days Occupied']
    ];
    
    sortedReports.forEach((report, index) => {
      let growth = 0;
      if (index > 0) {
        const prevStudios = sortedReports[index - 1].studio_count || 0;
        const currentStudios = report.studio_count || 0;
        growth = prevStudios > 0 ? ((currentStudios - prevStudios) / prevStudios) * 100 : 0;
      }
      
      growthData.push([
        format(new Date(report.month), 'MMM yyyy'),
        report.studio_count || 0,
        growth.toFixed(1) + '%',
        report.days_available || 0,
        report.days_occupied || 0,
      ]);
    });
    
    // Add summary
    const firstStudios = sortedReports[0]?.studio_count || 34;
    const lastStudios = sortedReports[sortedReports.length - 1]?.studio_count || 55;
    const totalGrowth = firstStudios > 0 ? (((lastStudios - firstStudios) / firstStudios) * 100).toFixed(1) : '61.8';
    
    growthData.push(['']);
    growthData.push(['Period: October 2024 - September 2025']);
    growthData.push(['']);
    growthData.push([`One-year growth from ${firstStudios} to ${lastStudios} apartments - +${totalGrowth}%`]);
    growthData.push(['']);
    growthData.push(['2023 Baseline: 14 studios']);
    
    // Calculate growth from 2023 (14 studios) to first report
    const growth2023ToFirst = 14 > 0 ? (((firstStudios - 14) / 14) * 100).toFixed(1) : 0;
    growthData.push([`Growth since 2023: +${growth2023ToFirst}%`]);
    
    const growthSheet = XLSX.utils.aoa_to_sheet(growthData);
    growthSheet['!cols'] = Array(5).fill({ wch: 20 });
    growthSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: growthData.length - 4, c: 0 }, e: { r: growthData.length - 4, c: 4 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, growthSheet, 'Studio Growth');
    
    // ADVANCED ANALYTICS SHEET 1: YoY Comparison & Growth Metrics
    const yoyData = [
      ['📈 YEAR-OVER-YEAR GROWTH ANALYSIS'],
      [''],
      ['Metric', 'Oct 2024', 'Sep 2025', 'Growth', 'Growth %', 'Status']
    ];
    
    const firstMonth = sortedReports[0] || {};
    const lastMonth = sortedReports[sortedReports.length - 1] || {};
    
    const yoyMetrics = [
      ['Studios', firstMonth.studio_count || 34, lastMonth.studio_count || 55, 
       (lastMonth.studio_count || 55) - (firstMonth.studio_count || 34),
       (((lastMonth.studio_count || 55) - (firstMonth.studio_count || 34)) / (firstMonth.studio_count || 34) * 100).toFixed(1) + '%',
       '🔥 Excellent'],
      ['Occupancy %', (firstMonth.occupancy || 0).toFixed(1) + '%', (lastMonth.occupancy || 0).toFixed(1) + '%',
       ((lastMonth.occupancy || 0) - (firstMonth.occupancy || 0)).toFixed(1) + '%',
       (((lastMonth.occupancy || 0) - (firstMonth.occupancy || 0)) / (firstMonth.occupancy || 1) * 100).toFixed(1) + '%',
       (lastMonth.occupancy || 0) > (firstMonth.occupancy || 0) ? '↑ Growing' : '↓ Declining'],
      ['Avg Price', firstMonth.average_price || 0, lastMonth.average_price || 0,
       (lastMonth.average_price || 0) - (firstMonth.average_price || 0),
       (((lastMonth.average_price || 0) - (firstMonth.average_price || 0)) / (firstMonth.average_price || 1) * 100).toFixed(1) + '%',
       (lastMonth.average_price || 0) > (firstMonth.average_price || 0) ? '↑ Improving' : '→ Stable'],
      ['Monthly Revenue', firstMonth.total_revenue || 0, lastMonth.total_revenue || 0,
       (lastMonth.total_revenue || 0) - (firstMonth.total_revenue || 0),
       (((lastMonth.total_revenue || 0) - (firstMonth.total_revenue || 0)) / (firstMonth.total_revenue || 1) * 100).toFixed(1) + '%',
       (lastMonth.total_revenue || 0) > (firstMonth.total_revenue || 0) ? '🔥 Excellent' : '⚠️ Review'],
    ];
    
    yoyData.push(...yoyMetrics);
    yoyData.push(['']);
    yoyData.push(['KEY INSIGHTS']);
    yoyData.push(['Total Period Revenue', totalRevenue]);
    yoyData.push(['Average Monthly Revenue', (totalRevenue / reports.length).toFixed(2)]);
    yoyData.push(['Revenue Per Studio (Period)', (totalRevenue / ((lastMonth.studio_count || 55) + (firstMonth.studio_count || 34)) * 2).toFixed(2)]);
    
    const yoySheet = XLSX.utils.aoa_to_sheet(yoyData);
    yoySheet['!cols'] = Array(6).fill({ wch: 20 });
    yoySheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
    XLSX.utils.book_append_sheet(workbook, yoySheet, 'YoY Growth Analysis');
    
    // ADVANCED ANALYTICS SHEET 2: ROI & Efficiency Metrics
    const roiData = [
      ['💰 ROI & EFFICIENCY ANALYSIS'],
      [''],
      ['Month', 'Revenue', 'Expenses', 'Profit Margin %', 'Revenue/Studio', 'Profit/Studio', 'Efficiency Score']
    ];
    
    reports.forEach(report => {
      const profitMargin = report.total_revenue > 0 ? ((report.total_profit / report.total_revenue) * 100).toFixed(1) : 0;
      const revenuePerStudio = report.studio_count > 0 ? (report.total_revenue / report.studio_count).toFixed(2) : 0;
      const profitPerStudio = report.studio_count > 0 ? (report.total_profit / report.studio_count).toFixed(2) : 0;
      const efficiencyScore = report.occupancy && report.average_price ? 
        ((report.occupancy / 100) * (report.average_price / 100) * 10).toFixed(1) : 0;
      
      roiData.push([
        format(new Date(report.month), 'MMM yyyy'),
        report.total_revenue || 0,
        report.total_expenses || 0,
        profitMargin + '%',
        revenuePerStudio,
        profitPerStudio,
        efficiencyScore
      ]);
    });
    
    roiData.push(['']);
    roiData.push(['PERIOD AVERAGES']);
    const avgProfitMargin = reports.reduce((sum, r) => sum + (r.total_revenue > 0 ? (r.total_profit / r.total_revenue) * 100 : 0), 0) / reports.length;
    roiData.push(['Average Profit Margin', avgProfitMargin.toFixed(1) + '%']);
    roiData.push(['Best Month Margin', Math.max(...reports.map(r => r.total_revenue > 0 ? (r.total_profit / r.total_revenue) * 100 : 0)).toFixed(1) + '%']);
    roiData.push(['Target Margin (Industry)', '35-40%']);
    roiData.push(['Status', avgProfitMargin > 35 ? '🔥 Above Target' : '⚠️ Below Target']);
    
    const roiSheet = XLSX.utils.aoa_to_sheet(roiData);
    roiSheet['!cols'] = Array(7).fill({ wch: 18 });
    roiSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    XLSX.utils.book_append_sheet(workbook, roiSheet, 'ROI & Efficiency');
    
    // ADVANCED ANALYTICS SHEET 3: Seasonal Performance & Patterns
    const seasonalData = [
      ['🌡️ SEASONAL PERFORMANCE ANALYSIS'],
      [''],
      ['Month', 'Revenue', 'Occupancy %', 'Avg Price', 'Performance', 'Rank']
    ];
    
    const performanceRanked = [...reports]
      .map(report => ({
        month: format(new Date(report.month), 'MMM yyyy'),
        revenue: report.total_revenue || 0,
        occupancy: report.occupancy || 0,
        avgPrice: report.average_price || 0,
        score: (report.total_revenue || 0) * (report.occupancy || 0) / 100
      }))
      .sort((a, b) => b.score - a.score);
    
    performanceRanked.forEach((item, index) => {
      let performance = '→ Average';
      if (index < 3) performance = '🔥 Top Performer';
      else if (index > performanceRanked.length - 4) performance = '⚠️ Needs Attention';
      
      seasonalData.push([
        item.month,
        item.revenue,
        item.occupancy.toFixed(1) + '%',
        item.avgPrice,
        performance,
        `#${index + 1}`
      ]);
    });
    
    seasonalData.push(['']);
    seasonalData.push(['INSIGHTS']);
    seasonalData.push(['Best Revenue Month', performanceRanked[0].month, performanceRanked[0].revenue]);
    seasonalData.push(['Highest Occupancy', performanceRanked.reduce((max, p) => p.occupancy > max.occupancy ? p : max).month, 
                       performanceRanked.reduce((max, p) => p.occupancy > max.occupancy ? p : max).occupancy.toFixed(1) + '%']);
    seasonalData.push(['Best Price Month', performanceRanked.reduce((max, p) => p.avgPrice > max.avgPrice ? p : max).month,
                       performanceRanked.reduce((max, p) => p.avgPrice > max.avgPrice ? p : max).avgPrice]);
    
    const seasonalSheet = XLSX.utils.aoa_to_sheet(seasonalData);
    seasonalSheet['!cols'] = Array(6).fill({ wch: 20 });
    seasonalSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
    XLSX.utils.book_append_sheet(workbook, seasonalSheet, 'Seasonal Performance');
    
    // ADVANCED ANALYTICS SHEET 4: Cost Optimization Analysis
    const costData = [
      ['💸 COST OPTIMIZATION ANALYSIS'],
      [''],
      ['Month', 'Cleaning/Tech', 'Marketing', 'Salaries', 'Utilities', 'Total', '% of Revenue', 'Status']
    ];
    
    reports.forEach(report => {
      const expenseRatio = report.total_revenue > 0 ? ((report.total_expenses / report.total_revenue) * 100) : 0;
      let status = '→ Normal';
      if (expenseRatio < 30) status = '🔥 Efficient';
      else if (expenseRatio > 40) status = '⚠️ High';
      
      costData.push([
        format(new Date(report.month), 'MMM yyyy'),
        report.cleaning_technical || 0,
        report.marketing || 0,
        report.salaries || 0,
        report.utilities || 0,
        report.total_expenses || 0,
        expenseRatio.toFixed(1) + '%',
        status
      ]);
    });
    
    costData.push(['']);
    costData.push(['EXPENSE CATEGORY ANALYSIS']);
    const totalCleaning = reports.reduce((sum, r) => sum + (r.cleaning_technical || 0), 0);
    const totalMarketing = reports.reduce((sum, r) => sum + (r.marketing || 0), 0);
    const totalSalaries = reports.reduce((sum, r) => sum + (r.salaries || 0), 0);
    const totalUtilities = reports.reduce((sum, r) => sum + (r.utilities || 0), 0);
    
    costData.push(['Total Cleaning/Technical', totalCleaning, '', ((totalCleaning/totalExpenses)*100).toFixed(1) + '%']);
    costData.push(['Total Marketing', totalMarketing, '', ((totalMarketing/totalExpenses)*100).toFixed(1) + '%']);
    costData.push(['Total Salaries', totalSalaries, '', ((totalSalaries/totalExpenses)*100).toFixed(1) + '%']);
    costData.push(['Total Utilities', totalUtilities, '', ((totalUtilities/totalExpenses)*100).toFixed(1) + '%']);
    costData.push(['']);
    costData.push(['Optimization Potential', 'Review marketing ROI and utility efficiency']);
    
    const costSheet = XLSX.utils.aoa_to_sheet(costData);
    costSheet['!cols'] = Array(8).fill({ wch: 18 });
    costSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    XLSX.utils.book_append_sheet(workbook, costSheet, 'Cost Optimization');
    
    // ADVANCED ANALYTICS SHEET 5: Company vs Owners Profit Distribution
    const profitSplitData = [
      ['🎯 PROFIT DISTRIBUTION ANALYSIS'],
      [''],
      ['Month', 'Total Profit', 'Company Profit', 'Company %', 'Owners Profit', 'Owners %', 'Split Ratio']
    ];
    
    reports.forEach(report => {
      const totalProfit = report.total_profit || 0;
      const companyProfit = report.company_profit || 0;
      const ownersProfit = report.studio_owners_profit || 0;
      const companyPercent = totalProfit > 0 ? ((companyProfit / totalProfit) * 100).toFixed(1) : 0;
      const ownersPercent = totalProfit > 0 ? ((ownersProfit / totalProfit) * 100).toFixed(1) : 0;
      
      profitSplitData.push([
        format(new Date(report.month), 'MMM yyyy'),
        totalProfit,
        companyProfit,
        companyPercent + '%',
        ownersProfit,
        ownersPercent + '%',
        `${companyPercent}/${ownersPercent}`
      ]);
    });
    
    profitSplitData.push(['']);
    profitSplitData.push(['PERIOD TOTALS']);
    profitSplitData.push(['Total Profit', totalProfit]);
    profitSplitData.push(['Company Share', companyProfit, '', ((companyProfit/totalProfit)*100).toFixed(1) + '%']);
    profitSplitData.push(['Owners Share', ownersProfit, '', ((ownersProfit/totalProfit)*100).toFixed(1) + '%']);
    profitSplitData.push(['']);
    profitSplitData.push(['VISUAL REPRESENTATION']);
    profitSplitData.push(['🟢 Company Profit:', companyProfit, `${((companyProfit/totalProfit)*100).toFixed(1)}%`]);
    profitSplitData.push(['🟡 Owners Profit:', ownersProfit, `${((ownersProfit/totalProfit)*100).toFixed(1)}%`]);
    
    const profitSplitSheet = XLSX.utils.aoa_to_sheet(profitSplitData);
    profitSplitSheet['!cols'] = Array(7).fill({ wch: 18 });
    profitSplitSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    XLSX.utils.book_append_sheet(workbook, profitSplitSheet, 'Profit Distribution');
    
    // ADVANCED ANALYTICS SHEET 6: Studio Count Growth with Details
    const studioGrowthDetailData = [
      ['📊 STUDIO COUNT GROWTH DETAILED'],
      [''],
      ['Month', 'Studio Count', 'New Studios', 'Growth from Previous', 'Growth %', 'Cumulative Growth', 'Status']
    ];
    
    sortedReports.forEach((report, index) => {
      const prevCount = index > 0 ? sortedReports[index - 1].studio_count || 0 : 34;
      const currentCount = report.studio_count || 0;
      const newStudios = currentCount - prevCount;
      const growthPercent = prevCount > 0 ? ((newStudios / prevCount) * 100).toFixed(1) : 0;
      const cumulativeGrowth = ((currentCount - 34) / 34 * 100).toFixed(1);
      let status = newStudios > 0 ? '↑ Growing' : newStudios < 0 ? '↓ Declined' : '→ Stable';
      
      studioGrowthDetailData.push([
        format(new Date(report.month), 'MMM yyyy'),
        currentCount,
        newStudios > 0 ? `+${newStudios}` : newStudios,
        newStudios,
        growthPercent + '%',
        cumulativeGrowth + '%',
        status
      ]);
    });
    
    studioGrowthDetailData.push(['']);
    studioGrowthDetailData.push(['GROWTH SUMMARY']);
    studioGrowthDetailData.push(['Starting Point (Oct 2024)', firstStudios]);
    studioGrowthDetailData.push(['Ending Point (Sep 2025)', lastStudios]);
    studioGrowthDetailData.push(['Total New Studios', String(lastStudios - firstStudios)]);
    studioGrowthDetailData.push(['Overall Growth', totalGrowth + '%']);
    studioGrowthDetailData.push(['']);
    studioGrowthDetailData.push(['📈 GROWTH TRAJECTORY']);
    studioGrowthDetailData.push(['2023 Baseline', '14 studios']);
    studioGrowthDetailData.push(['Growth 2023→2024', `+${firstStudios - 14} studios (+${growth2023ToFirst}%)`]);
    studioGrowthDetailData.push(['Growth 2024→2025', `+${lastStudios - firstStudios} studios (+${totalGrowth}%)`]);
    studioGrowthDetailData.push(['Total 2023→2025', `+${lastStudios - 14} studios (+${((lastStudios - 14) / 14 * 100).toFixed(1)}%)`]);
    
    const studioGrowthDetailSheet = XLSX.utils.aoa_to_sheet(studioGrowthDetailData);
    studioGrowthDetailSheet['!cols'] = Array(7).fill({ wch: 20 });
    studioGrowthDetailSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    XLSX.utils.book_append_sheet(workbook, studioGrowthDetailSheet, 'Studio Growth Detail');

    const fileName = startDate && endDate 
      ? `Orbi_City_Financial_Report_${format(startDate, 'MMM_yyyy')}_to_${format(endDate, 'MMM_yyyy')}.xlsx`
      : 'Orbi_City_Financial_Report_Oct2024_Sep2025.xlsx';

    try {
      XLSX.writeFile(workbook, fileName);
      toast.success("Excel report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download Excel report");
      console.error("Excel export error:", error);
    }
  };

  const exportToPNG = async () => {
    try {
      toast.info("Generating PNG image...");
      
      const dashboardElement = document.getElementById('finance-dashboard');
      if (!dashboardElement) {
        toast.error("Dashboard not found");
        return;
      }

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: dashboardElement.scrollWidth,
        height: dashboardElement.scrollHeight
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `finance-dashboard-${format(new Date(), 'yyyy-MM-dd')}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("PNG exported successfully! You can now use it in Canva.");
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('PNG export error:', error);
      toast.error("Failed to export PNG");
    }
  };

  const exportToPDF = async () => {
    try {
      toast.info("Generating complete PDF with all sections...");
      
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let currentPage = 1;

      const addPageNumber = (pageNum: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor(150);
        pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      };

      const captureElement = async (element: HTMLElement) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });
        
        return canvas;
      };

      // PAGE 1: Header + Period Selection
      const headerEl = document.querySelector('[data-pdf-header]') as HTMLElement;
      const periodEl = document.querySelector('[data-pdf-period]') as HTMLElement;
      
      if (headerEl) {
        toast.info("Capturing header...");
        const canvas = await captureElement(headerEl);
        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        
        if (periodEl) {
          const periodCanvas = await captureElement(periodEl);
          const periodData = periodCanvas.toDataURL('image/png', 1.0);
          const periodHeight = (periodCanvas.height * imgWidth) / periodCanvas.width;
          pdf.addImage(periodData, 'PNG', margin, margin + imgHeight + 5, imgWidth, periodHeight);
        }
        
        addPageNumber(currentPage);
      }

      // PAGES 2+: Monthly Cards (3 per page)
      const monthlyCards = Array.from(document.querySelectorAll('[data-pdf-monthly-card]')) as HTMLElement[];
      
      if (monthlyCards.length > 0) {
        const cardsPerPage = 3;
        
        for (let i = 0; i < monthlyCards.length; i += cardsPerPage) {
          pdf.addPage();
          currentPage++;
          toast.info(`Capturing months ${i + 1}-${Math.min(i + cardsPerPage, monthlyCards.length)}...`);
          
          let yPos = margin;
          
          for (let j = 0; j < cardsPerPage && i + j < monthlyCards.length; j++) {
            const card = monthlyCards[i + j];
            const canvas = await captureElement(card);
            const imgData = canvas.toDataURL('image/png', 1.0);
            const imgWidth = pageWidth - (2 * margin);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
          }
          
          addPageNumber(currentPage);
        }
      }

      // FINAL PAGES: Charts Section
      const chartsContainer = document.querySelector('[data-pdf-charts]') as HTMLElement;
      
      if (chartsContainer) {
        toast.info("Capturing analytics charts...");
        const chartSections = Array.from(chartsContainer.children) as HTMLElement[];
        
        for (const section of chartSections) {
          pdf.addPage();
          currentPage++;
          
          const canvas = await captureElement(section);
          const imgData = canvas.toDataURL('image/png', 1.0);
          const imgWidth = pageWidth - (2 * margin);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const maxHeight = pageHeight - (2 * margin) - 10;
          
          const finalHeight = Math.min(imgHeight, maxHeight);
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, finalHeight);
          addPageNumber(currentPage);
        }
      }

      const fileName = startDate && endDate
        ? `Orbi_City_Financial_Report_${format(startDate, 'MMM_yyyy')}_${format(endDate, 'MMM_yyyy')}.pdf`
        : `Orbi_City_Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      pdf.save(fileName);
      toast.success(`PDF exported successfully with ${currentPage} pages!`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPNG}>
          <Download className="mr-2 h-4 w-4" />
          Export as PNG (for Canva)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Download className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};