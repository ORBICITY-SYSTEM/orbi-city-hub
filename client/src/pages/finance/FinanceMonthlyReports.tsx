import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Plus, Upload, ChevronRight, FileSpreadsheet, TrendingUp, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeExcelFileForMonth } from "@/utils/excelAnalyzerMonthly";
import { MonthlyFileUploadManager } from "@/components/finance/MonthlyFileUploadManager";
import { PageHeader } from "@/components/ui/PageHeader";

const months = [
  { value: "1", label: "იანვარი" },
  { value: "2", label: "თებერვალი" },
  { value: "3", label: "მარტი" },
  { value: "4", label: "აპრილი" },
  { value: "5", label: "მაისი" },
  { value: "6", label: "ივნისი" },
  { value: "7", label: "ივლისი" },
  { value: "8", label: "აგვისტო" },
  { value: "9", label: "სექტემბერი" },
  { value: "10", label: "ოქტომბერი" },
  { value: "11", label: "ნოემბერი" },
  { value: "12", label: "დეკემბერი" },
];

const FinanceMonthlyAnalysisList = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const { data: uploads, isLoading, refetch } = useQuery({
    queryKey: ['monthly-analysis-uploads'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('monthly_analysis_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !month || !year) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეავსოთ ყველა ველი და აირჩიოთ ფაილი",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const analysisResult = await analyzeExcelFileForMonth(selectedFile, parseInt(year), parseInt(month));

      const filePath = `${user.id}/${year}-${month.padStart(2, '0')}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('monthly-analysis')
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('monthly_analysis_uploads')
        .insert({
          user_id: user.id,
          month: parseInt(month),
          year: parseInt(year),
          file_name: selectedFile.name,
          file_path: filePath,
          total_revenue: analysisResult.overallStats.totalRevenue,
          total_expenses: 0,
          net_profit: analysisResult.overallStats.totalRevenue,
          profit_margin: 0,
          occupancy_rate: analysisResult.overallStats.occupancyRate,
          adr: analysisResult.overallStats.avgADR,
          revpar: analysisResult.overallStats.revPAR,
          total_nights: analysisResult.overallStats.totalNights,
          total_bookings: analysisResult.overallStats.totalBookings,
          total_rooms: analysisResult.overallStats.uniqueRooms,
        });

      if (dbError) throw dbError;

      toast({
        title: "წარმატება",
        description: "თვიური ანალიზი წარმატებით აიტვირთა",
      });

      setIsDialogOpen(false);
      setSelectedFile(null);
      setMonth("");
      setYear("");
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "შეცდომა",
        description: "ფაილის ატვირთვისას მოხდა შეცდომა",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const addNewAnalysisButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">ახალი ანალიზი</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>თვიური ანალიზის დამატება</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>თვე</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ თვე" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>წელი</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ წელი" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Excel ფაილი</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                არჩეული ფაილი: {selectedFile.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !month || !year}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "იტვირთება..." : "ატვირთვა"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Monthly Reports"
        titleKa="თვეების ანალიზი"
        subtitle="Monthly financial reports and analytics"
        subtitleKa="თვიური ფინანსური რეპორტები და ანალიტიკა"
        icon={Calendar}
        iconGradient="from-purple-500 to-indigo-600"
        dataSource={{ type: "live", source: "Supabase" }}
        backUrl="/finance"
        actions={addNewAnalysisButton}
      />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <MonthlyFileUploadManager />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        ) : uploads && uploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload: any) => (
              <Card
                key={upload.id}
                className="group p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                onClick={() => setLocation(`/finance/monthly-analysis/${upload.year}/${upload.month}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {months.find(m => m.value === upload.month.toString())?.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{upload.year}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">შემოსავალი</span>
                    </div>
                    <span className="font-bold text-lg">₾{upload.total_revenue?.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-accent/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">დაკავება</p>
                      <p className="font-semibold">{upload.occupancy_rate?.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-accent/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">ADR</p>
                      <p className="font-semibold">₾{upload.adr?.toFixed(0)}</p>
                    </div>
                  </div>

                  {upload.ai_summary_ka && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI ანალიზი მზადაა</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <FileSpreadsheet className="h-3 w-3" />
                    <span className="truncate">{upload.file_name}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  თვიური რეპორტები
                </h2>
                <p className="text-muted-foreground max-w-md">
                  აქ ნახავთ დეტალურ თვიურ ანალიზს - შემოსავლები, ხარჯები, 
                  დაკავება, ADR და სხვა მნიშვნელოვანი მეტრიკები თვეების მიხედვით
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                პირველი ანალიზის დამატება
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FinanceMonthlyAnalysisList;
