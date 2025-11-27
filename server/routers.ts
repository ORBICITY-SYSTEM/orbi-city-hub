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

export const appRouter = router({
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
});

export type AppRouter = typeof appRouter;
