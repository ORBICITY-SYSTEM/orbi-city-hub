import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const FileUploadHistory = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: uploads, isLoading, refetch } = useQuery({
    queryKey: ["file-upload-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("file_uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("file_uploads")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: t("✅ წაიშალა", "✅ Deleted"),
        description: t("ფაილი წარმატებით წაიშალა", "File deleted successfully"),
      });

      refetch();
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("დასრულებული", "Completed")}
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            {t("მუშავდება", "Processing")}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            {t("შეცდომა", "Failed")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {t("მოლოდინში", "Pending")}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("იტვირთება...", "Loading...")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!uploads || uploads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("ატვირთული ფაილების ისტორია", "Upload History")}
          </CardTitle>
          <CardDescription>
            {t("ჯერ არ გაქვთ ატვირთული ფაილები", "No uploaded files yet")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {t("ატვირთული ფაილების ისტორია", "Upload History")}
        </CardTitle>
        <CardDescription>
          {t(
            `სულ ${uploads.length} ფაილი ატვირთული`,
            `Total ${uploads.length} files uploaded`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ფაილის სახელი", "File Name")}</TableHead>
                <TableHead>{t("ტიპი", "Type")}</TableHead>
                <TableHead>{t("ზომა", "Size")}</TableHead>
                <TableHead>{t("თარიღი", "Date")}</TableHead>
                <TableHead>{t("სტატუსი", "Status")}</TableHead>
                <TableHead>{t("ჩანაწერები", "Records")}</TableHead>
                <TableHead className="text-right">{t("მოქმედება", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {upload.file_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {upload.file_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(upload.file_size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(upload.upload_date), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{getStatusBadge(upload.processing_status)}</TableCell>
                  <TableCell>
                    {upload.records_processed > 0 ? (
                      <span className="text-primary font-semibold">
                        {upload.records_processed.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(upload.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
