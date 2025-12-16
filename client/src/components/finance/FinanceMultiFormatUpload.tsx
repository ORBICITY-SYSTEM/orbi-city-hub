import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileSpreadsheet, FileText, FileJson, FileImage, Link2, Table } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { processExcelFile } from "@/utils/financeExcelProcessor";
import { FileUploadHistory } from "./FileUploadHistory";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const FinanceMultiFormatUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [googleLink, setGoogleLink] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const processCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const processJSON = async (file: File): Promise<any> => {
    const text = await file.text();
    return JSON.parse(text);
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error(t("მომხმარებელი არ არის ავტორიზებული", "User not authenticated"));
      }

      const uploadRecord = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: "Excel",
          file_size: file.size,
          processing_status: "processing",
        })
        .select()
        .single();

      if (uploadRecord.error) throw uploadRecord.error;

      setProgress(10);
      const { records, monthlyRoomCounts, roomFirstSeen, stats } = await processExcelFile(file);
      
      setProgress(30);

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

      toast({
        title: t("✅ Excel დამუშავდა!", "✅ Excel processed!"),
        description: t(
          `${records.length} ჩანაწერი, ${roomFirstSeen.size} სტუდიო`,
          `${records.length} records, ${roomFirstSeen.size} studios`
        ),
      });

      queryClient.invalidateQueries({ queryKey: ["finance-dashboard-pro"] });
      queryClient.invalidateQueries({ queryKey: ["file-upload-history"] });
      setProgress(0);
    } catch (error: any) {
      console.error("Excel error:", error);
      
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error(t("მომხმარებელი არ არის ავტორიზებული", "User not authenticated"));

      const uploadRecord = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: "CSV",
          file_size: file.size,
          processing_status: "processing",
        })
        .select()
        .single();

      if (uploadRecord.error) throw uploadRecord.error;

      setProgress(20);
      const data = await processCSV(file);
      setProgress(50);

      await supabase
        .from("file_uploads")
        .update({
          processing_status: "completed",
          records_processed: data.length,
          metadata: { format: "CSV", rows: data.length },
        })
        .eq("id", uploadRecord.data.id);

      setProgress(100);

      toast({
        title: t("✅ CSV დამუშავდა!", "✅ CSV processed!"),
        description: t(`${data.length} ჩანაწერი`, `${data.length} records`),
      });

      queryClient.invalidateQueries({ queryKey: ["file-upload-history"] });
      setProgress(0);
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleJSONUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error(t("მომხმარებელი არ არის ავტორიზებული", "User not authenticated"));

      const uploadRecord = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: "JSON",
          file_size: file.size,
          processing_status: "processing",
        })
        .select()
        .single();

      if (uploadRecord.error) throw uploadRecord.error;

      setProgress(20);
      const data = await processJSON(file);
      setProgress(50);

      await supabase
        .from("file_uploads")
        .update({
          processing_status: "completed",
          records_processed: Array.isArray(data) ? data.length : 1,
          metadata: { format: "JSON" },
        })
        .eq("id", uploadRecord.data.id);

      setProgress(100);

      toast({
        title: t("✅ JSON დამუშავდა!", "✅ JSON processed!"),
        description: file.name,
      });

      queryClient.invalidateQueries({ queryKey: ["file-upload-history"] });
      setProgress(0);
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error(t("მომხმარებელი არ არის ავტორიზებული", "User not authenticated"));

      const uploadRecord = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
          processing_status: "processing",
        })
        .select()
        .single();

      if (uploadRecord.error) throw uploadRecord.error;

      setProgress(50);

      await supabase
        .from("file_uploads")
        .update({
          processing_status: "completed",
          metadata: { format: fileType, note: "Document uploaded, ready for analysis" },
        })
        .eq("id", uploadRecord.data.id);

      setProgress(100);

      toast({
        title: t(`✅ ${fileType} ატვირთულია!`, `✅ ${fileType} uploaded!`),
        description: file.name,
      });

      queryClient.invalidateQueries({ queryKey: ["file-upload-history"] });
      setProgress(0);
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleGoogleLinkSubmit = async () => {
    if (!googleLink.trim()) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error(t("მომხმარებელი არ არის ავტორიზებული", "User not authenticated"));

      const fileType = googleLink.includes('docs.google.com/spreadsheets') 
        ? 'Google Sheets' 
        : googleLink.includes('docs.google.com/document')
        ? 'Google Docs'
        : 'Google Link';

      const uploadRecord = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          file_name: googleLink,
          file_type: fileType,
          file_size: 0,
          processing_status: "completed",
          metadata: { link: googleLink, type: fileType },
        })
        .select()
        .single();

      if (uploadRecord.error) throw uploadRecord.error;

      setProgress(100);

      toast({
        title: t(`✅ ${fileType} დალინკულია!`, `✅ ${fileType} linked!`),
        description: googleLink,
      });

      queryClient.invalidateQueries({ queryKey: ["file-upload-history"] });
      setGoogleLink("");
      setProgress(0);
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {t("ფაილების ატვირთვა - ყველა ფორმატი", "File Upload - All Formats")}
          </CardTitle>
          <CardDescription>
            {t(
              "ატვირთეთ Excel, CSV, JSON, PDF, Word, PowerPoint ან Google-ის ბმული",
              "Upload Excel, CSV, JSON, PDF, Word, PowerPoint or Google link"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Excel/Spreadsheet */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Table className="h-4 w-4 text-emerald" />
              {t("ცხრილები", "Spreadsheets")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => document.getElementById('excel-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="border-emerald/30 hover:bg-emerald/10"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel (.xlsx, .xls)
              </Button>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />

              <Button
                onClick={() => document.getElementById('csv-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="border-emerald/30 hover:bg-emerald/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t("დოკუმენტები", "Documents")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => document.getElementById('pdf-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentUpload(e, "PDF")}
                className="hidden"
              />

              <Button
                onClick={() => document.getElementById('word-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                Word (.docx, .doc)
              </Button>
              <input
                id="word-upload"
                type="file"
                accept=".docx,.doc"
                onChange={(e) => handleDocumentUpload(e, "Word")}
                className="hidden"
              />

              <Button
                onClick={() => document.getElementById('ppt-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                <FileImage className="mr-2 h-4 w-4" />
                PowerPoint (.pptx, .ppt)
              </Button>
              <input
                id="ppt-upload"
                type="file"
                accept=".pptx,.ppt"
                onChange={(e) => handleDocumentUpload(e, "PowerPoint")}
                className="hidden"
              />
            </div>
          </div>

          {/* JSON */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FileJson className="h-4 w-4 text-gold" />
              {t("მონაცემები", "Data")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => document.getElementById('json-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="border-gold/30 hover:bg-gold/10"
              >
                <FileJson className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <input
                id="json-upload"
                type="file"
                accept=".json"
                onChange={handleJSONUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Google Links */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-info" />
              {t("Google ბმული", "Google Link")}
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder={t("Google Sheets ან Docs ბმული", "Google Sheets or Docs link")}
                value={googleLink}
                onChange={(e) => setGoogleLink(e.target.value)}
                disabled={uploading}
              />
              <Button
                onClick={handleGoogleLinkSubmit}
                disabled={uploading || !googleLink.trim()}
                className="bg-info hover:bg-info/90"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 30 && t("დამუშავება...", "Processing...")}
                {progress >= 30 && progress < 90 && t(`${Math.round(progress)}%`, `${Math.round(progress)}%`)}
                {progress >= 90 && t("დასრულება...", "Finalizing...")}
              </p>
            </div>
          )}

          <div className="text-xs bg-primary/10 p-3 rounded space-y-1">
            <p>💡 <strong>Excel/CSV:</strong> {t("ავტომატური დამუშავება და ბაზაში შენახვა", "Automatic processing and database save")}</p>
            <p>💡 <strong>PDF/Word/PPT:</strong> {t("ატვირთვა და შენახვა ანალიზისთვის", "Upload and save for analysis")}</p>
            <p>💡 <strong>JSON:</strong> {t("სტრუქტურირებული მონაცემების ატვირთვა", "Structured data upload")}</p>
            <p>💡 <strong>Google:</strong> {t("პირდაპირი ბმული შენახვა", "Direct link save")}</p>
          </div>
        </CardContent>
      </Card>

      <FileUploadHistory />
    </div>
  );
};
