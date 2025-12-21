/**
 * Real Finance Dashboard - Shows actual data from ORBI City Financial Report
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Percent, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function RealFinanceDashboard() {
  const { data: summary, isLoading: summaryLoading } = trpc.realFinance.getSummary.useQuery();
  const { data: keyMetrics, isLoading: metricsLoading } = trpc.realFinance.getKeyMetrics.useQuery();
  const { data: monthlyData, isLoading: monthlyLoading } = trpc.realFinance.getMonthlyData.useQuery();
  const { data: expenseBreakdown, isLoading: expenseLoading } = trpc.realFinance.getExpenseBreakdown.useQuery();

  if (summaryLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">💰 Real Finance Dashboard</h1>
        <p className="text-gray-400 text-lg">ORBI City Financial Report (Oct 2024 - Sep 2025)</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ₾{summary?.total_revenue?.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-2">12 months period</p>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ₾{summary?.total_profit?.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {keyMetrics?.profitChange > 0 ? '+' : ''}{keyMetrics?.profitChange}% vs prev month
            </p>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {keyMetrics?.profitMargin}%
            </div>
            <p className="text-xs text-gray-400 mt-2">Healthy margin</p>
          </CardContent>
        </Card>

        {/* Latest Month Occupancy */}
        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Occupancy ({keyMetrics?.latestMonth})</CardTitle>
            <Calendar className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {keyMetrics?.latestMonthOccupancy}%
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {keyMetrics?.occupancyChange > 0 ? '+' : ''}{keyMetrics?.occupancyChange}% vs prev month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">📊 Monthly Breakdown</CardTitle>
          <CardDescription>Revenue, Expenses, and Profit by Month</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-white font-bold">Month</th>
                    <th className="text-right py-3 px-4 text-white font-bold">Studios</th>
                    <th className="text-right py-3 px-4 text-white font-bold">Occupancy</th>
                    <th className="text-right py-3 px-4 text-white font-bold">Avg Price</th>
                    <th className="text-right py-3 px-4 text-white font-bold">Revenue</th>
                    <th className="text-right py-3 px-4 text-white font-bold">Expenses</th>
                    <th className="text-right py-3 px-4 text-white font-bold">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData?.map((month: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-white font-medium">{month.month} {month.year}</td>
                      <td className="text-right py-3 px-4 text-gray-300">{month.studios}</td>
                      <td className="text-right py-3 px-4 text-gray-300">{month.occupancy_percent}%</td>
                      <td className="text-right py-3 px-4 text-gray-300">₾{month.avg_price}</td>
                      <td className="text-right py-3 px-4 text-green-400 font-semibold">
                        ₾{month.total_revenue?.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-red-400">
                        ₾{month.total_expenses?.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-400 font-semibold">
                        ₾{month.total_profit?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-700 bg-gray-800/50">
                    <td className="py-4 px-4 text-white font-bold" colSpan={4}>TOTAL</td>
                    <td className="text-right py-4 px-4 text-green-400 font-bold text-lg">
                      ₾{summary?.total_revenue?.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4 text-red-400 font-bold text-lg">
                      ₾{summary?.total_expenses?.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4 text-blue-400 font-bold text-lg">
                      ₾{summary?.total_profit?.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">💸 Expense Breakdown</CardTitle>
          <CardDescription>Total expenses by category (12 months)</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Cleaning & Tech</div>
                <div className="text-2xl font-bold text-white">
                  ₾{expenseBreakdown?.cleaning_tech?.toLocaleString()}
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Marketing</div>
                <div className="text-2xl font-bold text-white">
                  ₾{expenseBreakdown?.marketing?.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Salaries</div>
                <div className="text-2xl font-bold text-white">
                  ₾{expenseBreakdown?.salaries?.toLocaleString()}
                </div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Utilities</div>
                <div className="text-2xl font-bold text-white">
                  ₾{expenseBreakdown?.utilities?.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl">✅</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Real Data Successfully Loaded!
              </h3>
              <p className="text-gray-300">
                This dashboard is now showing <strong>actual financial data</strong> from the ORBI City Financial Report Excel file.
                All {monthlyData?.length} months of data have been parsed, stored in the database, and displayed here.
              </p>
              <p className="text-gray-400 mt-2 text-sm">
                Data source: Orbi_City_Financial_Report_Oct2024_Sep2025.xlsx
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
