/**
 * AI Analyzer Router - tRPC endpoints for intelligent file analysis
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { analyzeUploadedFile, type FileAnalysisResult } from "./aiFileAnalyzer";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const aiAnalyzerRouter = router({
  /**
   * Analyze uploaded file and get intelligent distribution plan
   */
  analyzeFile: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }): Promise<FileAnalysisResult> => {
      try {
        // Download file from URL (if it's a URL)
        let filePath = input.fileUrl;
        
        // If it's a local path, use it directly
        if (!input.fileUrl.startsWith("http")) {
          filePath = input.fileUrl;
        }

        // Analyze file with AI
        const analysis = await analyzeUploadedFile(filePath, input.fileName);

        return analysis;
      } catch (error) {
        console.error("Error analyzing file:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze file",
        });
      }
    }),

  /**
   * Upload file and analyze it
   */
  uploadAndAnalyze: protectedProcedure
    .input(
      z.object({
        fileData: z.string(), // Base64 encoded file
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }): Promise<FileAnalysisResult> => {
      try {
        // Decode base64
        const buffer = Buffer.from(input.fileData, "base64");

        // Upload to S3
        const fileKey = `ai-analysis/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save file locally for analysis (temporary)
        const fs = await import("fs");
        const path = await import("path");
        const tempPath = path.join("/tmp", input.fileName);
        fs.writeFileSync(tempPath, buffer);

        // Analyze file
        const analysis = await analyzeUploadedFile(tempPath, input.fileName);

        // Clean up temp file
        fs.unlinkSync(tempPath);

        return analysis;
      } catch (error) {
        console.error("Error uploading and analyzing file:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload and analyze file",
        });
      }
    }),

  /**
   * Get analysis history for current user
   */
  getAnalysisHistory: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Implement database storage for analysis history
    return [];
  }),
});
