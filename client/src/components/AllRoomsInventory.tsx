import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryInventoryHistory } from "./CategoryInventoryHistory";
import { trpc } from "@/lib/trpc";

interface StandardItem {
  id: number;
  category: string;
  itemName: string;
  standardQuantity: number;
}

interface RoomItem {
  id: number;
  roomId: number;
  standardItemId: number;
  actualQuantity: number;
  condition: string;
  issueDetectedAt: Date | null;
  issueResolvedAt: Date | null;
}

interface Room {
  id: number;
  roomNumber: string;
}

export function AllRoomsInventory() {
  const { t } = useLanguage();

  const { data: rooms, isLoading: loadingRooms } = trpc.logistics.rooms.list.useQuery();
  const { data: standardItems, isLoading: loadingStandard } = trpc.logistics.standardItems.list.useQuery();
  const { data: allRoomItems, isLoading: loadingItems } = trpc.logistics.roomInventory.list.useQuery();

  if (loadingRooms || loadingStandard || loadingItems) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rooms || !standardItems || !allRoomItems) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          {t("მონაცემები ვერ მოიძებნა", "Data not found")}
        </p>
      </Card>
    );
  }

  // Group items by category
  const categories = Array.from(new Set(standardItems.map((item) => item.category)));

  // Helper function to get item status for a room
  const getItemStatus = (roomId: number, standardItemId: number) => {
    const roomItem = allRoomItems.find(
      (item) => item.roomId === roomId && item.standardItemId === standardItemId
    );

    if (!roomItem) {
      return { status: "missing", quantity: 0, condition: "missing" };
    }

    const standardItem = standardItems.find((item) => item.id === standardItemId);
    const standardQty = standardItem?.standardQuantity || 0;

    if (roomItem.actualQuantity < standardQty) {
      return { status: "incomplete", quantity: roomItem.actualQuantity, condition: roomItem.condition };
    }

    if (roomItem.condition === "poor" || roomItem.condition === "fair") {
      return { status: "warning", quantity: roomItem.actualQuantity, condition: roomItem.condition };
    }

    return { status: "complete", quantity: roomItem.actualQuantity, condition: roomItem.condition };
  };

  // Helper function to get badge variant
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "complete":
        return "default";
      case "incomplete":
        return "secondary";
      case "warning":
        return "destructive";
      case "missing":
        return "outline";
      default:
        return "outline";
    }
  };

  // Helper function to get badge text
  const getBadgeText = (status: string, quantity: number, condition: string) => {
    if (status === "missing") {
      return t("ნაკლული", "Missing");
    }
    if (status === "incomplete") {
      return `${quantity} ${t("ნაკლული", "Missing")}`;
    }
    if (status === "warning") {
      return t(condition === "poor" ? "ცუდი" : "საშუალო", condition === "poor" ? "Poor" : "Fair");
    }
    return t("კარგი", "Good");
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {t("ყველა ოთახის ინვენტარი", "All Rooms Inventory")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("ყველა ოთახის ინვენტარის მიმოხილვა", "Overview of inventory across all rooms")}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">{t("მიმოხილვა", "Overview")}</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {t(category, category)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-background">
                      {t("ოთახი", "Room")}
                    </TableHead>
                    {standardItems.map((item) => (
                      <TableHead key={item.id} className="text-center min-w-[120px]">
                        {t(item.itemName, item.itemName)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="sticky left-0 z-10 bg-background font-medium">
                        {room.roomNumber}
                      </TableCell>
                      {standardItems.map((item) => {
                        const status = getItemStatus(room.id, item.id);
                        return (
                          <TableCell key={item.id} className="text-center">
                            <Badge variant={getBadgeVariant(status.status)}>
                              {getBadgeText(status.status, status.quantity, status.condition)}
                            </Badge>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="default">{t("კარგი", "Good")}</Badge>
                <span>{t("ყველაფერი რიგზეა", "All good")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t("ნაკლული", "Missing")}</Badge>
                <span>{t("რაოდენობა არასაკმარისია", "Quantity insufficient")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{t("ცუდი", "Poor")}</Badge>
                <span>{t("მდგომარეობა ცუდია", "Condition poor")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t("ნაკლული", "Missing")}</Badge>
                <span>{t("ნივთი არ არის", "Item missing")}</span>
              </div>
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <CategoryInventoryHistory category={category} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
}
