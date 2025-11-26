import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface MissingItem {
  category: string;
  item_name: string;
  standard_quantity: number;
  rooms_with_issues: Array<{
    room_number: string;
    actual_quantity: number;
    missing_count: number;
  }>;
  total_missing: number;
}

export function InventoryDashboardStats() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Set up realtime subscriptions for data updates
  useEffect(() => {
    console.log('Setting up realtime subscriptions for dashboard...');
    
    const roomsChannel = supabase
      .channel('dashboard-rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        console.log('Rooms changed - invalidating queries:', payload);
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      })
      .subscribe();

    const inventoryChannel = supabase
      .channel('dashboard-inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_inventory_items' }, (payload) => {
        console.log('Room inventory changed - invalidating queries:', payload);
        queryClient.invalidateQueries({ queryKey: ["all-room-inventory-items"] });
      })
      .subscribe();

    const housekeepingChannel = supabase
      .channel('dashboard-housekeeping-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'housekeeping_schedules' }, (payload) => {
        console.log('Housekeeping changed - invalidating queries:', payload);
        queryClient.invalidateQueries({ queryKey: ["housekeeping-schedules-stats"] });
      })
      .subscribe();

    const maintenanceChannel = supabase
      .channel('dashboard-maintenance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_schedules' }, (payload) => {
        console.log('Maintenance changed - invalidating queries:', payload);
        queryClient.invalidateQueries({ queryKey: ["maintenance-schedules-stats"] });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions...');
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(housekeepingChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, [queryClient]);

  const { data: housekeepingSchedules = [], isLoading: isLoadingHousekeeping } = useQuery({
    queryKey: ["housekeeping-schedules-stats"],
    queryFn: async () => {
      console.log('Fetching housekeeping schedules...');
      const { data, error } = await supabase
        .from("housekeeping_schedules")
        .select("*");

      if (error) {
        console.error('Error fetching housekeeping schedules:', error);
        throw error;
      }
      console.log('Housekeeping schedules fetched:', data?.length);
      return data || [];
    },
  });

  const { data: maintenanceSchedules = [], isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["maintenance-schedules-stats"],
    queryFn: async () => {
      console.log('Fetching maintenance schedules...');
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .select("*");

      if (error) {
        console.error('Error fetching maintenance schedules:', error);
        throw error;
      }
      console.log('Maintenance schedules fetched:', data?.length);
      return data || [];
    },
  });

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      console.log('Fetching rooms...');
      const { data, error } = await supabase
        .from("rooms")
        .select("*");

      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }
      console.log('Rooms fetched:', data?.length);
      return data || [];
    },
  });

  const { data: standardItems = [], isLoading: isLoadingStandardItems } = useQuery({
    queryKey: ["standard-inventory-items"],
    queryFn: async () => {
      console.log('Fetching standard items...');
      const { data, error } = await supabase
        .from("standard_inventory_items")
        .select("*");
      if (error) {
        console.error('Error fetching standard items:', error);
        throw error;
      }
      console.log('Standard items fetched:', data?.length);
      return data || [];
    },
  });

  const { data: allRoomItems = [], isLoading: isLoadingRoomItems } = useQuery({
    queryKey: ["all-room-inventory-items"],
    queryFn: async () => {
      console.log('Fetching room inventory items...');
      const { data, error } = await supabase
        .from("room_inventory_items")
        .select("*");
      if (error) {
        console.error('Error fetching room items:', error);
        throw error;
      }
      console.log('Room items fetched:', data?.length);
      return data || [];
    },
  });

  const isLoading = isLoadingHousekeeping || isLoadingMaintenance || isLoadingRooms || isLoadingStandardItems || isLoadingRoomItems;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  console.log('Dashboard Stats - Data loaded:', {
    rooms: rooms.length,
    standardItems: standardItems.length,
    allRoomItems: allRoomItems.length,
    housekeeping: housekeepingSchedules.length,
    maintenance: maintenanceSchedules.length
  });

  // Calculate missing items
  const missingItems: MissingItem[] = [];
  const roomsWithIssues = new Set<string>();

  standardItems.forEach((item) => {
    const roomsWithMissing: Array<{
      room_number: string;
      actual_quantity: number;
      missing_count: number;
    }> = [];
    let totalMissing = 0;

    rooms.forEach((room) => {
      const roomItem = allRoomItems.find(
        (ri) => ri.room_id === room.id && ri.standard_item_id === item.id
      );
      const actualQty = roomItem?.actual_quantity ?? item.standard_quantity;

      if (actualQty < item.standard_quantity) {
        const missingCount = item.standard_quantity - actualQty;
        roomsWithMissing.push({
          room_number: room.room_number,
          actual_quantity: actualQty,
          missing_count: missingCount,
        });
        totalMissing += missingCount;
        roomsWithIssues.add(room.room_number);
      }
    });

    if (roomsWithMissing.length > 0) {
      missingItems.push({
        category: item.category,
        item_name: item.item_name,
        standard_quantity: item.standard_quantity,
        rooms_with_issues: roomsWithMissing,
        total_missing: totalMissing,
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
  const missingByRoom: Record<string, Array<{ item_name: string; missing_count: number }>> = {};
  missingItems.forEach((item) => {
    item.rooms_with_issues.forEach((room) => {
      if (!missingByRoom[room.room_number]) {
        missingByRoom[room.room_number] = [];
      }
      missingByRoom[room.room_number].push({
        item_name: item.item_name,
        missing_count: room.missing_count,
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
  const totalMaintenanceCost = maintenanceSchedules?.reduce((sum, s) => sum + (Number(s.cost) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("სულ ოთახები", "Total Rooms")}
              </p>
              <p className="text-2xl font-bold">{totalRooms}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("რეგულარული ოთახები", "Rooms OK")}
              </p>
              <p className="text-2xl font-bold">{roomsOK}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ოთახები პრობლემებით", "Rooms with Issues")}
              </p>
              <p className="text-2xl font-bold">{roomsWithIssues.size}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Housekeeping & Maintenance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {t("დასუფთავება", "Housekeeping")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("სულ დავალებები", "Total Tasks")}</span>
              <span className="font-semibold">{totalHousekeepingTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("შესრულებული", "Completed")}</span>
              <span className="font-semibold text-green-600">{completedHousekeepingTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("მიმდინარე", "Pending")}</span>
              <span className="font-semibold text-yellow-600">{pendingHousekeepingTasks}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            {t("ტექნიკური", "Maintenance")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("სულ დავალებები", "Total Tasks")}</span>
              <span className="font-semibold">{totalMaintenanceTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("შესრულებული", "Completed")}</span>
              <span className="font-semibold text-green-600">{completedMaintenanceTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("მიმდინარე", "Pending")}</span>
              <span className="font-semibold text-yellow-600">{pendingMaintenanceTasks}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-sm text-muted-foreground">{t("სულ ხარჯი", "Total Cost")}</span>
              <span className="font-semibold">{totalMaintenanceCost.toFixed(2)} ₾</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Missing Items by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {t("დანაკლისი ნივთები კატეგორიების მიხედვით", "Missing Items by Category")}
        </h3>
        <div className="space-y-4">
          {Object.entries(missingByCategory).map(([category, items]) => (
            <div key={category} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-primary">{category}</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.item_name} className="flex items-center justify-between text-sm">
                    <span>{item.item_name}</span>
                    <Badge variant="destructive">
                      {t("ნაკლი", "Missing")}: {item.total_missing}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(missingByCategory).length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p>{t("ყველა ნივთი სრულყოფილია!", "All items are complete!")}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Missing Items by Room */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          {t("დანაკლისი ნივთები ოთახების მიხედვით", "Missing Items by Room")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(missingByRoom)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([roomNumber, items]) => (
              <Card key={roomNumber} className="p-4 border-destructive/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{roomNumber}</h4>
                  <Badge variant="destructive">{items.length}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-muted-foreground truncate">{item.item_name}</span>
                      <span className="text-destructive font-medium">-{item.missing_count}</span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-muted-foreground text-xs pt-1">
                      +{items.length - 3} {t("მეტი", "more")}
                    </div>
                  )}
                </div>
              </Card>
            ))}
        </div>
        {Object.keys(missingByRoom).length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
            <p>{t("ყველა ოთახი სრულყოფილია!", "All rooms are complete!")}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
