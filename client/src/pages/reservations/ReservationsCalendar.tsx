/**
 * Reservations Calendar Page
 * Displays reservations calendar using Rows.com embed
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Calendar, BarChart3, Download } from "lucide-react";
import { RowsCalendarEmbed, RowsStatusEmbed } from "@/components/RowsEmbed";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ReservationsCalendar() {
  const [refreshing, setRefreshing] = useState(false);

  // Trigger sync mutation
  const syncMutation = trpc.otelms.syncCalendar.useMutation({
    onSuccess: () => {
      toast.success("Calendar synced successfully");
      setRefreshing(false);
    },
    onError: (error) => {
      toast.error("Sync failed: " + error.message);
      setRefreshing(false);
    },
  });

  const handleSync = async () => {
    setRefreshing(true);
    try {
      await syncMutation.mutateAsync();
    } catch (error) {
      // Error handled in onError
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Reservations Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Live calendar view from OTELMS Channel Manager via Rows.com
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Sync Now
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            This calendar is automatically synced from OTELMS Channel Manager using our Python API.
            Data flows: <strong>OTELMS → Python API → Rows.com → This Dashboard</strong>
          </p>
          <p className="mt-2">
            Sync runs automatically every hour. Click "Sync Now" to trigger a manual sync.
          </p>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="status">
            <BarChart3 className="h-4 w-4 mr-2" />
            Status Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <RowsCalendarEmbed height={800} />
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <RowsStatusEmbed height={600} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
