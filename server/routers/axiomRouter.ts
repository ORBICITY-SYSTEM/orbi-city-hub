import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { testAxiomConnection } from "../services/axiomClient";
import {
  getTawktoRowsIntegration,
  maskSecret,
  saveTawktoRowsConfig,
  triggerTawktoRowsSync,
} from "../services/tawktoRowsAutomation";
import { getNextRunAt, refreshTawktoRowsSchedule } from "../tawktoRowsScheduler";

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
        schedule: input.schedule,
        isEnabled: input.isEnabled,
      });

      await refreshTawktoRowsSchedule();
      return { success: true };
    }),

  runTawktoRowsAutomation: protectedProcedure.mutation(async () => {
    return triggerTawktoRowsSync("manual");
  }),
});
