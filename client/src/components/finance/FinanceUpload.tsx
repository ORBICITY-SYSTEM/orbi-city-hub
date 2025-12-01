import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export const FinanceUpload = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleRevenueUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = jsonData.map((row: any) => ({
        user_id: user.id,
        date: new Date(row.Date || row.date || row['თარიღი']).toISOString().split('T')[0],
        channel: row.Channel || row.channel || row['არხი'] || 'Direct',
        revenue: parseFloat(row.Revenue || row.revenue || row['შემოსავალი'] || 0),
        expenses: parseFloat(row.Expenses || row.expenses || row['ხარჯები'] || 0),
        profit: parseFloat(row.Profit || row.profit || row['მოგება'] || 0),
        occupancy: parseFloat(row.Occupancy || row.occupancy || row['ოკუპაცია'] || 0),
        adr: parseFloat(row.ADR || row.adr || row['საშუალო ტარიფი'] || 0),
        currency: row.Currency || row.currency || row['ვალუტა'] || 'EUR'
      }));

      const { error } = await supabase.from('finance_records').insert(records);
      if (error) throw error;

      toast({
        title: t("წარმატებით აიტვირთა", "Successfully uploaded"),
        description: t(`${records.length} ჩანაწერი დაემატა`, `${records.length} records added`)
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t("შეცდომა", "Error"),
        description: t("ფაილის ატვირთვა ვერ მოხერხდა", "Failed to upload file"),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleExpenseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = jsonData.map((row: any) => ({
        user_id: user.id,
        date: new Date(row.Date || row.date || row['თარიღი']).toISOString().split('T')[0],
        category: row.Category || row.category || row['კატეგორია'] || 'Other',
        amount: parseFloat(row.Amount || row.amount || row['თანხა'] || 0),
        note: row.Note || row.note || row['შენიშვნა'] || null
      }));

      const { error } = await supabase.from('expense_records').insert(records);
      if (error) throw error;

      toast({
        title: t("წარმატებით აიტვირთა", "Successfully uploaded"),
        description: t(`${records.length} ხარჯი დაემატა`, `${records.length} expenses added`)
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t("შეცდომა", "Error"),
        description: t("ფაილის ატვირთვა ვერ მოხერხდა", "Failed to upload file"),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {t("შემოსავლების ფაილი (OtelMS)", "Revenue File (OtelMS)")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "ატვირთეთ Excel ფაილი თარიღით, არხით, შემოსავლით და ოკუპაციით",
                  "Upload Excel file with Date, Channel, Revenue, and Occupancy"
                )}
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleRevenueUpload}
                className="hidden"
                id="revenue-upload"
                disabled={uploading}
              />
              <label htmlFor="revenue-upload">
                <Button disabled={uploading} asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {t("ატვირთვა", "Upload")}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
            <FileSpreadsheet className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {t("ხარჯების ფაილი", "Expense File")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "ატვირთეთ Excel ფაილი თარიღით, კატეგორიით და თანხით",
                  "Upload Excel file with Date, Category, and Amount"
                )}
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExpenseUpload}
                className="hidden"
                id="expense-upload"
                disabled={uploading}
              />
              <label htmlFor="expense-upload">
                <Button disabled={uploading} variant="destructive" asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {t("ატვირთვა", "Upload")}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
