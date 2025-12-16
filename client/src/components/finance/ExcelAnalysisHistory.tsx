import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFinanceAnalysis } from "@/contexts/FinanceAnalysisContext";
import { Archive, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const ExcelAnalysisHistory = () => {
  const { t } = useLanguage();
  const { analysisHistory, deleteAnalysis } = useFinanceAnalysis();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${Math.round(amount).toLocaleString()}₾`;
  };

  if (analysisHistory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" />
          {t("ატვირთული ფაილების არქივი", "Uploaded Files Archive")}
        </CardTitle>
        <CardDescription>
          {t("ნახეთ ყველა ატვირთული Excel ფაილის ისტორია", "View all uploaded Excel files history")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ფაილის სახელი", "File Name")}</TableHead>
                <TableHead>{t("ატვირთვის თარიღი", "Upload Date")}</TableHead>
                <TableHead className="text-right">{t("შემოსავალი", "Revenue")}</TableHead>
                <TableHead className="text-right">{t("ბრონები", "Bookings")}</TableHead>
                <TableHead className="text-right">{t("მოქმედება", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.file_name}</TableCell>
                  <TableCell>{formatDate(item.upload_date)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatCurrency(parseFloat(item.total_revenue))}
                  </TableCell>
                  <TableCell className="text-right">{item.total_bookings}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("დარწმუნებული ხართ?", "Are you sure?")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              "ეს მოქმედება შეუქცევადია. ფაილი და ანალიზი სამუდამოდ წაიშლება.",
                              "This action cannot be undone. The file and analysis will be permanently deleted."
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("გაუქმება", "Cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteAnalysis(item.id)}>
                            {t("წაშლა", "Delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
