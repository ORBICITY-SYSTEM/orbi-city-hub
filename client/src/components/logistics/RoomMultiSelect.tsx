import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoomMultiSelectProps {
  availableRooms: string[];
  selectedRooms: string[];
  onChange: (rooms: string[]) => void;
}

export const RoomMultiSelect = ({
  availableRooms,
  selectedRooms,
  onChange,
}: RoomMultiSelectProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      onChange(selectedRooms.filter((r) => r !== room));
    } else {
      onChange([...selectedRooms, room]);
    }
  };

  const removeRoom = (room: string) => {
    onChange(selectedRooms.filter((r) => r !== room));
  };

  return (
    <div className="space-y-2">
      {selectedRooms.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30 min-h-10">
          {selectedRooms.map((room) => (
            <Badge
              key={room}
              variant="secondary"
              className="text-sm"
            >
              {room}
            </Badge>
          ))}
        </div>
      ) : null}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            {selectedRooms.length === 0 
              ? t("აირჩიეთ ნომრები", "Select rooms")
              : t("ცვლილება", "Edit selection")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-50 bg-popover" align="start">
          <Command>
            <CommandInput placeholder={t("ძიება...", "Search...")} />
            <CommandList>
              <CommandEmpty>{t("ნომერი არ მოიძებნა", "No room found")}</CommandEmpty>
              <CommandGroup>
                {availableRooms.map((room) => (
                  <CommandItem
                    key={room}
                    value={room}
                    onSelect={() => {
                      toggleRoom(room);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRooms.includes(room) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {room}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="border-t p-2">
            <Button
              onClick={() => setOpen(false)}
              className="w-full"
              size="sm"
            >
              {t("არჩევის დასრულება", "Done")} ({selectedRooms.length})
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {selectedRooms.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {t("არჩეული:", "Selected:")} {selectedRooms.length} {t("ნომერი", "rooms")}
        </div>
      )}
    </div>
  );
};
