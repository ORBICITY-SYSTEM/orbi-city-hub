import { eq } from "drizzle-orm";
import { integrations } from "../../drizzle/schema";
import { getDb } from "../db";
import { decrypt, encrypt } from "../utils/encryption";

export const AXIOM_WEB_EXTRACTOR_SLUG = "axiom-web-extractor";
export const AXIOM_WEB_EXTRACTOR_NAME = "Axiom Web Extractor";

export type AutomationFrequency = "daily" | "weekly";

export type WebExtractorSchedule = {
  frequency: AutomationFrequency;
  time: string; // HH:mm
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
};

export type WebExtractorFieldMapping = Record<string, string>;

export type WebExtractorSource = {
  id: string;
  name: string;
  url: string;
  instructions: string;
  mapping: WebExtractorFieldMapping;
  enabled: boolean;
};

export type WebExtractorConfig = {
  botId: string;
  rowsSpreadsheetId: string;
  rowsApiKey?: string;
  createNewSheet: boolean;
  sheetNameTemplate: string;
  schedule: WebExtractorSchedule;
  sources: WebExtractorSource[];
};

type TriggerSource = "manual" | "schedule";

const DEFAULT_SCHEDULE: WebExtractorSchedule = {
  frequency: "daily",
  time: "09:00",
  dayOfWeek: 1,
};

const DEFAULT_SHEET_TEMPLATE = "Run {{date}} - {{source}}";

function parseConfig(rawConfig: unknown): WebExtractorConfig | null {
  if (!rawConfig) return null;
  if (typeof rawConfig === "string") {
    try {
      return JSON.parse(decrypt(rawConfig)) as WebExtractorConfig;
    } catch (error) {
      console.warn("[Axiom Web Extractor] Failed to decrypt config:", error);
      return null;
    }
  }
  if (typeof rawConfig === "object") {
    return rawConfig as WebExtractorConfig;
  }
  return null;
}

function normalizeMapping(mapping?: WebExtractorFieldMapping) {
  const normalized: WebExtractorFieldMapping = {};
  Object.entries(mapping || {}).forEach(([key, value]) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;
    normalized[trimmedKey] = (value ?? "").trim();
  });
  return normalized;
}

function normalizeSource(source: WebExtractorSource): WebExtractorSource {
  return {
    ...source,
    name: source.name.trim(),
    url: source.url.trim(),
    instructions: source.instructions.trim(),
    mapping: normalizeMapping(source.mapping),
  };
}

function normalizeConfig(config: WebExtractorConfig): WebExtractorConfig {
  return {
    ...config,
    botId: config.botId.trim(),
    rowsSpreadsheetId: config.rowsSpreadsheetId.trim(),
    sheetNameTemplate: (config.sheetNameTemplate || DEFAULT_SHEET_TEMPLATE).trim(),
    schedule: config.schedule || DEFAULT_SCHEDULE,
    sources: (config.sources || []).map(normalizeSource),
    createNewSheet: Boolean(config.createNewSheet),
  };
}

export async function getWebExtractorIntegration() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [integration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.slug, AXIOM_WEB_EXTRACTOR_SLUG))
    .limit(1);

  if (!integration) {
    return { integration: null, config: null };
  }

  const config = parseConfig(integration.config);
  return {
    integration,
    config: config ? normalizeConfig(config) : null,
  };
}

export async function saveWebExtractorConfig(params: {
  botId: string;
  rowsSpreadsheetId: string;
  rowsApiKey?: string;
  createNewSheet: boolean;
  sheetNameTemplate: string;
  schedule: WebExtractorSchedule;
  sources: WebExtractorSource[];
  isEnabled: boolean;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getWebExtractorIntegration();
  const existingConfig = existing.config;

  const rowsApiKey = params.rowsApiKey?.trim() || existingConfig?.rowsApiKey;
  if (!rowsApiKey && !process.env.ROWS_API_KEY) {
    throw new Error("Rows API key is required");
  }

  const normalizedConfig = normalizeConfig({
    botId: params.botId,
    rowsSpreadsheetId: params.rowsSpreadsheetId,
    rowsApiKey,
    createNewSheet: params.createNewSheet,
    sheetNameTemplate: params.sheetNameTemplate,
    schedule: params.schedule,
    sources: params.sources,
  });

  const encryptedConfig = encrypt(JSON.stringify(normalizedConfig));
  const status = params.isEnabled ? "active" : "inactive";

  if (existing.integration) {
    await db
      .update(integrations)
      .set({
        name: AXIOM_WEB_EXTRACTOR_NAME,
        type: "automation",
        config: encryptedConfig as any,
        status,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.slug, AXIOM_WEB_EXTRACTOR_SLUG));
  } else {
    await db.insert(integrations).values({
      name: AXIOM_WEB_EXTRACTOR_NAME,
      slug: AXIOM_WEB_EXTRACTOR_SLUG,
      type: "automation",
      config: encryptedConfig as any,
      status,
    });
  }

  return { success: true };
}

export function buildWebExtractorPayload(
  config: WebExtractorConfig,
  lastSync?: Date | null,
  triggeredBy: TriggerSource = "manual"
) {
  const enabledSources = config.sources
    .filter((source) => source.enabled && source.url.length > 0)
    .map((source) => ({
      id: source.id,
      name: source.name,
      url: source.url,
      instructions: source.instructions,
      mapping: normalizeMapping(source.mapping),
    }));

  const payload: Record<string, unknown> = {
    rowsApiKey: config.rowsApiKey,
    rowsSpreadsheetId: config.rowsSpreadsheetId,
    createNewSheet: config.createNewSheet,
    sheetNameTemplate: config.sheetNameTemplate,
    sources: enabledSources,
    since: lastSync ? lastSync.toISOString() : undefined,
    triggeredBy,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

export async function triggerWebExtractorRun(triggeredBy: TriggerSource) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { integration, config } = await getWebExtractorIntegration();
  if (!integration || !config) {
    return { success: false, error: "Automation is not configured" };
  }

  if (!config.botId) {
    return { success: false, error: "Axiom bot ID is missing" };
  }

  const rowsApiKey = config.rowsApiKey || process.env.ROWS_API_KEY;
  if (!rowsApiKey) {
    return { success: false, error: "Rows API key is missing" };
  }

  const { triggerBot } = await import("./axiomClient");
  const payload = buildWebExtractorPayload(
    {
      ...config,
      rowsApiKey,
    },
    integration.lastSync,
    triggeredBy
  );

  const result = await triggerBot(config.botId, payload as Record<string, unknown>);

  if (result.success) {
    await db
      .update(integrations)
      .set({
        status: "active",
        lastSync: new Date(),
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.slug, AXIOM_WEB_EXTRACTOR_SLUG));
  } else {
    await db
      .update(integrations)
      .set({
        status: "error",
        errorMessage: result.error || "Automation trigger failed",
        updatedAt: new Date(),
      })
      .where(eq(integrations.slug, AXIOM_WEB_EXTRACTOR_SLUG));
  }

  return result;
}

export const WEB_EXTRACTOR_DEFAULTS = {
  schedule: DEFAULT_SCHEDULE,
  sheetNameTemplate: DEFAULT_SHEET_TEMPLATE,
};
