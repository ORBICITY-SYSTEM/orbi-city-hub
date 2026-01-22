import { RowsStatusEmbed } from "@/components/RowsEmbed";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ChannelManagerStatus() {
  const { t } = useLanguage();

  const syncStatusMutation = trpc.otelms.syncStatus.useMutation({
    onSuccess: () => {
      toast.success("Status synced successfully");
    },
    onError: (error) => {
      toast.error(`Sync error: ${error.message}`);
    },
  });

  const handleSync = () => {
    syncStatusMutation.mutate();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channel Manager - Status</h1>
          <p className="text-muted-foreground">Live status from Rows.com</p>
        </div>
        <Button onClick={handleSync} disabled={syncStatusMutation.isPending}>
          {syncStatusMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sync Status
        </Button>
      </div>

      <RowsStatusEmbed />
    </div>
  );
}
