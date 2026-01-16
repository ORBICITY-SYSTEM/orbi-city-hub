import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { testAxiomConnection } from "../services/axiomClient";
import {
  buildTawktoRowsPayload,
  formatFieldMappingForPayload,
  getTawktoRowsIntegration,
  maskSecret,
  normalizeFieldMapping,
  saveTawktoRowsConfig,
  triggerTawktoRowsSync,
} from "../services/tawktoRowsAutomation";
import {
  WEB_EXTRACTOR_DEFAULTS,
  buildWebExtractorPayload,
  getWebExtractorIntegration,
  saveWebExtractorConfig,
  triggerWebExtractorRun,
} from "../services/axiomWebExtractor";
import { getNextRunAt, refreshTawktoRowsSchedule } from "../tawktoRowsScheduler";
import {
  getNextRunAt as getWebExtractorNextRunAt,
  refreshWebExtractorSchedule,
} from "../axiomWebExtractorScheduler";

const scheduleSchema = z
  .object({
    frequency: z.enum(["daily", "weekly"]),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    dayOfWeek: z.number().min(0).max(6).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.frequency === "weekly" && value.dayOfWeek === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dayOfWeek is required for weekly schedules",
        path: ["dayOfWeek"],
      });
    }
  });

export const axiomRouter = router({
  testConnection: protectedProcedure.mutation(async () => {
    return testAxiomConnection();
  }),

  getTawktoRowsAutomation: protectedProcedure.query(async () => {
    const { integration, config } = await getTawktoRowsIntegration();
    const rowsApiKeySource = config?.rowsApiKey
      ? "saved"
      : process.env.ROWS_API_KEY
        ? "environment"
        : "missing";

    const schedule = config?.schedule || {
      frequency: "daily",
      time: "09:00",
      dayOfWeek: 1,
    };

    return {
      configured: Boolean(config),
      status: integration?.status || "inactive",
      isEnabled: integration?.status === "active",
      lastSync: integration?.lastSync ? integration.lastSync.toISOString() : null,
      nextRun:
        integration?.status === "active" && config
          ? getNextRunAt(schedule).toISOString()
          : null,
      errorMessage: integration?.errorMessage || null,
      botId: config?.botId || "",
      rowsSpreadsheetId: config?.rowsSpreadsheetId || "",
      rowsTableId: config?.rowsTableId || "",
      tawkPropertyId: config?.tawkPropertyId || "",
      schedule,
      fieldMapping: normalizeFieldMapping(config?.fieldMapping),
      rowsApiKeyMasked: config?.rowsApiKey ? maskSecret(config.rowsApiKey) : "",
      rowsApiKeySource,
    };
  }),

  saveTawktoRowsAutomation: protectedProcedure
    .input(
      z.object({
        botId: z.string().min(1),
        rowsSpreadsheetId: z.string().min(1),
        rowsTableId: z.string().optional(),
        rowsApiKey: z.string().optional(),
        tawkPropertyId: z.string().optional(),
        fieldMapping: z.record(z.string()).optional(),
        schedule: scheduleSchema,
        isEnabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const rowsApiKey = input.rowsApiKey?.trim();

      await saveTawktoRowsConfig({
        botId: input.botId.trim(),
        rowsSpreadsheetId: input.rowsSpreadsheetId.trim(),
        rowsTableId: input.rowsTableId?.trim() || undefined,
        rowsApiKey: rowsApiKey ? rowsApiKey : undefined,
        tawkPropertyId: input.tawkPropertyId?.trim() || undefined,
        fieldMapping: input.fieldMapping,
        schedule: input.schedule,
        isEnabled: input.isEnabled,
      });

      await refreshTawktoRowsSchedule();
      return { success: true };
    }),

  runTawktoRowsAutomation: protectedProcedure.mutation(async () => {
    return triggerTawktoRowsSync("manual");
  }),

  previewTawktoRowsAutomation: protectedProcedure
    .input(
      z.object({
        botId: z.string().optional(),
        rowsSpreadsheetId: z.string().optional(),
        rowsTableId: z.string().optional(),
        rowsApiKey: z.string().optional(),
        tawkPropertyId: z.string().optional(),
        fieldMapping: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { integration, config } = await getTawktoRowsIntegration();
      const rowsApiKey =
        input.rowsApiKey?.trim() ||
        config?.rowsApiKey ||
        process.env.ROWS_API_KEY ||
        "";
      const fieldMapping = normalizeFieldMapping(input.fieldMapping ?? config?.fieldMapping);

      const effectiveConfig = {
        botId: input.botId?.trim() || config?.botId || "",
        rowsSpreadsheetId: input.rowsSpreadsheetId?.trim() || config?.rowsSpreadsheetId || "",
        rowsTableId: input.rowsTableId?.trim() || config?.rowsTableId || undefined,
        rowsApiKey,
        tawkPropertyId: input.tawkPropertyId?.trim() || config?.tawkPropertyId || undefined,
        schedule: config?.schedule || { frequency: "daily" as const, time: "09:00", dayOfWeek: 1 },
        fieldMapping,
      };

      const missingFields: string[] = [];
      if (!effectiveConfig.botId) missingFields.push("botId");
      if (!effectiveConfig.rowsSpreadsheetId) missingFields.push("rowsSpreadsheetId");
      if (!rowsApiKey) missingFields.push("rowsApiKey");
      if (!process.env.AXIOM_API_TOKEN) missingFields.push("axiomApiToken");

      const payload = buildTawktoRowsPayload(effectiveConfig, integration?.lastSync || null);
      const previewPayload = {
        ...payload,
        rowsApiKey: rowsApiKey ? maskSecret(rowsApiKey) : "",
        fieldMapping: formatFieldMappingForPayload(fieldMapping),
        triggeredBy: "manual",
      };

      const warnings: string[] = [];
      if (!effectiveConfig.rowsTableId) {
        warnings.push("Rows Table ID is optional but recommended for precise routing.");
      }
      if (!effectiveConfig.tawkPropertyId) {
        warnings.push("Tawk.to Property ID is optional; bot will use account default.");
      }

      return {
        payload: previewPayload,
        missingFields,
        warnings,
        lastSync: integration?.lastSync ? integration.lastSync.toISOString() : null,
      };
    }),

  getWebExtractorAutomation: protectedProcedure.query(async () => {
    const { integration, config } = await getWebExtractorIntegration();
    const rowsApiKeySource = config?.rowsApiKey
      ? "saved"
      : process.env.ROWS_API_KEY
        ? "environment"
        : "missing";

    const schedule = config?.schedule || WEB_EXTRACTOR_DEFAULTS.schedule;

    return {
      configured: Boolean(config),
      status: integration?.status || "inactive",
      isEnabled: integration?.status === "active",
      lastSync: integration?.lastSync ? integration.lastSync.toISOString() : null,
      nextRun:
        integration?.status === "active" && config
          ? getWebExtractorNextRunAt(schedule).toISOString()
          : null,
      errorMessage: integration?.errorMessage || null,
      botId: config?.botId || "",
      rowsSpreadsheetId: config?.rowsSpreadsheetId || "",
      createNewSheet: config?.createNewSheet ?? true,
      sheetNameTemplate: config?.sheetNameTemplate || WEB_EXTRACTOR_DEFAULTS.sheetNameTemplate,
      schedule,
      sources: config?.sources || [],
      rowsApiKeyMasked: config?.rowsApiKey ? maskSecret(config.rowsApiKey) : "",
      rowsApiKeySource,
    };
  }),

  saveWebExtractorAutomation: protectedProcedure
    .input(
      z.object({
        botId: z.string().min(1),
        rowsSpreadsheetId: z.string().min(1),
        rowsApiKey: z.string().optional(),
        createNewSheet: z.boolean(),
        sheetNameTemplate: z.string().min(1),
        schedule: scheduleSchema,
        sources: z.array(
          z.object({
            id: z.string().min(1),
            name: z.string(),
            url: z.string(),
            instructions: z.string(),
            mapping: z.record(z.string()).optional(),
            enabled: z.boolean(),
          })
        ),
        isEnabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const rowsApiKey = input.rowsApiKey?.trim();

      await saveWebExtractorConfig({
        botId: input.botId.trim(),
        rowsSpreadsheetId: input.rowsSpreadsheetId.trim(),
        rowsApiKey: rowsApiKey ? rowsApiKey : undefined,
        createNewSheet: input.createNewSheet,
        sheetNameTemplate: input.sheetNameTemplate,
        schedule: input.schedule,
        sources: input.sources.map((source) => ({
          ...source,
          name: source.name.trim(),
          url: source.url.trim(),
          instructions: source.instructions.trim(),
          mapping: source.mapping || {},
        })),
        isEnabled: input.isEnabled,
      });

      await refreshWebExtractorSchedule();
      return { success: true };
    }),

  runWebExtractorAutomation: protectedProcedure.mutation(async () => {
    return triggerWebExtractorRun("manual");
  }),

  previewWebExtractorAutomation: protectedProcedure
    .input(
      z.object({
        botId: z.string().optional(),
        rowsSpreadsheetId: z.string().optional(),
        rowsApiKey: z.string().optional(),
        createNewSheet: z.boolean().optional(),
        sheetNameTemplate: z.string().optional(),
        sources: z
          .array(
            z.object({
              id: z.string().min(1),
              name: z.string(),
              url: z.string(),
              instructions: z.string(),
              mapping: z.record(z.string()).optional(),
              enabled: z.boolean(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { integration, config } = await getWebExtractorIntegration();
      const rowsApiKey =
        input.rowsApiKey?.trim() ||
        config?.rowsApiKey ||
        process.env.ROWS_API_KEY ||
        "";

      const effectiveConfig = {
        botId: input.botId?.trim() || config?.botId || "",
        rowsSpreadsheetId: input.rowsSpreadsheetId?.trim() || config?.rowsSpreadsheetId || "",
        rowsApiKey,
        createNewSheet: input.createNewSheet ?? config?.createNewSheet ?? true,
        sheetNameTemplate: input.sheetNameTemplate || config?.sheetNameTemplate || WEB_EXTRACTOR_DEFAULTS.sheetNameTemplate,
        schedule: config?.schedule || WEB_EXTRACTOR_DEFAULTS.schedule,
        sources: input.sources || config?.sources || [],
      };

      const missingFields: string[] = [];
      if (!effectiveConfig.botId) missingFields.push("botId");
      if (!effectiveConfig.rowsSpreadsheetId) missingFields.push("rowsSpreadsheetId");
      if (!rowsApiKey) missingFields.push("rowsApiKey");
      if (!process.env.AXIOM_API_TOKEN) missingFields.push("axiomApiToken");
      if (effectiveConfig.sources.length === 0) missingFields.push("sources");

      const payload = buildWebExtractorPayload(
        {
          ...effectiveConfig,
          rowsApiKey,
        },
        integration?.lastSync || null,
        "manual"
      );

      const previewPayload = {
        ...payload,
        rowsApiKey: rowsApiKey ? maskSecret(rowsApiKey) : "",
      };

      const warnings: string[] = [];
      if (!effectiveConfig.sheetNameTemplate) {
        warnings.push("Sheet name template is empty; default will be used.");
      }

      return {
        payload: previewPayload,
        missingFields,
        warnings,
        lastSync: integration?.lastSync ? integration.lastSync.toISOString() : null,
      };
    }),
});
