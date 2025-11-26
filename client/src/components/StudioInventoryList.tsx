import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoomInventoryTable } from "@/components/RoomInventoryTable";
import { AllRoomsInventory } from "@/components/AllRoomsInventory";
import { trpc } from "@/lib/trpc";

export function StudioInventoryList() {
  const { t } = useLanguage();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const { data: rooms, isLoading } = trpc.logistics.rooms.list.useQuery();

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
        <p className="text-sm text-muted-foreground">
          {t("გთხოვთ დაუკავშირდეთ ადმინისტრატორს", "Please contact administrator")}
        </p>
      </Card>
    );
  }

  const selectedRoom = rooms.find((r) => r.id.toString() === selectedRoomId);

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
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {t("ოთახი", "Room")} {room.roomNumber}
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
        <RoomInventoryTable roomId={selectedRoom.id} roomNumber={selectedRoom.roomNumber} />
      ) : null}
    </div>
  );
}
