import { supabase } from "@/integrations/supabase/client";
import { trpc } from "@/lib/trpc";

interface LogActivityParams {
  action: "create" | "update" | "delete";
  entityType: "room" | "inventory_item" | "housekeeping_schedule" | "maintenance_schedule";
  entityId?: string;
  entityName?: string;
  changes?: any;
}

export const useLogisticsActivity = () => {
  // ROWS.COM sync mutation
  const rowsSyncMutation = trpc.rows.logActivity.useMutation({
    onError: (error) => {
      console.warn("[ROWS] Activity sync failed:", error.message);
    },
  });

  const logActivity = async ({
    action,
    entityType,
    entityId,
    entityName,
    changes,
  }: LogActivityParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Write to Supabase (primary)
      await supabase.from("logistics_activity_log").insert({
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        changes,
      });

      // 2. Sync to ROWS.COM (background, non-blocking)
      rowsSyncMutation.mutate({
        userEmail: user.email || "unknown",
        action,
        entityType,
        entityId,
        entityName,
        changes,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return { logActivity };
};
