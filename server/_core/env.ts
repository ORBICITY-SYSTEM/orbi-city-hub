import { z } from "zod";

const envSchema = z.object({
  VITE_APP_ID: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  OAUTH_SERVER_URL: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().optional(),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ROWS_API_KEY: z.string().optional(),
  ROWS_SPREADSHEET_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.warn("[ENV] Missing or invalid env vars, proceeding with best-effort defaults:", parsed.error.issues);
}
const env = parsed.success ? parsed.data : process.env;

export const ENV = {
  appId: env.VITE_APP_ID ?? "",
  cookieSecret: env.JWT_SECRET ?? "",
  databaseUrl: env.DATABASE_URL ?? "",
  oAuthServerUrl: env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: env.SUPABASE_URL ?? "",
  supabaseAnonKey: env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRole: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  rowsApiKey: env.ROWS_API_KEY ?? "",
  rowsSpreadsheetId: env.ROWS_SPREADSHEET_ID ?? "",
  openaiKey: env.OPENAI_API_KEY ?? "",
  upstashUrl: env.UPSTASH_REDIS_REST_URL ?? "",
  upstashToken: env.UPSTASH_REDIS_REST_TOKEN ?? "",
  sentryDsn: env.SENTRY_DSN ?? "",
};
