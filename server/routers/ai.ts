import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, type Message } from "../_core/llm";
import { getDb } from "../db";
import { aiConversations, files } from "../../drizzle/schema";
import { eq, desc, like } from "drizzle-orm";
import { KNOWLEDGE_BASE } from "../../shared/aiKnowledgeBase";
import { parseExcelFromUrl, formatExcelForAI, getExcelSummary } from "../utils/excelParser";
import { getDashboardDataForModule } from "../dashboardDataFetcher";

// Get module-specific system prompt
function getSystemPrompt(module: string): string {
  const baseContext = `You are an AI assistant for ORBI City Batumi - a 60-studio aparthotel in Batumi, Georgia.

## Property Details
${JSON.stringify(KNOWLEDGE_BASE.property, null, 2)}

## Georgian Tax System
VAT: ${KNOWLEDGE_BASE.tax.vat.rate * 100}% (${KNOWLEDGE_BASE.tax.vat.description})
Corporate Income Tax: ${KNOWLEDGE_BASE.tax.incomeTax.corporate.rate * 100}% (${KNOWLEDGE_BASE.tax.incomeTax.corporate.description})
Personal Income Tax: ${KNOWLEDGE_BASE.tax.incomeTax.personal.rate * 100}%
Tourist Tax: ${KNOWLEDGE_BASE.tax.touristTax.rate}

## Batumi Tourism Market
High Season: ${KNOWLEDGE_BASE.tourism.seasonality.high.months.join(", ")} (Occupancy: ${KNOWLEDGE_BASE.tourism.seasonality.high.occupancyRate * 100}%, ADR: $${KNOWLEDGE_BASE.tourism.seasonality.high.averageDailyRate})
Shoulder Season: ${KNOWLEDGE_BASE.tourism.seasonality.shoulder.months.join(", ")} (Occupancy: ${KNOWLEDGE_BASE.tourism.seasonality.shoulder.occupancyRate * 100}%, ADR: $${KNOWLEDGE_BASE.tourism.seasonality.shoulder.averageDailyRate})
Low Season: ${KNOWLEDGE_BASE.tourism.seasonality.low.months.join(", ")} (Occupancy: ${KNOWLEDGE_BASE.tourism.seasonality.low.occupancyRate * 100}%, ADR: $${KNOWLEDGE_BASE.tourism.seasonality.low.averageDailyRate})

## Distribution Channels
${Object.entries(KNOWLEDGE_BASE.tourism.bookingChannels).map(([channel, data]) => 
  `${channel}: ${data.share * 100}% share, ${data.commission * 100}% commission`
).join("\n")}
`;

  // Add module-specific prompt
  const modulePrompts: Record<string, string> = {
    "CEO Dashboard": KNOWLEDGE_BASE.prompts.ceo.systemPrompt,
    "Reservations": KNOWLEDGE_BASE.prompts.reservations.systemPrompt,
    "Finance": KNOWLEDGE_BASE.prompts.finance.systemPrompt,
    "Marketing": KNOWLEDGE_BASE.prompts.marketing.systemPrompt,
    "Logistics": KNOWLEDGE_BASE.prompts.logistics.systemPrompt,
    "Reports & Analytics": KNOWLEDGE_BASE.prompts.reports.systemPrompt,
  };

  const modulePrompt = modulePrompts[module] || KNOWLEDGE_BASE.prompts.ceo.systemPrompt;

  return `${baseContext}\n\n${modulePrompt}`;
}

export const aiRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        module: z.string(),
        userMessage: z.string(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
        fileType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { module, userMessage, fileUrl, fileName, fileType } = input;
      const startTime = Date.now();

      // Build system prompt based on module
      const systemPrompt = getSystemPrompt(module);
      
      // Fetch dashboard data for this module
      const dashboardData = await getDashboardDataForModule(module);

      // Check if user is referencing a file by name
      let referencedFile = null;
      const fileNameMatch = userMessage.match(/ფაილ(?:ი)?\s+სახელად\s+["']?([^"']+)["']?/i) || 
                           userMessage.match(/file\s+named\s+["']?([^"']+)["']?/i);
      
      if (fileNameMatch) {
        const searchFileName = fileNameMatch[1].trim();
        const db = await getDb();
        if (db) {
          const matchingFiles = await db
            .select()
            .from(files)
            .where(eq(files.userId, ctx.user.id))
            .limit(10);
          
          // Find file with matching name (case-insensitive partial match)
          referencedFile = matchingFiles.find(f => 
            f.fileName.toLowerCase().includes(searchFileName.toLowerCase())
          );
        }
      }

      // Build messages with dashboard data context
      let enhancedSystemPrompt = systemPrompt;
      
      if (dashboardData) {
        enhancedSystemPrompt += `\n\n## Current Dashboard Data\n${JSON.stringify(dashboardData, null, 2)}\n\nYou have access to the above real-time dashboard data. Use it to answer questions accurately and provide data-driven insights.`;
      }
      
      const messages: Message[] = [
        { role: "system", content: enhancedSystemPrompt },
      ];

      // Add user message
      let userContent = userMessage;
      
      // If user referenced a file by name, add it to context
      if (referencedFile) {
        const fileSize = referencedFile.fileSize ? (referencedFile.fileSize / 1024).toFixed(1) : '0';
        const mimeType = referencedFile.mimeType || 'unknown';
        let fileContext = `[Referenced file: ${referencedFile.fileName}]\n[File URL: ${referencedFile.fileUrl}]\n[File type: ${mimeType}]\n[File size: ${fileSize} KB]\n[Uploaded: ${new Date(referencedFile.uploadedAt).toLocaleString('ka-GE')}]`;
        
        // If it's an Excel file, parse it automatically
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
          try {
            const excelData = await parseExcelFromUrl(referencedFile.fileUrl, referencedFile.fileName);
            const formattedData = formatExcelForAI(excelData, 30); // Show first 30 rows
            fileContext += `\n\n${formattedData}`;
          } catch (error) {
            console.error('[AI] Excel parsing error:', error);
            fileContext += '\n\n[Note: Could not parse Excel file automatically]';
          }
        }
        
        userContent = `${userMessage}\n\n${fileContext}`;
      } else if (fileUrl) {
        userContent = `${userMessage}\n\n[File uploaded: ${fileName || "file"}]`;
      }

      messages.push({
        role: "user",
        content: userContent,
      });

      // Call Manus LLM
      const response = await invokeLLM({ messages });

      const aiResponse: string = (response.choices[0]?.message?.content as string) || "I apologize, but I couldn't generate a response. Please try again.";
      const responseTime = Date.now() - startTime;

      // Save conversation to database
      const db = await getDb();
      if (db) {
        try {
          // TODO: aiConversations schema has messages (json) column, not individual fields
          await db.insert(aiConversations).values({
            userId: ctx.user.id,
            module,
            messages: [
              { role: "user", content: userMessage, timestamp: Date.now() },
              { role: "assistant", content: aiResponse, timestamp: Date.now() },
            ] as any,
          });
        } catch (error) {
          console.error("[AI] Failed to save conversation:", error);
        }
      }

      return {
        response: aiResponse,
        responseTime,
      };
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        module: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { module, limit } = input;
      const db = await getDb();
      
      if (!db) {
        return [];
      }

      try {
        const history = await db
          .select()
          .from(aiConversations)
          .where(eq(aiConversations.module, module))
          .orderBy(desc(aiConversations.createdAt))
          .limit(limit);

        return history.reverse(); // Show oldest first
      } catch (error) {
        console.error("[AI] Failed to fetch history:", error);
        return [];
      }
    }),
});
