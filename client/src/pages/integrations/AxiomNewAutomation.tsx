import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, Clock, Loader2, Play, ShieldCheck, Zap } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-200 border-slate-500/30",
  pending: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  error: "bg-red-500/20 text-red-200 border-red-500/30",
};

const WEEK_DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export default function AxiomNewAutomation() {
  const { data, isLoading, refetch } = trpc.axiom.getTawktoRowsAutomation.useQuery();
  const saveMutation = trpc.axiom.saveTawktoRowsAutomation.useMutation();
  const runMutation = trpc.axiom.runTawktoRowsAutomation.useMutation();

  const [initialized, setInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [botId, setBotId] = useState("");
  const [tawkPropertyId, setTawkPropertyId] = useState("");
  const [rowsSpreadsheetId, setRowsSpreadsheetId] = useState("");
  const [rowsTableId, setRowsTableId] = useState("");
  const [rowsApiKey, setRowsApiKey] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [time, setTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState("1");

  useEffect(() => {
    if (!data || initialized) return;
    setIsEnabled(data.isEnabled ?? true);
    setBotId(data.botId ?? "");
    setTawkPropertyId(data.tawkPropertyId ?? "");
    setRowsSpreadsheetId(data.rowsSpreadsheetId ?? "");
    setRowsTableId(data.rowsTableId ?? "");
    setFrequency((data.schedule?.frequency as "daily" | "weekly") || "daily");
    setTime(data.schedule?.time || "09:00");
    setDayOfWeek(String(data.schedule?.dayOfWeek ?? "1"));
    setInitialized(true);
  }, [data, initialized]);

  const statusLabel = useMemo(() => {
    if (!data?.status) return "inactive";
    return data.status;
  }, [data]);

  const statusClass = STATUS_STYLES[statusLabel] || STATUS_STYLES.inactive;

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        botId,
        rowsSpreadsheetId,
        rowsTableId: rowsTableId || undefined,
        rowsApiKey: rowsApiKey || undefined,
        tawkPropertyId: tawkPropertyId || undefined,
        schedule: {
          frequency,
          time,
          dayOfWeek: frequency === "weekly" ? Number(dayOfWeek) : undefined,
        },
        isEnabled,
      });
      toast.success("Automation saved");
      setRowsApiKey("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save automation");
    }
  };

  const handleRun = async () => {
    try {
      const result = await runMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message || "Automation triggered");
      } else {
        toast.error(result.error || "Failed to trigger automation");
      }
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to trigger automation");
    }
  };

  const formattedLastSync = data?.lastSync ? new Date(data.lastSync).toLocaleString() : "Not synced yet";
  const formattedNextRun = data?.nextRun ? new Date(data.nextRun).toLocaleString() : "Not scheduled";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 -m-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <Zap className="h-6 w-6 text-purple-200" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">New Axiom Automation</h1>
                  <p className="text-slate-300">
                    Tawk.to contacts → Rows.com daily or weekly sync
                  </p>
                </div>
              </div>
            </div>
            <Badge className={`border ${statusClass} capitalize w-fit`}>{statusLabel}</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card className="bg-white/10 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Automation Setup</CardTitle>
                  <CardDescription className="text-slate-300">
                    Configure your Axiom bot and Rows destination.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">Enable automation</p>
                      <p className="text-xs text-slate-400">Runs on the schedule below.</p>
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white">Axiom Bot ID</Label>
                      <Input
                        value={botId}
                        onChange={(event) => setBotId(event.target.value)}
                        placeholder="bot_123456"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Tawk.to Property ID (optional)</Label>
                      <Input
                        value={tawkPropertyId}
                        onChange={(event) => setTawkPropertyId(event.target.value)}
                        placeholder="property_id"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white">Rows Spreadsheet ID</Label>
                      <Input
                        value={rowsSpreadsheetId}
                        onChange={(event) => setRowsSpreadsheetId(event.target.value)}
                        placeholder="rows_spreadsheet_id"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Rows Table ID (optional)</Label>
                      <Input
                        value={rowsTableId}
                        onChange={(event) => setRowsTableId(event.target.value)}
                        placeholder="rows_table_id"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Rows API Key</Label>
                    <Input
                      type="password"
                      value={rowsApiKey}
                      onChange={(event) => setRowsApiKey(event.target.value)}
                      placeholder="rows_••••"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      {data?.rowsApiKeySource === "saved" && data.rowsApiKeyMasked
                        ? `Saved key: ${data.rowsApiKeyMasked}`
                        : data?.rowsApiKeySource === "environment"
                          ? "Using ROWS_API_KEY from environment variables"
                          : "Rows API key is required to send contacts"}
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <CalendarClock className="h-4 w-4 text-purple-200" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-white">Frequency</Label>
                        <Select value={frequency} onValueChange={(value) => setFrequency(value as "daily" | "weekly")}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Run time</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="time"
                            value={time}
                            onChange={(event) => setTime(event.target.value)}
                            className="bg-white/10 border-white/20 text-white pl-9"
                          />
                        </div>
                      </div>
                      {frequency === "weekly" && (
                        <div className="space-y-2">
                          <Label className="text-white">Day of week</Label>
                          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {WEEK_DAYS.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Schedule runs on server time. Save to update the scheduler.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending || isLoading}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save automation"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRun}
                      disabled={runMutation.isPending || isLoading}
                      className="border-purple-500/50 text-purple-200 hover:bg-purple-500/10"
                    >
                      {runMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Run now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Bot Inputs</CardTitle>
                  <CardDescription className="text-slate-300">
                    Configure your Axiom bot to accept these input fields.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-200 space-y-2">
                  <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span>rowsApiKey</span>
                    <span className="text-xs text-slate-400">Rows API Key</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span>rowsSpreadsheetId</span>
                    <span className="text-xs text-slate-400">Spreadsheet ID</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span>rowsTableId</span>
                    <span className="text-xs text-slate-400">Optional table target</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span>tawkPropertyId</span>
                    <span className="text-xs text-slate-400">Optional property ID</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span>since</span>
                    <span className="text-xs text-slate-400">Last sync timestamp</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/10 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Status</CardTitle>
                  <CardDescription className="text-slate-300">
                    Monitor recent runs and scheduler state.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>Last sync</span>
                    <span className="text-slate-300">{formattedLastSync}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next run</span>
                    <span className="text-slate-300">{formattedNextRun}</span>
                  </div>
                  {data?.errorMessage && (
                    <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-red-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <span>{data.errorMessage}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Security Notes</CardTitle>
                  <CardDescription className="text-slate-300">
                    Keep API keys safe and rotate regularly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-200">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-200 mt-0.5" />
                    <span>Rows API keys are stored encrypted on the server.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-200 mt-0.5" />
                    <span>Axiom API key is read from `AXIOM_API_TOKEN`.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading automation settings...
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
