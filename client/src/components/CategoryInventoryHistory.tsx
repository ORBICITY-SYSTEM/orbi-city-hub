import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CategoryInventoryHistoryProps {
  category: string;
}

interface HistoryRecord {
  id: string;
  room_id: string;
  change_type: string;
  items_missing: string | null;
  items_added: string | null;
  items_removed: string | null;
  transfer_from_room: string | null;
  transfer_to_room: string | null;
  notes: string | null;
  description_date: string;
  room?: {
    room_number: string;
  };
}

export function CategoryInventoryHistory({ category }: CategoryInventoryHistoryProps) {
  const { t } = useLanguage();

  const { data: history, isLoading } = useQuery({
    queryKey: ["category-inventory-history", category],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("room_inventory_descriptions")
        .select(`
          *,
          room:rooms(room_number)
        `)
        .eq("user_id", user.id)
        .order("description_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as HistoryRecord[];
    },
  });

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "შეცვლა/გატეხვა":
        return t("შეცვლა/გატეხვა", "Replacement/Damage");
      case "დაკარგვა":
        return t("დაკარგვა", "Loss");
      case "ნომრიდან ნომერში გადატანა":
        return t("ნომრიდან ნომერში გადატანა", "Room Transfer");
      case "რეგულარული აღწერა":
        return t("რეგულარული აღწერა", "Regular Inventory");
      default:
        return type;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {t("ისტორია", "History")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {t("კატეგორიის ცვლილებების ისტორია", "Category Change History")}: {category}
          </DialogTitle>
          <DialogDescription>
            {t(
              "ნახეთ ყველა ცვლილება ამ კატეგორიის ნივთებზე თარიღების მიხედვით",
              "View all changes to items in this category by date"
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {t("ცვლილებების ისტორია არ მოიძებნა", "No change history found")}
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {history.map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {record.room?.room_number || "N/A"}
                      </Badge>
                      <Badge variant="outline">
                        {getChangeTypeLabel(record.change_type)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(record.description_date), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {record.items_missing && (
                      <div>
                        <span className="font-medium text-destructive">
                          {t("ნაკლული ნივთები", "Missing Items")}:
                        </span>{" "}
                        {record.items_missing}
                      </div>
                    )}
                    {record.items_added && (
                      <div>
                        <span className="font-medium text-green-600">
                          {t("დამატებული ნივთები", "Added Items")}:
                        </span>{" "}
                        {record.items_added}
                      </div>
                    )}
                    {record.items_removed && (
                      <div>
                        <span className="font-medium text-orange-600">
                          {t("ამოღებული ნივთები", "Removed Items")}:
                        </span>{" "}
                        {record.items_removed}
                      </div>
                    )}
                    {record.transfer_from_room && record.transfer_to_room && (
                      <div>
                        <span className="font-medium">
                          {t("გადატანა", "Transfer")}:
                        </span>{" "}
                        {record.transfer_from_room} → {record.transfer_to_room}
                      </div>
                    )}
                    {record.notes && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <span className="font-medium">{t("შენიშვნა", "Notes")}:</span>{" "}
                        {record.notes}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
