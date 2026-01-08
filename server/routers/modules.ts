import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  renameSubModule,
  addSubModule,
  updateKnowledgeBase,
  getModuleConfiguration,
} from "../moduleManagement";

export const modulesRouter = router({
  // Get all modules configuration
  getConfiguration: publicProcedure.query(async () => {
    return await getModuleConfiguration();
  }),

  // Rename/update a sub-module
  renameSubModule: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        subModuleId: z.string(),
        name: z.string().optional(),
        nameGe: z.string().optional(),
        description: z.string().optional(),
        descriptionGe: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await renameSubModule(input);
    }),

  // Add a new sub-module
  addSubModule: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        id: z.string(),
        name: z.string(),
        nameGe: z.string(),
        icon: z.string(),
        path: z.string(),
        description: z.string(),
        descriptionGe: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await addSubModule(input);
    }),

  // Update AI knowledge base
  updateKnowledgeBase: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        topics: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return await updateKnowledgeBase(input);
    }),
});
