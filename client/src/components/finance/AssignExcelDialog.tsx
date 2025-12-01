import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileSpreadsheet, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { analyzeExcelFileForMonth } from "@/utils/excelAnalyzerMonthly";
import { validateExcelFile, formatValidationMessage } from "@/utils/excelValidator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssignExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleType: 'revenue' | 'expenses' | 'profit';
  onSuccess?: () => void;
}

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function AssignExcelDialog({ open, onOpenChange, moduleType, onSuccess }: AssignExcelDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const { data: uploads } = useQuery({
    queryKey: ['file-uploads-monthly'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_type', 'monthly_excel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleAssign = async () => {
    if (!selectedFile || !selectedMonth || !selectedYear) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ აირჩიოთ ფაილი და თარიღი",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get the selected file
      const upload = uploads?.find(u => u.id === selectedFile);
      if (!upload) throw new Error("ფაილი ვერ მოიძებნა");

      const filePath = typeof upload.metadata === 'object' && upload.metadata !== null 
        ? (upload.metadata as any).file_path as string | null
        : null;
      
      if (!filePath || typeof filePath !== 'string') throw new Error("ფაილის მისამართი ვერ მოიძებნა");

      // Download the file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('monthly-analysis')
        .download(filePath);

      if (downloadError) throw downloadError;

      // Convert to File object
      const file = new File([fileData], upload.file_name);

      // Validate file structure
      toast({
        title: "შემოწმება...",
        description: "Excel ფაილის ვალიდაცია",
      });

      const validationResult = await validateExcelFile(file);

      if (!validationResult.isValid) {
        throw new Error(`ფაილის ვალიდაცია ვერ გაიარა:\n${formatValidationMessage(validationResult)}`);
      }

      if (validationResult.warnings.length > 0) {
        toast({
          title: "⚠️ გაფრთხილებები",
          description: validationResult.warnings.join('\n'),
          duration: 6000,
        });
      }

      // Analyze the file
      toast({
        title: "ანალიზი...",
        description: "მონაცემების დამუშავება მიმდინარეობს",
      });

      const analysisResult = await analyzeExcelFileForMonth(
        file,
        parseInt(selectedYear),
        parseInt(selectedMonth)
      );

      // Check if a record already exists for this month/year
      const { data: existingUpload, error: checkError } = await supabase
        .from('monthly_analysis_uploads')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', parseInt(selectedYear))
        .eq('month', parseInt(selectedMonth))
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUpload) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('monthly_analysis_uploads')
          .update({
            file_name: upload.file_name,
            file_path: filePath,
            total_revenue: analysisResult.overallStats.totalRevenue,
            total_nights: analysisResult.overallStats.totalNights,
            total_bookings: analysisResult.overallStats.totalBookings,
            total_rooms: analysisResult.overallStats.uniqueRooms,
            adr: analysisResult.overallStats.avgADR,
            occupancy_rate: analysisResult.overallStats.occupancyRate,
            revpar: analysisResult.overallStats.revPAR,
          })
          .eq('id', existingUpload.id);

        if (updateError) throw updateError;

        toast({
          title: "✅ განახლდა",
          description: `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} წლის ანალიზი განახლდა`,
        });
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('monthly_analysis_uploads')
          .insert({
            user_id: user.id,
            file_name: upload.file_name,
            file_path: filePath,
            year: parseInt(selectedYear),
            month: parseInt(selectedMonth),
            total_revenue: analysisResult.overallStats.totalRevenue,
            total_nights: analysisResult.overallStats.totalNights,
            total_bookings: analysisResult.overallStats.totalBookings,
            total_rooms: analysisResult.overallStats.uniqueRooms,
            adr: analysisResult.overallStats.avgADR,
            occupancy_rate: analysisResult.overallStats.occupancyRate,
            revpar: analysisResult.overallStats.revPAR,
          });

        if (insertError) throw insertError;

        toast({
          title: "✅ შეიქმნა",
          description: `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} წლის ანალიზი შეიქმნა`,
        });
      }

      onOpenChange(false);
      setSelectedFile("");
      setSelectedMonth("");
      onSuccess?.();
    } catch (error: any) {
      console.error('Assign error:', error);
      toast({
        title: "შეცდომა",
        description: error.message || "დამუშავებისას მოხდა შეცდომა",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Excel ფაილის მინიჭება</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>აირჩიეთ Excel ფაილი</Label>
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger>
                <SelectValue placeholder="აირჩიეთ ფაილი" />
              </SelectTrigger>
              <SelectContent>
                {uploads?.map((upload) => (
                  <SelectItem key={upload.id} value={upload.id}>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>{upload.file_name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({format(new Date(upload.created_at), "PP", { locale: ka })})
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {(!uploads || uploads.length === 0) && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    ფაილები არ არის ატვირთული
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>წელი</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="წელი" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>თვე</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="თვე" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              არჩეული ფაილი ჯერ გადამოწმდება, შემდეგ დამუშავდება და შეიქმნება ახალი თვიური ანალიზი.
              თუ ფაილში არ იქნება საჭირო სვეტები, მიიღებთ შეცდომის შეტყობინებას.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            გაუქმება
          </Button>
          <Button onClick={handleAssign} disabled={processing}>
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            დამუშავება
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
