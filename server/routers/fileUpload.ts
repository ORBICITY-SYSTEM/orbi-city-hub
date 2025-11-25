import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { files } from "../../drizzle/schema";
import { eq, and, like, desc } from "drizzle-orm";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

/**
 * File Manager Router
 * Centralized file upload and management system for CEO Dashboard
 */
export const fileUploadRouter = router({
  /**
   * Upload a file to S3 and save metadata to database
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
        module: z.string().optional(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Validate file size (10MB limit)
        const base64Data = input.fileData.split(",")[1] || input.fileData;
        const buffer = Buffer.from(base64Data, "base64");
        const fileSize = buffer.length;
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB

        if (fileSize > maxSizeBytes) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ფაილის ზომა არ უნდა აღემატებოდეს 10MB-ს",
          });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const ext = input.fileName.split(".").pop();
        const uniqueFileName = `${ctx.user.id}-${timestamp}-${randomSuffix}.${ext}`;

        // Upload to S3
        const { url: fileUrl } = await storagePut(`uploads/${uniqueFileName}`, buffer, input.mimeType);

        // Save metadata to database
        const [file] = await db
          .insert(files)
          .values({
            userId: ctx.user.id,
            fileName: uniqueFileName,
            originalName: input.fileName,
            fileUrl,
            fileSize,
            mimeType: input.mimeType,
            module: input.module || null,
            tags: input.tags ? JSON.stringify(input.tags) : null,
            description: input.description || null,
          })
          .$returningId();

        return {
          success: true,
          id: file.id,
          url: fileUrl,
          fileName: input.fileName,
          fileKey: uniqueFileName,
          uploadedAt: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[FileManager] Upload error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ფაილის ატვირთვა ვერ მოხერხდა",
        });
      }
    }),

  /**
   * List all files for the current user
   */
  getUploadedFiles: protectedProcedure
    .input(
      z
        .object({
          module: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        return [];
      }

      try {
        const conditions = [eq(files.userId, ctx.user.id)];

        if (input?.module) {
          conditions.push(eq(files.module, input.module));
        }

        if (input?.search) {
          conditions.push(like(files.originalName, `%${input.search}%`));
        }

        const result = await db
          .select()
          .from(files)
          .where(and(...conditions))
          .orderBy(desc(files.uploadedAt))
          .limit(input?.limit || 50);

        return result.map(file => ({
          ...file,
          tags: file.tags ? JSON.parse(file.tags as string) : [],
        }));
      } catch (error) {
        console.error("[FileManager] List error:", error);
        return [];
      }
    }),

  /**
   * Get file statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return { totalFiles: 0, totalSize: 0, modules: {} };
    }

    try {
      const userFiles = await db.select().from(files).where(eq(files.userId, ctx.user.id));

      const totalSize = userFiles.reduce((sum, file) => sum + file.fileSize, 0);
      const moduleCount: Record<string, number> = {};

      userFiles.forEach(file => {
        const module = file.module || "uncategorized";
        moduleCount[module] = (moduleCount[module] || 0) + 1;
      });

      return {
        totalFiles: userFiles.length,
        totalSize,
        modules: moduleCount,
      };
    } catch (error) {
      console.error("[FileManager] Stats error:", error);
      return { totalFiles: 0, totalSize: 0, modules: {} };
    }
  }),

  /**
   * Delete a file
   */
  deleteFile: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    try {
      // Verify ownership
      const [file] = await db
        .select()
        .from(files)
        .where(and(eq(files.id, input.id), eq(files.userId, ctx.user.id)))
        .limit(1);

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // Delete from database
      await db.delete(files).where(eq(files.id, input.id));

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error("[FileManager] Delete error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete file",
      });
    }
  }),

  /**
   * Rename a file
   */
  renameFile: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        newName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Verify ownership
        const [file] = await db
          .select()
          .from(files)
          .where(and(eq(files.id, input.id), eq(files.userId, ctx.user.id)))
          .limit(1);

        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        // Update original name
        await db.update(files).set({ originalName: input.newName }).where(eq(files.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[FileManager] Rename error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to rename file",
        });
      }
    }),

  /**
   * Search files by name
   */
  searchFiles: protectedProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const result = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, ctx.user.id), like(files.originalName, `%${input.query}%`)))
        .orderBy(desc(files.uploadedAt))
        .limit(20);

      return result.map(file => ({
        ...file,
        tags: file.tags ? JSON.parse(file.tags as string) : [],
      }));
    } catch (error) {
      console.error("[FileManager] Search error:", error);
      return [];
    }
  }),
});
