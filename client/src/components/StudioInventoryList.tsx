import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Building2, Trash2 } from "lucide-react";
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");

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

  // Add single room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (roomNumber: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if room already exists
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("room_number", roomNumber)
        .single();

      if (existing) {
        throw new Error("ოთახი უკვე არსებობს / Room already exists");
      }

      const { error } = await supabase.from("rooms").insert({
        user_id: user.id,
        room_number: roomNumber.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(t("ოთახი დაემატა!", "Room added successfully!"));
      setNewRoomNumber("");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      // First delete related inventory items
      await supabase.from("room_inventory_items").delete().eq("room_id", roomId);
      // Then delete housekeeping schedules
      await supabase.from("housekeeping_schedules").delete().eq("room_id", roomId);
      // Then delete maintenance schedules
      await supabase.from("maintenance_schedules").delete().eq("room_id", roomId);
      // Finally delete the room
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(t("ოთახი წაიშალა", "Room deleted"));
      setSelectedRoomId("");
    },
    onError: (error) => {
      toast.error(t("შეცდომა", "Error") + ": " + error.message);
    },
  });

  const handleAddRoom = () => {
    if (!newRoomNumber.trim()) {
      toast.error(t("შეიყვანეთ ოთახის ნომერი", "Please enter room number"));
      return;
    }
    addRoomMutation.mutate(newRoomNumber);
  };

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
          <div className="flex items-center justify-between">
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

            {/* Add Room Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("ახალი აპარტამენტი", "New Apartment")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-500" />
                    {t("ახალი აპარტამენტის დამატება", "Add New Apartment")}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "შეიყვანეთ ახალი აპარტამენტის ნომერი (მაგ: A 1234, C 5678)",
                      "Enter the new apartment number (e.g., A 1234, C 5678)"
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="roomNumber">
                      {t("აპარტამენტის ნომერი", "Apartment Number")}
                    </Label>
                    <Input
                      id="roomNumber"
                      placeholder="A 1234"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
                      className="text-lg font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t("გაუქმება", "Cancel")}
                  </Button>
                  <Button
                    onClick={handleAddRoom}
                    disabled={addRoomMutation.isPending || !newRoomNumber.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    {addRoomMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {t("დამატება", "Add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

            {/* Room count badge */}
            <span className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {t("სულ", "Total")}: {rooms.length} {t("აპარტამენტი", "apartments")}
            </span>

            {/* Delete room button - only show when a specific room is selected */}
            {selectedRoomId && selectedRoomId !== "all" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(t("დარწმუნებული ხართ? ეს წაშლის ოთახს და მის ყველა მონაცემს.", "Are you sure? This will delete the room and all its data."))) {
                    deleteRoomMutation.mutate(selectedRoomId);
                  }
                }}
                disabled={deleteRoomMutation.isPending}
              >
                {deleteRoomMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
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
