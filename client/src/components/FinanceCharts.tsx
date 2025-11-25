import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface MonthlyData {
  month: string;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  occupancyRate: number;
  avgPrice: number;
  companyProfit: number;
  ownersProfit: number;
  cleaningTech: number;
  marketing: number;
  salaries: number;
  utilities: number;
}

interface FinanceChartsProps {
  monthlyData: MonthlyData[];
}

export function FinanceCharts({ monthlyData }: FinanceChartsProps) {
  const revenueTrendRef = useRef<HTMLCanvasElement>(null);
  const expenseBreakdownRef = useRef<HTMLCanvasElement>(null);
  const profitMarginRef = useRef<HTMLCanvasElement>(null);
  const occupancyRef = useRef<HTMLCanvasElement>(null);
  const avgPriceRef = useRef<HTMLCanvasElement>(null);
  const profitSplitRef = useRef<HTMLCanvasElement>(null);
  const monthlyComparisonRef = useRef<HTMLCanvasElement>(null);

  const charts = useRef<Chart[]>([]);

  useEffect(() => {
    // Destroy previous charts
    charts.current.forEach(chart => chart.destroy());
    charts.current = [];

    if (!monthlyData || monthlyData.length === 0) return;

    const months = monthlyData.map(d => d.month).reverse();
    const revenues = monthlyData.map(d => d.totalRevenue).reverse();
    const expenses = monthlyData.map(d => d.totalExpenses).reverse();
    const profits = monthlyData.map(d => d.totalProfit).reverse();
    const occupancy = monthlyData.map(d => d.occupancyRate).reverse();
    const avgPrices = monthlyData.map(d => d.avgPrice).reverse();

    // 1. Revenue Trend Line Chart
    if (revenueTrendRef.current) {
      const ctx = revenueTrendRef.current.getContext("2d");
      if (ctx) {
        charts.current.push(new Chart(ctx, {
          type: "line",
          data: {
            labels: months,
            datasets: [{
              label: "Total Revenue",
              data: revenues,
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              tension: 0.4,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Revenue Trend" }
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (value: any) => `₾${value}` } }
            }
          }
        }));
      }
    }

    // 2. Expense Breakdown Pie Chart
    if (expenseBreakdownRef.current && monthlyData.length > 0) {
      const ctx = expenseBreakdownRef.current.getContext("2d");
      if (ctx) {
        const totalCleaning = monthlyData.reduce((sum, d) => sum + d.cleaningTech, 0);
        const totalMarketing = monthlyData.reduce((sum, d) => sum + d.marketing, 0);
        const totalSalaries = monthlyData.reduce((sum, d) => sum + d.salaries, 0);
        const totalUtilities = monthlyData.reduce((sum, d) => sum + d.utilities, 0);

        charts.current.push(new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["Cleaning/Tech", "Marketing", "Salaries", "Utilities"],
            datasets: [{
              data: [totalCleaning, totalMarketing, totalSalaries, totalUtilities],
              backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Expense Breakdown" },
              legend: { position: "bottom" }
            }
          }
        }));
      }
    }

    // 3. Profit Margin Trend
    if (profitMarginRef.current) {
      const ctx = profitMarginRef.current.getContext("2d");
      if (ctx) {
        const profitMargins = monthlyData.map(d => 
          d.totalRevenue > 0 ? (d.totalProfit / d.totalRevenue) * 100 : 0
        ).reverse();

        charts.current.push(new Chart(ctx, {
          type: "line",
          data: {
            labels: months,
            datasets: [{
              label: "Profit Margin %",
              data: profitMargins,
              borderColor: "#8b5cf6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              tension: 0.4,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Profit Margin Trend" }
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (value: any) => `${value}%` } }
            }
          }
        }));
      }
    }

    // 4. Occupancy Rate Bar Chart
    if (occupancyRef.current) {
      const ctx = occupancyRef.current.getContext("2d");
      if (ctx) {
        charts.current.push(new Chart(ctx, {
          type: "bar",
          data: {
            labels: months,
            datasets: [{
              label: "Occupancy Rate",
              data: occupancy,
              backgroundColor: "#3b82f6",
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Occupancy Rate" }
            },
            scales: {
              y: { beginAtZero: true, max: 100, ticks: { callback: (value: any) => `${value}%` } }
            }
          }
        }));
      }
    }

    // 5. Average Price Trend
    if (avgPriceRef.current) {
      const ctx = avgPriceRef.current.getContext("2d");
      if (ctx) {
        charts.current.push(new Chart(ctx, {
          type: "line",
          data: {
            labels: months,
            datasets: [{
              label: "Average Price",
              data: avgPrices,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              tension: 0.4,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Average Price Trend" }
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (value: any) => `₾${value}` } }
            }
          }
        }));
      }
    }

    // 6. Company vs Owners Split Donut Chart
    if (profitSplitRef.current && monthlyData.length > 0) {
      const ctx = profitSplitRef.current.getContext("2d");
      if (ctx) {
        const totalCompanyProfit = monthlyData.reduce((sum, d) => sum + d.companyProfit, 0);
        const totalOwnersProfit = monthlyData.reduce((sum, d) => sum + d.ownersProfit, 0);

        charts.current.push(new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Company Share", "Owners Share"],
            datasets: [{
              data: [totalCompanyProfit, totalOwnersProfit],
              backgroundColor: ["#10b981", "#f59e0b"],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Profit Distribution" },
              legend: { position: "bottom" }
            }
          }
        }));
      }
    }

    // 7. Monthly Comparison Multi-line Chart
    if (monthlyComparisonRef.current) {
      const ctx = monthlyComparisonRef.current.getContext("2d");
      if (ctx) {
        charts.current.push(new Chart(ctx, {
          type: "line",
          data: {
            labels: months,
            datasets: [
              {
                label: "Revenue",
                data: revenues,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                tension: 0.4,
              },
              {
                label: "Expenses",
                data: expenses,
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                tension: 0.4,
              },
              {
                label: "Profit",
                data: profits,
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                tension: 0.4,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Monthly Comparison" },
              legend: { position: "top" }
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (value: any) => `₾${value}` } }
            }
          }
        }));
      }
    }

    return () => {
      charts.current.forEach(chart => chart.destroy());
    };
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Analytics</h2>
      <p className="text-sm text-gray-600 mb-4">Visual analysis of performance metrics and trends</p>

      {/* Row 1: Revenue Trend + Expense Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div style={{ height: "300px" }}>
            <canvas ref={revenueTrendRef}></canvas>
          </div>
        </Card>
        <Card className="p-6">
          <div style={{ height: "300px" }}>
            <canvas ref={expenseBreakdownRef}></canvas>
          </div>
        </Card>
      </div>

      {/* Row 2: Profit Margin + Occupancy */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div style={{ height: "300px" }}>
            <canvas ref={profitMarginRef}></canvas>
          </div>
        </Card>
        <Card className="p-6">
          <div style={{ height: "300px" }}>
            <canvas ref={occupancyRef}></canvas>
          </div>
        </Card>
      </div>

      {/* Row 3: Avg Price + Profit Split */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div style={{ height: "300px" }}>
            <canvas ref={avgPriceRef}></canvas>
          </div>
        </Card>
        <Card className="p-6">
          <div style={{ height: "300px" }}>
            <canvas ref={profitSplitRef}></canvas>
          </div>
        </Card>
      </div>

      {/* Row 4: Monthly Comparison (Full Width) */}
      <Card className="p-6">
        <div style={{ height: "400px" }}>
          <canvas ref={monthlyComparisonRef}></canvas>
        </div>
      </Card>
    </div>
  );
}
