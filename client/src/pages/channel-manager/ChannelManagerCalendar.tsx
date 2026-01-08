import { RowsCalendarEmbed } from "@/components/RowsEmbed";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ChannelManagerCalendar() {
  const { t } = useLanguage();
  const otelmsApiUrl = import.meta.env.VITE_OTELMS_API_URL;

  const syncCalendarMutation = trpc.otelms.syncCalendar.useMutation({
    onSuccess: () => {
      toast.success("Calendar synced successfully");
    },
    onError: (error) => {
      toast.error(`Sync error: ${error.message}`);
    },
  });

  const handleSync = () => {
    syncCalendarMutation.mutate();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channel Manager - Calendar</h1>
          <p className="text-muted-foreground">Live calendar from Rows.com</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncCalendarMutation.isPending}>
            {syncCalendarMutation.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Calendar
          </Button>
          {otelmsApiUrl && (
            <Button variant="outline" asChild>
              <a href={otelmsApiUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View OTELMS API
              </a>
            </Button>
          )}
        </div>
      </div>

      <RowsCalendarEmbed />
    </div>
  );
}
