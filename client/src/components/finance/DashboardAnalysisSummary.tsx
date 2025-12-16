import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFinanceAnalysis } from "@/contexts/FinanceAnalysisContext";
import { TrendingUp, DollarSign, BedDouble, Calendar, Building2, Award, Percent } from "lucide-react";

export const DashboardAnalysisSummary = () => {
  const { t } = useLanguage();
  const { analysisResult } = useFinanceAnalysis();

  if (!analysisResult) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return `₾${Math.round(amount)}`;
  };

  const stats = analysisResult.overallStats;
  const lastMonth = analysisResult.monthlyStats[analysisResult.monthlyStats.length - 1];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t("Excel ანალიზის მიმოხილვა", "Excel Analysis Overview")}
        </CardTitle>
        <CardDescription>
          {t("იანვარი - სექტემბერი 2025 (Excel მონაცემები)", "January - September 2025 (Excel data)")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("სულ შემოსავალი", "Total Revenue")}</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BedDouble className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("სულ ღამეები", "Total Nights")}</p>
              <p className="text-lg font-bold">{Math.round(stats.totalNights)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("ბრონები", "Bookings")}</p>
              <p className="text-lg font-bold">{Math.round(stats.totalBookings)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("სტუდიოები", "Studios")}</p>
              <p className="text-lg font-bold">{lastMonth?.roomCount || stats.uniqueRooms}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ADR</p>
              <p className="text-lg font-bold">{formatCurrency(stats.avgADR)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Percent className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("დაკავება", "Occupancy")}</p>
              <p className="text-lg font-bold">{Math.round(stats.occupancyRate)}%</p>
            </div>
          </div>
        </div>

        {/* Monthly Details - Expanded */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t("თვიური დეტალები", "Monthly Details")}
          </h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-3">
            {analysisResult.monthlyStats.map((month) => (
              <div key={month.month} className="p-4 rounded-lg bg-background/50 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {month.month}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {month.roomCount} {t("სტუდიო", "studios")}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t("შემოსავალი", "Revenue")}</span>
                    <span className="font-bold text-primary">{formatCurrency(month.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t("ღამეები", "Nights")}</span>
                    <span className="font-semibold">{Math.round(month.totalNights)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">ADR</span>
                    <span className="font-semibold">{formatCurrency(month.avgADR)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t("დაკავება", "Occupancy")}</span>
                    <span className="font-semibold">{Math.round(month.occupancyRate)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
