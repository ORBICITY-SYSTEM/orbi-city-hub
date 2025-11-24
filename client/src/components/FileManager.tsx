import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Upload, File, FileText, Image, Video, Music, Archive, X, Download, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FileManagerProps {
  module?: string;
  onFileSelect?: (file: any) => void;
}

export function FileManager({ module, onFileSelect }: FileManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Queries
  const { data: filesData, isLoading } = trpc.fileManager.list.useQuery({ module, limit: 100 });
  const { data: statsData } = trpc.fileManager.stats.useQuery();
  const { data: searchResults } = trpc.fileManager.search.useQuery(
    { query: searchQuery, module },
    { enabled: searchQuery.length > 0 }
  );

  // Mutations
  const uploadMutation = trpc.fileManager.upload.useMutation({
    onSuccess: () => {
      toast.success("ფაილი წარმატებით აიტვირთა!");
      utils.fileManager.list.invalidate();
      utils.fileManager.stats.invalidate();
    },
    onError: (error) => {
      toast.error(`ატვირთვა ვერ მოხერხდა: ${error.message}`);
    },
  });

  const renameMutation = trpc.fileManager.rename.useMutation({
    onSuccess: () => {
      toast.success("ფაილის სახელი შეიცვალა!");
      utils.fileManager.list.invalidate();
      setIsRenameDialogOpen(false);
    },
  });

  const deleteMutation = trpc.fileManager.delete.useMutation({
    onSuccess: () => {
      toast.success("ფაილი წაიშალა!");
      utils.fileManager.list.invalidate();
      utils.fileManager.stats.invalidate();
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      handleFileUpload(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ფაილის ზომა არ უნდა აღემატებოდეს 10MB-ს");
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;

      try {
        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
          fileSize: file.size,
          module,
        });
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => handleFileUpload(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-5 w-5" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ka-GE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRename = (file: any) => {
    setSelectedFile(file);
    setNewFileName(file.fileName);
    setIsRenameDialogOpen(true);
  };

  const handleDelete = async (fileId: number) => {
    if (confirm("დარწმუნებული ხართ რომ გსურთ ფაილის წაშლა?")) {
      await deleteMutation.mutateAsync({ fileId });
    }
  };

  const displayFiles = searchQuery.length > 0 ? searchResults?.files : filesData?.files;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">სულ ფაილები</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalFiles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">სულ ზომა</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(statsData.totalSize)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">მოდულები</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statsData.byModule).map(([mod, count]) => (
                  <Badge key={mod} variant="secondary">
                    {mod}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>ფაილების ატვირთვა</CardTitle>
          <CardDescription>ატვირთეთ ნებისმიერი ფორმატის ფაილები (მაქს. 10MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              გადმოიტანეთ ფაილები აქ ან დააჭირეთ ღილაკს
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? "იტვირთება..." : "აირჩიეთ ფაილები"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ძებნა ფაილის სახელით..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>ატვირთული ფაილები</CardTitle>
          <CardDescription>
            {displayFiles?.length || 0} ფაილი
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">იტვირთება...</div>
          ) : displayFiles && displayFiles.length > 0 ? (
            <div className="space-y-2">
              {displayFiles.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onFileSelect?.(file)}
                >
                  <div className="flex-shrink-0 text-muted-foreground">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                      {file.module && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {file.module}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.fileUrl, "_blank");
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(file);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ფაილები არ მოიძებნა
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ფაილის გადარქმევა</DialogTitle>
            <DialogDescription>შეიყვანეთ ახალი სახელი ფაილისთვის</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">ფაილის სახელი</Label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              გაუქმება
            </Button>
            <Button
              onClick={() => {
                if (selectedFile) {
                  renameMutation.mutate({
                    fileId: selectedFile.id,
                    newName: newFileName,
                  });
                }
              }}
              disabled={renameMutation.isPending}
            >
              შენახვა
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
