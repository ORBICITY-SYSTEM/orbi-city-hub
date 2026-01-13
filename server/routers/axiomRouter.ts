import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { triggerBot, testAxiomConnection } from "../services/axiomClient";

/**
 * Axiom AI Automation Router
 * 
 * Provides tRPC endpoints for triggering Axiom bots and testing connections
 */
export const axiomRouter = router({
  /**
   * Test Axiom API connection
   */
  testConnection: publicProcedure
    .mutation(async () => {
      return await testAxiomConnection();
    }),

  /**
   * Trigger an Axiom bot
   */
  triggerBot: publicProcedure
    .input(
      z.object({
        botId: z.string().min(1, "Bot ID is required"),
        payload: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { botId, payload } = input;
      return await triggerBot(botId, payload || {});
    }),
});
