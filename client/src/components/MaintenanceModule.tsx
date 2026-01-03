import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2, Edit, CalendarIcon, Loader2, Check, Wrench } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MaintenanceEntry {
  scheduledDate: Date;
  roomNumber: string;
  problem: string;
  notes: string;
  status: string;
  estimatedCost?: number;
  priority: "low" | "medium" | "high" | "urgent";
}

export const MaintenanceModule = () => {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const { data: rooms } = trpc.logistics.rooms.list.useQuery();
  const { data: savedSchedules, isLoading } = trpc.logistics.maintenance.list.useQuery();

  const addScheduleMutation = trpc.logistics.maintenance.create.useMutation({
    onSuccess: () => {
      utils.logistics.maintenance.list.invalidate();
      utils.logistics.activityLog.list.invalidate();
      toast.success(t("ჩანაწერი დაემატა", "Entry added"));
    },
    onError: () => toast.error(t("შეცდომა დამატებისას", "Error adding entry")),
  });

  const updateScheduleMutation = trpc.logistics.maintenance.update.useMutation({
    onSuccess: () => {
      utils.logistics.maintenance.list.invalidate();
      utils.logistics.activityLog.list.invalidate();
      setEditDialogOpen(false);
      setEditingEntry(null);
      toast.success(t("ჩანაწერი განახლდა", "Entry updated"));
    },
  });

  const deleteScheduleMutation = trpc.logistics.maintenance.delete.useMutation({
    onSuccess: () => {
      utils.logistics.maintenance.list.invalidate();
      utils.logistics.activityLog.list.invalidate();
      toast.success(t("ჩანაწერი წაიშალა", "Entry deleted"));
    },
  });

  const addEntry = () => {
    setEntries([...entries, { scheduledDate: new Date(), roomNumber: "", problem: "", notes: "", status: "pending", priority: "medium" }]);
  };

  const removeEntry = (index: number) => setEntries(entries.filter((_, i) => i !== index));

  const updateEntry = (index: number, field: keyof MaintenanceEntry, value: any) => {
    const updated = [...entries];
    (updated[index] as any)[field] = value;
    setEntries(updated);
  };

  const handleSave = (index: number) => {
    const entry = entries[index];
    if (!entry.roomNumber || !entry.problem) {
      toast.error(t("შეავსეთ ოთახი და პრობლემა", "Fill room and problem"));
      return;
    }
    addScheduleMutation.mutate({
      scheduledDate: format(entry.scheduledDate, "yyyy-MM-dd"),
      roomNumber: entry.roomNumber,
      problem: entry.problem,
      notes: entry.notes || undefined,
      status: "pending",
      estimatedCost: entry.estimatedCost,
      priority: entry.priority,
    });
    removeEntry(index);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      completed: { variant: "default", label: t("დასრულებული", "Completed") },
      in_progress: { variant: "secondary", label: t("მიმდინარე", "In Progress") },
      pending: { variant: "outline", label: t("მოლოდინში", "Pending") },
      cancelled: { variant: "destructive", label: t("გაუქმებული", "Cancelled") },
    };
    const c = map[status] || map.pending;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { color: string; label: string }> = {
      low: { color: "bg-green-500/20 text-green-500", label: t("დაბალი", "Low") },
      medium: { color: "bg-yellow-500/20 text-yellow-500", label: t("საშუალო", "Medium") },
      high: { color: "bg-orange-500/20 text-orange-500", label: t("მაღალი", "High") },
      urgent: { color: "bg-red-500/20 text-red-500", label: t("სასწრაფო", "Urgent") },
    };
    const c = map[priority] || map.medium;
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  const openEditDialog = (schedule: any) => {
    setEditingEntry({ id: schedule.id, status: schedule.status, notes: schedule.notes || "", actualCost: schedule.actualCost });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingEntry) {
      updateScheduleMutation.mutate({
        id: editingEntry.id,
        status: editingEntry.status,
        notes: editingEntry.notes,
        actualCost: editingEntry.actualCost,
        completedAt: editingEntry.status === "completed" ? new Date() : undefined,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t("დარწმუნებული ხართ?", "Are you sure?"))) deleteScheduleMutation.mutate({ id });
  };

  if (isLoading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Wrench className="h-5 w-5" />{t("ახალი ტექნიკური მოთხოვნა", "New Maintenance Request")}</CardTitle>
          <Button onClick={addEntry} size="sm" className="gap-2"><Plus className="h-4 w-4" />{t("დამატება", "Add")}</Button>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t("დააჭირეთ 'დამატება' ახალი მოთხოვნისთვის", "Click 'Add' for new request")}</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 items-end p-4 bg-background/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium">{t("თარიღი", "Date")}</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}><CalendarIcon className="mr-2 h-4 w-4" />{format(entry.scheduledDate, "PP")}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={entry.scheduledDate} onSelect={(date) => date && updateEntry(index, "scheduledDate", date)} /></PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("ოთახი", "Room")}</label>
                    <Select value={entry.roomNumber} onValueChange={(v) => updateEntry(index, "roomNumber", v)}>
                      <SelectTrigger><SelectValue placeholder={t("აირჩიეთ", "Select")} /></SelectTrigger>
                      <SelectContent>{rooms?.map((room) => <SelectItem key={room.id} value={room.roomNumber}>{room.roomNumber}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("პრობლემა", "Problem")}</label>
                    <Input value={entry.problem} onChange={(e) => updateEntry(index, "problem", e.target.value)} placeholder={t("აღწერეთ პრობლემა", "Describe problem")} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("პრიორიტეტი", "Priority")}</label>
                    <Select value={entry.priority} onValueChange={(v) => updateEntry(index, "priority", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t("დაბალი", "Low")}</SelectItem>
                        <SelectItem value="medium">{t("საშუალო", "Medium")}</SelectItem>
                        <SelectItem value="high">{t("მაღალი", "High")}</SelectItem>
                        <SelectItem value="urgent">{t("სასწრაფო", "Urgent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("ხარჯი", "Cost")}</label>
                    <Input type="number" value={entry.estimatedCost || ""} onChange={(e) => updateEntry(index, "estimatedCost", parseFloat(e.target.value) || undefined)} placeholder="₾" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(index)} disabled={addScheduleMutation.isPending}><Check className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => removeEntry(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader><CardTitle className="text-lg">{t("ტექნიკური მოთხოვნები", "Maintenance Requests")}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("თარიღი", "Date")}</TableHead>
                <TableHead>{t("ოთახი", "Room")}</TableHead>
                <TableHead>{t("პრობლემა", "Problem")}</TableHead>
                <TableHead>{t("პრიორიტეტი", "Priority")}</TableHead>
                <TableHead>{t("სტატუსი", "Status")}</TableHead>
                <TableHead>{t("ხარჯი", "Cost")}</TableHead>
                <TableHead className="text-right">{t("მოქმედებები", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedSchedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell><div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{schedule.scheduledDate}</div></TableCell>
                  <TableCell><Badge variant="outline">{schedule.roomNumber}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate">{schedule.problem}</TableCell>
                  <TableCell>{getPriorityBadge(schedule.priority)}</TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  <TableCell>{schedule.actualCost ? "₾" + schedule.actualCost : schedule.estimatedCost ? "~₾" + schedule.estimatedCost : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(schedule)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(schedule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!savedSchedules || savedSchedules.length === 0) && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t("ჩანაწერები არ მოიძებნა", "No entries found")}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("რედაქტირება", "Edit Entry")}</DialogTitle></DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("სტატუსი", "Status")}</label>
                <Select value={editingEntry.status} onValueChange={(v) => setEditingEntry({ ...editingEntry, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("მოლოდინში", "Pending")}</SelectItem>
                    <SelectItem value="in_progress">{t("მიმდინარე", "In Progress")}</SelectItem>
                    <SelectItem value="completed">{t("დასრულებული", "Completed")}</SelectItem>
                    <SelectItem value="cancelled">{t("გაუქმებული", "Cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("რეალური ხარჯი", "Actual Cost")}</label>
                <Input type="number" value={editingEntry.actualCost || ""} onChange={(e) => setEditingEntry({ ...editingEntry, actualCost: parseFloat(e.target.value) || undefined })} placeholder="₾" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("შენიშვნა", "Notes")}</label>
                <Textarea value={editingEntry.notes} onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t("გაუქმება", "Cancel")}</Button>
                <Button onClick={handleEditSave} disabled={updateScheduleMutation.isPending}>{t("შენახვა", "Save")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
