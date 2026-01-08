import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, Trash2, Calendar, Download, AlertCircle, CheckCircle, FileDown, File, Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, HardDrive, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { validateExcelFile, formatValidationMessage } from "@/utils/excelValidator";
import { generateExcelTemplate, generateMinimalExcelTemplate } from "@/utils/excelTemplateGenerator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function MonthlyFileUploadManager() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minSize, setMinSize] = useState<string>("");
  const [maxSize, setMaxSize] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: allUploads, refetch } = useQuery({
    queryKey: ['file-uploads-monthly'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_type', 'monthly_excel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!allUploads || allUploads.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        latestUpload: null,
      };
    }

    const totalSize = allUploads.reduce((sum, upload) => sum + (upload.file_size || 0), 0);
    const sortedByDate = [...allUploads].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      totalFiles: allUploads.length,
      totalSize,
      latestUpload: sortedByDate[0]?.created_at || null,
    };
  }, [allUploads]);

  // Filter and sort uploads
  const uploads = useMemo(() => {
    if (!allUploads) return [];

    let filtered = [...allUploads];

    // Search by filename
    if (searchQuery) {
      filtered = filtered.filter(upload => 
        upload.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(upload => 
        new Date(upload.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(upload => 
        new Date(upload.created_at) <= endDate
      );
    }

    // Filter by file size
    if (minSize) {
      const minBytes = parseFloat(minSize) * 1024; // Convert KB to bytes
      filtered = filtered.filter(upload => upload.file_size >= minBytes);
    }
    if (maxSize) {
      const maxBytes = parseFloat(maxSize) * 1024; // Convert KB to bytes
      filtered = filtered.filter(upload => upload.file_size <= maxBytes);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "size":
          comparison = a.file_size - b.file_size;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [allUploads, searchQuery, sortBy, sortOrder, minSize, maxSize, dateFrom, dateTo]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setMinSize("");
    setMaxSize("");
    setDateFrom("");
    setDateTo("");
    setSortBy("date");
    setSortOrder("desc");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Step 1: Validate file structure
    setValidating(true);
    toast({
      title: "შემოწმება...",
      description: "Excel ფაილის ვალიდაცია მიმდინარეობს",
    });

    const validationResult = await validateExcelFile(file);
    setValidating(false);

    // Show validation errors
    if (!validationResult.isValid) {
      toast({
        title: "❌ ვალიდაცია ვერ გაიარა",
        description: formatValidationMessage(validationResult),
        variant: "destructive",
        duration: 10000,
      });
      e.target.value = '';
      return;
    }

    // Show warnings if any
    if (validationResult.warnings.length > 0) {
      toast({
        title: "⚠️ გაფრთხილებები",
        description: validationResult.warnings.join('\n'),
        duration: 8000,
      });
    } else {
      toast({
        title: "✅ ვალიდაცია წარმატებულია",
        description: "ფაილი შეესაბამება მოთხოვნებს",
      });
    }

    // Step 2: Upload file
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('monthly-analysis')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Log the upload
      const { error: logError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: 'monthly_excel',
          file_size: file.size,
          processing_status: 'completed',
          metadata: {
            file_path: filePath,
            uploaded_at: new Date().toISOString(),
          }
        });

      if (logError) throw logError;

      toast({
        title: "✅ წარმატება",
        description: "ფაილი წარმატებით აიტვირთა",
      });

      refetch();
      e.target.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "შეცდომა",
        description: error.message || "ფაილის ატვირთვისას მოხდა შეცდომა",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (uploadId: string, filePath: string | null) => {
    if (!filePath) {
      toast({
        title: "შეცდომა",
        description: "ფაილის მისამართი ვერ მოიძებნა",
        variant: "destructive",
      });
      return;
    }
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('monthly-analysis')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', uploadId);

      if (dbError) throw dbError;

      toast({
        title: "✅ წაიშალა",
        description: "ფაილი წარმატებით წაიშალა",
      });

      refetch();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "შეცდომა",
        description: "ფაილის წაშლისას მოხდა შეცდომა",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('monthly-analysis')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ ჩამოიტვირთა",
        description: "ფაილი წარმატებით ჩამოიტვირთა",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "შეცდომა",
        description: "ფაილის ჩამოტვირთვისას მოხდა შეცდომა",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Info Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>საჭირო სვეტები Excel ფაილში</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
            <li><strong>ნომერი</strong> / Room - ოთახის ნომერი</li>
            <li><strong>შესვლა</strong> / Check-in - შესვლის თარიღი</li>
            <li><strong>გასვლა</strong> / Check-out - გასვლის თარიღი</li>
            <li><strong>თანხა</strong> / Revenue - ჯავშნის თანხა</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">ატვირთეთ Excel ფაილები</h3>
            <p className="text-sm text-muted-foreground">
              ატვირთეთ OtelMS-დან ექსპორტირებული ფაილები
            </p>
          </div>
          <div className="flex gap-2">
            {/* Template Download Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  generateExcelTemplate();
                  toast({
                    title: "✅ Template ჩამოიტვირთა",
                    description: "ნიმუში ფაილი მაგალითი მონაცემებით",
                  });
                }}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  მაგალითებით
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  generateMinimalExcelTemplate();
                  toast({
                    title: "✅ Template ჩამოიტვირთა",
                    description: "ცარიელი template მხოლოდ სვეტებით",
                  });
                }}>
                  <File className="h-4 w-4 mr-2" />
                  ცარიელი
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Upload Button */}
            <div>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading || validating}
            />
            <Button
              onClick={() => document.getElementById('excel-upload')?.click()}
              disabled={uploading || validating}
            >
              <Upload className="h-4 w-4 mr-2" />
              {validating ? "იმოწმება..." : uploading ? "იტვირთება..." : "ატვირთვა"}
            </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* File Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Files */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">სულ ფაილები</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalFiles}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Total Size */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">ჯამური ზომა</p>
              <p className="text-3xl font-bold text-foreground">
                {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        {/* Latest Upload */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">ბოლო ატვირთვა</p>
              <p className="text-lg font-bold text-foreground">
                {stats.latestUpload 
                  ? format(new Date(stats.latestUpload), "dd MMM yyyy", { locale: ka })
                  : "არ არის"}
              </p>
              {stats.latestUpload && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(stats.latestUpload), "HH:mm", { locale: ka })}
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">ფილტრები და ძებნა</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
            >
              გასუფთავება
            </Button>
          </div>

          {/* Search and Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>ძებნა სახელით</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ფაილის სახელი..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>დალაგება</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">თარიღით</SelectItem>
                  <SelectItem value="name">სახელით</SelectItem>
                  <SelectItem value="size">ზომით</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>მიმართულება</Label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    ზრდადობით
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    კლებადობით
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>თარიღის დიაპაზონი</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="დან"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="მდე"
                />
              </div>
            </div>

            {/* File Size Range */}
            <div className="space-y-2">
              <Label>ზომა (KB)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  placeholder="მინ"
                  min="0"
                />
                <Input
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder="მაქს"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              ნაპოვნია: <span className="font-semibold text-foreground">{uploads?.length || 0}</span> ფაილი
              {allUploads && uploads && uploads.length !== allUploads.length && (
                <span className="ml-1">({allUploads.length} სულ)</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Files List */}
      <div className="space-y-3">
        {uploads && uploads.length === 0 && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">ფაილები ცარიელია</h3>
              <p className="text-sm text-muted-foreground">
                ჯერ არ არის ატვირთული Excel ფაილები
              </p>
            </div>
          </Card>
        )}

        {uploads?.map((upload) => {
          const filePath = typeof upload.metadata === 'object' && upload.metadata !== null 
            ? (upload.metadata as any).file_path as string | null
            : null;
          return (
            <Card key={upload.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <FileSpreadsheet className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{upload.file_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {format(new Date(upload.created_at), "PPp", { locale: ka })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ზომა: {(upload.file_size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => filePath && handleDownload(filePath, upload.file_name)}
                    disabled={!filePath}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(upload.id, filePath)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
