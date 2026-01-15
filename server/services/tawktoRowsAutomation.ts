import { eq } from "drizzle-orm";
import { integrations } from "../../drizzle/schema";
import { getDb } from "../db";
import { decrypt, encrypt } from "../utils/encryption";
import { triggerBot } from "./axiomClient";

export const TAWKTO_ROWS_SLUG = "axiom-tawkto-rows";
export const TAWKTO_ROWS_NAME = "Axiom Tawk.to → Rows";

export type AutomationFrequency = "daily" | "weekly";

export type TawktoRowsSchedule = {
  frequency: AutomationFrequency;
  time: string; // HH:mm
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
};

export type TawktoRowsConfig = {
  botId: string;
  rowsSpreadsheetId: string;
  rowsTableId?: string;
  rowsApiKey?: string;
  tawkPropertyId?: string;
  schedule: TawktoRowsSchedule;
};

type TriggerSource = "manual" | "schedule";

function parseConfig(rawConfig: unknown): TawktoRowsConfig | null {
  if (!rawConfig) return null;
  if (typeof rawConfig === "string") {
    try {
      return JSON.parse(decrypt(rawConfig)) as TawktoRowsConfig;
    } catch (error) {
      console.warn("[Axiom Automation] Failed to decrypt config:", error);
      return null;
    }
  }
  if (typeof rawConfig === "object") {
    return rawConfig as TawktoRowsConfig;
  }
  return null;
}

export function maskSecret(value?: string, visibleChars: number = 4) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= visibleChars) return "•".repeat(trimmed.length);
  return `${"•".repeat(Math.max(trimmed.length - visibleChars, 6))}${trimmed.slice(-visibleChars)}`;
}

export async function getTawktoRowsIntegration() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [integration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.slug, TAWKTO_ROWS_SLUG))
    .limit(1);

  if (!integration) {
    return { integration: null, config: null };
  }

  const config = parseConfig(integration.config);
  return { integration, config };
}

export async function saveTawktoRowsConfig(params: {
  botId: string;
  rowsSpreadsheetId: string;
  rowsTableId?: string;
  rowsApiKey?: string;
  tawkPropertyId?: string;
  schedule: TawktoRowsSchedule;
  isEnabled: boolean;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getTawktoRowsIntegration();
  const existingConfig = existing.config;

  const rowsApiKey = params.rowsApiKey?.trim() || existingConfig?.rowsApiKey;
  if (!rowsApiKey && !process.env.ROWS_API_KEY) {
    throw new Error("Rows API key is required");
  }

  const mergedConfig: TawktoRowsConfig = {
    botId: params.botId,
    rowsSpreadsheetId: params.rowsSpreadsheetId,
    rowsTableId: params.rowsTableId || undefined,
    rowsApiKey,
    tawkPropertyId: params.tawkPropertyId || undefined,
    schedule: params.schedule,
  };

  const encryptedConfig = encrypt(JSON.stringify(mergedConfig));
  const status = params.isEnabled ? "active" : "inactive";

  if (existing.integration) {
    await db
      .update(integrations)
      .set({
        name: TAWKTO_ROWS_NAME,
        type: "automation",
        config: encryptedConfig as any,
        status,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.slug, TAWKTO_ROWS_SLUG));
  } else {
    await db.insert(integrations).values({
      name: TAWKTO_ROWS_NAME,
      slug: TAWKTO_ROWS_SLUG,
      type: "automation",
      config: encryptedConfig as any,
      status,
    });
  }

  return { success: true };
}

function buildPayload(config: TawktoRowsConfig, lastSync?: Date | null) {
  const payload: Record<string, string | undefined> = {
    rowsApiKey: config.rowsApiKey,
    rowsSpreadsheetId: config.rowsSpreadsheetId,
    rowsTableId: config.rowsTableId,
    tawkPropertyId: config.tawkPropertyId,
    since: lastSync ? lastSync.toISOString() : undefined,
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value));
}

export async function triggerTawktoRowsSync(triggeredBy: TriggerSource) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { integration, config } = await getTawktoRowsIntegration();
  if (!integration || !config) {
    return {
      success: false,
      error: "Automation is not configured",
    };
  }

  if (!config.botId) {
    return {
      success: false,
      error: "Axiom bot ID is missing",
    };
  }

  const rowsApiKey = config.rowsApiKey || process.env.ROWS_API_KEY;
  if (!rowsApiKey) {
    return {
      success: false,
      error: "Rows API key is missing",
    };
  }

  const payload = buildPayload(
    {
      ...config,
      rowsApiKey,
    },
    integration.lastSync
  );

  const result = await triggerBot(config.botId, {
    ...payload,
    triggeredBy,
  });

  if (result.success) {
    await db
      .update(integrations)
      .set({
        status: "active",
        lastSync: new Date(),
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.slug, TAWKTO_ROWS_SLUG));
  } else {
    await db
      .update(integrations)
      .set({
        status: "error",
        errorMessage: result.error || "Automation trigger failed",
        updatedAt: new Date(),
      })
      .where(eq(integrations.slug, TAWKTO_ROWS_SLUG));
  }

  return result;
}
