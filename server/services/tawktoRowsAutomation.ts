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

export type TawktoRowsFieldMapping = Record<string, string>;

export const DEFAULT_FIELD_MAPPING: TawktoRowsFieldMapping = {
  contactId: "Contact ID",
  name: "Name",
  email: "Primary Email",
  phone: "Primary Phone",
  organization: "Organization",
  tags: "Tags",
  createdAt: "Created At",
  updatedAt: "Updated At",
  lastSeen: "Last Seen",
};

export type TawktoRowsConfig = {
  botId: string;
  rowsSpreadsheetId: string;
  rowsTableId?: string;
  rowsApiKey?: string;
  tawkPropertyId?: string;
  schedule: TawktoRowsSchedule;
  fieldMapping: TawktoRowsFieldMapping;
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

export function normalizeFieldMapping(mapping?: TawktoRowsFieldMapping) {
  const merged = { ...DEFAULT_FIELD_MAPPING, ...(mapping || {}) };
  return Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [key, (value ?? "").trim()])
  ) as TawktoRowsFieldMapping;
}

export function formatFieldMappingForPayload(mapping?: TawktoRowsFieldMapping) {
  const normalized = normalizeFieldMapping(mapping);
  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value.length > 0)
  ) as TawktoRowsFieldMapping;
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
  const normalizedConfig = config
    ? {
        ...config,
        fieldMapping: normalizeFieldMapping(config.fieldMapping),
      }
    : null;
  return { integration, config: normalizedConfig };
}

export async function saveTawktoRowsConfig(params: {
  botId: string;
  rowsSpreadsheetId: string;
  rowsTableId?: string;
  rowsApiKey?: string;
  tawkPropertyId?: string;
  schedule: TawktoRowsSchedule;
  fieldMapping?: TawktoRowsFieldMapping;
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

  const fieldMapping = normalizeFieldMapping(
    params.fieldMapping ?? existingConfig?.fieldMapping
  );

  const mergedConfig: TawktoRowsConfig = {
    botId: params.botId,
    rowsSpreadsheetId: params.rowsSpreadsheetId,
    rowsTableId: params.rowsTableId || undefined,
    rowsApiKey,
    tawkPropertyId: params.tawkPropertyId || undefined,
    schedule: params.schedule,
    fieldMapping,
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

export function buildTawktoRowsPayload(config: TawktoRowsConfig, lastSync?: Date | null) {
  const payload: Record<string, string | TawktoRowsFieldMapping | undefined> = {
    rowsApiKey: config.rowsApiKey,
    rowsSpreadsheetId: config.rowsSpreadsheetId,
    rowsTableId: config.rowsTableId,
    tawkPropertyId: config.tawkPropertyId,
    since: lastSync ? lastSync.toISOString() : undefined,
    fieldMapping: formatFieldMappingForPayload(config.fieldMapping),
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (!value) return false;
      if (typeof value === "object") {
        return Object.keys(value).length > 0;
      }
      return true;
    })
  );
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

  const payload = buildTawktoRowsPayload(
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
