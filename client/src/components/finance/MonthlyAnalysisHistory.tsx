import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ka } from "date-fns/locale";

interface Upload {
  id: string;
  file_name: string;
  created_at: string;
  total_revenue: number;
  total_nights: number;
  occupancy_rate: number;
  adr: number;
}

interface MonthlyAnalysisHistoryProps {
  uploads: Upload[];
  onEdit: (upload: Upload) => void;
  onDelete: (uploadId: string) => void;
  onDownload: (upload: Upload) => void;
}

export function MonthlyAnalysisHistory({
  uploads,
  onEdit,
  onDelete,
  onDownload,
}: MonthlyAnalysisHistoryProps) {
  if (uploads.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">ისტორია ცარიელია</h3>
          <p className="text-sm text-muted-foreground">
            ამ თვეში ჯერ არ არის ატვირთული ფაილები
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload) => (
        <Card key={upload.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{upload.file_name}</h4>
                <p className="text-xs text-muted-foreground">
                  ატვირთულია: {format(new Date(upload.created_at), "PPp", { locale: ka })}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    შემოსავალი: ₾{upload.total_revenue?.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    დაკავება: {upload.occupancy_rate?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(upload)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(upload)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(upload.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
