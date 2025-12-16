import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { files } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { storagePut } from "../storage";

/**
 * File Manager Router
 * Handles file uploads, listing, and deletion
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const fileManagerRouter = router({
  /**
   * Upload a file to S3 and save metadata to database
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
        module: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, "base64");
        const fileSize = buffer.length;

        // Check file size
        if (fileSize > MAX_FILE_SIZE) {
          throw new Error(`ფაილის ზომა აჭარბებს 10MB ლიმიტს`);
        }

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `user-${ctx.user.id}/files/${timestamp}-${randomSuffix}-${input.fileName}`;

        // Upload to S3
        const { url: fileUrl } = await storagePut(fileKey, buffer, input.mimeType);

        // Save to database
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Use parameterized SQL query
        const insertQuery = sql`
          INSERT INTO files (userId, fileName, fileUrl, fileSize, mimeType, module, description)
          VALUES (${ctx.user.id}, ${input.fileName}, ${fileUrl}, ${fileSize}, ${input.mimeType}, ${input.module || null}, ${input.description || null})
        `;
        
        const result = await db.execute(insertQuery);

        return {
          success: true,
          fileId: result[0].insertId,
          fileUrl,
          message: "ფაილი წარმატებით აიტვირთა",
        };
      } catch (error) {
        console.error("[FileManager] Upload error:", error);
        throw new Error(
          error instanceof Error ? error.message : "ფაილის ატვირთვა ვერ მოხერხდა"
        );
      }
    }),

  /**
   * Get all files for the current user
   */
  list: protectedProcedure
    .input(
      z
        .object({
          module: z.string().optional(),
          limit: z.number().optional().default(100),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return [];
        }

        let query = db
          .select()
          .from(files)
          .where(eq(files.userId, ctx.user.id))
          .orderBy(desc(files.uploadedAt))
          .limit(input?.limit || 100);

        const results = await query;

        return results.map((file) => ({
          id: file.id,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          module: file.module,
          description: file.description,
          uploadedAt: file.uploadedAt,
        }));
      } catch (error) {
        console.error("[FileManager] List error:", error);
        return [];
      }
    }),

  /**
   * Delete a file
   */
  delete: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Verify file belongs to user before deleting
        const fileToDelete = await db
          .select()
          .from(files)
          .where(eq(files.id, input.fileId))
          .limit(1);

        if (fileToDelete.length === 0) {
          throw new Error("ფაილი ვერ მოიძებნა");
        }

        if (fileToDelete[0].userId !== ctx.user.id) {
          throw new Error("არ გაქვთ ამ ფაილის წაშლის უფლება");
        }

        // Delete from database
        await db.delete(files).where(eq(files.id, input.fileId));

        return {
          success: true,
          message: "ფაილი წარმატებით წაიშალა",
        };
      } catch (error) {
        console.error("[FileManager] Delete error:", error);
        throw new Error(
          error instanceof Error ? error.message : "ფაილის წაშლა ვერ მოხერხდა"
        );
      }
    }),

  /**
   * Get file by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return null;
        }

        const result = await db
          .select()
          .from(files)
          .where(eq(files.id, input.fileId))
          .limit(1);

        if (result.length === 0 || result[0].userId !== ctx.user.id) {
          return null;
        }

        return result[0];
      } catch (error) {
        console.error("[FileManager] GetById error:", error);
        return null;
      }
    }),
});
