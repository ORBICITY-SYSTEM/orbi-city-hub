import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import "./finance-print.css";

interface FinancePrintReportProps {
  records: any[];
  expenses: any[];
  summaryStats: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalBookings: number;
    totalNights: number;
    avgADR: number;
    occupancyRate: number;
    totalRooms: number;
  };
  dateRange: { from: Date; to: Date };
  onReady?: () => void;
}

export function FinancePrintReport({ records, expenses, summaryStats, dateRange, onReady }: FinancePrintReportProps) {
  const { language } = useLanguage();
  const isGeorgian = language === 'ka';

  useEffect(() => {
    // Call onReady after component is mounted and rendered
    if (onReady) {
      setTimeout(onReady, 500);
    }
  }, [onReady]);

  // Calculate monthly data
  const monthlyData = new Map<string, any>();
  records.forEach(r => {
    const month = r.date?.substring(0, 7);
    if (!month) return;
    if (!monthlyData.has(month)) {
      monthlyData.set(month, {
        revenue: 0,
        bookings: 0,
        nights: 0,
        rooms: new Set(),
      });
    }
    const data = monthlyData.get(month);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
    if (r.room_number) data.rooms.add(r.room_number);
  });

  const sortedMonths = Array.from(monthlyData.keys()).sort();

  // Calculate channel data
  const channelData = new Map<string, any>();
  records.forEach(r => {
    const channel = r.channel || 'Direct';
    if (!channelData.has(channel)) {
      channelData.set(channel, {
        revenue: 0,
        bookings: 0,
        nights: 0,
      });
    }
    const data = channelData.get(channel);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
  });

  const sortedChannels = Array.from(channelData.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue);

  // Calculate building block data
  const buildingData = new Map<string, any>();
  records.forEach(r => {
    const block = r.building_block || 'Unknown';
    if (!buildingData.has(block)) {
      buildingData.set(block, {
        revenue: 0,
        bookings: 0,
        nights: 0,
        rooms: new Set(),
      });
    }
    const data = buildingData.get(block);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
    if (r.room_number) data.rooms.add(r.room_number);
  });

  const sortedBuildings = Array.from(buildingData.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue);

  // Calculate expense breakdown by category
  const expensesByCategory = new Map<string, number>();
  expenses.forEach(e => {
    const category = e.category || 'Other';
    expensesByCategory.set(category, (expensesByCategory.get(category) || 0) + Number(e.amount || 0));
  });

  const sortedExpenses = Array.from(expensesByCategory.entries())
    .sort((a, b) => b[1] - a[1]);

  const formatCurrency = (value: number) => {
    return `₾ ${value.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isGeorgian ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString(isGeorgian ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="print-report">
      {/* Cover Page */}
      <div className="print-page cover-page">
        <div className="cover-content">
          <h1 className="cover-title">
            {isGeorgian ? 'ფინანსური ანგარიში' : 'Financial Report'}
          </h1>
          <div className="cover-period">
            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </div>
          <div className="cover-logo">
            <div className="logo-circle">Orbi City</div>
          </div>
          <div className="cover-footer">
            {isGeorgian ? 'შექმნილია' : 'Generated on'}: {new Date().toLocaleDateString(isGeorgian ? 'ka-GE' : 'en-US')}
          </div>
        </div>
      </div>

      {/* Executive Summary Page */}
      <div className="print-page">
        <div className="page-header">
          <h2>{isGeorgian ? 'აღმასრულებელი რეზიუმე' : 'Executive Summary'}</h2>
          <div className="page-number">1</div>
        </div>

        <div className="summary-grid">
          <div className="summary-card primary">
            <div className="summary-label">{isGeorgian ? 'მთლიანი შემოსავალი' : 'Total Revenue'}</div>
            <div className="summary-value">{formatCurrency(summaryStats.totalRevenue)}</div>
          </div>

          <div className="summary-card danger">
            <div className="summary-label">{isGeorgian ? 'მთლიანი ხარჯები' : 'Total Expenses'}</div>
            <div className="summary-value">{formatCurrency(summaryStats.totalExpenses)}</div>
          </div>

          <div className={`summary-card ${summaryStats.netProfit >= 0 ? 'success' : 'danger'}`}>
            <div className="summary-label">{isGeorgian ? 'წმინდა მოგება' : 'Net Profit'}</div>
            <div className="summary-value">{formatCurrency(summaryStats.netProfit)}</div>
          </div>

          <div className="summary-card info">
            <div className="summary-label">{isGeorgian ? 'მარჟა' : 'Profit Margin'}</div>
            <div className="summary-value">
              {summaryStats.totalRevenue > 0 
                ? `${((summaryStats.netProfit / summaryStats.totalRevenue) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">{isGeorgian ? 'ჯავშნების რაოდენობა' : 'Total Bookings'}</div>
            <div className="metric-value">{summaryStats.totalBookings.toLocaleString()}</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">{isGeorgian ? 'ღამეების რაოდენობა' : 'Total Nights'}</div>
            <div className="metric-value">{summaryStats.totalNights.toLocaleString()}</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">{isGeorgian ? 'საშუალო ADR' : 'Average ADR'}</div>
            <div className="metric-value">{formatCurrency(summaryStats.avgADR)}</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">{isGeorgian ? 'დაკავებულობა' : 'Occupancy Rate'}</div>
            <div className="metric-value">{summaryStats.occupancyRate.toFixed(1)}%</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">{isGeorgian ? 'სტუდიოების რაოდენობა' : 'Total Studios'}</div>
            <div className="metric-value">{summaryStats.totalRooms}</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">{isGeorgian ? 'საშუალო ღამის ღირებულება' : 'Revenue per Night'}</div>
            <div className="metric-value">
              {summaryStats.totalNights > 0 
                ? formatCurrency(summaryStats.totalRevenue / summaryStats.totalNights)
                : formatCurrency(0)}
            </div>
          </div>
        </div>

        <div className="page-footer">
          <div>{isGeorgian ? 'Orbi City ფინანსური ანგარიში' : 'Orbi City Financial Report'}</div>
          <div>{formatDate(dateRange.from)} - {formatDate(dateRange.to)}</div>
        </div>
      </div>

      {/* Monthly Performance Page */}
      <div className="print-page">
        <div className="page-header">
          <h2>{isGeorgian ? 'თვიური შესრულება' : 'Monthly Performance'}</h2>
          <div className="page-number">2</div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{isGeorgian ? 'თვე' : 'Month'}</th>
              <th className="text-right">{isGeorgian ? 'შემოსავალი' : 'Revenue'}</th>
              <th className="text-right">{isGeorgian ? 'ჯავშნები' : 'Bookings'}</th>
              <th className="text-right">{isGeorgian ? 'ღამეები' : 'Nights'}</th>
              <th className="text-right">{isGeorgian ? 'სტუდიოები' : 'Studios'}</th>
              <th className="text-right">ADR</th>
            </tr>
          </thead>
          <tbody>
            {sortedMonths.map(month => {
              const data = monthlyData.get(month);
              const adr = data.nights > 0 ? data.revenue / data.nights : 0;
              return (
                <tr key={month}>
                  <td className="font-medium">{formatMonth(month)}</td>
                  <td className="text-right">{formatCurrency(data.revenue)}</td>
                  <td className="text-right">{data.bookings}</td>
                  <td className="text-right">{data.nights}</td>
                  <td className="text-right">{data.rooms.size}</td>
                  <td className="text-right">{formatCurrency(adr)}</td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td className="font-bold">{isGeorgian ? 'სულ' : 'Total'}</td>
              <td className="text-right font-bold">{formatCurrency(summaryStats.totalRevenue)}</td>
              <td className="text-right font-bold">{summaryStats.totalBookings}</td>
              <td className="text-right font-bold">{summaryStats.totalNights}</td>
              <td className="text-right font-bold">{summaryStats.totalRooms}</td>
              <td className="text-right font-bold">{formatCurrency(summaryStats.avgADR)}</td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <div>{isGeorgian ? 'Orbi City ფინანსური ანგარიში' : 'Orbi City Financial Report'}</div>
          <div>{formatDate(dateRange.from)} - {formatDate(dateRange.to)}</div>
        </div>
      </div>

      {/* Channel Performance Page */}
      <div className="print-page">
        <div className="page-header">
          <h2>{isGeorgian ? 'არხების შესრულება' : 'Channel Performance'}</h2>
          <div className="page-number">3</div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{isGeorgian ? 'არხი' : 'Channel'}</th>
              <th className="text-right">{isGeorgian ? 'შემოსავალი' : 'Revenue'}</th>
              <th className="text-right">{isGeorgian ? 'ჯავშნები' : 'Bookings'}</th>
              <th className="text-right">{isGeorgian ? 'ღამეები' : 'Nights'}</th>
              <th className="text-right">ADR</th>
              <th className="text-right">{isGeorgian ? '% წილი' : '% Share'}</th>
            </tr>
          </thead>
          <tbody>
            {sortedChannels.map(([channel, data]) => {
              const adr = data.nights > 0 ? data.revenue / data.nights : 0;
              const share = summaryStats.totalRevenue > 0 ? (data.revenue / summaryStats.totalRevenue) * 100 : 0;
              return (
                <tr key={channel}>
                  <td className="font-medium">{channel}</td>
                  <td className="text-right">{formatCurrency(data.revenue)}</td>
                  <td className="text-right">{data.bookings}</td>
                  <td className="text-right">{data.nights}</td>
                  <td className="text-right">{formatCurrency(adr)}</td>
                  <td className="text-right">{share.toFixed(1)}%</td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td className="font-bold">{isGeorgian ? 'სულ' : 'Total'}</td>
              <td className="text-right font-bold">{formatCurrency(summaryStats.totalRevenue)}</td>
              <td className="text-right font-bold">{summaryStats.totalBookings}</td>
              <td className="text-right font-bold">{summaryStats.totalNights}</td>
              <td className="text-right font-bold">{formatCurrency(summaryStats.avgADR)}</td>
              <td className="text-right font-bold">100%</td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <div>{isGeorgian ? 'Orbi City ფინანსური ანგარიში' : 'Orbi City Financial Report'}</div>
          <div>{formatDate(dateRange.from)} - {formatDate(dateRange.to)}</div>
        </div>
      </div>

      {/* Building Block Performance Page */}
      <div className="print-page">
        <div className="page-header">
          <h2>{isGeorgian ? 'ბლოკების შესრულება' : 'Building Block Performance'}</h2>
          <div className="page-number">4</div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{isGeorgian ? 'ბლოკი' : 'Block'}</th>
              <th className="text-right">{isGeorgian ? 'შემოსავალი' : 'Revenue'}</th>
              <th className="text-right">{isGeorgian ? 'ჯავშნები' : 'Bookings'}</th>
              <th className="text-right">{isGeorgian ? 'ღამეები' : 'Nights'}</th>
              <th className="text-right">{isGeorgian ? 'სტუდიოები' : 'Studios'}</th>
              <th className="text-right">ADR</th>
            </tr>
          </thead>
          <tbody>
            {sortedBuildings.map(([block, data]) => {
              const adr = data.nights > 0 ? data.revenue / data.nights : 0;
              return (
                <tr key={block}>
                  <td className="font-medium">{block}</td>
                  <td className="text-right">{formatCurrency(data.revenue)}</td>
                  <td className="text-right">{data.bookings}</td>
                  <td className="text-right">{data.nights}</td>
                  <td className="text-right">{data.rooms.size}</td>
                  <td className="text-right">{formatCurrency(adr)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="page-footer">
          <div>{isGeorgian ? 'Orbi City ფინანსური ანგარიში' : 'Orbi City Financial Report'}</div>
          <div>{formatDate(dateRange.from)} - {formatDate(dateRange.to)}</div>
        </div>
      </div>

      {/* Expenses Page */}
      <div className="print-page">
        <div className="page-header">
          <h2>{isGeorgian ? 'ხარჯების ანალიზი' : 'Expense Analysis'}</h2>
          <div className="page-number">5</div>
        </div>

        <div className="expense-summary">
          <div className="expense-total">
            <div className="expense-label">{isGeorgian ? 'მთლიანი ხარჯები' : 'Total Expenses'}</div>
            <div className="expense-value">{formatCurrency(summaryStats.totalExpenses)}</div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{isGeorgian ? 'კატეგორია' : 'Category'}</th>
              <th className="text-right">{isGeorgian ? 'თანხა' : 'Amount'}</th>
              <th className="text-right">{isGeorgian ? '% შემოსავლიდან' : '% of Revenue'}</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map(([category, amount]) => {
              const percentOfRevenue = summaryStats.totalRevenue > 0 
                ? (amount / summaryStats.totalRevenue) * 100 
                : 0;
              return (
                <tr key={category}>
                  <td className="font-medium">{category}</td>
                  <td className="text-right">{formatCurrency(amount)}</td>
                  <td className="text-right">{percentOfRevenue.toFixed(1)}%</td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td className="font-bold">{isGeorgian ? 'სულ' : 'Total'}</td>
              <td className="text-right font-bold">{formatCurrency(summaryStats.totalExpenses)}</td>
              <td className="text-right font-bold">
                {summaryStats.totalRevenue > 0 
                  ? `${((summaryStats.totalExpenses / summaryStats.totalRevenue) * 100).toFixed(1)}%`
                  : '0%'}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <div>{isGeorgian ? 'Orbi City ფინანსური ანგარიში' : 'Orbi City Financial Report'}</div>
          <div>{formatDate(dateRange.from)} - {formatDate(dateRange.to)}</div>
        </div>
      </div>
    </div>
  );
}
