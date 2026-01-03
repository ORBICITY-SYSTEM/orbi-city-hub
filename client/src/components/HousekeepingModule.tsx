import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, Pencil, Calendar, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoomMultiSelect } from "@/components/RoomMultiSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";

interface ScheduleEntry {
  date: string;
  rooms: string[];
  notes: string;
}

export const HousekeepingModule = () => {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // tRPC Queries
  const { data: availableRooms } = trpc.logistics.rooms.list.useQuery(undefined, {
    select: (data) => data?.map(r => r.roomNumber) || [],
  });

  const { data: schedules, isLoading } = trpc.logistics.housekeeping.list.useQuery();

  // tRPC Mutations
  const addScheduleMutation = trpc.logistics.housekeeping.create.useMutation({
    onSuccess: () => {
      utils.logistics.housekeeping.list.invalidate();
      utils.logistics.activity.list.invalidate();
      toast.success(t("ჩანაწერი დაემატა", "Entry added"));
    },
    onError: () => {
      toast.error(t("შეცდომა დამატებისას", "Error adding entry"));
    },
  });

  const updateScheduleMutation = trpc.logistics.housekeeping.update.useMutation({
    onSuccess: () => {
      utils.logistics.housekeeping.list.invalidate();
      utils.logistics.activity.list.invalidate();
      toast.success(t("სტატუსი განახლდა", "Status updated"));
    },
  });

  const deleteScheduleMutation = trpc.logistics.housekeeping.delete.useMutation({
    onSuccess: () => {
      utils.logistics.housekeeping.list.invalidate();
      utils.logistics.activity.list.invalidate();
      toast.success(t("ჩანაწერი წაიშალა", "Entry deleted"));
    },
  });

  const updateScheduleDataMutation = trpc.logistics.housekeeping.update.useMutation({
    onSuccess: () => {
      utils.logistics.housekeeping.list.invalidate();
      setEditDialogOpen(false);
      setEditingSchedule(null);
      toast.success(t("ჩანაწერი განახლდა", "Entry updated"));
    },
  });

  const addEntry = () => {
    setEntries([...entries, { date: format(new Date(), "yyyy-MM-dd"), rooms: [], notes: "" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof ScheduleEntry, value: string | string[]) => {
    const updated = [...entries];
    updated[index][field] = value as any;
    setEntries(updated);
  };

  const handleSave = (index: number) => {
    const entry = entries[index];
    if (!entry.date || entry.rooms.length === 0) {
      toast.error(t("შეავსეთ თარიღი და ნომრები", "Fill date and rooms"));
      return;
    }
    addScheduleMutation.mutate({
      scheduledDate: entry.date,
      rooms: entry.rooms,
      totalRooms: entry.rooms.length,
      notes: entry.notes.trim() || undefined,
    });
    removeEntry(index);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="default">{t("დასრულებული", "Completed")}</Badge>;
    }
    if (status === "in_progress") {
      return <Badge variant="secondary">{t("მიმდინარე", "In Progress")}</Badge>;
    }
    return <Badge variant="outline">{t("მოლოდინში", "Pending")}</Badge>;
  };

  const openEditDialog = (schedule: any) => {
    setEditingSchedule({
      id: schedule.id,
      date: schedule.scheduledDate,
      rooms: schedule.rooms || [],
      notes: schedule.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingSchedule) {
      updateScheduleDataMutation.mutate({
        id: editingSchedule.id,
        notes: editingSchedule.notes,
      });
    }
  };

  const openDetailDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (id: number, status: "pending" | "in_progress" | "completed" | "cancelled") => {
    updateScheduleMutation.mutate({
      id,
      status,
      completedAt: status === "completed" ? new Date() : undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t("დარწმუნებული ხართ?", "Are you sure?"))) {
      deleteScheduleMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Entry Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {t("ახალი ჩანაწერის დამატება", "Add New Entry")}
          </CardTitle>
          <Button onClick={addEntry} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("დამატება", "Add")}
          </Button>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t("დააჭირეთ 'დამატება' ახალი ჩანაწერისთვის", "Click 'Add' for new entry")}
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="flex gap-4 items-end p-4 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <Label>{t("თარიღი", "Date")}</Label>
                    <Input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(index, "date", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>{t("ოთახები", "Rooms")}</Label>
                    <RoomMultiSelect
                      availableRooms={availableRooms || []}
                      selectedRooms={entry.rooms}
                      onSelectionChange={(rooms) => updateEntry(index, "rooms", rooms)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>{t("შენიშვნა", "Notes")}</Label>
                    <Input
                      value={entry.notes}
                      onChange={(e) => updateEntry(index, "notes", e.target.value)}
                      placeholder={t("არასავალდებულო", "Optional")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(index)}
                      disabled={addScheduleMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeEntry(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">
            {t("დასუფთავების გრაფიკი", "Housekeeping Schedule")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("თარიღი", "Date")}</TableHead>
                <TableHead>{t("ოთახები", "Rooms")}</TableHead>
                <TableHead>{t("სტატუსი", "Status")}</TableHead>
                <TableHead>{t("შენიშვნა", "Notes")}</TableHead>
                <TableHead className="text-right">{t("მოქმედებები", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => openDetailDialog(schedule)}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {schedule.scheduledDate}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => openDetailDialog(schedule)}>
                    <Badge variant="secondary">{schedule.totalRooms} {t("ოთახი", "rooms")}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {schedule.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {schedule.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(schedule.id, "completed")}
                          title={t("დასრულება", "Complete")}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(schedule)}
                        title={t("რედაქტირება", "Edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(schedule.id)}
                        title={t("წაშლა", "Delete")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!schedules || schedules.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("ჩანაწერები არ მოიძებნა", "No entries found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("რედაქტირება", "Edit Entry")}</DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4">
              <div>
                <Label>{t("თარიღი", "Date")}</Label>
                <Input
                  type="date"
                  value={editingSchedule.date}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("ოთახები", "Rooms")}</Label>
                <div className="text-sm text-muted-foreground">
                  {editingSchedule.rooms?.join(", ") || "-"}
                </div>
              </div>
              <div>
                <Label>{t("შენიშვნა", "Notes")}</Label>
                <Textarea
                  value={editingSchedule.notes}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  {t("გაუქმება", "Cancel")}
                </Button>
                <Button onClick={handleEditSave} disabled={updateScheduleDataMutation.isPending}>
                  {t("შენახვა", "Save")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("დეტალები", "Details")}</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t("თარიღი", "Date")}</Label>
                    <p className="font-medium">{selectedSchedule.scheduledDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("სტატუსი", "Status")}</Label>
                    <div>{getStatusBadge(selectedSchedule.status)}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("ოთახები", "Rooms")}</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSchedule.rooms?.map((room: string) => (
                      <Badge key={room} variant="outline">{room}</Badge>
                    ))}
                  </div>
                </div>
                {selectedSchedule.notes && (
                  <div>
                    <Label className="text-muted-foreground">{t("შენიშვნა", "Notes")}</Label>
                    <p>{selectedSchedule.notes}</p>
                  </div>
                )}
                {selectedSchedule.completedAt && (
                  <div>
                    <Label className="text-muted-foreground">{t("დასრულდა", "Completed")}</Label>
                    <p>{format(new Date(selectedSchedule.completedAt), "yyyy-MM-dd HH:mm")}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
