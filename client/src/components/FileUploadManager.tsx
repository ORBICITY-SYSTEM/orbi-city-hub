import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

/**
 * File Upload Manager Component
 * Handles file uploads with drag-and-drop support
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_FILE_TYPES = {
  // Excel files
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  // CSV
  "text/csv": [".csv"],
  // PDF
  "application/pdf": [".pdf"],
  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  // Documents
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
};

interface FileUploadManagerProps {
  module?: string;
  onUploadSuccess?: () => void;
}

export function FileUploadManager({ module = "CEO", onUploadSuccess }: FileUploadManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.fileManager.upload.useMutation({
    onSuccess: () => {
      toast.success("ფაილი წარმატებით აიტვირთა");
      onUploadSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "ფაილის ატვირთვა ვერ მოხერხდა");
    },
  });

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("ფაილის ზომა აჭარბებს 10MB ლიმიტს");
      return;
    }

    // Validate file type
    const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES);
    if (!acceptedTypes.includes(file.type)) {
      toast.error("ფაილის ტიპი არ არის მხარდაჭერილი");
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64 = base64Data.split(",")[1]; // Remove data:image/png;base64, prefix

        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
          module,
        });

        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("ფაილის წაკითხვა ვერ მოხერხდა");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(",")}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div>
              <p className="text-lg font-medium">ფაილი იტვირთება...</p>
              <p className="text-sm text-muted-foreground mt-1">
                გთხოვთ დაელოდოთ
              </p>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">
                ჩააგდეთ ფაილი აქ ან დააჭირეთ ასარჩევად
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                მხარდაჭერილი ფორმატები: Excel (.xlsx, .xls), CSV, PDF, სურათები (JPG, PNG, WEBP), Word, PowerPoint
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                მაქსიმალური ზომა: 10MB
              </p>
            </div>
            <Button variant="outline" className="mt-2">
              <Upload className="h-4 w-4 mr-2" />
              აირჩიეთ ფაილი
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
