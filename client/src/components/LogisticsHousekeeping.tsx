import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Check, X, Calendar, Upload, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ScheduleEntry {
  id: string;
  date: string;
  rooms: string[];
  status: "pending" | "in_progress" | "completed" | "cancelled";
  notes: string;
  assignedTo: string;
  completedAt?: string;
}

// Mock data from ORBI City apartments
const mockSchedules: ScheduleEntry[] = [
  { id: "SCH-001", date: "2025-11-26", rooms: ["A 3041", "A 2441", "A 1833"], status: "in_progress", notes: "Deep cleaning required", assignedTo: "მარიამ გელაშვილი", completedAt: undefined },
  { id: "SCH-002", date: "2025-11-26", rooms: ["C 2641", "C 2547"], status: "pending", notes: "Standard cleaning", assignedTo: "ნინო ბერიძე", completedAt: undefined },
  { id: "SCH-003", date: "2025-11-25", rooms: ["A 3041", "C 2641", "A 2441", "A 1833"], status: "completed", notes: "Checkout cleaning", assignedTo: "მარიამ გელაშვილი", completedAt: "2025-11-25 18:30" },
  { id: "SCH-004", date: "2025-11-25", rooms: ["C 4706", "A 4027"], status: "completed", notes: "Standard cleaning", assignedTo: "ნინო ბერიძე", completedAt: "2025-11-25 17:45" },
  { id: "SCH-005", date: "2025-11-24", rooms: ["A 4029", "D 3418", "D 3414"], status: "completed", notes: "Deep cleaning + linen change", assignedTo: "მარიამ გელაშვილი", completedAt: "2025-11-24 19:15" },
  { id: "SCH-006", date: "2025-11-24", rooms: ["D 3416", "C 2847"], status: "completed", notes: "Standard cleaning", assignedTo: "ნინო ბერიძე", completedAt: "2025-11-24 16:30" },
  { id: "SCH-007", date: "2025-11-23", rooms: ["C 1256", "C 2524", "C 2961"], status: "completed", notes: "Checkout cleaning", assignedTo: "მარიამ გელაშვილი", completedAt: "2025-11-23 18:00" },
];

const availableRooms = [
  "A 3041", "A 2441", "A 1833", "C 2641", "C 2547", "C 4706", "A 4027", "A 4029",
  "D 3418", "D 3414", "D 3416", "C 2847", "C 1256", "C 2524", "C 2961", "C 2861",
  "C 2520", "C 3428", "C 2921", "A 3035"
];

const cleaningStaff = ["მარიამ გელაშვილი", "ნინო ბერიძე", "თამარ მახარაძე"];

export function LogisticsHousekeeping() {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(mockSchedules);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    rooms: [] as string[],
    notes: "",
    assignedTo: cleaningStaff[0]
  });
  const [selectedRoom, setSelectedRoom] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleAddRoom = () => {
    if (selectedRoom && !newEntry.rooms.includes(selectedRoom)) {
      setNewEntry({ ...newEntry, rooms: [...newEntry.rooms, selectedRoom] });
      setSelectedRoom("");
    }
  };

  const handleRemoveRoom = (room: string) => {
    setNewEntry({ ...newEntry, rooms: newEntry.rooms.filter(r => r !== room) });
  };

  const handleAddSchedule = () => {
    if (newEntry.rooms.length === 0) {
      toast.error("Please select at least one room");
      return;
    }

    const schedule: ScheduleEntry = {
      id: `SCH-${String(schedules.length + 1).padStart(3, "0")}`,
      date: newEntry.date,
      rooms: newEntry.rooms,
      status: "pending",
      notes: newEntry.notes,
      assignedTo: newEntry.assignedTo
    };

    setSchedules([schedule, ...schedules]);
    setNewEntry({
      date: new Date().toISOString().split("T")[0],
      rooms: [],
      notes: "",
      assignedTo: cleaningStaff[0]
    });
    toast.success("Schedule added successfully");
  };

  const handleUpdateStatus = (id: string, status: ScheduleEntry["status"]) => {
    setSchedules(schedules.map(s =>
      s.id === id
        ? { ...s, status, completedAt: status === "completed" ? new Date().toLocaleString() : undefined }
        : s
    ));
    toast.success("Status updated");
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success("Schedule deleted");
  };

  const filteredSchedules = schedules.filter(s =>
    statusFilter === "all" || s.status === statusFilter
  );

  const getStatusBadge = (status: ScheduleEntry["status"]) => {
    const variants: Record<ScheduleEntry["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string; color: string }> = {
      pending: { variant: "outline", label: "Pending", color: "text-gray-600" },
      in_progress: { variant: "secondary", label: "In Progress", color: "text-blue-600" },
      completed: { variant: "default", label: "Completed", color: "text-green-600" },
      cancelled: { variant: "destructive", label: "Cancelled", color: "text-red-600" },
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const todaySchedules = schedules.filter(s => s.date === new Date().toISOString().split("T")[0]);
  const pendingCount = schedules.filter(s => s.status === "pending").length;
  const inProgressCount = schedules.filter(s => s.status === "in_progress").length;
  const completedToday = todaySchedules.filter(s => s.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Housekeeping Schedule</h2>
        <p className="text-sm text-gray-600">Manage daily cleaning schedules and room assignments</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="text-sm text-yellow-700 font-medium">Pending</div>
          <div className="text-3xl font-bold text-yellow-900">{pendingCount}</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting assignment</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-sm text-blue-700 font-medium">In Progress</div>
          <div className="text-3xl font-bold text-blue-900">{inProgressCount}</div>
          <div className="text-xs text-blue-600 mt-1">Currently cleaning</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-sm text-green-700 font-medium">Completed Today</div>
          <div className="text-3xl font-bold text-green-900">{completedToday}</div>
          <div className="text-xs text-green-600 mt-1">{todaySchedules.length} total today</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="text-sm text-purple-700 font-medium">Total Rooms</div>
          <div className="text-3xl font-bold text-purple-900">{availableRooms.length}</div>
          <div className="text-xs text-purple-600 mt-1">Active apartments</div>
        </Card>
      </div>

      {/* Add New Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-green-600" />
          Add New Schedule
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Assigned To</label>
            <Select value={newEntry.assignedTo} onValueChange={(v) => setNewEntry({ ...newEntry, assignedTo: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cleaningStaff.map(staff => (
                  <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Select Rooms</label>
          <div className="flex gap-2">
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a room..." />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.filter(r => !newEntry.rooms.includes(r)).map(room => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddRoom} disabled={!selectedRoom}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {newEntry.rooms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {newEntry.rooms.map(room => (
                <Badge key={room} variant="secondary" className="text-sm">
                  {room}
                  <button onClick={() => handleRemoveRoom(room)} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Notes</label>
          <Textarea
            placeholder="Special instructions, cleaning type, etc..."
            value={newEntry.notes}
            onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
            rows={2}
          />
        </div>

        <Button onClick={handleAddSchedule} className="mt-4 w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </Card>

      {/* Schedules Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">Cleaning Schedules</h3>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-mono text-sm">{schedule.id}</TableCell>
                <TableCell>{schedule.date}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {schedule.rooms.map(room => (
                      <Badge key={room} variant="outline" className="text-xs">{room}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{schedule.assignedTo}</TableCell>
                <TableCell className="max-w-xs truncate">{schedule.notes || "-"}</TableCell>
                <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                <TableCell>{schedule.completedAt || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {schedule.status === "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(schedule.id, "in_progress")}>
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                    {schedule.status === "in_progress" && (
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(schedule.id, "completed")}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {schedule.status !== "completed" && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSchedule(schedule.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Footer */}
      <div className="text-sm text-gray-600 text-right">
        Showing {filteredSchedules.length} of {schedules.length} schedules
      </div>
    </div>
  );
}
