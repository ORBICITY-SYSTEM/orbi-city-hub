import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParsedItem {
  itemName: string;
  status: "+" | "-";
  quantity?: number;
  notes?: string;
}

interface BulkInventoryImportProps {
  roomId: string;
  roomNumber: string;
  onComplete: () => void;
}

export function BulkInventoryImport({ roomId, roomNumber, onComplete }: BulkInventoryImportProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [importText, setImportText] = useState("");
  const [preview, setPreview] = useState<ParsedItem[]>([]);

  const { data: standardItems } = useQuery({
    queryKey: ["standard-inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standard_inventory_items")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const parseInventoryText = (text: string): ParsedItem[] => {
    const lines = text.split("\n");
    const parsed: ParsedItem[] = [];

    for (const line of lines) {
      // Skip empty lines and category headers
      if (!line.trim() || !line.match(/^\d+\./)) continue;

      // Extract item name and status/quantity
      const match = line.match(/^\d+\.\s+(.+?)([\+\-])(\d*)(.*)$/);
      if (!match) continue;

      const [, itemName, status, quantity, notes] = match;
      
      parsed.push({
        itemName: itemName.trim(),
        status: status as "+" | "-",
        quantity: quantity ? parseInt(quantity) : undefined,
        notes: notes.trim() || undefined,
      });
    }

    return parsed;
  };

  const handlePreview = () => {
    const parsed = parseInventoryText(importText);
    setPreview(parsed);
    if (parsed.length === 0) {
      toast.error(t("ფორმატი არასწორია", "Invalid format"));
    } else {
      toast.success(t("ნაპოვნია", "Found") + ` ${parsed.length} ` + t("ნივთი", "items"));
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!standardItems) throw new Error("Standard items not loaded");

      const updates = [];

      for (const item of preview) {
        // Find matching standard item (case-insensitive, partial match)
        const standardItem = standardItems.find(si => 
          si.item_name.toLowerCase().includes(item.itemName.toLowerCase()) ||
          item.itemName.toLowerCase().includes(si.item_name.toLowerCase())
        );

        if (!standardItem) {
          console.warn(`Standard item not found for: ${item.itemName}`);
          continue;
        }

        let actualQuantity: number;
        let condition: string;
        let notes = item.notes || "";

        if (item.status === "+") {
          if (item.quantity !== undefined) {
            actualQuantity = item.quantity;
            notes = `სტანდარტი + დამატებით ${item.quantity}. ${notes}`.trim();
          } else {
            actualQuantity = standardItem.standard_quantity;
          }
          condition = "OK";
        } else {
          actualQuantity = 0;
          condition = "Missing";
        }

        // Check if record exists
        const { data: existing } = await supabase
          .from("room_inventory_items")
          .select("id")
          .eq("room_id", roomId)
          .eq("standard_item_id", standardItem.id)
          .maybeSingle();

        if (existing) {
          updates.push(
            supabase
              .from("room_inventory_items")
              .update({
                actual_quantity: actualQuantity,
                condition,
                notes,
                last_checked: new Date().toISOString(),
                issue_detected_at: condition === "Missing" ? new Date().toISOString() : null,
              })
              .eq("id", existing.id)
          );
        } else {
          updates.push(
            supabase
              .from("room_inventory_items")
              .insert({
                room_id: roomId,
                standard_item_id: standardItem.id,
                actual_quantity: actualQuantity,
                condition,
                notes,
                last_checked: new Date().toISOString(),
                issue_detected_at: condition === "Missing" ? new Date().toISOString() : null,
              })
          );
        }

        // Log to history
        const changeType = condition === "Missing" ? "issue_detected" : "inspection";
        await supabase.from("room_inventory_descriptions").insert({
          room_id: roomId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          change_type: changeType,
          items_missing: condition === "Missing" ? item.itemName : null,
          notes: notes || `Bulk import: ${item.itemName}`,
          description_date: new Date().toISOString(),
        });
      }

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-inventory-items", roomId] });
      toast.success(t("ინვენტარი განახლდა", "Inventory updated"));
      setImportText("");
      setPreview([]);
      onComplete();
    },
    onError: (error) => {
      toast.error(t("შეცდომა", "Error") + ": " + error.message);
    },
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t("ინვენტარის ჩატვირთვა", "Bulk Inventory Import")} - {roomNumber}
          </h3>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t(
                "ფორმატი: 1. ნივთის სახელი+ (ან -) რაოდენობა კომენტარი",
                "Format: 1. Item name+ (or -) quantity comment"
              )}
              <br />
              <strong>+</strong> = {t("არის", "present")}, <strong>-</strong> = {t("არ არის", "missing")}
            </AlertDescription>
          </Alert>
        </div>

        <Textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={`მაგალითი / Example:
1. Კარადა სარკით+
2. აივნის სკამი-
3. Ბალიში+2 დამატებითი კომენტარი
4. ღვინის ბოკალი-`}
          rows={15}
          className="font-mono text-sm"
        />

        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline">
            <Info className="h-4 w-4 mr-2" />
            {t("გადახედვა", "Preview")}
          </Button>
          <Button 
            onClick={() => importMutation.mutate()} 
            disabled={preview.length === 0 || importMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importMutation.isPending 
              ? t("იტვირთება...", "Importing...") 
              : t("ჩატვირთვა", "Import")} ({preview.length})
          </Button>
        </div>

        {preview.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg max-h-[300px] overflow-auto">
            <h4 className="font-semibold mb-2">{t("გადახედვა", "Preview")}:</h4>
            <ul className="text-sm space-y-1">
              {preview.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={item.status === "+" ? "text-green-600" : "text-destructive"}>
                    {item.status}
                  </span>
                  <span className="flex-1">
                    <strong>{item.itemName}</strong>
                    {item.quantity && ` (${item.quantity})`}
                    {item.notes && <span className="text-muted-foreground"> - {item.notes}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
