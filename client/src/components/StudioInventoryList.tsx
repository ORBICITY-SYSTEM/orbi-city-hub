import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoomInventoryTable } from "@/components/RoomInventoryTable";
import { AllRoomsInventory } from "@/components/AllRoomsInventory";

interface Room {
  id: string;
  room_number: string;
}

export function StudioInventoryList() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const { data: rooms, isLoading } = useQuery({
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

  const createRoomsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const roomNumbers = [
        'A 1821', 'A 1033', 'A 1806', 'A 2035', 'C 2936', 'C 3834', 'C 3928',
        'C 4638', 'C 2107', 'C 2529', 'C 2609', 'C 3611', 'C 4011', 'C 4704',
        'C 3421', 'C 3423', 'C 3425', 'C 3428', 'C 3431', 'C 3437', 'C 3439',
        'C 3441', 'A 1301', 'C 2921', 'C 2923', 'C 2558', 'D1 3414', 'D1 3416',
        'D1 3418', 'A 4035', 'C 2522', 'A 1258', 'C 2524', 'C 2520', 'C 2547',
        'C 1256', 'C 2861', 'C 2961', 'C 2847', 'C 2947', 'A 3041', 'A 3035',
        'A 1833', 'A 2441', 'D2 3727', 'C 3937', 'C 2641', 'C 4706', 'A 4023',
        'A 4025', 'A 4027', 'A 4029', 'A 4024', 'A 4022', 'A 4026', 'C 2637'
      ];

      const roomsToInsert = roomNumbers.map((num) => ({
        user_id: user.id,
        room_number: num,
      }));

      const { error } = await supabase.from("rooms").insert(roomsToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(t("ოთახები შეიქმნა", "Rooms created successfully"));
    },
    onError: (error) => {
      toast.error(t("შეცდომა", "Error") + ": " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          {t("ოთახები ვერ მოიძებნა", "No rooms found")}
        </p>
        <Button onClick={() => createRoomsMutation.mutate()} disabled={createRoomsMutation.isPending}>
          {createRoomsMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {t("შექმენი 56 ოთახი", "Create 56 Rooms")}
        </Button>
      </Card>
    );
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {t("სტუდიოს ინვენტარის მართვა", "Studio Inventory Management")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "აირჩიეთ ოთახი ინვენტარის დასათვალიერებლად და განსაახლებლად",
                "Select a room to view and update its inventory"
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">{t("აირჩიეთ ოთახი", "Select Room")}:</label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("ოთახის ნომერი", "Room Number")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა ოთახი", "All Rooms")}</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {t("ოთახი", "Room")} {room.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {selectedRoomId === "all" ? (
        <AllRoomsInventory />
      ) : selectedRoom ? (
        <RoomInventoryTable roomId={selectedRoom.id} roomNumber={selectedRoom.room_number} />
      ) : null}
    </div>
  );
}
