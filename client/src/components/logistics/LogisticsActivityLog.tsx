import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { History, User, Clock, Package, ClipboardList, Wrench } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  changes: any;
  created_at: string;
}

export function LogisticsActivityLog() {
  const { t } = useLanguage();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logistics-activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logistics_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ActivityLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionBadge = (action: string) => {
    const actionMap = {
      create: { variant: "default" as const, label: t("შექმნა", "Created") },
      update: { variant: "secondary" as const, label: t("განახლდა", "Updated") },
      delete: { variant: "destructive" as const, label: t("წაიშალა", "Deleted") },
    };
    const config = actionMap[action as keyof typeof actionMap] || actionMap.update;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEntityIcon = (entityType: string) => {
    const iconMap = {
      room: <Package className="h-4 w-4" />,
      inventory_item: <Package className="h-4 w-4" />,
      housekeeping_schedule: <ClipboardList className="h-4 w-4" />,
      maintenance_schedule: <Wrench className="h-4 w-4" />,
    };
    return iconMap[entityType as keyof typeof iconMap] || <Package className="h-4 w-4" />;
  };

  const getEntityLabel = (entityType: string) => {
    const labelMap = {
      room: t("ოთახი", "Room"),
      inventory_item: t("ინვენტარი", "Inventory"),
      housekeeping_schedule: t("დასუფთავება", "Housekeeping"),
      maintenance_schedule: t("ტექნიკური", "Maintenance"),
    };
    return labelMap[entityType as keyof typeof labelMap] || entityType;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {t("აქტივობის ლოგი", "Activity Log")}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t(
          "ყველა ცვლილების ისტორია Logistics მოდულში",
          "History of all changes in Logistics module"
        )}
      </p>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <Card key={log.id} className="p-4 border-l-4 border-l-primary/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getEntityIcon(log.entity_type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(log.action)}
                        <span className="font-medium">{getEntityLabel(log.entity_type)}</span>
                        {log.entity_name && (
                          <span className="text-sm text-muted-foreground">
                            • {log.entity_name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{log.user_email || t("უცნობი", "Unknown")}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{format(new Date(log.created_at), "PPp")}</span>
                      </div>

                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-sm text-primary cursor-pointer hover:underline">
                            {t("ცვლილებები", "Changes")}
                          </summary>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("ჯერ არ არის აქტივობა", "No activity yet")}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
