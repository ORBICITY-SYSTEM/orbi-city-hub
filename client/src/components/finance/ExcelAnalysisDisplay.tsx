import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFinanceAnalysis } from "@/contexts/FinanceAnalysisContext";
import { Upload, FileSpreadsheet, TrendingUp, Building, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeExcelFile, type AnalysisResult } from "@/utils/excelAnalyzer";
import { ExcelAnalysisHistory } from "./ExcelAnalysisHistory";

export const ExcelAnalysisDisplay = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { analysisResult, setAnalysisResult, saveAnalysisResult } = useFinanceAnalysis();
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: t("შეცდომა", "Error"),
        description: t("გთხოვთ აირჩიოთ Excel ფაილი", "Please select an Excel file"),
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const analysisResult = await analyzeExcelFile(file);
      setAnalysisResult(analysisResult);
      
      // Save to database and storage
      await saveAnalysisResult(analysisResult, file);
      
      toast({
        title: t("✅ წარმატება", "✅ Success"),
        description: t(
          `გაანალიზებულია და შენახულია ${analysisResult.overallStats.totalBookings} ბრონი`,
          `Analyzed and saved ${analysisResult.overallStats.totalBookings} bookings`
        ),
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message || t("ფაილის ანალიზი ვერ მოხერხდა", "Failed to analyze file"),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      e.target.value = '';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)}₾`;
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ka-GE', { year: 'numeric', month: 'long' });
  };

  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {t("ფაილის ანალიზი", "File Analysis")}
          </CardTitle>
          <CardDescription>
            {t(
              "ატვირთეთ Excel ფაილი დეტალური ანალიზისთვის",
              "Upload Excel file for detailed analysis"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload">
            <Button
              variant="outline"
              className="w-full"
              disabled={analyzing}
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {analyzing ? t("იტვირთება...", "Loading...") : t("ატვირთეთ Excel ფაილი", "Upload Excel File")}
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* History Archive */}
      <ExcelAnalysisHistory />

      {/* Upload New File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {t("ფაილის ანალიზი", "File Analysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload">
            <Button
              variant="outline"
              size="sm"
              disabled={analyzing}
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {t("ახალი ფაილის ატვირთვა", "Upload New File")}
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("ზოგადი სტატისტიკა", "Overall Statistics")}
          </CardTitle>
          <CardDescription>
            {t("იანვარი - სექტემბერი 2025", "January - September 2025")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("სულ შემოსავალი", "Total Revenue")}</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(analysisResult.overallStats.totalRevenue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("სულ ღამეები", "Total Nights")}</p>
              <p className="text-2xl font-bold">{analysisResult.overallStats.totalNights.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("სულ ბრონები", "Total Bookings")}</p>
              <p className="text-2xl font-bold">{analysisResult.overallStats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("საშუალო ADR", "Average ADR")}</p>
              <p className="text-2xl font-bold">{formatCurrency(analysisResult.overallStats.avgADR)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("უნიკალური ოთახები", "Unique Rooms")}</p>
              <p className="text-2xl font-bold">{analysisResult.overallStats.uniqueRooms}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t("თვიური სტატისტიკა", "Monthly Statistics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("თვე", "Month")}</TableHead>
                  <TableHead className="text-right">{t("სტუდიოების რაოდენობა", "Room Count")}</TableHead>
                  <TableHead className="text-right">{t("შემოსავალი", "Revenue")}</TableHead>
                  <TableHead className="text-right">{t("ღამეები", "Nights")}</TableHead>
                  <TableHead className="text-right">{t("ბრონები", "Bookings")}</TableHead>
                  <TableHead className="text-right">{t("საშ. ADR", "Avg ADR")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResult.monthlyStats.map((stat) => (
                  <TableRow key={stat.month}>
                    <TableCell className="font-medium">{getMonthName(stat.month)}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      {stat.roomCount}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(stat.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">{stat.totalNights.toFixed(0)}</TableCell>
                    <TableCell className="text-right">{stat.totalBookings.toFixed(0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stat.avgADR)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Room Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {t("ოთახების სტატისტიკა", "Room Statistics")}
          </CardTitle>
          <CardDescription>
            {t("დალაგებული შემოსავლის მიხედვით", "Sorted by revenue")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>{t("ოთახი", "Room")}</TableHead>
                  <TableHead className="text-right">{t("შემოსავალი", "Revenue")}</TableHead>
                  <TableHead className="text-right">{t("ღამეები", "Nights")}</TableHead>
                  <TableHead className="text-right">{t("ბრონები", "Bookings")}</TableHead>
                  <TableHead className="text-right">{t("საშ. ADR", "Avg ADR")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResult.roomStats.map((stat) => (
                  <TableRow key={stat.room}>
                    <TableCell className="font-medium">{stat.room}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(stat.revenue)}
                    </TableCell>
                    <TableCell className="text-right">{Math.round(stat.nights).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Math.round(stat.bookings)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stat.adr)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
