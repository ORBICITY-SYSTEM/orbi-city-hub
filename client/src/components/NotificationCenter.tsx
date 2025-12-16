import { useState } from "react";
import { Bell, Check, CheckCheck, X, AlertTriangle, Info, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  approval: Clock,
};

const typeColors = {
  info: "text-blue-400 bg-blue-500/20",
  success: "text-emerald-400 bg-emerald-500/20",
  warning: "text-yellow-400 bg-yellow-500/20",
  error: "text-red-400 bg-red-500/20",
  approval: "text-purple-400 bg-purple-500/20",
};

const priorityColors = {
  low: "border-slate-500/30",
  normal: "border-slate-500/30",
  high: "border-yellow-500/30",
  urgent: "border-red-500/30 animate-pulse",
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, refetch } = trpc.notifications.getAll.useQuery({
    limit: 20,
  });

  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery({});

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({});
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate({ id });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-300 hover:text-white hover:bg-slate-700/50"
        >
          <Bell className="h-5 w-5" />
          {(unreadCount || 0) > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 bg-slate-800 border-slate-700 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-semibold text-white">Notifications</h3>
          {(unreadCount || 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Bell className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Info;
                const colorClass = typeColors[notification.type as keyof typeof typeColors] || typeColors.info;
                const priorityClass = priorityColors[notification.priority as keyof typeof priorityColors] || priorityColors.normal;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-700/30 transition-colors cursor-pointer border-l-2 ${priorityClass} ${
                      !notification.isRead ? "bg-slate-700/20" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${notification.isRead ? "text-slate-400" : "text-white"}`}>
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                            onClick={(e) => handleDelete(notification.id, e)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {notification.message && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          {notification.actionLabel && notification.actionUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-xs text-emerald-400 hover:text-emerald-300 p-0 h-auto"
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white text-xs w-full"
            onClick={() => {
              setIsOpen(false);
              window.location.href = "/system/notifications";
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
