import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoomInventoryTable } from "@/components/RoomInventoryTable";
import { AllRoomsInventory } from "@/components/AllRoomsInventory";
import { trpc } from "@/lib/trpc";

export function StudioInventoryList() {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const { data: rooms, isLoading } = trpc.logistics.rooms.list.useQuery();

  const createRoomsMutation = trpc.logistics.rooms.createBulk.useMutation({
    onSuccess: () => {
      utils.logistics.rooms.list.invalidate();
      toast.success(t("ოთახები შეიქმნა", "Rooms created"));
    },
    onError: () => {
      toast.error(t("შეცდომა ოთახების შექმნისას", "Error creating rooms"));
    },
  });

  const handleCreateRooms = () => {
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
    createRoomsMutation.mutate({ roomNumbers });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedRoom = rooms?.find((r) => r.id.toString() === selectedRoomId);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("აირჩიეთ ოთახი", "Select room")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("ყველა ოთახი", "All rooms")}</SelectItem>
                {rooms?.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(!rooms || rooms.length === 0) && (
            <Button
              onClick={handleCreateRooms}
              disabled={createRoomsMutation.isPending}
              className="gap-2"
            >
              {createRoomsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("ოთახების შექმნა", "Create Rooms")}
            </Button>
          )}
        </div>

        {selectedRoomId ? (
          <RoomInventoryTable roomId={selectedRoomId} roomNumber={selectedRoom?.roomNumber || ""} />
        ) : (
          <AllRoomsInventory rooms={rooms || []} />
        )}
      </Card>
    </div>
  );
}
