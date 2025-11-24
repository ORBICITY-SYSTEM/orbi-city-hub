import { Upload, X, FileText, Image, FileSpreadsheet } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FileUploadProps {
  module: "finance" | "marketing" | "logistics" | "reservations" | "reports";
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  module,
  onUploadSuccess,
  acceptedTypes = ".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.fileUpload.uploadFile.useMutation({
    onSuccess: (data) => {
      toast.success(`ფაილი წარმატებით აიტვირთა: ${data.fileName}`);
      setSelectedFile(null);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.(data.url, data.fileName);
    },
    onError: (error) => {
      toast.error(`შეცდომა: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`ფაილის ზომა არ უნდა აღემატებოდეს ${maxSizeMB}MB-ს`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        // Remove data:*/*;base64, prefix
        const base64String = base64Data.split(",")[1];

        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64String,
          mimeType: selectedFile.type,
          module,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("File upload error:", error);
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    if (ext === "pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
      return <Image className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-upload-${module}`}
      />

      {!selectedFile ? (
        <label
          htmlFor={`file-upload-${module}`}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors block"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {module === "finance" && "ატვირთეთ Excel/CSV ფინანსური რეპორტები ანალიზისთვის"}
            {module === "marketing" && "ატვირთეთ რევიუები ან analytics რეპორტები ანალიზისთვის"}
            {module === "logistics" && "ატვირთეთ ფოტოები ან Excel ფაილები ინვენტარის ანალიზისთვის"}
            {module === "reservations" && "ატვირთეთ ვაუჩერები, ბრონირების ფაილები, ან Excel რეპორტები ანალიზისთვის"}
            {module === "reports" && "ატვირთეთ ისტორიული მონაცემები პატერნების ანალიზისთვის"}
          </p>
          <Button variant="outline" size="sm" type="button">
            <Upload className="h-4 w-4 mr-2" />
            აირჩიეთ ფაილები
          </Button>
        </label>
      ) : (
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "იტვირთება..." : "ატვირთვა"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
