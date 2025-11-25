import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText,
  Image,
  FileSpreadsheet,
  File as FileIcon,
  Download,
  Trash2,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * File History Component
 * Displays list of uploaded files with preview, download, and delete actions
 */

interface FileHistoryProps {
  module?: string;
  refreshTrigger?: number;
}

export function FileHistory({ module, refreshTrigger }: FileHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  const { data: files, isLoading, refetch } = trpc.fileManager.list.useQuery(
    { module },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  const deleteMutation = trpc.fileManager.delete.useMutation({
    onSuccess: () => {
      toast.success("ფაილი წარმატებით წაიშალა");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "ფაილის წაშლა ვერ მოხერხდა");
    },
  });

  // Refetch when refreshTrigger changes
  useState(() => {
    if (refreshTrigger) {
      refetch();
    }
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return <FileSpreadsheet className="h-5 w-5" />;
    if (mimeType === "application/pdf") return <FileText className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ka-GE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePreview = (file: { fileUrl: string; fileName: string; mimeType: string }) => {
    // Only preview images and PDFs
    if (file.mimeType.startsWith("image/") || file.mimeType === "application/pdf") {
      setPreviewFile({
        url: file.fileUrl,
        name: file.fileName,
        type: file.mimeType,
      });
    } else {
      toast.info("ამ ტიპის ფაილის preview არ არის ხელმისაწვდომი");
    }
  };

  const handleDownload = (file: { fileUrl: string; fileName: string }) => {
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ფაილი იწერება...");
  };

  const handleDelete = async (fileId: number) => {
    if (confirm("დარწმუნებული ხართ რომ გსურთ ფაილის წაშლა?")) {
      await deleteMutation.mutateAsync({ fileId });
    }
  };

  const filteredFiles = files?.filter((file) =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>იტვირთება...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">ატვირთული ფაილები</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ძებნა..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        {!filteredFiles || filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>ფაილები არ მოიძებნა</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-muted-foreground">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(file.mimeType.startsWith("image/") ||
                    file.mimeType === "application/pdf") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-8rem)]">
            {previewFile?.type.startsWith("image/") ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="w-full h-auto"
              />
            ) : previewFile?.type === "application/pdf" ? (
              <iframe
                src={previewFile.url}
                className="w-full h-[70vh]"
                title={previewFile.name}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
