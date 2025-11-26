import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface MissingItem {
  category: string;
  itemName: string;
  standardQuantity: number;
  roomsWithIssues: Array<{
    roomNumber: string;
    actualQuantity: number;
    missingCount: number;
  }>;
  totalMissing: number;
}

export function InventoryDashboardStats() {
  const { t } = useLanguage();

  const { data: housekeepingSchedules = [], isLoading: isLoadingHousekeeping } = 
    trpc.logistics.housekeeping.list.useQuery();

  const { data: maintenanceSchedules = [], isLoading: isLoadingMaintenance } = 
    trpc.logistics.maintenance.list.useQuery();

  const { data: rooms = [], isLoading: isLoadingRooms } = 
    trpc.logistics.rooms.list.useQuery();

  const { data: standardItems = [], isLoading: isLoadingStandardItems } = 
    trpc.logistics.standardItems.list.useQuery();

  const { data: allRoomItems = [], isLoading: isLoadingRoomItems } = 
    trpc.logistics.roomInventory.list.useQuery();

  const isLoading = isLoadingHousekeeping || isLoadingMaintenance || isLoadingRooms || isLoadingStandardItems || isLoadingRoomItems;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate missing items
  const missingItems: MissingItem[] = [];
  const roomsWithIssues = new Set<string>();

  standardItems.forEach((item) => {
    const roomsWithMissing: Array<{
      roomNumber: string;
      actualQuantity: number;
      missingCount: number;
    }> = [];
    let totalMissing = 0;

    rooms.forEach((room) => {
      const roomItem = allRoomItems.find(
        (ri) => ri.roomId === room.id && ri.standardItemId === item.id
      );
      const actualQty = roomItem?.actualQuantity ?? item.standardQuantity;

      if (actualQty < item.standardQuantity) {
        const missingCount = item.standardQuantity - actualQty;
        roomsWithMissing.push({
          roomNumber: room.roomNumber,
          actualQuantity: actualQty,
          missingCount: missingCount,
        });
        totalMissing += missingCount;
        roomsWithIssues.add(room.roomNumber);
      }
    });

    if (roomsWithMissing.length > 0) {
      missingItems.push({
        category: item.category,
        itemName: item.itemName,
        standardQuantity: item.standardQuantity,
        roomsWithIssues: roomsWithMissing,
        totalMissing: totalMissing,
      });
    }
  });

  // Group by category
  const missingByCategory = missingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MissingItem[]>);

  // Group by room
  const missingByRoom: Record<string, Array<{ itemName: string; missingCount: number }>> = {};
  missingItems.forEach((item) => {
    item.roomsWithIssues.forEach((room) => {
      if (!missingByRoom[room.roomNumber]) {
        missingByRoom[room.roomNumber] = [];
      }
      missingByRoom[room.roomNumber].push({
        itemName: item.itemName,
        missingCount: room.missingCount,
      });
    });
  });

  const totalRooms = rooms.length;
  const roomsOK = totalRooms - roomsWithIssues.size;

  // Calculate housekeeping stats
  const totalHousekeepingTasks = housekeepingSchedules?.length || 0;
  const completedHousekeepingTasks = housekeepingSchedules?.filter(s => s.status === 'completed').length || 0;
  const pendingHousekeepingTasks = totalHousekeepingTasks - completedHousekeepingTasks;

  // Calculate maintenance stats
  const totalMaintenanceTasks = maintenanceSchedules?.length || 0;
  const completedMaintenanceTasks = maintenanceSchedules?.filter(s => s.status === 'completed').length || 0;
  const pendingMaintenanceTasks = totalMaintenanceTasks - completedMaintenanceTasks;
  const totalMaintenanceCost = maintenanceSchedules?.reduce((sum, s) => sum + (Number(s.actualCost || s.estimatedCost) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("სულ ოთახები", "Total Rooms")}</p>
              <p className="text-3xl font-bold mt-2">{totalRooms}</p>
            </div>
            <Package className="h-10 w-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("ოთახები რიგზე", "Rooms OK")}</p>
              <p className="text-3xl font-bold mt-2 text-success">{roomsOK}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("ოთახები პრობლემით", "Rooms with Issues")}</p>
              <p className="text-3xl font-bold mt-2 text-destructive">{roomsWithIssues.size}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("ნაკლული ნივთები", "Missing Items")}</p>
              <p className="text-3xl font-bold mt-2 text-warning">{missingItems.length}</p>
            </div>
            <Package className="h-10 w-10 text-warning" />
          </div>
        </Card>
      </div>

      {/* Housekeeping & Maintenance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("დასუფთავება", "Housekeeping")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("სულ დავალებები", "Total Tasks")}</span>
              <Badge variant="outline">{totalHousekeepingTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("დასრულებული", "Completed")}</span>
              <Badge variant="default">{completedHousekeepingTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("მიმდინარე", "Pending")}</span>
              <Badge variant="secondary">{pendingHousekeepingTasks}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("ტექნიკური", "Maintenance")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("სულ დავალებები", "Total Tasks")}</span>
              <Badge variant="outline">{totalMaintenanceTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("დასრულებული", "Completed")}</span>
              <Badge variant="default">{completedMaintenanceTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("მიმდინარე", "Pending")}</span>
              <Badge variant="secondary">{pendingMaintenanceTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("ხარჯი", "Cost")}</span>
              <Badge variant="destructive">₾{totalMaintenanceCost.toFixed(2)}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Missing Items by Category */}
      {Object.keys(missingByCategory).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("ნაკლული ნივთები კატეგორიებით", "Missing Items by Category")}
          </h3>
          <div className="space-y-4">
            {Object.entries(missingByCategory).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-semibold text-primary">{t(category, category)}</h4>
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{t(item.itemName, item.itemName)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("ნაკლული", "Missing")}: {item.totalMissing} {t("ნივთი", "items")} • {item.roomsWithIssues.length} {t("ოთახში", "rooms")}
                      </p>
                    </div>
                    <Badge variant="destructive">{item.totalMissing}</Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Rooms with Issues */}
      {Object.keys(missingByRoom).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("ოთახები პრობლემით", "Rooms with Issues")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(missingByRoom).map(([roomNumber, items]) => (
              <Card key={roomNumber} className="p-4 border-destructive/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{t("ოთახი", "Room")} {roomNumber}</h4>
                  <Badge variant="destructive">{items.length}</Badge>
                </div>
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      • {t(item.itemName, item.itemName)}: -{item.missingCount}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* All OK Message */}
      {missingItems.length === 0 && (
        <Card className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-success mb-2">
            {t("ყველაფერი რიგზეა!", "Everything is OK!")}
          </h3>
          <p className="text-muted-foreground">
            {t("ყველა ოთახის ინვენტარი სრულია", "All rooms have complete inventory")}
          </p>
        </Card>
      )}
    </div>
  );
}
