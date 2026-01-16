import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";

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

type MappingEntry = {
  sourceField: string;
  rowsColumn: string;
};

type SourceState = {
  id: string;
  name: string;
  url: string;
  instructions: string;
  enabled: boolean;
  mapping: MappingEntry[];
};

const createSourceId = () => `src_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

const mappingRecordToEntries = (record?: Record<string, string>) =>
  Object.entries(record || {}).map(([sourceField, rowsColumn]) => ({
    sourceField,
    rowsColumn,
  }));

const mappingEntriesToRecord = (entries: MappingEntry[]) => {
  const record: Record<string, string> = {};
  entries.forEach(({ sourceField, rowsColumn }) => {
    const key = sourceField.trim();
    if (!key) return;
    record[key] = rowsColumn.trim();
  });
  return record;
};

export default function AxiomWebExtractor() {
  const { data, isLoading, refetch } = trpc.axiom.getWebExtractorAutomation.useQuery();
  const saveMutation = trpc.axiom.saveWebExtractorAutomation.useMutation();
  const runMutation = trpc.axiom.runWebExtractorAutomation.useMutation();
  const previewMutation = trpc.axiom.previewWebExtractorAutomation.useMutation();
  const testAxiomMutation = trpc.axiom.testConnection.useMutation();

  const [initialized, setInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [botId, setBotId] = useState("");
  const [rowsSpreadsheetId, setRowsSpreadsheetId] = useState("");
  const [rowsApiKey, setRowsApiKey] = useState("");
  const [createNewSheet, setCreateNewSheet] = useState(true);
  const [sheetNameTemplate, setSheetNameTemplate] = useState("Run {{date}} - {{source}}");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [time, setTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [sources, setSources] = useState<SourceState[]>([]);
  const [mappingDrafts, setMappingDrafts] = useState<Record<string, MappingEntry>>({});

  const [previewPayload, setPreviewPayload] = useState<Record<string, unknown> | null>(null);
  const [previewMissingFields, setPreviewMissingFields] = useState<string[]>([]);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewLastSync, setPreviewLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (!data || initialized) return;
    setIsEnabled(data.isEnabled ?? true);
    setBotId(data.botId ?? "");
    setRowsSpreadsheetId(data.rowsSpreadsheetId ?? "");
    setCreateNewSheet(data.createNewSheet ?? true);
    setSheetNameTemplate(data.sheetNameTemplate || "Run {{date}} - {{source}}");
    setFrequency((data.schedule?.frequency as "daily" | "weekly") || "daily");
    setTime(data.schedule?.time || "09:00");
    setDayOfWeek(String(data.schedule?.dayOfWeek ?? "1"));
    const normalizedSources: SourceState[] = (data.sources || []).map((source: any) => ({
      id: source.id,
      name: source.name || "",
      url: source.url || "",
      instructions: source.instructions || "",
      enabled: source.enabled ?? true,
      mapping: mappingRecordToEntries(source.mapping),
    }));
    setSources(normalizedSources);
    setInitialized(true);
  }, [data, initialized]);

  const statusLabel = useMemo(() => data?.status || "inactive", [data]);
  const statusClass = STATUS_STYLES[statusLabel] || STATUS_STYLES.inactive;
  const hasPreview =
    previewPayload !== null ||
    previewWarnings.length > 0 ||
    previewMissingFields.length > 0 ||
    previewLastSync !== null;

  const formattedLastSync = data?.lastSync ? new Date(data.lastSync).toLocaleString() : "Not synced yet";
  const formattedNextRun = data?.nextRun ? new Date(data.nextRun).toLocaleString() : "Not scheduled";

  const handleSourceChange = (id: string, updates: Partial<SourceState>) => {
    setSources((prev) =>
      prev.map((source) => (source.id === id ? { ...source, ...updates } : source))
    );
  };

  const handleAddSource = () => {
    const newSource: SourceState = {
      id: createSourceId(),
      name: "",
      url: "",
      instructions: "",
      enabled: true,
      mapping: [],
    };
    setSources((prev) => [...prev, newSource]);
  };

  const handleRemoveSource = (id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id));
    setMappingDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAddMapping = (sourceId: string) => {
    const draft = mappingDrafts[sourceId] || { sourceField: "", rowsColumn: "" };
    if (!draft.sourceField.trim()) {
      toast.error("Mapping field name is required");
      return;
    }
    setSources((prev) =>
      prev.map((source) => {
        if (source.id !== sourceId) return source;
        const existingIndex = source.mapping.findIndex(
          (entry) => entry.sourceField.trim() === draft.sourceField.trim()
        );
        if (existingIndex >= 0) {
          const updated = [...source.mapping];
          updated[existingIndex] = {
            sourceField: draft.sourceField.trim(),
            rowsColumn: draft.rowsColumn.trim(),
          };
          return { ...source, mapping: updated };
        }
        return {
          ...source,
          mapping: [
            ...source.mapping,
            { sourceField: draft.sourceField.trim(), rowsColumn: draft.rowsColumn.trim() },
          ],
        };
      })
    );
    setMappingDrafts((prev) => ({
      ...prev,
      [sourceId]: { sourceField: "", rowsColumn: "" },
    }));
  };

  const handleRemoveMapping = (sourceId: string, index: number) => {
    setSources((prev) =>
      prev.map((source) => {
        if (source.id !== sourceId) return source;
        const updated = [...source.mapping];
        updated.splice(index, 1);
        return { ...source, mapping: updated };
      })
    );
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        botId,
        rowsSpreadsheetId,
        rowsApiKey: rowsApiKey || undefined,
        createNewSheet,
        sheetNameTemplate,
        schedule: {
          frequency,
          time,
          dayOfWeek: frequency === "weekly" ? Number(dayOfWeek) : undefined,
        },
        sources: sources.map((source) => ({
          ...source,
          mapping: mappingEntriesToRecord(source.mapping),
        })),
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

  const handlePreview = async () => {
    try {
      const result = await previewMutation.mutateAsync({
        botId,
        rowsSpreadsheetId,
        rowsApiKey: rowsApiKey || undefined,
        createNewSheet,
        sheetNameTemplate,
        sources: sources.map((source) => ({
          ...source,
          mapping: mappingEntriesToRecord(source.mapping),
        })),
      });
      setPreviewPayload(result.payload);
      setPreviewMissingFields(result.missingFields || []);
      setPreviewWarnings(result.warnings || []);
      setPreviewLastSync(result.lastSync || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate preview");
    }
  };

  const handleTestAxiom = async () => {
    try {
      const result = await testAxiomMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message || "Axiom connection successful");
      } else {
        toast.error(result.error || result.message || "Axiom connection failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Axiom connection failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 -m-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Zap className="h-6 w-6 text-purple-200" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Axiom Web Extractor</h1>
                <p className="text-slate-300">
                  Paste URLs + instructions and sync extracted data into Rows sheets.
                </p>
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
                    Configure the bot, Rows destination, and scheduler.
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
                      <Label className="text-white">Rows Spreadsheet ID</Label>
                      <Input
                        value={rowsSpreadsheetId}
                        onChange={(event) => setRowsSpreadsheetId(event.target.value)}
                        placeholder="rows_spreadsheet_id"
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
                          : "Rows API key is required to send data"}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">Create new sheet</p>
                        <p className="text-xs text-slate-400">Creates a new sheet/tab per run.</p>
                      </div>
                      <Switch checked={createNewSheet} onCheckedChange={setCreateNewSheet} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Sheet name template</Label>
                      <Input
                        value={sheetNameTemplate}
                        onChange={(event) => setSheetNameTemplate(event.target.value)}
                        placeholder="Run {{date}} - {{source}}"
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-xs text-slate-400">
                        Use placeholders: {{`{{date}}`}}, {{`{{source}}`}}.
                      </p>
                    </div>
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
                  <CardTitle className="text-white">Sources</CardTitle>
                  <CardDescription className="text-slate-300">
                    Add URLs, instructions, and field mappings for each site.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sources.length === 0 && (
                    <p className="text-sm text-slate-400">No sources yet. Add your first site.</p>
                  )}
                  {sources.map((source) => (
                    <div key={source.id} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={source.enabled}
                            onCheckedChange={(value) => handleSourceChange(source.id, { enabled: value })}
                          />
                          <span className="text-sm text-white">Enabled</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => handleRemoveSource(source.id)}
                          className="text-slate-300 hover:text-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-white">Source name</Label>
                          <Input
                            value={source.name}
                            onChange={(event) => handleSourceChange(source.id, { name: event.target.value })}
                            placeholder="Example: Tawk.to Contacts"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Source URL</Label>
                          <Input
                            value={source.url}
                            onChange={(event) => handleSourceChange(source.id, { url: event.target.value })}
                            placeholder="https://example.com/page"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Extraction instructions</Label>
                        <Textarea
                          value={source.instructions}
                          onChange={(event) => handleSourceChange(source.id, { instructions: event.target.value })}
                          placeholder="Describe exactly which data to collect and how to format it."
                          className="min-h-[110px] bg-white/10 border-white/20 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Field mapping</Label>
                        <div className="space-y-2">
                          {source.mapping.map((entry, index) => (
                            <div key={`${source.id}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                              <Input
                                value={entry.sourceField}
                                onChange={(event) => {
                                  const updated = [...source.mapping];
                                  updated[index] = { ...entry, sourceField: event.target.value };
                                  handleSourceChange(source.id, { mapping: updated });
                                }}
                                placeholder="Source field key"
                                className="bg-white/10 border-white/20 text-white"
                              />
                              <Input
                                value={entry.rowsColumn}
                                onChange={(event) => {
                                  const updated = [...source.mapping];
                                  updated[index] = { ...entry, rowsColumn: event.target.value };
                                  handleSourceChange(source.id, { mapping: updated });
                                }}
                                placeholder="Rows column name"
                                className="bg-white/10 border-white/20 text-white"
                              />
                              <Button
                                variant="ghost"
                                onClick={() => handleRemoveMapping(source.id, index)}
                                className="text-slate-300 hover:text-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                          <Input
                            value={mappingDrafts[source.id]?.sourceField || ""}
                            onChange={(event) =>
                              setMappingDrafts((prev) => ({
                                ...prev,
                                [source.id]: {
                                  sourceField: event.target.value,
                                  rowsColumn: prev[source.id]?.rowsColumn || "",
                                },
                              }))
                            }
                            placeholder="Source field key"
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <Input
                            value={mappingDrafts[source.id]?.rowsColumn || ""}
                            onChange={(event) =>
                              setMappingDrafts((prev) => ({
                                ...prev,
                                [source.id]: {
                                  sourceField: prev[source.id]?.sourceField || "",
                                  rowsColumn: event.target.value,
                                },
                              }))
                            }
                            placeholder="Rows column name"
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <Button
                            variant="outline"
                            onClick={() => handleAddMapping(source.id)}
                            className="border-purple-500/50 text-purple-200 hover:bg-purple-500/10"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddSource}
                    className="border-purple-500/50 text-purple-200 hover:bg-purple-500/10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add source
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Preview & Validate</CardTitle>
                  <CardDescription className="text-slate-300">
                    Generate the payload and validate required settings before running.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={previewMutation.isPending || isLoading}
                      className="border-purple-500/50 text-purple-200 hover:bg-purple-500/10"
                    >
                      {previewMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Generate preview
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleTestAxiom}
                      disabled={testAxiomMutation.isPending}
                      className="border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/10"
                    >
                      {testAxiomMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Test Axiom connection
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {hasPreview ? (
                      previewMissingFields.length > 0 ? (
                        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                          <div className="flex items-center gap-2 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            Missing required fields:
                          </div>
                          <p className="mt-2 text-xs text-red-100">
                            {previewMissingFields.join(", ")}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                          <div className="flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Required fields look good.
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                        Generate a preview to validate your configuration.
                      </div>
                    )}

                    {previewWarnings.length > 0 && (
                      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                        <p className="font-medium">Warnings:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-50">
                          {previewWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasPreview && (
                      <p className="text-xs text-slate-400">
                        Last sync reference: {previewLastSync || "none"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Payload preview</Label>
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(
                          previewPayload || {
                            note: "Generate a preview to see the payload that will be sent to Axiom.",
                            lastSync: previewLastSync,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
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
