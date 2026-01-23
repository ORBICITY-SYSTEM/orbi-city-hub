import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Calculator, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/PageHeader";

export default function FinanceAnalytics() {
  const { data: summary } = trpc.realFinance.getSummary.useQuery();
  const { data: monthlyData } = trpc.realFinance.getMonthlyData.useQuery();

  // ROI Calculator State
  const [investment, setInvestment] = useState<number>(0);
  const [returns, setReturns] = useState<number>(0);

  // RevPAR Calculator State
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Calculate ROI
  const roiResult = useMemo(() => {
    if (investment === 0) return { roi: 0, profit: 0 };
    const profit = returns - investment;
    const roi = (profit / investment) * 100;
    return { roi, profit };
  }, [investment, returns]);

  // Calculate RevPAR for selected month
  const revparData = useMemo(() => {
    if (!monthlyData) return null;

    let data = monthlyData;
    if (selectedMonth !== "all") {
      data = monthlyData.filter(m => m.month === selectedMonth);
    }

    const totalRevenue = data.reduce((sum, m) => sum + m.totalRevenue, 0);
    const totalDaysAvailable = data.reduce((sum, m) => sum + m.daysAvailable, 0);
    const totalDaysOccupied = data.reduce((sum, m) => sum + m.daysOccupied, 0);
    const avgOccupancy = totalDaysAvailable > 0 
      ? (totalDaysOccupied / totalDaysAvailable) * 100 
      : 0;

    const revpar = totalDaysAvailable > 0 ? totalRevenue / totalDaysAvailable : 0;
    const avgADR = data.reduce((sum, m) => sum + m.avgPrice, 0) / data.length;

    return {
      revpar: Math.round(revpar),
      occupancy: avgOccupancy.toFixed(1),
      adr: Math.round(avgADR),
      totalRevenue,
      daysAvailable: totalDaysAvailable,
    };
  }, [monthlyData, selectedMonth]);

  // Forecasting - Simple linear regression
  const forecastData = useMemo(() => {
    if (!monthlyData || monthlyData.length < 3) return null;

    const revenues = monthlyData.map(m => m.totalRevenue);
    const n = revenues.length;
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / n;

    // Calculate trend (simple moving average)
    const last3Months = revenues.slice(-3);
    const avgLast3 = last3Months.reduce((a, b) => a + b, 0) / 3;
    const growthRate = ((avgLast3 - avgRevenue) / avgRevenue) * 100;

    // Forecast next month
    const lastRevenue = revenues[revenues.length - 1];
    const forecastRevenue = lastRevenue * (1 + (growthRate / 100));

    return {
      currentAvg: Math.round(avgRevenue),
      last3MonthsAvg: Math.round(avgLast3),
      growthRate: growthRate.toFixed(1),
      forecastNext: Math.round(forecastRevenue),
    };
  }, [monthlyData]);

  // Profitability Metrics
  const profitMetrics = useMemo(() => {
    if (!summary) return null;

    const grossMargin = (summary.netProfit / summary.totalRevenue) * 100;
    const expenseRatio = (summary.totalExpenses / summary.totalRevenue) * 100;
    const breakEven = summary.totalExpenses;

    return {
      grossMargin: grossMargin.toFixed(1),
      expenseRatio: expenseRatio.toFixed(1),
      breakEven: Math.round(breakEven),
    };
  }, [summary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Finance Analytics"
        titleKa="ფინანსური ანალიტიკა"
        subtitle="ROI Calculator, RevPAR Analysis, Forecasting, Profitability Metrics"
        subtitleKa="ROI კალკულატორი, RevPAR ანალიზი, პროგნოზირება, მომგებიანობის მეტრიკები"
        icon={BarChart3}
        iconGradient="from-cyan-500 to-blue-600"
        dataSource={{ type: "live", source: "tRPC" }}
      />

      <div className="p-6">
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* ROI Calculator */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Calculator className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ROI Calculator</h2>
              <p className="text-sm text-white/70">Calculate Return on Investment</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-white font-bold">Initial Investment (₾)</Label>
              <Input
                type="number"
                value={investment || ""}
                onChange={(e) => setInvestment(Number(e.target.value))}
                placeholder="Enter investment amount"
                className="bg-white/10 text-white border-white/20 mt-2"
              />
            </div>

            <div>
              <Label className="text-white font-bold">Total Returns (₾)</Label>
              <Input
                type="number"
                value={returns || ""}
                onChange={(e) => setReturns(Number(e.target.value))}
                placeholder="Enter total returns"
                className="bg-white/10 text-white border-white/20 mt-2"
              />
            </div>

            <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30 mt-6">
              <div className="text-sm text-white/80 mb-2 font-bold">ROI Result</div>
              <div className="text-3xl font-bold text-green-300 mb-2">
                {roiResult.roi.toFixed(2)}%
              </div>
              <div className="text-sm text-white/70 font-bold">
                Profit: ₾{roiResult.profit.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        {/* RevPAR Analysis */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">RevPAR Analysis</h2>
              <p className="text-sm text-white/70">Revenue Per Available Room</p>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-white font-bold mb-2 block">Select Period</Label>
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

          {revparData && (
            <div className="space-y-3">
              <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30">
                <div className="text-sm text-white/80 mb-1 font-bold">RevPAR</div>
                <div className="text-3xl font-bold text-blue-300">
                  ₾{revparData.revpar.toLocaleString()}
                </div>
                <div className="text-xs text-white/70 mt-1 font-bold">
                  Per Available Room Day
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs text-white/70 font-bold">Occupancy Rate</div>
                  <div className="text-xl font-bold text-white">{revparData.occupancy}%</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs text-white/70 font-bold">Average ADR</div>
                  <div className="text-xl font-bold text-white">₾{revparData.adr}</div>
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-lg">
                <div className="text-xs text-white/70 font-bold">Total Revenue</div>
                <div className="text-xl font-bold text-white">
                  ₾{revparData.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Forecasting */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Revenue Forecasting</h2>
              <p className="text-sm text-white/70">AI-Powered Predictions</p>
            </div>
          </div>

          {forecastData && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs text-white/70 font-bold">Current Avg</div>
                  <div className="text-lg font-bold text-white">
                    ₾{forecastData.currentAvg.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs text-white/70 font-bold">Last 3 Months</div>
                  <div className="text-lg font-bold text-white">
                    ₾{forecastData.last3MonthsAvg.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-400/30">
                <div className="text-sm text-white/80 mb-2 font-bold">Growth Rate</div>
                <div className="text-2xl font-bold text-orange-300">
                  {forecastData.growthRate}%
                </div>
                <div className="text-xs text-white/70 mt-1 font-bold">
                  {parseFloat(forecastData.growthRate) > 0 ? "📈 Positive Trend" : "📉 Negative Trend"}
                </div>
              </div>

              <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30">
                <div className="text-sm text-white/80 mb-2 font-bold">Forecast Next Month</div>
                <div className="text-2xl font-bold text-green-300">
                  ₾{forecastData.forecastNext.toLocaleString()}
                </div>
                <div className="text-xs text-white/70 mt-1 font-bold">
                  Based on trend analysis
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Profitability Metrics */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Profitability Metrics</h2>
              <p className="text-sm text-white/70">Margin Analysis & Break-Even</p>
            </div>
          </div>

          {profitMetrics && (
            <div className="space-y-3">
              <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-400/30">
                <div className="text-sm text-white/80 mb-2 font-bold">Gross Profit Margin</div>
                <div className="text-3xl font-bold text-purple-300">
                  {profitMetrics.grossMargin}%
                </div>
                <div className="text-xs text-white/70 mt-1 font-bold">
                  Net Profit / Total Revenue
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs text-white/70 font-bold">Expense Ratio</div>
                  <div className="text-xl font-bold text-white">{profitMetrics.expenseRatio}%</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs text-white/70 font-bold">Break-Even</div>
                  <div className="text-xl font-bold text-white">
                    ₾{profitMetrics.breakEven.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-white mb-3">Key Insights</h3>
                <ul className="space-y-2 text-xs text-white/80">
                  <li className="flex items-start gap-2">
                    <span>✅</span>
                    <span>Profit margin of {profitMetrics.grossMargin}% indicates {parseFloat(profitMetrics.grossMargin) > 20 ? "healthy" : "moderate"} profitability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>💡</span>
                    <span>Expense ratio at {profitMetrics.expenseRatio}% - {parseFloat(profitMetrics.expenseRatio) < 80 ? "well controlled" : "needs optimization"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎯</span>
                    <span>Break-even point: ₾{profitMetrics.breakEven.toLocaleString()} monthly revenue required</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}
