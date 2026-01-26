import { supabase } from "@/integrations/supabase/client";

interface LogActivityParams {
  action: "create" | "update" | "delete";
  entityType: "room" | "inventory_item" | "housekeeping_schedule" | "maintenance_schedule";
  entityId?: string;
  entityName?: string;
  changes?: any;
}

export const useLogisticsActivity = () => {
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

      // Write to Supabase (single source of truth)
      await supabase.from("logistics_activity_log").insert({
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        changes,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return { logActivity };
};
