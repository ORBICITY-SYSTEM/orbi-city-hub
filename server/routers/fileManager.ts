import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { files } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

/**
 * File Manager Router
 * Centralized file management system with upload history, file operations, and AI integration
 */

export const fileManagerRouter = router({
  /**
   * Upload file to S3 and save metadata to database
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
        fileSize: z.number(),
        module: z.string().optional(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileExtension = input.fileName.split(".").pop();
      const fileKey = `user-${ctx.user.id}/uploads/${timestamp}-${randomSuffix}.${fileExtension}`;

      // Convert base64 to buffer
      const base64Data = input.fileData.split(",")[1] || input.fileData;
      const fileBuffer = Buffer.from(base64Data, "base64");

      // Upload to S3
      const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);

      // Save to database
      const [file] = await db.insert(files).values({
        userId: ctx.user.id,
        fileName: input.fileName,
        originalName: input.fileName,
        fileUrl,
        fileKey,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        module: input.module || null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        description: input.description || null,
        isDeleted: false,
      });

      return {
        success: true,
        fileId: file.insertId,
        fileUrl,
        fileName: input.fileName,
      };
    }),

  /**
   * List all files for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        module: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      let query = db
        .select()
        .from(files)
        .where(and(eq(files.userId, ctx.user.id), eq(files.isDeleted, false)))
        .orderBy(desc(files.uploadedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Filter by module if provided
      if (input.module) {
        query = db
          .select()
          .from(files)
          .where(and(eq(files.userId, ctx.user.id), eq(files.isDeleted, false), eq(files.module, input.module)))
          .orderBy(desc(files.uploadedAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      const result = await query;

      // Parse JSON fields
      const parsedFiles = result.map((file) => ({
        ...file,
        tags: file.tags ? JSON.parse(file.tags as string) : [],
      }));

      return {
        files: parsedFiles,
        total: parsedFiles.length,
      };
    }),

  /**
   * Get single file by ID
   */
  getById: protectedProcedure.input(z.object({ fileId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, input.fileId), eq(files.userId, ctx.user.id), eq(files.isDeleted, false)))
      .limit(1);

    if (!file) {
      throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
    }

    return {
      ...file,
      tags: file.tags ? JSON.parse(file.tags as string) : [],
    };
  }),

  /**
   * Rename file
   */
  rename: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        newName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify ownership
      const [file] = await db
        .select()
        .from(files)
        .where(and(eq(files.id, input.fileId), eq(files.userId, ctx.user.id), eq(files.isDeleted, false)))
        .limit(1);

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      // Update filename
      await db.update(files).set({ fileName: input.newName }).where(eq(files.id, input.fileId));

      return { success: true };
    }),

  /**
   * Update file metadata (tags, description, module)
   */
  updateMetadata: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        module: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify ownership
      const [file] = await db
        .select()
        .from(files)
        .where(and(eq(files.id, input.fileId), eq(files.userId, ctx.user.id), eq(files.isDeleted, false)))
        .limit(1);

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      // Update metadata
      const updates: any = {};
      if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags);
      if (input.description !== undefined) updates.description = input.description;
      if (input.module !== undefined) updates.module = input.module;

      await db.update(files).set(updates).where(eq(files.id, input.fileId));

      return { success: true };
    }),

  /**
   * Soft delete file (mark as deleted, don't remove from S3)
   */
  delete: protectedProcedure.input(z.object({ fileId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Verify ownership
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, input.fileId), eq(files.userId, ctx.user.id), eq(files.isDeleted, false)))
      .limit(1);

    if (!file) {
      throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
    }

    // Soft delete
    await db.update(files).set({ isDeleted: true }).where(eq(files.id, input.fileId));

    return { success: true };
  }),

  /**
   * Search files by name or tags
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        module: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get all user files
      const allFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, ctx.user.id), eq(files.isDeleted, false)))
        .orderBy(desc(files.uploadedAt));

      // Filter by search query (case-insensitive)
      const searchLower = input.query.toLowerCase();
      const filtered = allFiles.filter((file) => {
        const nameMatch = file.fileName.toLowerCase().includes(searchLower);
        const descMatch = file.description?.toLowerCase().includes(searchLower);
        const tagsMatch = file.tags ? JSON.parse(file.tags as string).some((tag: string) => tag.toLowerCase().includes(searchLower)) : false;

        const moduleMatch = input.module ? file.module === input.module : true;

        return (nameMatch || descMatch || tagsMatch) && moduleMatch;
      });

      // Parse JSON fields
      const parsedFiles = filtered.map((file) => ({
        ...file,
        tags: file.tags ? JSON.parse(file.tags as string) : [],
      }));

      return {
        files: parsedFiles,
        total: parsedFiles.length,
      };
    }),

  /**
   * Get file statistics
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const userFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, ctx.user.id), eq(files.isDeleted, false)));

    const totalSize = userFiles.reduce((sum, file) => sum + file.fileSize, 0);
    const totalFiles = userFiles.length;

    // Group by module
    const byModule: Record<string, number> = {};
    userFiles.forEach((file) => {
      const module = file.module || "uncategorized";
      byModule[module] = (byModule[module] || 0) + 1;
    });

    // Group by mime type
    const byType: Record<string, number> = {};
    userFiles.forEach((file) => {
      const type = file.mimeType.split("/")[0] || "other";
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      totalFiles,
      totalSize,
      byModule,
      byType,
    };
  }),
});
