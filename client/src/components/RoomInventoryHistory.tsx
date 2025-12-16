import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { X } from "lucide-react";

interface RoomInventoryHistoryProps {
  roomId: string;
  onClose: () => void;
}

export const RoomInventoryHistory = ({ roomId, onClose }: RoomInventoryHistoryProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ["room-history", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_inventory_descriptions")
        .select("*")
        .eq("room_id", roomId)
        .order("description_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getChangeTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "შეცვლა/გატეხვა":
        return "destructive";
      case "დაკარგვა":
        return "secondary";
      case "ნომრიდან ნომერში გადატანა":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>აღწერების ისტორია</CardTitle>
            <CardDescription>ყველა ცვლილება და აღწერა</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">იტვირთება...</p>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {format(new Date(item.description_date), "dd/MM/yyyy HH:mm")}
                        </p>
                        <Badge variant={getChangeTypeBadgeVariant(item.change_type || "")}>
                          {item.change_type}
                        </Badge>
                      </div>

                      {item.items_missing && (
                        <div>
                          <p className="text-sm font-medium text-destructive">რა აკლია (-):</p>
                          <p className="text-sm text-muted-foreground">{item.items_missing}</p>
                        </div>
                      )}

                      {item.items_added && (
                        <div>
                          <p className="text-sm font-medium text-green-600">რა დაემატა (+):</p>
                          <p className="text-sm text-muted-foreground">{item.items_added}</p>
                        </div>
                      )}

                      {item.items_removed && (
                        <div>
                          <p className="text-sm font-medium">რა წაიღეს:</p>
                          <p className="text-sm text-muted-foreground">{item.items_removed}</p>
                        </div>
                      )}

                      {item.change_type === "ნომრიდან ნომერში გადატანა" && (
                        <div className="flex gap-4">
                          {item.transfer_from_room && (
                            <div>
                              <p className="text-sm font-medium">საიდან:</p>
                              <p className="text-sm text-muted-foreground">#{item.transfer_from_room}</p>
                            </div>
                          )}
                          {item.transfer_to_room && (
                            <div>
                              <p className="text-sm font-medium">სად:</p>
                              <p className="text-sm text-muted-foreground">#{item.transfer_to_room}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {item.notes && (
                        <div>
                          <p className="text-sm font-medium">შენიშვნები:</p>
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">ჯერ არ არის აღწერები</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};