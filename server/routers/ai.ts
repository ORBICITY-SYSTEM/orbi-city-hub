import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, type Message } from "../_core/llm";
import { getDb } from "../db";
import { aiConversations, files } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { KNOWLEDGE_BASE } from "../../shared/aiKnowledgeBase";

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

      // Check if user is referencing a file by name
      const db = await getDb();
      let resolvedFileUrl = fileUrl;
      let resolvedFileName = fileName;

      // Look for file references in user message (e.g., "analyze file named october 2025")
      const fileNameMatch = userMessage.match(/\u10e4\u10d0\u10d8\u10da(?:\u10d8)?\s+(?:\u10e1\u10d0\u10ee\u10d4\u10da\u10d8\u10d7|\u10e1\u10d0\u10ee\u10d4\u10da\u10d0\u10d3)\s+["']?([^"'\n]+)["']?|file\s+(?:named|called)\s+["']?([^"'\n]+)["']?/i);
      
      if (fileNameMatch && db) {
        const searchName = fileNameMatch[1] || fileNameMatch[2];
        const userFiles = await db
          .select()
          .from(files)
          .where(eq(files.userId, ctx.user.id));
        
        const matchedFile = userFiles.find(f => 
          f.originalName.toLowerCase().includes(searchName.toLowerCase())
        );

        if (matchedFile) {
          resolvedFileUrl = matchedFile.fileUrl;
          resolvedFileName = matchedFile.originalName;
        }
      }

      // Build messages
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
      ];

      // Add user message
      let userContent = userMessage;
      if (resolvedFileUrl) {
        userContent = `${userMessage}\n\n[File referenced: ${resolvedFileName || "file"} - URL: ${resolvedFileUrl}]`;
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
      // db already declared above
      if (db) {
        try {
          await db.insert(aiConversations).values({
            userId: ctx.user.id,
            module,
            userMessage,
            aiResponse,
            fileUrl: fileUrl ?? undefined,
            fileName: fileName ?? undefined,
            fileType: fileType ?? undefined,
            responseTime: responseTime,
            tokensUsed: response.usage?.total_tokens ?? undefined,
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
