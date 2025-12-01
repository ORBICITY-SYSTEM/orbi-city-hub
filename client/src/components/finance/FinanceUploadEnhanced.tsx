import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

export const FinanceUploadEnhanced = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const extractBuildingBlock = (roomNumber: string): string => {
    if (!roomNumber) return "Unknown";
    const match = roomNumber.trim().match(/^([A-Z]+)/);
    return match ? match[1] : "Unknown";
  };

  const normalizeChannel = (channel: string | undefined): string => {
    if (!channel || channel.trim() === "") return "Direct";
    const c = channel.toLowerCase().trim();
    
    if (c.includes("პირდაპირი") || c.includes("direct")) return "Direct";
    if (c.includes("booking")) return "Booking.com";
    if (c.includes("expedia")) return "Expedia";
    if (c.includes("whatsapp")) return "WhatsApp";
    if (c.includes("airbnb")) return "Airbnb";
    
    return channel.trim();
  };

  const handleRevenueUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const records = jsonData.map((row: any) => {
        const roomNumber = row["ნომერი"] || row["room"] || row["Room"] || "";
        const channel = normalizeChannel(row["წყარო"] || row["source"] || row["Source"]);
        const checkinDate = row["შესვლა"] || row["checkin"] || row["Check-in"];
        const checkoutDate = row["გასვლა"] || row["checkout"] || row["Check-out"];
        const nights = parseInt(row["ხანგრძლივობა"] || row["nights"] || row["Nights"] || "1");
        const amount = parseFloat(row["თანხა"] || row["amount"] || row["Amount"] || row["revenue"] || row["Revenue"] || "0");
        
        return {
          user_id: user.id,
          date: checkinDate,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          room_number: roomNumber,
          building_block: extractBuildingBlock(roomNumber),
          channel: channel,
          nights: nights,
          revenue: amount,
          expenses: 0,
          profit: amount,
          occupancy: 0,
          adr: nights > 0 ? amount / nights : amount,
          currency: "GEL"
        };
      }).filter(r => r.revenue > 0);

      const { error } = await supabase
        .from("finance_records")
        .insert(records);

      if (error) throw error;

      toast({
        title: t("წარმატებული ატვირთვა", "Upload Successful"),
        description: t(`${records.length} ჩანაწერი დაემატა`, `${records.length} records added`),
      });

      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: t("შეცდომა", "Error"),
        description: t("ფაილის ატვირთვა ვერ მოხერხდა", "Failed to upload file"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleExpenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const records = jsonData.map((row: any) => ({
        user_id: user.id,
        date: row["თარიღი"] || row["date"] || row["Date"],
        category: row["კატეგორია"] || row["category"] || row["Category"] || "Other",
        subcategory: row["ქვეკატეგორია"] || row["subcategory"] || null,
        amount: parseFloat(row["თანხა"] || row["amount"] || row["Amount"] || "0"),
        vendor: row["მიმწოდებელი"] || row["vendor"] || null,
        payment_method: row["გადახდის მეთოდი"] || row["payment_method"] || null,
        note: row["შენიშვნა"] || row["note"] || row["Note"] || null,
      })).filter(r => r.amount > 0);

      const { error } = await supabase
        .from("expense_records")
        .insert(records);

      if (error) throw error;

      toast({
        title: t("წარმატებული ატვირთვა", "Upload Successful"),
        description: t(`${records.length} ხარჯი დაემატა`, `${records.length} expenses added`),
      });

      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: t("შეცდომა", "Error"),
        description: t("ფაილის ატვირთვა ვერ მოხერხდა", "Failed to upload file"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t("შემოსავლების ატვირთვა", "Revenue Upload")}</CardTitle>
              <CardDescription>
                {t(
                  "ატვირთეთ OtelMS-დან ექსპორტირებული Excel ფაილი",
                  "Upload Excel file exported from OtelMS"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-primary/20 p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleRevenueUpload}
              disabled={uploading}
              className="hidden"
              id="revenue-upload"
            />
            <label htmlFor="revenue-upload">
              <Button disabled={uploading} asChild>
                <span className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {t("აირჩიეთ ფაილი", "Choose File")}
                </span>
              </Button>
            </label>
            <p className="text-sm text-muted-foreground mt-4">
              {t("Excel ფორმატი: ნომერი, წყარო, შესვლა, ხანგრძლივობა, გასვლა, თანხა", 
                 "Excel format: Room, Source, Check-in, Nights, Check-out, Amount")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle>{t("ხარჯების ატვირთვა", "Expenses Upload")}</CardTitle>
              <CardDescription>
                {t(
                  "ატვირთეთ ხარჯების Excel ფაილი",
                  "Upload expenses Excel file"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-destructive/20 p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExpenseUpload}
              disabled={uploading}
              className="hidden"
              id="expense-upload"
            />
            <label htmlFor="expense-upload">
              <Button disabled={uploading} variant="destructive" asChild>
                <span className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {t("აირჩიეთ ფაილი", "Choose File")}
                </span>
              </Button>
            </label>
            <p className="text-sm text-muted-foreground mt-4">
              {t("Excel ფორმატი: თარიღი, კატეგორია, თანხა, შენიშვნა", 
                 "Excel format: Date, Category, Amount, Note")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
