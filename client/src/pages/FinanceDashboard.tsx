import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, TrendingUp, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinanceCharts } from "@/components/FinanceCharts";

export default function FinanceDashboard() {
  const { data: summary, isLoading } = trpc.realFinance.getSummary.useQuery();
  const { data: monthlyData } = trpc.realFinance.getMonthlyData.useQuery();

  // State for filters
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [showCharts, setShowCharts] = useState(false);

  // All months including Coming Soon
  const allMonths = useMemo(() => {
    const data = [
      ...(monthlyData || []),
      { month: "November 2025", comingSoon: true },
      { month: "December 2025", comingSoon: true }
    ];
    return data;
  }, [monthlyData]);

  // Filter data based on selected filters
  const filteredMonths = useMemo(() => {
    if (!monthlyData) return [];
    
    let filtered = [...monthlyData];

    // Single month filter
    if (selectedMonth !== "all") {
      filtered = filtered.filter(m => m.month === selectedMonth);
    }

    // Period filter
    if (selectedPeriod !== "all") {
      const monthCount = parseInt(selectedPeriod);
      filtered = filtered.slice(-monthCount);
    }

    return filtered;
  }, [monthlyData, selectedMonth, selectedPeriod]);

  // Calculate filtered summary
  const filteredSummary = useMemo(() => {
    if (!filteredMonths.length) return summary;

    const totalRevenue = filteredMonths.reduce((sum, m) => sum + m.totalRevenue, 0);
    const totalExpenses = filteredMonths.reduce((sum, m) => sum + m.totalExpenses, 0);
    const totalProfit = filteredMonths.reduce((sum, m) => sum + m.totalProfit, 0);
    const companyProfit = filteredMonths.reduce((sum, m) => sum + m.companyProfit, 0);
    const ownersProfit = filteredMonths.reduce((sum, m) => sum + m.ownersProfit, 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      companyShare: companyProfit,
      companyPercent: totalProfit > 0 ? (companyProfit / totalProfit) * 100 : 0,
      ownersShare: ownersProfit,
      ownersPercent: totalProfit > 0 ? (ownersProfit / totalProfit) * 100 : 0,
    };
  }, [filteredMonths, summary]);

  // Display months (filtered + coming soon if viewing all)
  const displayMonths = useMemo(() => {
    if (selectedMonth === "all" && selectedPeriod === "all") {
      return allMonths;
    }
    return filteredMonths;
  }, [selectedMonth, selectedPeriod, allMonths, filteredMonths]);

  // Export to Excel
  const handleExport = () => {
    const data = filteredMonths.map(m => ({
      Month: m.month,
      Studios: m.studios,
      Revenue: m.totalRevenue,
      Expenses: m.totalExpenses,
      Profit: m.totalProfit,
      Occupancy: `${m.occupancyRate}%`,
      AvgPrice: m.avgPrice,
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbi-finance-${selectedMonth}-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-lg text-white font-bold">Loading real financial data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10 text-white p-8 rounded-lg mb-6 shadow-xl">
        <h1 className="text-4xl font-bold mb-2">💰 Finance Dashboard</h1>
        <p className="text-white/90 font-bold">
          Real Data from Excel • October 2024 - September 2025
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-lg">Filters</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedMonth("all");
              setSelectedPeriod("all");
            }}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Reset Filters
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Single Month Selector */}
          <div>
            <label className="text-sm text-white/80 mb-2 block font-bold">Select Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-white/10 text-white border-white/20">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthlyData?.map((m) => (
                  <SelectItem key={m.month} value={m.month}>
                    {m.month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Quick Filters */}
          <div>
            <label className="text-sm text-white/80 mb-2 block font-bold">Quick Period</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-white/10 text-white border-white/20">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods (12 months)</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="9">Last 9 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <Button 
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-bold w-full"
              disabled={filteredMonths.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Toggle Charts */}
          <div className="flex items-end">
            <Button 
              onClick={() => setShowCharts(!showCharts)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showCharts ? "Hide Charts" : "Show Charts"}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-white/70 font-bold">
          📊 Showing {displayMonths.length} months • 
          {selectedMonth !== "all" ? ` Single Month: ${selectedMonth}` : ""} 
          {selectedPeriod !== "all" ? ` Last ${selectedPeriod} Months` : " Full Period"}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 shadow-xl border border-white/20">
        <h3 className="font-bold text-white text-lg mb-4">📈 Summary Statistics</h3>
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-400/30 backdrop-blur-sm">
            <div className="text-sm text-white/80 mb-1 font-bold">TOTAL REVENUE</div>
            <div className="text-2xl font-bold text-yellow-300">
              ₾{filteredSummary?.totalRevenue.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-yellow-200 mt-1 font-bold">
              {filteredMonths.length} Month{filteredMonths.length !== 1 ? 's' : ''}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30 backdrop-blur-sm">
            <div className="text-sm text-white/80 mb-1 font-bold">TOTAL EXPENSES</div>
            <div className="text-2xl font-bold text-red-300">
              ₾{filteredSummary?.totalExpenses.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-red-200 mt-1 font-bold">Operating Costs</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30 backdrop-blur-sm">
            <div className="text-sm text-white/80 mb-1 font-bold">NET PROFIT</div>
            <div className="text-2xl font-bold text-purple-300">
              ₾{filteredSummary?.netProfit.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-purple-200 mt-1 font-bold">
              {filteredSummary?.profitMargin.toFixed(1)}% Margin
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30 backdrop-blur-sm">
            <div className="text-sm text-white/80 mb-1 font-bold">COMPANY SHARE</div>
            <div className="text-2xl font-bold text-green-300">
              ₾{filteredSummary?.companyShare.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-green-200 mt-1 font-bold">
              {filteredSummary?.companyPercent.toFixed(1)}% of Profit
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30 backdrop-blur-sm">
            <div className="text-sm text-white/80 mb-1 font-bold">OWNERS SHARE</div>
            <div className="text-2xl font-bold text-orange-300">
              ₾{filteredSummary?.ownersShare.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-orange-200 mt-1 font-bold">
              {filteredSummary?.ownersPercent.toFixed(1)}% of Profit
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && filteredMonths.length > 0 && (
        <div className="mb-6">
          <FinanceCharts monthlyData={filteredMonths} />
        </div>
      )}

      {/* Monthly Performance Breakdown */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-white">📊 Monthly Performance Breakdown</h2>

        <div className="grid grid-cols-3 gap-4">
          {displayMonths?.map((month: any, idx: number) => (
            <Card key={idx} className="p-4 hover:shadow-2xl transition-shadow bg-white/10 backdrop-blur-md border-white/20 relative">
              {month.comingSoon ? (
                // Coming Soon Card
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔜</div>
                  <h3 className="font-bold text-2xl text-white mb-2">{month.month}</h3>
                  <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm">
                    Coming Soon
                  </div>
                  <p className="text-white/60 text-sm mt-4 font-bold">
                    Data will be available soon
                  </p>
                </div>
              ) : (
                // Real Data Card
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-white">{month.month}</h3>
                  </div>

                  <div className="text-sm text-white/80 mb-3 font-bold">🏢 {month.studios} Studios</div>

                  {/* Operational */}
                  <div className="mb-3">
                    <div className="text-xs font-bold text-green-300 mb-2">⚙️ OPERATIONAL</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-white/60 font-bold">Days Available</div>
                        <div className="font-bold text-white">{month.daysAvailable}</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">Days Occupied</div>
                        <div className="font-bold text-white">{month.daysOccupied}</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">Occupancy</div>
                        <div className="font-bold text-white">{month.occupancyRate}%</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">Average Price</div>
                        <div className="font-bold text-white">₾{month.avgPrice}</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="mb-3">
                    <div className="text-xs font-bold text-blue-300 mb-1">💰 REVENUE</div>
                    <div className="text-sm">
                      <div className="text-white/60 text-xs font-bold">Total Revenue</div>
                      <div className="font-bold text-lg text-white">₾{month.totalRevenue.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="mb-3">
                    <div className="text-xs font-bold text-red-300 mb-2">💸 EXPENSES</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-white/60 font-bold">Cleaning/Technical</div>
                        <div className="font-bold text-white">₾{month.cleaningTech.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">Marketing</div>
                        <div className="font-bold text-white">₾{month.marketing.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">Salaries</div>
                        <div className="font-bold text-white">₾{month.salaries.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">Utilities</div>
                        <div className="font-bold text-white">₾{month.utilities.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="text-white/60 text-xs font-bold">Total Expenses</div>
                      <div className="font-bold text-white">₾{month.totalExpenses.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="bg-white/10 p-2 rounded border border-white/20">
                    <div className="text-xs font-bold text-purple-300 mb-2">📊 PROFIT</div>
                    <div className="mb-2">
                      <div className="text-white/60 text-xs font-bold">Total Profit</div>
                      <div className="font-bold text-lg text-white">₾{month.totalProfit.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-500/20 p-2 rounded border border-green-400/30">
                        <div className="text-white/60 font-bold">Company Profit</div>
                        <div className="font-bold text-green-300">₾{month.companyProfit.toLocaleString()}</div>
                      </div>
                      <div className="bg-yellow-500/20 p-2 rounded border border-yellow-400/30">
                        <div className="text-white/60 font-bold">Owners Profit</div>
                        <div className="font-bold text-yellow-300">₾{month.ownersProfit.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
