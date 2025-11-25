import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

/**
 * File upload router for handling file uploads to S3 storage
 * Supports Excel, CSV, PDF, images for AI analysis
 */
export const fileUploadRouter = router({
  /**
   * Upload a file to S3 and return the URL
   * File is sent as base64 string from frontend
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded file data
        mimeType: z.string(),
        module: z.enum(["finance", "marketing", "logistics", "reservations", "reports"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate file size (10MB limit)
        const fileSizeBytes = (input.fileData.length * 3) / 4; // base64 to bytes approximation
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        
        if (fileSizeBytes > maxSizeBytes) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ფაილის ზომა არ უნდა აღემატებოდეს 10MB-ს",
          });
        }

        // Validate file type
        const allowedTypes = [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "მხარდაჭერილია მხოლოდ Excel, CSV, PDF და სურათები",
          });
        }

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(input.fileData, "base64");

        // Generate unique file key with timestamp and random suffix
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileExtension = input.fileName.split(".").pop();
        const fileKey = `${ctx.user.id}/${input.module}/${timestamp}-${randomSuffix}.${fileExtension}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        return {
          success: true,
          url,
          fileName: input.fileName,
          fileKey,
          uploadedAt: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("[File Upload] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ფაილის ატვირთვა ვერ მოხერხდა",
        });
      }
    }),

  /**
   * Get list of uploaded files for a module
   */
  getUploadedFiles: protectedProcedure
    .input(
      z.object({
        module: z.enum(["finance", "marketing", "logistics", "reservations", "reports"]),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Store file metadata in database and query here
      // For now, return empty array as placeholder
      return [];
    }),
});
