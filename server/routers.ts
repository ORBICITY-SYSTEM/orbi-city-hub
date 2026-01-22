import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { googleRouter } from "./routers/google";
import { publicProcedure, router } from "./_core/trpc";
import { fileUploadRouter } from "./routers/fileUpload";
import { aiRouter } from "./routers/ai";
import { modulesRouter } from "./routers/modules";
import { backupRouter } from "./routers/backup";
import { healthRouter } from "./routers/health";
import { rbacRouter } from "./routers/rbac";
import { fileManagerRouter } from "./routers/fileManager";
import { adminRouter } from "./routers/admin";
import { gmailRouter } from "./routers/gmail";
import { reservationsRouter } from "./routers/reservations";
import { excelImportRouter } from "./routers/excelImport";
import { financeRouter } from "./routers/finance";
import { fileRouter } from "./fileRouter";
import { socialMediaRouter } from "./routers/socialMediaRouter";
import { logisticsRouter } from "./logisticsRouter";
import { feedbackRouter } from "./feedbackRouter";
import { healthCheckRouter } from "./routers/healthCheck";
import { cacheRouter } from "./routers/cache";
import { performanceRouter } from "./routers/performanceRouter";
import { alertsRouter } from "./routers/alertsRouter";
import { securityRouter } from "./routers/securityRouter";
import { gdprRouter } from "./routers/gdprRouter";
import { databaseRouter } from "./routers/databaseRouter";
import { uptimeRouter } from "./routers/uptimeRouter";
import { otelmsRouter } from "./routers/otelms";
import { integrationsRouter } from "./routers/integrationsRouter";
import { googleAnalyticsRouter } from "./routers/googleAnalytics";
import { googleBusinessRouter } from "./routers/googleBusiness";
import { gmailOtelmsRouter } from "./routers/gmailOtelms";
import { gmailSyncRouter } from "./routers/gmailSync";
import { emailCategorizationRouter } from "./routers/emailCategorizationRouter";
import { butlerRouter } from "./butlerRouter";
import { aiAnalyzerRouter } from "./aiAnalyzerRouter";
import { realFinanceRouter } from "./realFinanceRouter";
import { n8nWebhookRouter } from "./routers/n8nWebhook";
import { activityLogRouter } from "./routers/activityLog";
import { notificationsRouter } from "./routers/notificationsRouter";
import { analyticsRouter } from "./routers/analyticsRouter";
import { whitelabelRouter } from "./routers/whitelabelRouter";
import { otaRouter } from "./routers/otaRouter";
import { reviewsRouter } from "./routers/reviewsRouter";
import { ceoDashboardRouter } from "./ceoDashboardRouter";
import { telegramRouter } from "./routers/telegramRouter";
import { tawktoRouter } from "./routers/tawktoRouter";
import { ingestRouter } from "./routers/ingestRouter";
import { outboxRouter } from "./routers/outboxRouter";
import { seedLogisticsRouter } from "./routers/seedLogistics";
import { appscriptBridgeRouter } from "./routers/appscriptBridge";
import { marketingRouter } from "./routers/marketingRouter";
import { reservationsRouter as reservationsAIDirectorRouter } from "./routers/reservationsRouter";
import { financeRouter as financeAIDirectorRouter } from "./routers/financeRouter";
import { logisticsRouter as logisticsAIDirectorRouter } from "./routers/logisticsRouter";
import { financeCopilotRouter } from "./routers/financeCopilotRouter";
import { rowsRouter } from "./routers/rowsRouter";

export const appRouter = router({
  rows: rowsRouter,
  realFinance: realFinanceRouter,
  aiAnalyzer: aiAnalyzerRouter,
  butler: butlerRouter,
  google: googleRouter,
  fileUpload: fileUploadRouter,
  fileManager: fileManagerRouter,
  admin: adminRouter,
  gmail: gmailRouter,
  reservations: reservationsRouter,
  excelImport: excelImportRouter,
  finance: financeRouter,
  file: fileRouter,
  socialMedia: socialMediaRouter,
  logistics: logisticsRouter,
  feedback: feedbackRouter,
  healthCheck: healthCheckRouter,
  cache: cacheRouter,
  performance: performanceRouter,
  alerts: alertsRouter,
  security: securityRouter,
  gdpr: gdprRouter,
  database: databaseRouter,
  uptime: uptimeRouter,
  otelms: otelmsRouter,
  integrations: integrationsRouter,
  googleAnalytics: googleAnalyticsRouter,
  googleBusiness: googleBusinessRouter,
  gmailOtelms: gmailOtelmsRouter,
  gmailSync: gmailSyncRouter,
  emailCategorization: emailCategorizationRouter,
  n8nWebhook: n8nWebhookRouter,
  activityLog: activityLogRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
  whitelabel: whitelabelRouter,
  ota: otaRouter,
  reviews: reviewsRouter,
  ceoDashboard: ceoDashboardRouter,
  telegram: telegramRouter,
  tawkto: tawktoRouter,
  ingest: ingestRouter,
  outbox: outboxRouter,
  seedLogistics: seedLogisticsRouter,
  appscriptBridge: appscriptBridgeRouter,
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  ai: aiRouter,
  modules: modulesRouter,
  backup: backupRouter,
  health: healthRouter,
  rbac: rbacRouter,
  marketing: marketingRouter,
  reservationsAIDirector: reservationsAIDirectorRouter,
  financeAIDirector: financeAIDirectorRouter,
  logisticsAIDirector: logisticsAIDirectorRouter,
  financeCopilot: financeCopilotRouter,
});

export type AppRouter = typeof appRouter;
