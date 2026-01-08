import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryInventoryHistory } from "./CategoryInventoryHistory";

interface StandardItem {
  id: string;
  category: string;
  item_name: string;
  standard_quantity: number;
}

interface RoomItem {
  id: string;
  room_id: string;
  standard_item_id: string;
  actual_quantity: number;
  condition: string;
  issue_detected_at: string | null;
  issue_resolved_at: string | null;
}

interface Room {
  id: string;
  room_number: string;
}

export function AllRoomsInventory() {
  const { t } = useLanguage();

  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");

      if (error) throw error;
      return data as Room[];
    },
  });

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

  const { data: allRoomItems, isLoading: loadingItems } = useQuery({
    queryKey: ["all-room-inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_inventory_items")
        .select("*");
      if (error) throw error;
      return data as RoomItem[];
    },
  });

  if (loadingRooms || loadingStandard || loadingItems) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rooms || !standardItems) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">{t("მონაცემები ვერ მოიძებნა", "No data found")}</p>
      </Card>
    );
  }

  // Build inventory data for all items across all rooms
  const inventoryByItem: Record<string, { 
    item: StandardItem, 
    totalMissing: number,
    roomQuantities: Array<{ roomNumber: string, roomId: string, actualQty: number, isMissing: boolean }>
  }> = {};

  standardItems.forEach((item) => {
    let totalMissing = 0;
    const roomQuantities: Array<{ roomNumber: string, roomId: string, actualQty: number, isMissing: boolean }> = [];

    rooms.forEach((room) => {
      const roomItem = allRoomItems?.find(
        (ri) => ri.room_id === room.id && ri.standard_item_id === item.id
      );
      const actualQty = roomItem?.actual_quantity ?? item.standard_quantity;
      const isMissing = actualQty < item.standard_quantity;
      
      if (isMissing) {
        totalMissing += (item.standard_quantity - actualQty);
      }

      roomQuantities.push({ 
        roomNumber: room.room_number, 
        roomId: room.id,
        actualQty,
        isMissing 
      });
    });

    inventoryByItem[item.id] = { item, totalMissing, roomQuantities };
  });

  // Group by category
  const groupedInventory = Object.values(inventoryByItem).reduce((acc, data) => {
    if (!acc[data.item.category]) {
      acc[data.item.category] = [];
    }
    acc[data.item.category].push(data);
    return acc;
  }, {} as Record<string, Array<typeof inventoryByItem[string]>>);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {t("ყველა ოთახის ინვენტარი", "All Rooms Inventory")}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {t(
            "ამ სიაში ნაჩვენებია სტანდარტული ინვენტარი ყველა ოთახისთვის",
            "This list shows standard inventory for all rooms"
          )}
        </p>

        <Tabs defaultValue={Object.keys(groupedInventory)[0]} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <TabsList className="flex flex-wrap h-auto">
              {Object.keys(groupedInventory).map((category) => (
                <TabsTrigger key={category} value={category} className="text-sm">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(groupedInventory).map(([category, items]) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="flex justify-end mb-2">
                <CategoryInventoryHistory category={category} />
              </div>
              <div className="border rounded-md">
                {/* Horizontal and vertical scrollable content with visible scrollbars */}
                <div className="max-h-[600px] overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-md hover:[&::-webkit-scrollbar-thumb]:bg-primary/70">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead className="sticky left-0 z-20 bg-background min-w-[250px] border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          {t("ნივთის სახელი", "ITEM NAME")}
                        </TableHead>
                        <TableHead className="min-w-[140px] text-center bg-muted/50">
                          {t("სტანდარტი 1 ოთახი", "STANDARD 1 ROOM")}
                        </TableHead>
                        <TableHead className="min-w-[140px] text-center bg-muted/50 border-r">
                          {t("ნაკლული ჯამი", "MISSING TOTAL")}
                        </TableHead>
                        {rooms.map((room) => (
                          <TableHead key={room.id} className="min-w-[100px] text-center text-xs">
                            {room.room_number}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(({ item, totalMissing, roomQuantities }) => (
                        <TableRow key={item.id}>
                          <TableCell className="sticky left-0 z-10 bg-background font-medium border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {item.item_name}
                          </TableCell>
                          <TableCell className="text-center bg-muted/30">
                            {item.standard_quantity}
                          </TableCell>
                          <TableCell className="text-center bg-muted/30 border-r">
                            {totalMissing > 0 ? (
                              <Badge variant="destructive">{totalMissing}</Badge>
                            ) : (
                              <Badge variant="secondary">0</Badge>
                            )}
                          </TableCell>
                          {roomQuantities.map(({ roomId, actualQty, isMissing }) => (
                            <TableCell key={roomId} className="text-center">
                              <Badge 
                                variant={isMissing ? "destructive" : "secondary"}
                                className="min-w-[40px] justify-center"
                              >
                                {actualQty}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
