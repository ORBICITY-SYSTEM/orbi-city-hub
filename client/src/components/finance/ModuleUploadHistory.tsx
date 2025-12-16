import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ka } from "date-fns/locale";

interface ModuleUpload {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
}

interface ModuleUploadHistoryProps {
  uploadId: string;
  moduleType: string;
}

export function ModuleUploadHistory({ uploadId, moduleType }: ModuleUploadHistoryProps) {
  const [uploads, setUploads] = useState<ModuleUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUploads = async () => {
    try {
      const { data, error } = await supabase
        .from("monthly_module_uploads")
        .select("*")
        .eq("upload_id", uploadId)
        .eq("module_type", moduleType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error("Error loading uploads:", error);
      toast({
        title: "შეცდომა",
        description: "ფაილების ჩატვირთვისას მოხდა შეცდომა",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, [uploadId, moduleType]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("monthly-analysis")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "წარმატება",
        description: "ფაილი ჩამოიტვირთა",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "შეცდომა",
        description: "ფაილის ჩამოტვირთვისას მოხდა შეცდომა",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("monthly-analysis")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("monthly_module_uploads")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "წარმატება",
        description: "ფაილი წაიშალა",
      });

      loadUploads();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "შეცდომა",
        description: "ფაილის წაშლისას მოხდა შეცდომა",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">იტვირთება...</p>
      </Card>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">ჯერ არ არის ატვირთული ფაილები</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        ატვირთული ფაილების ისტორია
      </h4>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file_name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(upload.created_at), "dd MMM yyyy, HH:mm", { locale: ka })}
                  </span>
                  <span>{formatFileSize(upload.file_size)}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(upload.file_path, upload.file_name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(upload.id, upload.file_path)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
