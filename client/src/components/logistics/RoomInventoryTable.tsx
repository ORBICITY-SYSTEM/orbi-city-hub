import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, FileSpreadsheet, History, Upload } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import * as XLSX from "xlsx";
import { RoomInventoryHistory } from "./RoomInventoryHistory";
import { BulkInventoryImport } from "./BulkInventoryImport";

interface RoomInventoryTableProps {
  roomId: string;
  roomNumber: string;
}

interface StandardItem {
  id: string;
  category: string;
  item_name: string;
  standard_quantity: number;
}

interface RoomItem {
  id: string;
  standard_item_id: string;
  actual_quantity: number;
  condition: string;
  notes: string | null;
  last_checked: string;
}

export function RoomInventoryTable({ roomId, roomNumber }: RoomInventoryTableProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [conditions, setConditions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const { data: standardItems, isLoading: loadingStandard } = useQuery({
    queryKey: ["standard-inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standard_inventory_items")
        .select("*")
        .order("category", { ascending: true })
        .order("item_name", { ascending: true });
      if (error) throw error;
      return data as StandardItem[];
    },
  });

  const { data: roomItems, isLoading: loadingRoom } = useQuery({
    queryKey: ["room-inventory-items", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_inventory_items")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data as RoomItem[];
    },
  });

  useEffect(() => {
    if (standardItems && roomItems) {
      const newQuantities: Record<string, number> = {};
      const newConditions: Record<string, string> = {};
      const newNotes: Record<string, string> = {};

      standardItems.forEach((item) => {
        const roomItem = roomItems.find((ri) => ri.standard_item_id === item.id);
        newQuantities[item.id] = roomItem?.actual_quantity ?? item.standard_quantity;
        newConditions[item.id] = roomItem?.condition ?? "OK";
        newNotes[item.id] = roomItem?.notes ?? "";
      });

      setQuantities(newQuantities);
      setConditions(newConditions);
      setNotes(newNotes);
    }
  }, [standardItems, roomItems]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!standardItems) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const changedItems: string[] = [];

      for (const item of standardItems) {
        const existingItem = roomItems?.find((ri) => ri.standard_item_id === item.id);
        const actualQty = quantities[item.id] ?? item.standard_quantity;
        const condition = conditions[item.id] ?? "OK";
        const prevQty = existingItem?.actual_quantity ?? item.standard_quantity;

        // Track if item became missing or was restored
        let issueDetected = null;
        let issueResolved = null;

        if (prevQty >= item.standard_quantity && actualQty < item.standard_quantity) {
          // Item just became missing
          issueDetected = new Date().toISOString();
          changedItems.push(`${item.item_name}: ${prevQty} → ${actualQty}`);
        } else if (prevQty < item.standard_quantity && actualQty >= item.standard_quantity) {
          // Item was restored
          issueResolved = new Date().toISOString();
          changedItems.push(`${item.item_name}: ${prevQty} → ${actualQty} (აღდგენილი)`);
        } else if (prevQty !== actualQty) {
          changedItems.push(`${item.item_name}: ${prevQty} → ${actualQty}`);
        }

        const updateData: any = {
          actual_quantity: actualQty,
          condition: condition,
          notes: notes[item.id] || null,
          last_checked: new Date().toISOString(),
        };

        if (issueDetected) updateData.issue_detected_at = issueDetected;
        if (issueResolved) updateData.issue_resolved_at = issueResolved;

        if (existingItem?.id) {
          const { error } = await supabase
            .from("room_inventory_items")
            .update(updateData)
            .eq("id", existingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("room_inventory_items")
            .insert({
              room_id: roomId,
              standard_item_id: item.id,
              ...updateData,
            });
          if (error) throw error;
        }
      }

      // Log changes to history if any items changed
      if (changedItems.length > 0) {
        const { error: historyError } = await supabase
          .from("room_inventory_descriptions")
          .insert({
            room_id: roomId,
            user_id: user.id,
            change_type: "რაოდენობის შეცვლა",
            items_missing: changedItems.join(", "),
            description_date: new Date().toISOString(),
          });
        if (historyError) console.error("Failed to log history:", historyError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-inventory-items", roomId] });
      queryClient.invalidateQueries({ queryKey: ["all-room-inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["category-inventory-history"] });
      toast.success(t("ინვენტარი განახლდა", "Inventory updated successfully"));
    },
    onError: (error) => {
      toast.error(t("შეცდომა", "Error") + ": " + error.message);
    },
  });

  const exportToExcel = () => {
    if (!standardItems) return;

    const exportData = standardItems.map((item) => ({
      [t("კატეგორია", "Category")]: item.category,
      [t("ნივთი", "Item Name")]: item.item_name,
      [t("სტანდარტული რაოდენობა", "Standard Quantity")]: item.standard_quantity,
      [t("ფაქტობრივი რაოდენობა", "Actual Quantity")]: quantities[item.id] ?? item.standard_quantity,
      [t("მდგომარეობა", "Condition")]: conditions[item.id] ?? "OK",
      [t("შენიშვნები", "Notes")]: notes[item.id] ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("ინვენტარი", "Inventory"));
    XLSX.writeFile(wb, `Room_${roomNumber}_Inventory_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(t("ექსპორტი წარმატებული", "Exported successfully"));
  };

  if (loadingStandard || loadingRoom) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!standardItems || standardItems.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          {t("სტანდარტული ინვენტარი ვერ მოიძებნა", "No standard inventory items found")}
        </p>
      </Card>
    );
  }

  const groupedItems = standardItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StandardItem[]>);

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      OK: "default",
      Missing: "destructive",
      "To Replace": "secondary",
    };
    return <Badge variant={variants[condition] || "default"}>{condition}</Badge>;
  };

  if (showHistory) {
    return <RoomInventoryHistory roomId={roomId} onClose={() => setShowHistory(false)} />;
  }

  if (showBulkImport) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setShowBulkImport(false)} variant="outline">
          {t("უკან", "Back")}
        </Button>
        <BulkInventoryImport 
          roomId={roomId} 
          roomNumber={roomNumber}
          onComplete={() => {
            setShowBulkImport(false);
            queryClient.invalidateQueries({ queryKey: ["room-inventory-items", roomId] });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("ოთახი", "Room")} {roomNumber} - {t("ინვენტარის მართვა", "Inventory Management")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("ბოლო შემოწმება", "Last checked")}: {new Date().toLocaleDateString("ka-GE")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBulkImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t("ტექსტიდან ჩატვირთვა", "Import from Text")}
          </Button>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            {t("ისტორია", "History")}
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t("ექსპორტი Excel", "Export to Excel")}
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("შენახვა", "Save")}
          </Button>
        </div>
      </div>

      {Object.entries(groupedItems).map(([category, items]) => (
        <Card key={category} className="p-6">
          <h4 className="text-md font-semibold mb-4 text-primary">{category}</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">{t("ნივთი", "Item Name")}</TableHead>
                  <TableHead className="w-[120px]">{t("სტანდარტი", "Standard")}</TableHead>
                  <TableHead className="w-[120px]">{t("ფაქტობრივი", "Actual")}</TableHead>
                  <TableHead className="w-[150px]">{t("მდგომარეობა", "Condition")}</TableHead>
                  <TableHead>{t("შენიშვნები", "Notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const actualQty = quantities[item.id] ?? item.standard_quantity;
                  const isMissing = actualQty < item.standard_quantity;

                  return (
                    <TableRow key={item.id} className={isMissing ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>{item.standard_quantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={actualQty}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className={`w-20 ${isMissing ? "border-destructive" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={conditions[item.id] ?? "OK"}
                          onValueChange={(value) =>
                            setConditions((prev) => ({
                              ...prev,
                              [item.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OK">OK</SelectItem>
                            <SelectItem value="Missing">{t("დაკარგული", "Missing")}</SelectItem>
                            <SelectItem value="To Replace">{t("შესაცვლელი", "To Replace")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={notes[item.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder={t("შენიშვნა...", "Note...")}
                          className="min-h-[60px]"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}
    </div>
  );
}
