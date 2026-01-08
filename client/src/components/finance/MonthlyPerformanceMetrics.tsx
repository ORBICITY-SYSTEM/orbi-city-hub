import { Card } from "@/components/ui/card";

interface MonthlyPerformanceMetricsProps {
  occupancyRate: number;
  adr: number;
  revpar: number;
  totalNights: number;
  totalBookings: number;
  totalRooms: number;
}

export function MonthlyPerformanceMetrics({
  occupancyRate,
  adr,
  revpar,
  totalNights,
  totalBookings,
  totalRooms
}: MonthlyPerformanceMetricsProps) {
  const formatCurrency = (amount: number) => {
    return `₾${amount.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`;
  };

  const metrics = [
    {
      label: "დაკავების მაჩვენებელი",
      value: `${occupancyRate.toFixed(1)}%`,
      icon: "📊",
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
    },
    {
      label: "საშუალო ღამის ფასი (ADR)",
      value: formatCurrency(adr),
      icon: "💰",
      color: "from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800"
    },
    {
      label: "RevPAR",
      value: formatCurrency(revpar),
      icon: "📈",
      color: "from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800"
    },
    {
      label: "სულ ღამეები",
      value: totalNights.toFixed(1),
      icon: "🌙",
      color: "from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800"
    },
    {
      label: "სულ ბრონირებები",
      value: totalBookings.toFixed(0),
      icon: "🏨",
      color: "from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800"
    },
    {
      label: "უნიკალური ოთახები",
      value: totalRooms,
      icon: "🏢",
      color: "from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`p-4 bg-gradient-to-br ${metric.color}`}
        >
          <div className="space-y-2">
            <div className="text-2xl">{metric.icon}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              {metric.label}
            </div>
            <div className="text-xl font-bold">
              {metric.value}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
