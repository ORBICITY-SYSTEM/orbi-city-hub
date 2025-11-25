import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  Trash2,
  Download,
  Search,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Unified File Manager Component
 * Centralized file upload and management for CEO Dashboard
 */
export function FileManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: files = [], isLoading } = trpc.fileUpload.getUploadedFiles.useQuery({
    search: searchQuery || undefined,
  });
  const { data: stats } = trpc.fileUpload.getStats.useQuery();

  const uploadMutation = trpc.fileUpload.uploadFile.useMutation({
    onSuccess: () => {
      toast.success("ფაილი წარმატებით აიტვირთა");
      utils.fileUpload.getUploadedFiles.invalidate();
      utils.fileUpload.getStats.invalidate();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: error => {
      toast.error(error.message || "ფაილის ატვირთვა ვერ მოხერხდა");
    },
  });

  const deleteMutation = trpc.fileUpload.deleteFile.useMutation({
    onSuccess: () => {
      toast.success("ფაილი წაიშალა");
      utils.fileUpload.getUploadedFiles.invalidate();
      utils.fileUpload.getStats.invalidate();
      setDeleteId(null);
    },
    onError: () => {
      toast.error("ფაილის წაშლა ვერ მოხერხდა");
    },
  });

  const renameMutation = trpc.fileUpload.renameFile.useMutation({
    onSuccess: () => {
      toast.success("ფაილის სახელი შეიცვალა");
      utils.fileUpload.getUploadedFiles.invalidate();
      setEditingId(null);
      setEditingName("");
    },
    onError: () => {
      toast.error("ფაილის გადარქმევა ვერ მოხერხდა");
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async e => {
        const base64 = e.target?.result as string;
        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast.error("ფაილის წაკითხვა ვერ მოხერხდა");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.includes("pdf")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const startRename = (file: (typeof files)[0]) => {
    setEditingId(file.id);
    setEditingName(file.originalName);
  };

  const saveRename = () => {
    if (editingId && editingName.trim()) {
      renameMutation.mutate({ id: editingId, newName: editingName.trim() });
    }
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">სულ ფაილები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFiles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">სულ ზომა</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats?.totalSize || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">მოდულები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats?.modules || {}).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>ფაილების ატვირთვა</CardTitle>
          <CardDescription>გადმოიტანეთ ფაილები აქ ან დააჭირეთ ღილაკს</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={uploading}>
                <span className="cursor-pointer">{uploading ? "იტვირთება..." : "აირჩიეთ ფაილები"}</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ძებნა ფაილის სახელით..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>ატვირთული ფაილები</CardTitle>
          <CardDescription>{files.length} ფაილი</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">იტვირთება...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">ფაილები არ მოიძებნა</div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.mimeType)}
                    {editingId === file.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="h-8"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === "Enter") saveRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={saveRename}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelRename}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.originalName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(file.fileSize)} •{" "}
                          {new Date(file.uploadedAt).toLocaleDateString("ka-GE")}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startRename(file)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={file.fileUrl} download={file.originalName}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(file.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
            <AlertDialogDescription>ფაილი სამუდამოდ წაიშლება და აღდგენა შეუძლებელი იქნება.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate({ id: deleteId });
              }}
            >
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
