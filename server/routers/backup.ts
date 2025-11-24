import { router, protectedProcedure } from "../_core/trpc";
import { createDatabaseBackup, cleanupOldBackups } from "../backup";
import { z } from "zod";

export const backupRouter = router({
  /**
   * Manually trigger a database backup
   * Only accessible to authenticated users
   */
  createBackup: protectedProcedure.mutation(async () => {
    return await createDatabaseBackup();
  }),

  /**
   * Clean up old backups
   * Only accessible to authenticated users
   */
  cleanup: protectedProcedure
    .input(z.object({
      retentionDays: z.number().min(1).max(365).default(30)
    }))
    .mutation(async ({ input }) => {
      const deletedCount = await cleanupOldBackups(input.retentionDays);
      return {
        success: true,
        deletedCount
      };
    }),
});
