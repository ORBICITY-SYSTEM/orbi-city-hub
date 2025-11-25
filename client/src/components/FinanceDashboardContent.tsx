import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { FinanceCharts } from "@/components/FinanceCharts";

export function FinanceDashboardContent() {
  const { data: summary, isLoading } = trpc.finance.getSummary.useQuery();
  const { data: monthlyData } = trpc.finance.getMonthlyData.useQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><div className="text-lg">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 w-64 rounded-full" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-2" />Manage Fields</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600" size="sm"><Plus className="w-4 h-4 mr-2" />Add Month</Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">Comprehensive Monthly Performance Analysis • FY 2024-2025</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="text-sm text-gray-600 mb-1">TOTAL REVENUE</div>
            <div className="text-2xl font-bold text-yellow-700">₾{summary?.totalRevenue.toLocaleString() || '0'}</div>
            <div className="text-xs text-yellow-600 mt-1">1 Period Performance</div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-sm text-gray-600 mb-1">TOTAL EXPENSES</div>
            <div className="text-2xl font-bold text-red-700">₾{summary?.totalExpenses.toLocaleString() || '0'}</div>
            <div className="text-xs text-red-600 mt-1">Operating Costs</div>
          </Card>

          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-sm text-gray-600 mb-1">NET PROFIT</div>
            <div className="text-2xl font-bold text-purple-700">₾{summary?.netProfit.toLocaleString() || '0'}</div>
            <div className="text-xs text-purple-600 mt-1">{summary?.profitMargin.toFixed(1)}% Margin</div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm text-gray-600 mb-1">COMPANY SHARE</div>
            <div className="text-2xl font-bold text-green-700">₾{summary?.companyShare.toLocaleString() || '0'}</div>
            <div className="text-xs text-green-600 mt-1">{summary?.companyPercent.toFixed(1)}% of Profit</div>
          </Card>

          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="text-sm text-gray-600 mb-1">OWNERS SHARE</div>
            <div className="text-2xl font-bold text-orange-700">₾{summary?.ownersShare.toLocaleString() || '0'}</div>
            <div className="text-xs text-orange-600 mt-1">{summary?.ownersPercent.toFixed(1)}% of Profit</div>
          </Card>
        </div>
      </Card>

      {/* Period Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Period Selection</h3>
            <p className="text-sm text-gray-600">Filter reports by custom date range • October 2024 - September 2025</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Start Date</Button>
            <span className="text-gray-400">to</span>
            <Button variant="outline" size="sm">End Date</Button>
          </div>
        </div>
      </Card>

      {/* Monthly Performance Breakdown */}
      <div>
        <h2 className="text-xl font-bold mb-2">Monthly Performance Breakdown</h2>
        <p className="text-sm text-gray-600 mb-4">Detailed metrics and financial analysis for each reporting period</p>

        <div className="grid grid-cols-3 gap-4">
          {monthlyData?.map((month: any, idx: number) => (
            <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{month.month}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">✏️</Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">🗑️</Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">{month.studios} Studios</div>

              {/* Operational */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-green-700 mb-2">OPERATIONAL</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><div className="text-gray-500">Days Available</div><div className="font-semibold">{month.daysAvailable}</div></div>
                  <div><div className="text-gray-500">Days Occupied</div><div className="font-semibold">{month.daysOccupied}</div></div>
                  <div><div className="text-gray-500">Occupancy</div><div className="font-semibold">{month.occupancyRate}%</div></div>
                  <div><div className="text-gray-500">Average Price</div><div className="font-semibold">₾{month.avgPrice}</div></div>
                </div>
              </div>

              {/* Revenue */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-blue-700 mb-1">REVENUE</div>
                <div className="text-sm">
                  <div className="text-gray-500 text-xs">Total Revenue</div>
                  <div className="font-bold text-lg">₾{month.totalRevenue.toLocaleString()}</div>
                </div>
              </div>

              {/* Expenses */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-red-700 mb-2">EXPENSES</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><div className="text-gray-500">Cleaning/Technical</div><div className="font-semibold">₾{month.cleaningTech.toLocaleString()}</div></div>
                  <div><div className="text-gray-500">Marketing</div><div className="font-semibold">₾{month.marketing.toLocaleString()}</div></div>
                  <div><div className="text-gray-500">Salaries</div><div className="font-semibold">₾{month.salaries.toLocaleString()}</div></div>
                  <div><div className="text-gray-500">Utilities</div><div className="font-semibold">₾{month.utilities.toLocaleString()}</div></div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="text-gray-500 text-xs">Total Expenses</div>
                  <div className="font-bold">₾{month.totalExpenses.toLocaleString()}</div>
                </div>
              </div>

              {/* Profit */}
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs font-semibold text-purple-700 mb-2">PROFIT</div>
                <div className="mb-2">
                  <div className="text-gray-500 text-xs">Total Profit</div>
                  <div className="font-bold text-lg">₾{month.totalProfit.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-gray-500">Company Profit</div>
                    <div className="font-semibold text-green-700">₾{month.companyProfit.toLocaleString()}</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-gray-500">Owners Profit</div>
                    <div className="font-semibold text-yellow-700">₾{month.ownersProfit.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      {monthlyData && monthlyData.length > 0 && (
        <FinanceCharts monthlyData={monthlyData} />
      )}
    </div>
  );
}
