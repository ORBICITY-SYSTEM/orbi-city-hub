import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CustomFieldManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomFieldManager = ({ open, onOpenChange }: CustomFieldManagerProps) => {
  const queryClient = useQueryClient();
  const [newField, setNewField] = useState({
    field_name: "",
    field_label: "",
    field_type: "number",
  });

  const { data: fields } = useQuery({
    queryKey: ["report-field-definitions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("report_field_definitions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("display_order");

      if (error) throw error;
      return data || [];
    },
  });

  const addFieldMutation = useMutation({
    mutationFn: async (field: typeof newField) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fieldName = field.field_label.toLowerCase().replace(/\s+/g, "_");
      
      const { error } = await supabase
        .from("report_field_definitions" as any)
        .insert({
          user_id: user.id,
          field_name: fieldName,
          field_label: field.field_label,
          field_type: field.field_type,
          display_order: fields?.length || 0,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-field-definitions"] });
      toast.success("Field added successfully");
      setNewField({ field_name: "", field_label: "", field_type: "number" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add field");
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("report_field_definitions" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-field-definitions"] });
      toast.success("Field deleted successfully");
    },
  });

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.field_label) {
      toast.error("Please enter a field label");
      return;
    }
    addFieldMutation.mutate(newField);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Custom Fields</DialogTitle>
          <DialogDescription>
            Add custom fields to track additional metrics in your monthly reports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Field Form */}
          <form onSubmit={handleAddField} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="field_label">Field Label</Label>
                <Input
                  id="field_label"
                  placeholder="e.g., Expenses, Profit"
                  value={newField.field_label}
                  onChange={(e) =>
                    setNewField({ ...newField, field_label: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_type">Type</Label>
                <Select
                  value={newField.field_type}
                  onValueChange={(value) =>
                    setNewField({ ...newField, field_type: value })
                  }
                >
                  <SelectTrigger id="field_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </form>

          {/* Existing Fields */}
          <div className="space-y-2">
            <h4 className="font-semibold">Existing Fields</h4>
            <div className="space-y-2">
              {fields?.map((field: any) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{field.field_label}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {field.field_type}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFieldMutation.mutate(field.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {fields?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No custom fields yet. Add one above!
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
