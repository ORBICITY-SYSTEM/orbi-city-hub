import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, History } from "lucide-react";
import { RoomInventoryForm } from "./RoomInventoryForm";
import { RoomInventoryHistory } from "./RoomInventoryHistory";
import { RoomInventoryTemplate } from "./RoomInventoryTemplate";
import { AllRoomsInventory } from "./AllRoomsInventory";
import { toast } from "sonner";
import { format } from "date-fns";

export const RoomInventoryManagement = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>("ყველა ოთახი");
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const queryClient = useQueryClient();

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Sort rooms by block (A, C, D) and then by number
      return data?.sort((a, b) => {
        const [blockA, numA] = [a.room_number.charAt(0), a.room_number.slice(1).trim()];
        const [blockB, numB] = [b.room_number.charAt(0), b.room_number.slice(1).trim()];
        
        if (blockA !== blockB) return blockA.localeCompare(blockB);
        
        const parseNum = (str: string) => {
          const match = str.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        
        return parseNum(numA) - parseNum(numB);
      }) || [];
    },
  });

  const { data: latestDescription } = useQuery({
    queryKey: ["latest-description", selectedRoomId],
    queryFn: async () => {
      if (!selectedRoomId || selectedRoomId === "all") return null;

      const { data, error } = await supabase
        .from("room_inventory_descriptions")
        .select("*")
        .eq("room_id", selectedRoomId)
        .order("description_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedRoomId && selectedRoomId !== "all",
  });

  const createRoomsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Room numbers organized by blocks in ascending order
      const roomNumbers = [
        // A Block
        "A 1033", "A 1258", "A 1301", "A 1806", "A 1833", "A 2035", "A 2441", 
        "A 3035", "A 3041", "A 4022-4024", "A 4023-4025", "A 4026", "A 4027", 
        "A 4029", "A 4035",
        // C Block
        "C 1256", "C 1421", "C 2107", "C 2520", "C 2522", "C 2524", "C 2529", 
        "C 2547", "C 2558", "C 2609", "C 2637", "C 2641", "C 2847", "C 2861", 
        "C 2921", "C 2923", "C 2936", "C 2947", "C 2961", "C 3421", "C 3423", 
        "C 3425", "C 3428", "C 3431", "C 3437", "C 3439", "C 3441", "C 3611", 
        "C 3834", "C 3928", "C 3937", "C 4011", "C 4638", "C 4704", "C 4706",
        // D Block
        "D 3414", "D 3416", "D 3418", "D 3727"
      ].map(num => ({
        room_number: num,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from("rooms")
        .insert(roomNumbers);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("51 სტუდიო წარმატებით შეიქმნა");
    },
    onError: () => {
      toast.error("შეცდომა ოთახების შექმნისას");
    },
  });

  useEffect(() => {
    if (rooms && rooms.length === 0) {
      createRoomsMutation.mutate();
    }
  }, [rooms]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Studio Inventory Management</CardTitle>
          <CardDescription>
            Select a room to view and update its inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium min-w-[100px]">Select Room:</label>
              <Select
                value={selectedRoomId} 
                onValueChange={(value) => {
                  setSelectedRoomId(value);
                  const room = rooms?.find(r => r.id === value);
                  setSelectedRoomNumber(value === "all" ? "ყველა ოთახი" : room?.room_number || "");
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Room Number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room #{room.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoomId && selectedRoomId !== "all" && latestDescription && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">ბოლო აღწერა:</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(latestDescription.description_date), "dd/MM/yyyy HH:mm")}
                    </p>
                    {latestDescription.change_type && (
                      <p className="text-sm">
                        <span className="font-medium">ტიპი:</span> {latestDescription.change_type}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedRoomId && selectedRoomId !== "all" && (
              <div className="flex gap-2">
                <Button onClick={() => setShowTemplate(true)} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  ინვენტარის შაბლონი
                </Button>
                <Button onClick={() => setShowForm(true)} variant="outline" className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  ცვლილების აღწერა
                </Button>
                <Button onClick={() => setShowHistory(true)} variant="outline" className="flex-1">
                  <History className="mr-2 h-4 w-4" />
                  ისტორია
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRoomId === "all" && <AllRoomsInventory />}

      {showTemplate && selectedRoomId && selectedRoomId !== "all" && (
        <RoomInventoryTemplate
          roomId={selectedRoomId}
          roomNumber={selectedRoomNumber}
        />
      )}

      {showForm && selectedRoomId && selectedRoomId !== "all" && (
        <RoomInventoryForm
          roomId={selectedRoomId}
          onClose={() => setShowForm(false)}
        />
      )}

      {showHistory && selectedRoomId && selectedRoomId !== "all" && (
        <RoomInventoryHistory
          roomId={selectedRoomId}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};