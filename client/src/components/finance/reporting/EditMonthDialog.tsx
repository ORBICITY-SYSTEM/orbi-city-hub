import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface EditMonthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: any;
  customFields: any[];
}

export const EditMonthDialog = ({
  open,
  onOpenChange,
  report,
  customFields,
}: EditMonthDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  // Initialize form data
  useEffect(() => {
    if (report) {
      setFormData({
        studio_count: report.studio_count || 56,
        days_available: report.days_available || 0,
        days_occupied: report.days_occupied || 0,
        occupancy: report.occupancy || 0,
        average_price: report.average_price || 0,
        total_revenue: report.total_revenue || 0,
        cleaning_technical: report.cleaning_technical || 0,
        marketing: report.marketing || 0,
        salaries: report.salaries || 0,
        utilities: report.utilities || 0,
        total_expenses: report.total_expenses || 0,
        total_profit: report.total_profit || 0,
        company_profit: report.company_profit || 0,
        studio_owners_profit: report.studio_owners_profit || 0,
        notes: report.notes || "",
        custom_fields: report.custom_fields || {},
      });
    }
  }, [report]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { custom_fields, ...baseFields } = data;

      const { error } = await supabase
        .from("monthly_reports" as any)
        .update({
          ...baseFields,
          custom_fields: custom_fields || {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-reports"] });
      toast.success("Report updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Gather custom field data
    const customFieldData: any = {};
    customFields?.forEach((field: any) => {
      if (formData.custom_fields?.[field.field_name] !== undefined) {
        customFieldData[field.field_name] = formData.custom_fields[field.field_name];
      }
    });

    updateMutation.mutate({
      studio_count: formData.studio_count,
      days_available: formData.days_available,
      days_occupied: formData.days_occupied,
      occupancy: formData.occupancy,
      average_price: formData.average_price,
      total_revenue: formData.total_revenue,
      cleaning_technical: formData.cleaning_technical,
      marketing: formData.marketing,
      salaries: formData.salaries,
      utilities: formData.utilities,
      total_expenses: formData.total_expenses,
      total_profit: formData.total_profit,
      company_profit: formData.company_profit,
      studio_owners_profit: formData.studio_owners_profit,
      notes: formData.notes,
      custom_fields: customFieldData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {format(new Date(report.month), "MMMM yyyy")}</DialogTitle>
          <DialogDescription>
            Update all financial data for this month
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Studio Count */}
          <div className="space-y-2">
            <Label htmlFor="studio_count">Studio Count</Label>
            <Input
              id="studio_count"
              type="number"
              value={formData.studio_count || ""}
              onChange={(e) =>
                setFormData({ ...formData, studio_count: parseInt(e.target.value) })
              }
            />
          </div>

          <Separator />

          {/* Operational Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Operational Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days_available">Days Available</Label>
                <Input
                  id="days_available"
                  type="number"
                  value={formData.days_available || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, days_available: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days_occupied">Days Occupied</Label>
                <Input
                  id="days_occupied"
                  type="number"
                  value={formData.days_occupied || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, days_occupied: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupancy">Occupancy (%)</Label>
                <Input
                  id="occupancy"
                  type="number"
                  step="0.1"
                  value={formData.occupancy || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, occupancy: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="average_price">Average Price (₾)</Label>
                <Input
                  id="average_price"
                  type="number"
                  step="0.01"
                  value={formData.average_price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, average_price: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Revenue */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Revenue</h4>
            <div className="space-y-2">
              <Label htmlFor="total_revenue" className="text-lg">Total Revenue (₾)</Label>
              <Input
                id="total_revenue"
                type="number"
                step="0.01"
                value={formData.total_revenue || ""}
                onChange={(e) =>
                  setFormData({ ...formData, total_revenue: parseFloat(e.target.value) })
                }
                className="text-lg font-semibold"
              />
            </div>
          </div>

          <Separator />

          {/* Expenses */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Expenses</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cleaning_technical">Cleaning/Technical (₾)</Label>
                <Input
                  id="cleaning_technical"
                  type="number"
                  step="0.01"
                  value={formData.cleaning_technical || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cleaning_technical: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketing">Marketing (₾)</Label>
                <Input
                  id="marketing"
                  type="number"
                  step="0.01"
                  value={formData.marketing || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, marketing: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaries">Salaries (₾)</Label>
                <Input
                  id="salaries"
                  type="number"
                  step="0.01"
                  value={formData.salaries || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, salaries: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilities">Utilities (₾)</Label>
                <Input
                  id="utilities"
                  type="number"
                  step="0.01"
                  value={formData.utilities || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, utilities: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="total_expenses" className="text-lg">Total Expenses (₾)</Label>
                <Input
                  id="total_expenses"
                  type="number"
                  step="0.01"
                  value={formData.total_expenses || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, total_expenses: parseFloat(e.target.value) })
                  }
                  className="text-lg font-semibold"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Profit */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Profit</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="total_profit" className="text-lg">Total Profit (₾)</Label>
                <Input
                  id="total_profit"
                  type="number"
                  step="0.01"
                  value={formData.total_profit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, total_profit: parseFloat(e.target.value) })
                  }
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_profit">Company Profit (₾)</Label>
                <Input
                  id="company_profit"
                  type="number"
                  step="0.01"
                  value={formData.company_profit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, company_profit: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studio_owners_profit">Studio Owners Profit (₾)</Label>
                <Input
                  id="studio_owners_profit"
                  type="number"
                  step="0.01"
                  value={formData.studio_owners_profit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, studio_owners_profit: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {customFields && customFields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Custom Fields</h4>
                <div className="grid grid-cols-2 gap-4">
                  {customFields.map((field: any) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.field_name}>{field.field_label}</Label>
                      <Input
                        id={field.field_name}
                        type={field.field_type === "percentage" ? "number" : "text"}
                        step={field.field_type === "number" || field.field_type === "percentage" ? "0.01" : undefined}
                        value={formData.custom_fields?.[field.field_name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            custom_fields: {
                              ...formData.custom_fields,
                              [field.field_name]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add any additional notes or comments..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
