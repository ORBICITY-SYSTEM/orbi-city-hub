import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
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

export const appRouter = router({
  fileUpload: fileUploadRouter,
  fileManager: fileManagerRouter,
  admin: adminRouter,
  gmail: gmailRouter,
  reservations: reservationsRouter,
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
