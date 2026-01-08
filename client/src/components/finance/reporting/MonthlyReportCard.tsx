import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { EditMonthDialog } from "./EditMonthDialog";
import { toast } from "sonner";

interface MonthlyReportCardProps {
  report: any;
  customFields: any[];
}

export const MonthlyReportCard = ({ report, customFields }: MonthlyReportCardProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const queryClient = useQueryClient();

  const monthName = format(new Date(report.month), "MMMM yyyy");

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("monthly_reports" as any)
        .delete()
        .eq("id", report.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-reports"] });
      toast.success("Month deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete month");
    },
  });

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{monthName}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEdit(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {report.studio_count} Studios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Operational Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Operational</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Days Available</div>
                <div className="font-semibold">{report.days_available?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Days Occupied</div>
                <div className="font-semibold">{report.days_occupied?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Occupancy</div>
                <div className="font-semibold">{report.occupancy || 0}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Average Price</div>
                <div className="font-semibold">₾{report.average_price || 0}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Revenue */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Revenue</h4>
            <div className="rounded-lg p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Total Revenue</div>
              <div className="text-xl font-medium">
                ₾{report.total_revenue?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          <Separator />

          {/* Expenses */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Expenses</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Cleaning/Technical</div>
                <div className="font-medium">₾{report.cleaning_technical?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Marketing</div>
                <div className="font-medium">₾{report.marketing?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Salaries</div>
                <div className="font-medium">₾{report.salaries?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Utilities</div>
                <div className="font-medium">₾{report.utilities?.toLocaleString() || 0}</div>
              </div>
            </div>
            <div className="rounded-lg p-2 mt-2 bg-muted/30">
              <div className="text-xs text-muted-foreground">Total Expenses</div>
              <div className="text-lg font-medium">
                ₾{report.total_expenses?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          <Separator />

          {/* Profit */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Profit</h4>
            <div className="space-y-2">
              <div className="rounded-lg p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">Total Profit</div>
                <div className="text-xl font-medium">
                  ₾{report.total_profit?.toLocaleString() || 0}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-success/10 rounded p-2">
                  <div className="text-muted-foreground text-xs">Company Profit</div>
                  <div className="font-semibold text-success">₾{report.company_profit?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="text-muted-foreground text-xs">Owners Profit</div>
                  <div className="font-semibold">₾{report.studio_owners_profit?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {customFields && customFields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Custom Fields</h4>
                {customFields?.map((field: any) => (
                  <div key={field.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{field.field_label}</span>
                    <span className="font-medium">
                      {report.custom_fields?.[field.field_name] || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {report.notes && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground italic">{report.notes}</div>
            </>
          )}
        </CardContent>
      </Card>

      <EditMonthDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        report={report}
        customFields={customFields}
      />
    </>
  );
};
