import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useLogisticsRealtimeNotifications = () => {
  const { t } = useLanguage();

  useEffect(() => {
    const getCurrentUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    };

    const setupRealtimeSubscription = async () => {
      const currentUserId = await getCurrentUserId();

      const channel = supabase
        .channel('logistics-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logistics_activity_log'
          },
          (payload) => {
            const newLog = payload.new as any;
            
            // Don't show notifications for current user's own changes
            if (newLog.user_id === currentUserId) {
              return;
            }

            const actionText = {
              create: t("შექმნა", "created"),
              update: t("განაახლა", "updated"),
              delete: t("წაშალა", "deleted")
            }[newLog.action] || newLog.action;

            const entityText = {
              room: t("ოთახი", "room"),
              inventory_item: t("ინვენტარის ელემენტი", "inventory item"),
              housekeeping_schedule: t("დასუფთავების გრაფიკი", "housekeeping schedule"),
              maintenance_schedule: t("ტექნიკური გრაფიკი", "maintenance schedule")
            }[newLog.entity_type] || newLog.entity_type;

            toast({
              title: t("ახალი ცვლილება", "New Change"),
              description: `${newLog.user_email || t("მომხმარებელმა", "User")} ${actionText} ${entityText}${newLog.entity_name ? `: ${newLog.entity_name}` : ""}`,
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [t]);
};
