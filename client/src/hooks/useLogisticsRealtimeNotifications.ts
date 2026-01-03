import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Logistics Realtime Notifications Hook
 * 
 * Migrated from Supabase realtime to tRPC polling.
 * In future, can be upgraded to SSE/WebSocket for true realtime.
 * 
 * Polls every 30 seconds for new activity log entries.
 */
export const useLogisticsRealtimeNotifications = () => {
  const { t } = useLanguage();
  const lastCheckedRef = useRef<Date>(new Date());
  const shownIdsRef = useRef<Set<number>>(new Set());

  // Poll for new activity logs
  const { data: activityLogs } = trpc.logistics.activity.list.useQuery(
    { limit: 10 },
    {
      refetchInterval: 30000, // Poll every 30 seconds
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    if (!activityLogs || activityLogs.length === 0) return;

    // Filter for new entries we haven't shown yet
    const newLogs = activityLogs.filter((log: any) => {
      const logDate = new Date(log.createdAt);
      const isNew = logDate > lastCheckedRef.current;
      const notShown = !shownIdsRef.current.has(log.id);
      return isNew && notShown;
    });

    // Show toast for each new log
    newLogs.forEach((log: any) => {
      shownIdsRef.current.add(log.id);

      const actionText = {
        create: t("შექმნა", "created"),
        update: t("განაახლა", "updated"),
        delete: t("წაშალა", "deleted"),
        status_change: t("სტატუსი შეცვალა", "changed status"),
        assign: t("მიანიჭა", "assigned"),
        complete: t("დაასრულა", "completed"),
      }[log.action] || log.action;

      const entityText = {
        room: t("ოთახი", "room"),
        inventory_item: t("ინვენტარის ელემენტი", "inventory item"),
        housekeeping_task: t("დასუფთავების ამოცანა", "housekeeping task"),
        maintenance_request: t("ტექნიკური მოთხოვნა", "maintenance request"),
      }[log.entityType] || log.entityType;

      toast.info(
        `${log.userName || t("მომხმარებელმა", "User")} ${actionText} ${entityText}${log.entityName ? `: ${log.entityName}` : ""}`,
        {
          description: t("ახალი ცვლილება", "New Change"),
          duration: 5000,
        }
      );
    });

    // Update last checked time
    if (newLogs.length > 0) {
      lastCheckedRef.current = new Date();
    }
  }, [activityLogs, t]);
};
