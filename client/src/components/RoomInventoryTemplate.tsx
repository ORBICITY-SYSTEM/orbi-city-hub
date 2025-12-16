import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface RoomInventoryTemplateProps {
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
  notes: string | null;
  issue_detected_at: string | null;
  issue_resolved_at: string | null;
}

export const RoomInventoryTemplate = ({ roomId, roomNumber }: RoomInventoryTemplateProps) => {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: standardItems, isLoading: loadingStandard } = useQuery({
    queryKey: ["standard-inventory"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("standard_inventory_items")
        .select("*")
        .order("category")
        .order("item_name");

      if (error) throw error;
      return data as StandardItem[];
    },
  });

  const { data: roomItems, isLoading: loadingRoom } = useQuery({
    queryKey: ["room-inventory", roomId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("room_inventory_items")
        .select("*")
        .eq("room_id", roomId);

      if (error) throw error;
      return data as RoomItem[];
    },
    enabled: !!roomId,
  });

  useEffect(() => {
    if (roomItems && standardItems) {
      const newQuantities: Record<string, number> = {};
      const newNotes: Record<string, string> = {};
      
      standardItems.forEach((item) => {
        const roomItem = roomItems.find((ri) => ri.standard_item_id === item.id);
        newQuantities[item.id] = roomItem?.actual_quantity ?? item.standard_quantity;
        newNotes[item.id] = roomItem?.notes ?? "";
      });
      
      setQuantities(newQuantities);
      setNotes(newNotes);
    }
  }, [roomItems, standardItems]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!standardItems) return;

      const updates = standardItems.map((item) => {
        const actualQty = quantities[item.id] ?? item.standard_quantity;
        const isMissing = actualQty < item.standard_quantity;
        const existingItem = roomItems?.find((ri) => ri.standard_item_id === item.id);
        
        const update: any = {
          room_id: roomId,
          standard_item_id: item.id,
          actual_quantity: actualQty,
          notes: notes[item.id] || null,
          last_checked: new Date().toISOString(),
        };

        // Track issue detection
        if (isMissing && !existingItem?.issue_detected_at) {
          update.issue_detected_at = new Date().toISOString();
          update.issue_resolved_at = null;
        }
        
        // Track issue resolution
        if (!isMissing && existingItem?.issue_detected_at && !existingItem?.issue_resolved_at) {
          update.issue_resolved_at = new Date().toISOString();
        }

        return update;
      });

      const { error } = await (supabase as any)
        .from("room_inventory_items")
        .upsert(updates, { onConflict: "room_id,standard_item_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-inventory", roomId] });
      queryClient.invalidateQueries({ queryKey: ["inventory-dashboard"] });
      toast.success("ინვენტარი წარმატებით შენახულია");
    },
    onError: () => {
      toast.error("შეცდომა ინვენტარის შენახვისას");
    },
  });

  if (loadingStandard || loadingRoom) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const groupedItems = standardItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StandardItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ოთახი #{roomNumber} - ინვენტარის შაბლონი</h3>
          <p className="text-sm text-muted-foreground">
            შეავსეთ რეალური რაოდენობები თითოეული ნივთისთვის
          </p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />შენახვა...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />შენახვა</>
          )}
        </Button>
      </div>

      {Object.entries(groupedItems || {}).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
            <CardDescription>სტანდარტი vs რეალური რაოდენობა</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => {
                const actual = quantities[item.id] ?? item.standard_quantity;
                const isMissing = actual < item.standard_quantity;
                
                return (
                  <div key={item.id} className="flex items-center gap-4 pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        სტანდარტი: {item.standard_quantity} ცალი
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">რეალური:</label>
                        <Input
                          type="number"
                          min="0"
                          value={quantities[item.id] ?? item.standard_quantity}
                          onChange={(e) => 
                            setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 0 })
                          }
                          className={`w-20 ${isMissing ? 'border-destructive' : ''}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        <label className="text-xs text-muted-foreground">შენიშვნა:</label>
                        <Input
                          type="text"
                          placeholder="შენიშვნა..."
                          value={notes[item.id] ?? ""}
                          onChange={(e) => 
                            setNotes({ ...notes, [item.id]: e.target.value })
                          }
                          className="text-sm"
                        />
                      </div>
                      {isMissing && (
                        <span className="text-xs text-destructive font-medium whitespace-nowrap">
                          აკლია: {item.standard_quantity - actual}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
