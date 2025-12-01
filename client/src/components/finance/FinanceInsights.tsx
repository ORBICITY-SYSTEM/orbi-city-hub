import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Trophy, Target } from "lucide-react";

interface FinanceInsightsProps {
  data: any;
  formatCurrency: (amount: number) => string;
}

export const FinanceInsights = ({ data, formatCurrency }: FinanceInsightsProps) => {
  const { t } = useLanguage();

  if (!data || !data.records || data.records.length === 0) {
    return null;
  }

  // Calculate monthly revenue
  const monthlyRevenue = new Map<string, number>();
  data.records.forEach((r: any) => {
    const month = r.date.substring(0, 7);
    monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + (r.revenue || 0));
  });

  const months = Array.from(monthlyRevenue.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  // Best and weakest months
  const bestMonth = months.reduce((max, curr) => curr[1] > max[1] ? curr : max, months[0]);
  const weakestMonth = months.reduce((min, curr) => curr[1] < min[1] ? curr : min, months[0]);
  
  // Calculate month-over-month changes
  let biggestDrop: [string, number] | null = null;
  for (let i = 1; i < months.length; i++) {
    const prev = months[i - 1][1];
    const curr = months[i][1];
    const change = ((curr - prev) / prev) * 100;
    if (!biggestDrop || change < biggestDrop[1]) {
      biggestDrop = [months[i][0], change];
    }
  }

  // Top channel
  const topChannel = Object.entries(data.channelStats || {})
    .sort(([, a]: any, [, b]: any) => (b as any).revenue - (a as any).revenue)[0];

  const monthNames = {
    "01": t("იანვარი", "January"),
    "02": t("თებერვალი", "February"),
    "03": t("მარტი", "March"),
    "04": t("აპრილი", "April"),
    "05": t("მაისი", "May"),
    "06": t("ივნისი", "June"),
    "07": t("ივლისი", "July"),
    "08": t("აგვისტო", "August"),
    "09": t("სექტემბერი", "September"),
  };

  const getMonthName = (monthStr: string) => {
    const monthNum = monthStr.split('-')[1];
    return monthNames[monthNum as keyof typeof monthNames] || monthStr;
  };

  const insights = [
    {
      type: 'success',
      icon: Trophy,
      title: t("საუკეთესო თვე", "Best Month"),
      description: `${getMonthName(bestMonth[0])} (${formatCurrency(bestMonth[1])})`,
      color: "text-success border-success/20 bg-success/5"
    },
    {
      type: 'info',
      icon: TrendingDown,
      title: t("უსუსური თვე", "Weakest Month"),
      description: `${getMonthName(weakestMonth[0])} (${formatCurrency(weakestMonth[1])})`,
      color: "text-muted-foreground border-muted-foreground/20 bg-muted/5"
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: t("ყურადღება", "Attention"),
      description: biggestDrop 
        ? `${getMonthName(biggestDrop[0])} ${t("აჩვენა", "showed")} ${biggestDrop[1].toFixed(1)}% ${t("შემცირება", "decline")}`
        : t("სტაბილური ტრენდი", "Stable trend"),
      color: "text-warning border-warning/20 bg-warning/5"
    },
    {
      type: 'success',
      icon: TrendingUp,
      title: t("პორტფოლიო", "Portfolio"),
      description: `+${data.portfolioGrowth.toFixed(0)}% ${t("ზრდა", "growth")} (${data.currentRoomCount} ${t("სტუდიო", "studios")})`,
      color: "text-primary border-primary/20 bg-primary/5"
    },
    {
      type: 'info',
      icon: Target,
      title: t("საუკეთესო წყარო", "Top Channel"),
      description: topChannel ? `${topChannel[0]} (${(((topChannel[1] as any).revenue / data.totalRevenue) * 100).toFixed(1)}%)` : "N/A",
      color: "text-primary border-primary/20 bg-primary/5"
    },
    {
      type: 'success',
      icon: Lightbulb,
      title: t("რეკომენდაცია", "Recommendation"),
      description: t(
        `Occupancy ${data.avgOccupancy.toFixed(1)}% - ${data.avgOccupancy >= 70 ? "ძალიან კარგი!" : "გაზარდეთ Direct booking-ები"}`,
        `Occupancy ${data.avgOccupancy.toFixed(1)}% - ${data.avgOccupancy >= 70 ? "Excellent!" : "Increase Direct bookings"}`
      ),
      color: data.avgOccupancy >= 70 ? "text-success border-success/20 bg-success/5" : "text-warning border-warning/20 bg-warning/5"
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {t("სმარტ ანალიზი", "Smart Insights")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <Alert key={index} className={insight.color}>
              <insight.icon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold text-sm">{insight.title}</div>
                <div className="text-xs mt-1">{insight.description}</div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
