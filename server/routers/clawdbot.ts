/**
 * ClawdBot Router
 *
 * Dedicated tRPC endpoints for the unified ClawdBot AI system.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, type Message } from "../_core/llm";

// Module type validation
const moduleSchema = z.enum(['general', 'marketing', 'reservations', 'finance', 'logistics']);

export const clawdbotRouter = router({
  /**
   * Main chat endpoint - sends message to Claude with custom system prompt
   */
  chat: protectedProcedure
    .input(
      z.object({
        systemPrompt: z.string(),
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        ),
        module: moduleSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { systemPrompt, messages, module } = input;
      const startTime = Date.now();

      try {
        // Build message array for LLM
        const llmMessages: Message[] = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
        ];

        // Call LLM
        const response = await invokeLLM({ messages: llmMessages });

        const aiResponse = response.choices[0]?.message?.content as string ||
          'I apologize, but I could not process that request.';

        return {
          response: aiResponse,
          responseTime: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens || 0,
        };
      } catch (error) {
        console.error('[ClawdBot] Chat error:', error);
        throw new Error('Failed to get AI response');
      }
    }),

  /**
   * Quick query - simple question without conversation history
   */
  quickQuery: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        module: moduleSchema,
        context: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { query, module, context } = input;

      // Build a simple system prompt based on module
      const modulePrompts: Record<string, string> = {
        general: 'You are ClawdBot CEO AI for ORBICITY hotel management. Be concise and action-oriented.',
        marketing: 'You are ClawdBot Marketing AI. Focus on OTA reviews, social media, and advertising.',
        reservations: 'You are ClawdBot Reservations AI. Focus on bookings, pricing, and guest communication.',
        finance: 'You are ClawdBot Finance AI. Focus on revenue, expenses, and financial reporting.',
        logistics: 'You are ClawdBot Logistics AI. Focus on housekeeping, inventory, and maintenance.',
      };

      const systemPrompt = `${modulePrompts[module] || modulePrompts.general}
${context ? `\nContext: ${JSON.stringify(context)}` : ''}
Respond in the same language as the query.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
        });

        return {
          response: response.choices[0]?.message?.content as string || 'Unable to process.',
        };
      } catch (error) {
        console.error('[ClawdBot] Quick query error:', error);
        throw new Error('Failed to process query');
      }
    }),
});
