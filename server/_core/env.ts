import { z } from "zod";

const envSchema = z.object({
  VITE_APP_ID: z.string().optional(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OAUTH_SERVER_URL: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().optional(),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  ROWS_API_KEY: z.string().min(1, "ROWS_API_KEY is required"),
  ROWS_SPREADSHEET_ID: z.string().min(1, "ROWS_SPREADSHEET_ID is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const ENV = {
  appId: parsed.VITE_APP_ID ?? "",
  cookieSecret: parsed.JWT_SECRET,
  databaseUrl: parsed.DATABASE_URL,
  oAuthServerUrl: parsed.OAUTH_SERVER_URL ?? "",
  ownerOpenId: parsed.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: parsed.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: parsed.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: parsed.SUPABASE_URL,
  supabaseAnonKey: parsed.SUPABASE_ANON_KEY,
  supabaseServiceRole: parsed.SUPABASE_SERVICE_ROLE_KEY,
  rowsApiKey: parsed.ROWS_API_KEY,
  rowsSpreadsheetId: parsed.ROWS_SPREADSHEET_ID,
  openaiKey: parsed.OPENAI_API_KEY,
  upstashUrl: parsed.UPSTASH_REDIS_REST_URL,
  upstashToken: parsed.UPSTASH_REDIS_REST_TOKEN,
  sentryDsn: parsed.SENTRY_DSN,
};
