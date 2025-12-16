import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Clock, 
  User, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Globe,
  Settings,
  FileText,
  Mail,
  DollarSign,
  Calendar
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format, formatDistanceToNow } from "date-fns";

const actionTypeIcons: Record<string, any> = {
  create: Database,
  update: Settings,
  delete: FileText,
  login: User,
  email: Mail,
  booking: Calendar,
  payment: DollarSign,
  external: Globe,
};

const actionTypeColors: Record<string, string> = {
  create: "bg-green-500/20 text-green-400 border-green-500/30",
  update: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delete: "bg-red-500/20 text-red-400 border-red-500/30",
  login: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  email: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  booking: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  payment: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  external: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actionType: "",
    module: "",
    startDate: "",
    endDate: "",
  });

  const { data: logsData, isLoading, refetch } = trpc.activityLog.getAll.useQuery({
    page,
    limit: 20,
    actionType: filters.actionType || undefined,
    module: filters.module || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  });

  const { data: actionTypes } = trpc.activityLog.getActionTypes.useQuery();
  const { data: modules } = trpc.activityLog.getModules.useQuery();

  const rollbackMutation = trpc.activityLog.rollback.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const canRollback = (createdAt: Date) => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return new Date(createdAt) > fifteenMinutesAgo;
  };

  const handleRollback = async (id: number) => {
    if (confirm("Are you sure you want to undo this action?")) {
      await rollbackMutation.mutateAsync({ id, userId: 1 });
    }
  };

  const clearFilters = () => {
    setFilters({
      actionType: "",
      module: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Activity Log</h1>
              <p className="text-slate-400">Track all system activities and changes</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600">
            {logsData?.total || 0} total activities
          </Badge>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters({ ...filters, actionType: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {actionTypes?.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.module}
                onValueChange={(value) => setFilters({ ...filters, module: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Modules</SelectItem>
                  {modules?.map((mod) => (
                    <SelectItem key={mod} value={mod || ""}>{mod}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
              ) : logsData?.logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Activity className="w-12 h-12 mb-2 opacity-50" />
                  <p>No activity logs found</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

                  {logsData?.logs.map((log, index) => {
                    const Icon = actionTypeIcons[log.actionType] || Activity;
                    const colorClass = actionTypeColors[log.actionType] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
                    const isRollbackable = log.isRollbackable && !log.rolledBackAt && canRollback(log.createdAt);

                    return (
                      <div
                        key={log.id}
                        className={`relative flex items-start gap-4 p-4 hover:bg-slate-700/30 transition-colors ${
                          log.rolledBackAt ? "opacity-50" : ""
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-white capitalize">
                                  {log.actionType}
                                </span>
                                {log.targetEntity && (
                                  <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                                    {log.targetEntity}
                                  </Badge>
                                )}
                                {log.module && (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                                    {log.module}
                                  </Badge>
                                )}
                                {log.rolledBackAt && (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                                    Rolled Back
                                  </Badge>
                                )}
                              </div>
                              {log.targetId && (
                                <p className="text-sm text-slate-400 mt-1">
                                  ID: {log.targetId}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isRollbackable && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRollback(log.id)}
                                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                  disabled={rollbackMutation.isPending}
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Undo
                                </Button>
                              )}
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>

                          {/* Changes preview */}
                          {(log.oldValue || log.newValue) && (
                            <div className="mt-2 p-2 bg-slate-900/50 rounded-lg text-xs">
                              {log.oldValue && (
                                <div className="text-red-400/70">
                                  - {JSON.stringify(log.oldValue).slice(0, 100)}...
                                </div>
                              )}
                              {log.newValue && (
                                <div className="text-green-400/70">
                                  + {JSON.stringify(log.newValue).slice(0, 100)}...
                                </div>
                              )}
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            {log.userId && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                User #{log.userId}
                              </span>
                            )}
                            {log.ipAddress && (
                              <span>{log.ipAddress}</span>
                            )}
                            <span>
                              {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pagination */}
        {logsData && logsData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Page {page} of {logsData.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(logsData.totalPages, p + 1))}
                disabled={page === logsData.totalPages}
                className="border-slate-600 text-slate-300"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
