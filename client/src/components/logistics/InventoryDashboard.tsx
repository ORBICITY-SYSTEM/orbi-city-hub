import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface MissingItem {
  room_number: string;
  category: string;
  item_name: string;
  standard_quantity: number;
  actual_quantity: number;
  missing: number;
  issue_detected_at: string | null;
  issue_resolved_at: string | null;
}

export const InventoryDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["inventory-dashboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get all rooms and sort by block and number
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .eq("user_id", user.id);

      // Sort rooms by block (A, C, D) and then by number
      const sortedRooms = rooms?.sort((a, b) => {
        const [blockA, numA] = [a.room_number.charAt(0), a.room_number.slice(1).trim()];
        const [blockB, numB] = [b.room_number.charAt(0), b.room_number.slice(1).trim()];
        
        if (blockA !== blockB) return blockA.localeCompare(blockB);
        
        const parseNum = (str: string) => {
          const match = str.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        
        return parseNum(numA) - parseNum(numB);
      });

      if (roomsError) throw roomsError;

      // Get standard items using raw query to bypass types
      const { data: standardItems, error: standardError } = await (supabase as any)
        .from("standard_inventory_items")
        .select("*");

      if (standardError) throw standardError;

      // Get all room inventory items using raw query
      const { data: roomInventory, error: inventoryError } = await (supabase as any)
        .from("room_inventory_items")
        .select("*, room_id");

      if (inventoryError) throw inventoryError;

      // Calculate missing items
      const missingItems: MissingItem[] = [];
      const categoryStats: Record<string, { total: number; missing: number }> = {};

      sortedRooms?.forEach((room: any) => {
        standardItems?.forEach((standard: any) => {
          const roomItem = roomInventory?.find(
            (ri: any) => ri.room_id === room.id && ri.standard_item_id === standard.id
          );
          
          const actual = roomItem?.actual_quantity ?? 0;
          const missing = standard.standard_quantity - actual;

          if (missing > 0) {
            missingItems.push({
              room_number: room.room_number,
              category: standard.category,
              item_name: standard.item_name,
              standard_quantity: standard.standard_quantity,
              actual_quantity: actual,
              missing,
              issue_detected_at: roomItem?.issue_detected_at || null,
              issue_resolved_at: roomItem?.issue_resolved_at || null,
            });
          }

          // Update category stats
          if (!categoryStats[standard.category]) {
            categoryStats[standard.category] = { total: 0, missing: 0 };
          }
          categoryStats[standard.category].total += standard.standard_quantity;
          categoryStats[standard.category].missing += missing;
        });
      });

      return {
        rooms: sortedRooms || [],
        missingItems,
        categoryStats,
        totalMissingItems: missingItems.reduce((sum, item) => sum + item.missing, 0),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const groupedByRoom = dashboardData?.missingItems.reduce((acc, item) => {
    if (!acc[item.room_number]) {
      acc[item.room_number] = [];
    }
    acc[item.room_number].push(item);
    return acc;
  }, {} as Record<string, MissingItem[]>);

  // Sort rooms by block
  const sortedRoomEntries = Object.entries(groupedByRoom || {}).sort((a, b) => {
    const [blockA, numA] = [a[0].charAt(0), a[0].slice(1).trim()];
    const [blockB, numB] = [b[0].charAt(0), b[0].slice(1).trim()];
    
    if (blockA !== blockB) return blockA.localeCompare(blockB);
    
    const parseNum = (str: string) => {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    
    return parseNum(numA) - parseNum(numB);
  });

  const groupedByCategory = dashboardData?.missingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MissingItem[]>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">სულ ოთახები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.rooms.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">სულ აკლია</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {dashboardData?.totalMissingItems || 0} ცალი
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ოთახები პრობლემებით</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {Object.keys(groupedByRoom || {}).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">კატეგორიები პრობლემებით</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(dashboardData?.categoryStats || {}).filter(
                (cat) => dashboardData?.categoryStats[cat].missing > 0
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-room" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="by-room">ოთახების მიხედვით</TabsTrigger>
          <TabsTrigger value="by-category">კატეგორიების მიხედვით</TabsTrigger>
          <TabsTrigger value="statistics">სტატისტიკა</TabsTrigger>
        </TabsList>

        <TabsContent value="by-room">
          <Card>
            <CardHeader>
              <CardTitle>დაკარგული ნივთები ოთახების მიხედვით</CardTitle>
              <CardDescription>რა აკლია თითოეულ ოთახში</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {sortedRoomEntries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    ყველა ოთახში ყველაფერი სრულად არის! 🎉
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sortedRoomEntries.map(([roomNumber, items]) => (
                      <Card key={roomNumber}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">ოთახი #{roomNumber}</CardTitle>
                            <Badge variant="destructive">
                              {items.reduce((sum, item) => sum + item.missing, 0)} ცალი აკლია
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {items.map((item, idx) => {
                              const isResolved = item.issue_resolved_at !== null;
                              return (
                                <div key={idx} className="flex flex-col gap-1 p-2 rounded-lg border">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{item.item_name}</span>
                                    <span className={`font-medium ${isResolved ? 'text-success' : 'text-destructive'}`}>
                                      -{item.missing} ({item.actual_quantity}/{item.standard_quantity})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {item.issue_detected_at && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>აღმოჩენილი: {format(new Date(item.issue_detected_at), 'dd/MM/yyyy HH:mm')}</span>
                                      </div>
                                    )}
                                    {item.issue_resolved_at && (
                                      <div className="flex items-center gap-1 text-success">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>მოგვარებული: {format(new Date(item.issue_resolved_at), 'dd/MM/yyyy HH:mm')}</span>
                                      </div>
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
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-category">
          <Card>
            <CardHeader>
              <CardTitle>დაკარგული ნივთები კატეგორიების მიხედვით</CardTitle>
              <CardDescription>რა აკლია თითოეული კატეგორიის ჭრილში</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {Object.entries(groupedByCategory || {}).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    ყველა ნივთი სრულად არის! 🎉
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedByCategory || {}).map(([category, items]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{category}</CardTitle>
                            <Badge variant="destructive">
                              სულ: {items.reduce((sum, item) => sum + item.missing, 0)} ცალი
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {items.map((item, idx) => {
                              const isResolved = item.issue_resolved_at !== null;
                              return (
                                <div key={idx} className="flex flex-col gap-1 p-2 rounded-lg border">
                                  <div className="flex items-center justify-between">
                                    <span>
                                      <span className="font-medium">{item.item_name}</span>
                                      <span className="text-muted-foreground text-xs ml-2">(ოთახი #{item.room_number})</span>
                                    </span>
                                    <span className={`font-medium ${isResolved ? 'text-success' : 'text-destructive'}`}>
                                      -{item.missing}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {item.issue_detected_at && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>აღმოჩენილი: {format(new Date(item.issue_detected_at), 'dd/MM/yyyy HH:mm')}</span>
                                      </div>
                                    )}
                                    {item.issue_resolved_at && (
                                      <div className="flex items-center gap-1 text-success">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>მოგვარებული: {format(new Date(item.issue_resolved_at), 'dd/MM/yyyy HH:mm')}</span>
                                      </div>
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
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>დეტალური სტატისტიკა</CardTitle>
              <CardDescription>კატეგორიების მიხედვით ჯამური მდგომარეობა</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {Object.entries(dashboardData?.categoryStats || {}).map(([category, stats]) => {
                    const completionRate = ((stats.total - stats.missing) / stats.total * 100).toFixed(1);
                    
                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">სრულყოფილება:</span>
                              <span className="font-medium">{completionRate}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">სულ უნდა იყოს:</span>
                              <span className="font-medium">{stats.total} ცალი</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">აკლია:</span>
                              <span className="font-medium text-destructive">{stats.missing} ცალი</span>
                            </div>
                            {stats.missing > 0 && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 rounded text-xs">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <span>საჭიროა შევსება</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
