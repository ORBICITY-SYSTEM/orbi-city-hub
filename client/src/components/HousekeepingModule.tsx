import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, Pencil, Upload, Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoomMultiSelect } from "@/components/RoomMultiSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLogisticsActivity } from "@/hooks/useLogisticsActivity";

interface ScheduleEntry {
  date: string;
  rooms: string[];
  notes: string;
}

export const HousekeepingModule = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { logActivity } = useLogisticsActivity();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: availableRooms } = useQuery({
    queryKey: ["available-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_number")
        .order("room_number");

      if (error) throw error;
      return data.map(r => r.room_number);
    },
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["housekeeping-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housekeeping_schedules")
        .select("*")
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addScheduleMutation = useMutation({
    mutationFn: async (entry: ScheduleEntry) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("housekeeping_schedules")
        .insert({
          user_id: user.id,
          scheduled_date: entry.date,
          rooms: entry.rooms,
          total_rooms: entry.rooms.length,
          notes: entry.notes.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, entry) => {
      await logActivity({
        action: "create",
        entityType: "housekeeping_schedule",
        entityId: data.id,
        entityName: `${entry.rooms.length} rooms - ${entry.date}`,
        changes: { rooms: entry.rooms, notes: entry.notes },
      });
      queryClient.invalidateQueries({ queryKey: ["housekeeping-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-activity-log"] });
      toast.success(t("ჩანაწერი დაემატა", "Entry added"));
    },
    onError: () => {
      toast.error(t("შეცდომა დამატებისას", "Error adding entry"));
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("housekeeping_schedules")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async (_, { id, status }) => {
      const schedule = schedules?.find(s => s.id === id);
      await logActivity({
        action: "update",
        entityType: "housekeeping_schedule",
        entityId: id,
        entityName: schedule ? `${schedule.rooms.length} rooms` : undefined,
        changes: { status, previous_status: schedule?.status },
      });
      queryClient.invalidateQueries({ queryKey: ["housekeeping-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-activity-log"] });
      toast.success(t("სტატუსი განახლდა", "Status updated"));
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("housekeeping_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      const schedule = schedules?.find(s => s.id === id);
      await logActivity({
        action: "delete",
        entityType: "housekeeping_schedule",
        entityId: id,
        entityName: schedule ? `${schedule.rooms.length} rooms - ${schedule.scheduled_date}` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["housekeeping-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-activity-log"] });
      toast.success(t("ჩანაწერი წაიშალა", "Entry deleted"));
    },
  });

  const updateScheduleDataMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("housekeeping_schedules")
        .update({
          scheduled_date: data.date,
          rooms: data.rooms,
          total_rooms: data.rooms.length,
          notes: data.notes || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeeping-schedules"] });
      setEditDialogOpen(false);
      setEditingSchedule(null);
      toast.success(t("ჩანაწერი განახლდა", "Entry updated"));
    },
  });

  const updateMediaMutation = useMutation({
    mutationFn: async ({ id, mediaUrls, additionalNotes }: { id: string; mediaUrls: string[]; additionalNotes?: string }) => {
      const updates: any = { media_urls: mediaUrls };
      if (additionalNotes !== undefined) {
        updates.additional_notes = additionalNotes;
      }
      
      const { error } = await supabase
        .from("housekeeping_schedules")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeeping-schedules"] });
      toast.success(t("განახლდა", "Updated"));
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
    addScheduleMutation.mutate(entry);
    removeEntry(index);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="default">{t("დასრულებული", "Completed")}</Badge>;
    }
    return <Badge variant="outline">{t("მოლოდინში", "Pending")}</Badge>;
  };

  const openEditDialog = (schedule: any) => {
    setEditingSchedule({
      id: schedule.id,
      date: schedule.scheduled_date,
      rooms: schedule.rooms,
      notes: schedule.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingSchedule) {
      updateScheduleDataMutation.mutate({
        id: editingSchedule.id,
        data: {
          date: editingSchedule.date,
          rooms: editingSchedule.rooms,
          notes: editingSchedule.notes,
        },
      });
    }
  };

  const handleFileUpload = async (scheduleId: string, files: FileList) => {
    if (!files.length) return;
    
    setUploadingFiles(scheduleId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${scheduleId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('housekeeping-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('housekeeping-media')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      
      const schedule = schedules?.find(s => s.id === scheduleId);
      const existingUrls = schedule?.media_urls || [];
      
      await updateMediaMutation.mutateAsync({
        id: scheduleId,
        mediaUrls: [...existingUrls, ...urls],
      });

      toast.success(t("ფაილები აიტვირთა", "Files uploaded"));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t("შეცდომა ატვირთვისას", "Upload error"));
    } finally {
      setUploadingFiles(null);
    }
  };

  const openDetailDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const handleDeleteMedia = async (scheduleId: string, urlToDelete: string) => {
    const schedule = schedules?.find(s => s.id === scheduleId);
    if (!schedule) return;

    const updatedUrls = schedule.media_urls.filter((url: string) => url !== urlToDelete);
    
    try {
      await updateMediaMutation.mutateAsync({
        id: scheduleId,
        mediaUrls: updatedUrls,
      });

      // Also delete from storage
      const fileName = urlToDelete.split('/housekeeping-media/')[1];
      if (fileName) {
        await supabase.storage.from('housekeeping-media').remove([fileName]);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleUpdateAdditionalNotes = async (scheduleId: string, notes: string) => {
    try {
      const schedule = schedules?.find(s => s.id === scheduleId);
      await updateMediaMutation.mutateAsync({
        id: scheduleId,
        mediaUrls: schedule?.media_urls || [],
        additionalNotes: notes,
      });
    } catch (error) {
      console.error('Update notes error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {t("დააჭირეთ + ღილაკს ახალი ჩანაწერის დასამატებლად", "Click + button to add new entry")}
        </p>
        <Button onClick={addEntry} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("ახალი ჩანაწერი", "New Entry")}
        </Button>
      </div>

      {entries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">{t("თარიღი", "Date")}</TableHead>
                  <TableHead>{t("დასალაგებელი ნომრები", "Rooms to Clean")}</TableHead>
                  <TableHead className="w-[100px]">{t("სულ", "Total")}</TableHead>
                  <TableHead>{t("შენიშვნები", "Notes")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateEntry(index, "date", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <RoomMultiSelect
                          availableRooms={availableRooms || []}
                          selectedRooms={entry.rooms}
                          onChange={(rooms) => updateEntry(index, "rooms", rooms)}
                        />
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {entry.rooms.length > 0 ? entry.rooms.length : "-"}
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={entry.notes}
                          onChange={(e) => updateEntry(index, "notes", e.target.value)}
                          placeholder={t("შენიშვნები...", "Notes...")}
                          rows={1}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(index)}
                            size="sm"
                            variant="default"
                            disabled={addScheduleMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeEntry(index)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-4">
              {t("იტვირთება...", "Loading...")}
            </p>
          ) : schedules && schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("თარიღი", "Date")}</TableHead>
                  <TableHead>{t("ნომრები", "Rooms")}</TableHead>
                  <TableHead className="w-[100px]">{t("სულ", "Total")}</TableHead>
                  <TableHead>{t("შენიშვნები", "Notes")}</TableHead>
                  <TableHead className="w-[120px]">{t("სტატუსი", "Status")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => openDetailDialog(schedule)}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Calendar className="h-4 w-4" />
                        {format(new Date(schedule.scheduled_date), "PP")}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{schedule.rooms.join(", ")}</span>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {schedule.total_rooms}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {schedule.notes || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(schedule.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditDialog(schedule)}
                          size="sm"
                          variant="outline"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          size="sm"
                          variant="outline"
                          disabled={uploadingFiles === schedule.id}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleFileUpload(schedule.id, e.target.files);
                            }
                          }}
                        />
                        {schedule.status !== "completed" && (
                          <Button
                            onClick={() => updateScheduleMutation.mutate({ id: schedule.id, status: "completed" })}
                            size="sm"
                            variant="outline"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("ჩანაწერები არ არის", "No entries yet")}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ჩანაწერის რედაქტირება", "Edit Entry")}</DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("თარიღი", "Date")}</Label>
                <Input
                  type="date"
                  value={editingSchedule.date}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("ნომრები", "Rooms")}</Label>
                <RoomMultiSelect
                  availableRooms={availableRooms || []}
                  selectedRooms={editingSchedule.rooms}
                  onChange={(rooms) => setEditingSchedule({ ...editingSchedule, rooms })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("შენიშვნები", "Notes")}</Label>
                <Textarea
                  value={editingSchedule.notes}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                  rows={3}
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

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedSchedule && format(new Date(selectedSchedule.scheduled_date), "PP")} - {t("დეტალური ინფორმაცია", "Details")}
            </DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="font-semibold mb-2">{t("ნომრები", "Rooms")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSchedule.rooms.map((room: string) => (
                      <Badge key={room} variant="outline">{room}</Badge>
                    ))}
                  </div>
                </div>

                {selectedSchedule.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">{t("შენიშვნები", "Notes")}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSchedule.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">{t("დამატებითი კომენტარები", "Additional Comments")}</h3>
                  <Textarea
                    value={selectedSchedule.additional_notes || ""}
                    onChange={(e) => {
                      setSelectedSchedule({ ...selectedSchedule, additional_notes: e.target.value });
                    }}
                    onBlur={(e) => handleUpdateAdditionalNotes(selectedSchedule.id, e.target.value)}
                    placeholder={t("დაწერეთ კომენტარები...", "Write comments...")}
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{t("სურათები და ვიდეოები", "Photos & Videos")}</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/*,video/*';
                        input.onchange = (e: any) => {
                          if (e.target.files) {
                            handleFileUpload(selectedSchedule.id, e.target.files);
                          }
                        };
                        input.click();
                      }}
                      disabled={uploadingFiles === selectedSchedule.id}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("ატვირთვა", "Upload")}
                    </Button>
                  </div>

                  {selectedSchedule.media_urls && selectedSchedule.media_urls.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedSchedule.media_urls.map((url: string, index: number) => (
                        <div key={index} className="relative group">
                          {url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video 
                              src={url} 
                              controls 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <img 
                              src={url} 
                              alt={`Media ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteMedia(selectedSchedule.id, url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t("ფაილები ჯერ არ არის ატვირთული", "No files uploaded yet")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">{t("სტატუსი", "Status")}:</span>
                    {" "}
                    {getStatusBadge(selectedSchedule.status)}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t("სულ ნომრები", "Total Rooms")}:</span>
                    {" "}
                    <span className="font-semibold">{selectedSchedule.total_rooms}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
