import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, type Message } from "../_core/llm";
import { getDb } from "../db";
import { aiConversations } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const ORBI_CONTEXT = `You are an AI assistant for ORBI City Hub, an aparthotel management system in Batumi, Georgia.

ORBI City Details:
- Location: Batumi, Georgia (Black Sea coast)
- Property: 60 sea-view studios
- Channels: 15 distribution platforms (Booking.com, Airbnb, Expedia, Agoda, Ostrovok, TikTok, Trip.com, Sutochno, etc.)
- Average occupancy: 85%
- Average rating: 9.2/10
- Target market: International tourists, business travelers
- Peak season: June-September
- Currency: Georgian Lari (₾)

Your role varies by module:
- CEO Dashboard: Strategic insights, KPI analysis, growth recommendations
- Reservations: Booking management, guest communication, pricing optimization
- Finance: P&L analysis, cost optimization, revenue forecasting
- Marketing: Channel performance, campaign ideas, ROI optimization
- Logistics: Inventory management, housekeeping optimization, staff scheduling

Always provide actionable, data-driven insights specific to ORBI City's context.`;

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
      const systemPrompt = `${ORBI_CONTEXT}

Current Module: ${module}

Provide helpful, specific answers based on the user's question. If they upload data (Excel, CSV), analyze it thoroughly. Use markdown formatting for better readability.`;

      // Build messages
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
      ];

      // Add user message
      let userContent = userMessage;
      if (fileUrl) {
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
