import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MonthlyDashboardStatsProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  companyShare: number;
  ownersShare: number;
  profitMargin: number;
}

export function MonthlyDashboardStats({
  totalRevenue,
  totalExpenses,
  netProfit,
  companyShare,
  ownersShare,
  profitMargin
}: MonthlyDashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return `₾${amount.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Revenue */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl">₾</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Total Revenue
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            <span>Period Performance</span>
          </div>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl">₾</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Total Expenses
            </div>
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-100">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-xs text-muted-foreground">
            Operating Costs
          </div>
        </div>
      </Card>

      {/* Net Profit */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl">₾</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Net Profit
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(netProfit)}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            {profitMargin.toFixed(1)}% Margin
          </div>
        </div>
      </Card>

      {/* Company Share */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl">₾</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Company Share
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(companyShare)}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            {netProfit > 0 ? ((companyShare / netProfit) * 100).toFixed(1) : 0}% of Profit
          </div>
        </div>
      </Card>

      {/* Owners Share */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl">₾</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Owners Share
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            {formatCurrency(ownersShare)}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">
            {netProfit > 0 ? ((ownersShare / netProfit) * 100).toFixed(1) : 0}% of Profit
          </div>
        </div>
      </Card>
    </div>
  );
}
