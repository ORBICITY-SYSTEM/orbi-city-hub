import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { processExcelFile } from "@/utils/financeExcelProcessor";
import { FileUploadHistory } from "./FileUploadHistory";
import { useFinanceActivity } from "@/hooks/useFinanceActivity";

export const FinanceUploadPro = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { logActivity } = useFinanceActivity();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error(t("მომხმარებელი არ არის ავტორიზებული", "User not authenticated"));
      }

      // Log upload to database
      const uploadRecord = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type || "unknown",
          file_size: file.size,
          processing_status: "processing",
        })
        .select()
        .single();

      if (uploadRecord.error) throw uploadRecord.error;

      // Check if it's an Excel file
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      if (isExcel) {
        // Process Excel in browser
        setProgress(10);
        const { records, monthlyRoomCounts, roomFirstSeen, stats } = await processExcelFile(file);
        
        setProgress(30);
        console.log('Processing complete:', stats);

        // Batch insert to Supabase
        const batchSize = 500;
        let inserted = 0;

        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize).map(r => ({
            user_id: user.id,
            room_number: r.roomNumber,
            building_block: r.buildingBlock,
            channel: r.channel,
            checkin_date: r.checkinDate,
            checkout_date: r.checkoutDate,
            nights: r.nights,
            revenue: r.revenue,
            date: r.date,
            adr: r.nights > 0 ? r.revenue / r.nights : 0,
          }));

          const { error } = await supabase
            .from('finance_records')
            .insert(batch);

          if (error) throw error;

          inserted += batch.length;
          setProgress(30 + (inserted / records.length) * 60);
        }

        // Update upload record
        await supabase
          .from("file_uploads")
          .update({
            processing_status: "completed",
            records_processed: records.length,
            metadata: {
              uniqueRooms: roomFirstSeen.size,
              months: monthlyRoomCounts.length,
              dateRange: stats.dateRange,
            },
          })
          .eq("id", uploadRecord.data.id);

        setProgress(100);

        // Log activity
        await logActivity({
          entityType: 'file_upload',
          entityId: uploadRecord.data.id,
          entityName: file.name,
          action: 'uploaded',
          changes: {
            recordsProcessed: records.length,
            uniqueRooms: roomFirstSeen.size,
            months: monthlyRoomCounts.length,
          },
        });

        toast({
          title: t("✅ წარმატებით დამუშავდა!", "✅ Successfully processed!"),
          description: t(
            `${records.length} ჩანაწერი, ${roomFirstSeen.size} სტუდიო, ${monthlyRoomCounts.length} თვე`,
            `${records.length} records, ${roomFirstSeen.size} studios, ${monthlyRoomCounts.length} months`
          ),
        });

        queryClient.invalidateQueries({ queryKey: ["finance-dashboard-pro"] });
        queryClient.invalidateQueries({ queryKey: ["finance-records"] });
      } else {
        // For non-Excel files, just log them
        await supabase
          .from("file_uploads")
          .update({
            processing_status: "completed",
            records_processed: 0,
            metadata: {
              note: "File uploaded but not processed automatically",
            },
          })
          .eq("id", uploadRecord.data.id);

        toast({
          title: t("✅ ფაილი ატვირთულია", "✅ File uploaded"),
          description: t(
            "ფაილი წარმატებით ატვირთულია. გთხოვთ მიუთითოთ რა უნდა გააკეთოს სისტემამ ამ ფაილთან.",
            "File uploaded successfully. Please specify what the system should do with this file."
          ),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["file-upload-history"] });
      setProgress(0);
    } catch (error: any) {
      console.error("Upload error:", error);
      
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message || t("ფაილის ატვირთვა ვერ მოხერხდა", "Failed to upload file"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("ფაილის ატვირთვა", "File Upload")}
          </CardTitle>
          <CardDescription>
            {t(
              "ატვირთეთ ნებისმიერი ფაილი - Excel, PDF, Word, ან სხვა. სისტემა თვითონ გაიგებს რა გააკეთოს.",
              "Upload any file - Excel, PDF, Word, or others. The system will automatically understand what to do."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("ამუშავებს...", "Processing...")}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("აირჩიეთ ფაილი", "Select File")}
                </>
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 30 && t("ფაილის დამუშავება...", "Processing file...")}
                {progress >= 30 && progress < 90 && t(`ატვირთვა: ${Math.round(progress)}%`, `Uploading: ${Math.round(progress)}%`)}
                {progress >= 90 && t("დასრულება...", "Finalizing...")}
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="text-xs bg-primary/10 p-3 rounded">
              💡 {t(
                "Excel ფაილები ავტომატურად დამუშავდება. სხვა ფაილები დაილოგება და თქვენ შეძლებთ მიუთითოთ რა გააკეთოს სისტემამ.",
                "Excel files will be processed automatically. Other files will be logged and you can specify what the system should do."
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <FileUploadHistory />
    </div>
  );
};
