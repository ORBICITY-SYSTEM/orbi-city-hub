import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, type Message } from "../_core/llm";
import { getDb } from "../db";
import { aiConversations } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { KNOWLEDGE_BASE } from "../../shared/aiKnowledgeBase";
import {
  detectConflicts,
  checkAvailability,
  parseNaturalDateQuery,
  formatConflictMessage,
  formatAvailabilitySummary,
  type Reservation,
} from "../../shared/reservationConflicts";
import { bookings } from "../../drizzle/schema";

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

  // Check for booking conflicts (for Excel upload validation)
  checkConflicts: protectedProcedure
    .input(
      z.object({
        newBookings: z.array(
          z.object({
            roomNumber: z.string(),
            guestName: z.string(),
            checkIn: z.string(), // ISO date string
            checkOut: z.string(),
            status: z.enum(["confirmed", "pending", "checked_out"]),
            price: z.number(),
            source: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch existing reservations
      const existingReservations = await db.select().from(bookings);

      // Convert to Reservation type
      const existing: Reservation[] = existingReservations.map((r) => ({
        id: r.id,
        roomNumber: r.roomNumber || "Unknown",
        guestName: `Guest #${r.guestId}`, // Will need to join with guests table for actual name
        checkIn: new Date(r.checkIn),
        checkOut: new Date(r.checkOut),
        status: r.status === "checked_in" ? "confirmed" : r.status === "cancelled" ? "checked_out" : r.status as "confirmed" | "pending" | "checked_out",
        price: r.totalPrice / 100, // Convert from tetri to lari
        source: r.channel,
      }));

      const newBookings: Reservation[] = input.newBookings.map((b) => ({
        roomNumber: b.roomNumber,
        guestName: b.guestName,
        checkIn: new Date(b.checkIn),
        checkOut: new Date(b.checkOut),
        status: b.status,
        price: b.price,
        source: b.source,
      }));

      const result = detectConflicts(newBookings, existing);

      return {
        hasConflict: result.hasConflict,
        conflicts: result.conflicts.map((c) => ({
          message: formatConflictMessage(c),
          newBooking: c.newBooking,
          existingBooking: c.existingBooking,
          overlapDays: c.overlapDays,
        })),
      };
    }),

  // Check room availability (for AI Q&A)
  checkAvailability: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(), // Natural language: "10-15 Aug"
        startDate: z.string().optional(), // ISO date
        endDate: z.string().optional(),
        roomNumber: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let startDate: Date | null = null;
      let endDate: Date | null = null;

      // Parse natural language query if provided
      if (input.query) {
        const parsed = parseNaturalDateQuery(input.query);
        startDate = parsed.startDate;
        endDate = parsed.endDate;
      }

      // Override with explicit dates if provided
      if (input.startDate) startDate = new Date(input.startDate);
      if (input.endDate) endDate = new Date(input.endDate);

      if (!startDate || !endDate) {
        throw new Error(
          "Could not parse dates. Please provide dates in format: '10-15 Aug' or ISO dates."
        );
      }

      // Fetch existing reservations
      const existingReservations = await db.select().from(bookings);

      const existing: Reservation[] = existingReservations.map((r) => ({
        id: r.id,
        roomNumber: r.roomNumber || "Unknown",
        guestName: `Guest #${r.guestId}`,
        checkIn: new Date(r.checkIn),
        checkOut: new Date(r.checkOut),
        status: r.status === "checked_in" ? "confirmed" : r.status === "cancelled" ? "checked_out" : r.status as "confirmed" | "pending" | "checked_out",
        price: r.totalPrice / 100,
        source: r.channel,
      }));

      const result = checkAvailability(
        { startDate, endDate, roomNumber: input.roomNumber },
        existing
      );

      return {
        ...result,
        summary: formatAvailabilitySummary(result, { startDate, endDate }),
      };
    }),
});
