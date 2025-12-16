import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2, Edit, CalendarIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useLogisticsActivity } from "@/hooks/useLogisticsActivity";

interface MaintenanceEntry {
  id?: string;
  scheduled_date: Date;
  room_number: string;
  problem: string;
  notes: string;
  status: string;
  solving_date?: Date | null;
  cost?: number;
  media_urls?: string[];
  additional_notes?: string;
}

export const MaintenanceModule = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { logActivity } = useLogisticsActivity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [editingEntry, setEditingEntry] = useState<MaintenanceEntry | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");

      if (error) throw error;
      return data;
    },
  });

  const { data: savedSchedules } = useQuery({
    queryKey: ["maintenance-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .select("*")
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addScheduleMutation = useMutation({
    mutationFn: async (entry: MaintenanceEntry) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("maintenance_schedules")
        .insert({
          user_id: user.id,
          scheduled_date: format(entry.scheduled_date, "yyyy-MM-dd"),
          room_number: entry.room_number,
          problem: entry.problem,
          notes: entry.notes,
          status: entry.status,
          solving_date: entry.solving_date ? format(entry.solving_date, "yyyy-MM-dd") : null,
          cost: entry.cost || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, entry) => {
      await logActivity({
        action: "create",
        entityType: "maintenance_schedule",
        entityId: data.id,
        entityName: `Room ${entry.room_number} - ${entry.problem}`,
        changes: { problem: entry.problem, status: entry.status, cost: entry.cost },
      });
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-activity-log"] });
      toast.success(t("მონაცემები წარმატებით შეინახა", "Schedule saved successfully"));
      setEntries([]);
    },
    onError: (error) => {
      console.error("Error saving schedule:", error);
      toast.error(t("შეცდომა მონაცემების შენახვისას", "Error saving schedule"));
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceEntry> }) => {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.scheduled_date) {
        updateData.scheduled_date = format(updates.scheduled_date, "yyyy-MM-dd");
      }
      if (updates.solving_date) {
        updateData.solving_date = format(updates.solving_date, "yyyy-MM-dd");
      }
      if (updates.status === "completed" && !updateData.solving_date) {
        updateData.solving_date = format(new Date(), "yyyy-MM-dd");
        updateData.completed_at = new Date().toISOString();
      }
      if (updates.cost !== undefined) {
        updateData.cost = updates.cost;
      }

      const { error } = await supabase
        .from("maintenance_schedules")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async (_, { id, updates }) => {
      const schedule = savedSchedules?.find(s => s.id === id);
      await logActivity({
        action: "update",
        entityType: "maintenance_schedule",
        entityId: id,
        entityName: schedule ? `Room ${schedule.room_number}` : undefined,
        changes: updates,
      });
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-activity-log"] });
      toast.success(t("მონაცემები განახლდა", "Schedule updated"));
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maintenance_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      const schedule = savedSchedules?.find(s => s.id === id);
      await logActivity({
        action: "delete",
        entityType: "maintenance_schedule",
        entityId: id,
        entityName: schedule ? `Room ${schedule.room_number} - ${schedule.problem}` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-activity-log"] });
      toast.success(t("ჩანაწერი წაიშალა", "Entry deleted"));
    },
  });

  const updateMediaMutation = useMutation({
    mutationFn: async ({ id, media_urls }: { id: string; media_urls: string[] }) => {
      const { error } = await supabase
        .from("maintenance_schedules")
        .update({ media_urls, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
    },
  });

  const handleFileUpload = async (scheduleId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${scheduleId}_${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("housekeeping-media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("housekeeping-media")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const schedule = savedSchedules?.find((s) => s.id === scheduleId);
      const currentUrls = schedule?.media_urls || [];
      const newUrls = [...currentUrls, ...uploadedUrls];

      await updateMediaMutation.mutateAsync({ id: scheduleId, media_urls: newUrls });

      if (selectedSchedule?.id === scheduleId) {
        setSelectedSchedule({ ...selectedSchedule, media_urls: newUrls });
      }

      toast.success(t("ფაილები აიტვირთა", "Files uploaded successfully"));
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(t("შეცდომა ფაილების ატვირთვისას", "Error uploading files"));
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (detailFileInputRef.current) detailFileInputRef.current.value = "";
    }
  };

  const handleDeleteMedia = async (scheduleId: string, urlToDelete: string) => {
    try {
      const fileName = urlToDelete.split("/").slice(-2).join("/");
      
      const { error: deleteError } = await supabase.storage
        .from("housekeeping-media")
        .remove([fileName]);

      if (deleteError) throw deleteError;

      const schedule = savedSchedules?.find((s) => s.id === scheduleId);
      const newUrls = (schedule?.media_urls || []).filter((url) => url !== urlToDelete);

      await updateMediaMutation.mutateAsync({ id: scheduleId, media_urls: newUrls });

      if (selectedSchedule?.id === scheduleId) {
        setSelectedSchedule({ ...selectedSchedule, media_urls: newUrls });
      }

      toast.success(t("ფაილი წაიშალა", "File deleted"));
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error(t("შეცდომა ფაილის წაშლისას", "Error deleting file"));
    }
  };

  const handleUpdateAdditionalNotes = async (scheduleId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("maintenance_schedules")
        .update({ additional_notes: notes, updated_at: new Date().toISOString() })
        .eq("id", scheduleId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      toast.success(t("კომენტარი შეინახა", "Comment saved"));
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error(t("შეცდომა კომენტარის შენახვისას", "Error saving comment"));
    }
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        scheduled_date: new Date(),
        room_number: "",
        problem: "",
        notes: "",
        status: "pending",
        solving_date: null,
        cost: 0,
      },
    ]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof MaintenanceEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleSave = () => {
    const validEntries = entries.filter(
      (entry) => entry.room_number && entry.problem
    );

    if (validEntries.length === 0) {
      toast.error(t("შეავსეთ ველები", "Please fill in required fields"));
      return;
    }

    validEntries.forEach((entry) => {
      addScheduleMutation.mutate(entry);
    });
  };

  const openEditDialog = (schedule: any) => {
    setEditingEntry({
      id: schedule.id,
      scheduled_date: new Date(schedule.scheduled_date),
      room_number: schedule.room_number,
      problem: schedule.problem,
      notes: schedule.notes || "",
      status: schedule.status,
      solving_date: schedule.solving_date ? new Date(schedule.solving_date) : null,
      cost: schedule.cost || 0,
    });
    setEditDialogOpen(true);
  };

  const openDetailDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingEntry?.id) return;

    updateScheduleMutation.mutate(
      {
        id: editingEntry.id,
        updates: {
          scheduled_date: editingEntry.scheduled_date,
          room_number: editingEntry.room_number,
          problem: editingEntry.problem,
          notes: editingEntry.notes,
          status: editingEntry.status,
          solving_date: editingEntry.solving_date,
          cost: editingEntry.cost,
        },
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingEntry(null);
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: t("მოლოდინში", "Pending") },
      in_progress: { variant: "secondary" as const, label: t("მიმდინარე", "In Progress") },
      completed: { variant: "default" as const, label: t("დასრულებული", "Completed") },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("ტექნიკური გაუმართაობა", "Maintenance Schedule")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.map((entry, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("თარიღი", "Date")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(entry.scheduled_date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={entry.scheduled_date}
                        onSelect={(date) =>
                          date && updateEntry(index, "scheduled_date", date)
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("ოთახი", "Room")}
                  </label>
                  <Select
                    value={entry.room_number}
                    onValueChange={(value) => updateEntry(index, "room_number", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("აირჩიეთ ოთახი", "Select room")} />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms?.map((room) => (
                        <SelectItem key={room.id} value={room.room_number}>
                          {t("ოთახი", "Room")} #{room.room_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("პრობლემა", "Problem")}
                  </label>
                  <Input
                    value={entry.problem}
                    onChange={(e) => updateEntry(index, "problem", e.target.value)}
                    placeholder={t("აღწერეთ პრობლემა", "Describe the problem")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("შენიშვნა", "Notes")}
                  </label>
                  <Input
                    value={entry.notes}
                    onChange={(e) => updateEntry(index, "notes", e.target.value)}
                    placeholder={t("დამატებითი ინფორმაცია", "Additional info")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("სტატუსი", "Status")}
                  </label>
                  <Select
                    value={entry.status}
                    onValueChange={(value) => updateEntry(index, "status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("მოლოდინში", "Pending")}</SelectItem>
                      <SelectItem value="in_progress">{t("მიმდინარე", "In Progress")}</SelectItem>
                      <SelectItem value="completed">{t("დასრულებული", "Completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("ღირებულება", "Cost")}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.cost || ""}
                    onChange={(e) => updateEntry(index, "cost", parseFloat(e.target.value) || 0)}
                    placeholder={t("მიუთითეთ ღირებულება", "Enter cost")}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEntry(index)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("წაშლა", "Remove")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button onClick={addEntry} variant="outline" className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              {t("ახალი ჩანაწერი", "Add Entry")}
            </Button>
            {entries.length > 0 && (
              <Button onClick={handleSave} className="flex-1">
                {t("შენახვა", "Save All")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t("თარიღი", "Date")}</th>
                  <th className="text-left p-2">{t("ოთახი", "Room")}</th>
                  <th className="text-left p-2">{t("პრობლემა", "Problem")}</th>
                  <th className="text-left p-2">{t("შენიშვნა", "Notes")}</th>
                  <th className="text-left p-2">{t("სტატუსი", "Status")}</th>
                  <th className="text-left p-2">{t("მოგვარების თარიღი", "Solving Date")}</th>
                  <th className="text-left p-2">{t("ღირებულება", "Cost")}</th>
                  <th className="text-right p-2">{t("მოქმედება", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {savedSchedules?.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={() => openDetailDialog(schedule)}
                      >
                        {format(new Date(schedule.scheduled_date), "PPP")}
                      </Button>
                    </td>
                    <td className="p-2">{t("ოთახი", "Room")} #{schedule.room_number}</td>
                    <td className="p-2">{schedule.problem}</td>
                    <td className="p-2">{schedule.notes || "-"}</td>
                    <td className="p-2">{getStatusBadge(schedule.status)}</td>
                    <td className="p-2">
                      {schedule.solving_date
                        ? format(new Date(schedule.solving_date), "PPP")
                        : "-"}
                    </td>
                    <td className="p-2">
                      {schedule.cost ? `${schedule.cost} ₾` : "-"}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2 justify-end">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(schedule.id, e.target.files)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFiles}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("რედაქტირება", "Edit Entry")}</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("თარიღი", "Date")}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editingEntry.scheduled_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingEntry.scheduled_date}
                      onSelect={(date) =>
                        date &&
                        setEditingEntry({ ...editingEntry, scheduled_date: date })
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("ოთახი", "Room")}
                </label>
                <Select
                  value={editingEntry.room_number}
                  onValueChange={(value) =>
                    setEditingEntry({ ...editingEntry, room_number: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms?.map((room) => (
                      <SelectItem key={room.id} value={room.room_number}>
                        {t("ოთახი", "Room")} #{room.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("პრობლემა", "Problem")}
                </label>
                <Input
                  value={editingEntry.problem}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, problem: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("შენიშვნა", "Notes")}
                </label>
                <Textarea
                  value={editingEntry.notes}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, notes: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("სტატუსი", "Status")}
                </label>
                <Select
                  value={editingEntry.status}
                  onValueChange={(value) =>
                    setEditingEntry({ ...editingEntry, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("მოლოდინში", "Pending")}</SelectItem>
                    <SelectItem value="in_progress">{t("მიმდინარე", "In Progress")}</SelectItem>
                    <SelectItem value="completed">{t("დასრულებული", "Completed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("მოგვარების თარიღი", "Solving Date")}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingEntry.solving_date
                        ? format(editingEntry.solving_date, "PPP")
                        : t("აირჩიეთ თარიღი", "Pick a date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingEntry.solving_date || undefined}
                      onSelect={(date) =>
                        setEditingEntry({ ...editingEntry, solving_date: date || null })
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("ღირებულება", "Cost")}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingEntry.cost || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, cost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder={t("მიუთითეთ ღირებულება", "Enter cost")}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEditSave} className="flex-1">
                  {t("შენახვა", "Save")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  {t("გაუქმება", "Cancel")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("დეტალური ინფორმაცია", "Detail View")}</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("თარიღი", "Date")}</p>
                  <p className="font-medium">
                    {format(new Date(selectedSchedule.scheduled_date), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("ოთახი", "Room")}</p>
                  <p className="font-medium">
                    {t("ოთახი", "Room")} #{selectedSchedule.room_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("პრობლემა", "Problem")}</p>
                  <p className="font-medium">{selectedSchedule.problem}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("სტატუსი", "Status")}</p>
                  <div className="mt-1">{getStatusBadge(selectedSchedule.status)}</div>
                </div>
              </div>

              {selectedSchedule.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("შენიშვნა", "Notes")}
                  </p>
                  <p className="text-sm">{selectedSchedule.notes}</p>
                </div>
              )}

              {selectedSchedule.solving_date && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("მოგვარების თარიღი", "Solving Date")}
                  </p>
                  <p className="font-medium">
                    {format(new Date(selectedSchedule.solving_date), "PPP")}
                  </p>
                </div>
              )}

              {selectedSchedule.cost && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("ღირებულება", "Cost")}
                  </p>
                  <p className="font-medium">{selectedSchedule.cost} ₾</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("დამატებითი კომენტარი", "Additional Comments")}
                </label>
                <Textarea
                  defaultValue={selectedSchedule.additional_notes || ""}
                  onBlur={(e) =>
                    handleUpdateAdditionalNotes(selectedSchedule.id, e.target.value)
                  }
                  placeholder={t("დაამატეთ კომენტარი...", "Add comment...")}
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">
                    {t("ფოტო და ვიდეო", "Photos & Videos")}
                  </label>
                  <div>
                    <input
                      ref={detailFileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(selectedSchedule.id, e.target.files)
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => detailFileInputRef.current?.click()}
                      disabled={uploadingFiles}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("ატვირთვა", "Upload")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {selectedSchedule.media_urls?.map((url: string, idx: number) => (
                    <div key={idx} className="relative group">
                      {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={url}
                          alt={`Media ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={url}
                          controls
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMedia(selectedSchedule.id, url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};