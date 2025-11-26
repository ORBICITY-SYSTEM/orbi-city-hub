import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import * as XLSX from "xlsx";
import { trpc } from "@/lib/trpc";

interface RoomInventoryTableProps {
  roomId: number;
  roomNumber: string;
}

interface StandardItem {
  id: number;
  category: string;
  itemName: string;
  standardQuantity: number;
}

interface RoomItem {
  id: number;
  standardItemId: number;
  actualQuantity: number;
  condition: string;
  notes: string | null;
  lastChecked: Date;
}

export function RoomInventoryTable({ roomId, roomNumber }: RoomInventoryTableProps) {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [conditions, setConditions] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const { data: standardItems, isLoading: loadingStandard } = trpc.logistics.standardItems.list.useQuery();
  const { data: roomItems, isLoading: loadingRoom } = trpc.logistics.roomInventory.getByRoomId.useQuery({ roomId });

  const saveMutation = trpc.logistics.roomInventory.upsert.useMutation({
    onSuccess: () => {
      utils.logistics.roomInventory.getByRoomId.invalidate({ roomId });
      utils.logistics.roomInventory.list.invalidate();
      toast.success(t("ინვენტარი განახლდა", "Inventory updated successfully"));
    },
    onError: (error) => {
      toast.error(t("შეცდომა", "Error") + ": " + error.message);
    },
  });

  useEffect(() => {
    if (standardItems && roomItems) {
      const newQuantities: Record<number, number> = {};
      const newConditions: Record<number, string> = {};
      const newNotes: Record<number, string> = {};

      standardItems.forEach((item) => {
        const roomItem = roomItems.find((ri) => ri.standardItemId === item.id);
        newQuantities[item.id] = roomItem?.actualQuantity ?? item.standardQuantity;
        newConditions[item.id] = roomItem?.condition ?? "good";
        newNotes[item.id] = roomItem?.notes ?? "";
      });

      setQuantities(newQuantities);
      setConditions(newConditions);
      setNotes(newNotes);
    }
  }, [standardItems, roomItems]);

  const handleSave = async () => {
    if (!standardItems) return;

    try {
      for (const item of standardItems) {
        const actualQty = quantities[item.id] ?? item.standardQuantity;
        const condition = conditions[item.id] ?? "good";
        const itemNotes = notes[item.id] || undefined;

        await saveMutation.mutateAsync({
          roomId,
          standardItemId: item.id,
          actualQuantity: actualQty,
          condition: condition as "good" | "fair" | "poor" | "missing",
          notes: itemNotes,
        });
      }
    } catch (error) {
      console.error("Failed to save inventory:", error);
    }
  };

  const exportToExcel = () => {
    if (!standardItems) return;

    const exportData = standardItems.map((item) => ({
      [t("კატეგორია", "Category")]: item.category,
      [t("ნივთი", "Item Name")]: item.itemName,
      [t("სტანდარტული რაოდენობა", "Standard Quantity")]: item.standardQuantity,
      [t("ფაქტობრივი რაოდენობა", "Actual Quantity")]: quantities[item.id] ?? item.standardQuantity,
      [t("მდგომარეობა", "Condition")]: conditions[item.id] ?? "good",
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

  if (!standardItems) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          {t("სტანდარტული ნივთები ვერ მოიძებნა", "Standard items not found")}
        </p>
      </Card>
    );
  }

  // Group items by category
  const categories = Array.from(new Set(standardItems.map((item) => item.category)));

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {t("ოთახი", "Room")} {roomNumber} - {t("ინვენტარი", "Inventory")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("განაახლეთ ინვენტარის რაოდენობა და მდგომარეობა", "Update inventory quantity and condition")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t("ექსპორტი", "Export")}
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("შენახვა", "Save")}
            </Button>
          </div>
        </div>

        {categories.map((category) => {
          const categoryItems = standardItems.filter((item) => item.category === category);
          return (
            <div key={category} className="space-y-3">
              <h4 className="font-semibold text-primary">{t(category, category)}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ნივთი", "Item")}</TableHead>
                    <TableHead className="text-center">{t("სტანდარტი", "Standard")}</TableHead>
                    <TableHead className="text-center">{t("ფაქტობრივი", "Actual")}</TableHead>
                    <TableHead className="text-center">{t("მდგომარეობა", "Condition")}</TableHead>
                    <TableHead>{t("შენიშვნები", "Notes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryItems.map((item) => {
                    const actualQty = quantities[item.id] ?? item.standardQuantity;
                    const isMissing = actualQty < item.standardQuantity;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{t(item.itemName, item.itemName)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.standardQuantity}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={quantities[item.id] ?? item.standardQuantity}
                            onChange={(e) =>
                              setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 0 })
                            }
                            className={`w-20 text-center ${isMissing ? "border-destructive" : ""}`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={conditions[item.id] ?? "good"}
                            onValueChange={(value) => setConditions({ ...conditions, [item.id]: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="good">{t("კარგი", "Good")}</SelectItem>
                              <SelectItem value="fair">{t("საშუალო", "Fair")}</SelectItem>
                              <SelectItem value="poor">{t("ცუდი", "Poor")}</SelectItem>
                              <SelectItem value="missing">{t("ნაკლული", "Missing")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder={t("შენიშვნები...", "Notes...")}
                            value={notes[item.id] ?? ""}
                            onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
