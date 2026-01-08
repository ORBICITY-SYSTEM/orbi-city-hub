import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";
import { invokeLLM } from "../_core/llm";

const execAsync = promisify(exec);

// Helper to call Gmail MCP tools
async function callGmailMCP(toolName: string, input: Record<string, any>): Promise<any> {
  const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
  const command = `manus-mcp-cli tool call ${toolName} --server gmail --input '${inputJson}'`;
  
  try {
    const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
    
    // Extract result file path from output
    const match = stdout.match(/\/tmp\/manus-mcp\/mcp_result_[a-f0-9]+\.json/);
    if (!match) {
      throw new Error("Failed to find result file in MCP output");
    }
    
    const resultPath = match[0];
    
    // Read the result file
    const { readFile } = await import("fs/promises");
    const resultContent = await readFile(resultPath, "utf-8");
    const result = JSON.parse(resultContent);
    
    return result;
  } catch (error: any) {
    console.error("[Gmail MCP] Error:", error.message);
    throw new Error(`Gmail MCP call failed: ${error.message}`);
  }
}

// Schema for parsed booking data
const BookingDataSchema = z.object({
  guestName: z.string(),
  checkIn: z.string(), // ISO date
  checkOut: z.string(), // ISO date
  roomNumber: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  channel: z.enum(["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]),
  bookingId: z.string(),
  status: z.enum(["confirmed", "pending", "cancelled"]),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  numberOfGuests: z.number().optional(),
  specialRequests: z.string().optional(),
});

export type BookingData = z.infer<typeof BookingDataSchema>;

// AI-powered email parser
async function parseBookingEmail(emailContent: string, subject: string, from: string): Promise<BookingData | null> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a booking email parser. Extract booking information from hotel reservation emails.
          
Return ONLY valid JSON in this exact format:
{
  "guestName": "Full Name",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "roomNumber": "room number if available",
  "price": 123.45,
  "currency": "GEL",
  "channel": "Booking.com" | "Airbnb" | "Expedia" | "Agoda" | "Direct" | "Other",
  "bookingId": "unique booking ID",
  "status": "confirmed" | "pending" | "cancelled",
  "guestEmail": "email@example.com",
  "guestPhone": "+995...",
  "numberOfGuests": 2,
  "specialRequests": "any special requests"
}

If you cannot extract booking information, return null.
Do not include any explanation, only JSON.`,
        },
        {
          role: "user",
          content: `Parse this booking email:

Subject: ${subject}
From: ${from}

Email Content:
${emailContent}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "booking_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              guestName: { type: "string" },
              checkIn: { type: "string" },
              checkOut: { type: "string" },
              roomNumber: { type: ["string", "null"] },
              price: { type: ["number", "null"] },
              currency: { type: ["string", "null"] },
              channel: { 
                type: "string",
                enum: ["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]
              },
              bookingId: { type: "string" },
              status: { 
                type: "string",
                enum: ["confirmed", "pending", "cancelled"]
              },
              guestEmail: { type: ["string", "null"] },
              guestPhone: { type: ["string", "null"] },
              numberOfGuests: { type: ["number", "null"] },
              specialRequests: { type: ["string", "null"] },
            },
            required: ["guestName", "checkIn", "checkOut", "channel", "bookingId", "status"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    
    // Validate with Zod
    const validated = BookingDataSchema.parse(parsed);
    
    return validated;
  } catch (error: any) {
    console.error("[Email Parser] Error:", error.message);
    return null;
  }
}

export const gmailRouter = router({
  // Search for booking emails
  searchBookingEmails: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        maxResults: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const defaultQuery = "subject:booking OR subject:reservation OR from:booking.com OR from:airbnb.com OR from:expedia.com OR from:agoda.com";
      const query = input.query || defaultQuery;

      const result = await callGmailMCP("gmail_search_messages", {
        q: query,
        max_results: input.maxResults,
      });

      return {
        messages: result.content?.[0]?.text ? JSON.parse(result.content[0].text) : [],
      };
    }),

  // Read and parse specific email threads
  readAndParseThreads: protectedProcedure
    .input(
      z.object({
        threadIds: z.array(z.string()).min(1).max(10),
      })
    )
    .mutation(async ({ input }) => {
      const result = await callGmailMCP("gmail_read_threads", {
        thread_ids: input.threadIds,
        include_full_messages: true,
      });

      const threads = result.content?.[0]?.text ? JSON.parse(result.content[0].text) : [];
      
      // Parse each thread
      const parsedBookings: Array<BookingData & { threadId: string; emailDate: string }> = [];
      
      for (const thread of threads) {
        const firstMessage = thread.messages?.[0];
        if (!firstMessage) continue;

        const subject = firstMessage.subject || "";
        const from = firstMessage.from || "";
        const body = typeof firstMessage.body === 'string' ? firstMessage.body : JSON.stringify(firstMessage.body);
        const date = firstMessage.date || "";

        const bookingData = await parseBookingEmail(body, subject, from);
        
        if (bookingData) {
          parsedBookings.push({
            ...bookingData,
            threadId: thread.id,
            emailDate: date,
          });
        }
      }

      return {
        parsedBookings,
        totalThreads: threads.length,
        successfulParsing: parsedBookings.length,
      };
    }),

  // Fetch and parse recent booking emails (last 30 days)
  fetchRecentBookings: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
        maxResults: z.number().min(1).max(50).default(20),
      })
    )
    .mutation(async ({ input }) => {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const dateQuery = `after:${startDate.toISOString().split('T')[0]}`;
      const query = `(subject:booking OR subject:reservation OR from:booking.com OR from:airbnb.com OR from:expedia.com OR from:agoda.com) ${dateQuery}`;

      // Search for emails
      const searchResult = await callGmailMCP("gmail_search_messages", {
        q: query,
        max_results: input.maxResults,
      });

      const messages = searchResult.content?.[0]?.text ? JSON.parse(searchResult.content[0].text) : [];
      
      if (messages.length === 0) {
        return {
          parsedBookings: [],
          totalEmails: 0,
          successfulParsing: 0,
        };
      }

      // Extract thread IDs
      const threadIds = messages.map((msg: any) => msg.threadId).slice(0, 10); // Limit to 10 threads

      // Read and parse threads
      const threadsResult = await callGmailMCP("gmail_read_threads", {
        thread_ids: threadIds,
        include_full_messages: true,
      });

      const threads = threadsResult.content?.[0]?.text ? JSON.parse(threadsResult.content[0].text) : [];
      
      // Parse each thread
      const parsedBookings: Array<BookingData & { threadId: string; emailDate: string }> = [];
      
      for (const thread of threads) {
        const firstMessage = thread.messages?.[0];
        if (!firstMessage) continue;

        const subject = firstMessage.subject || "";
        const from = firstMessage.from || "";
        const body = typeof firstMessage.body === 'string' ? firstMessage.body : JSON.stringify(firstMessage.body);
        const date = firstMessage.date || "";

        const bookingData = await parseBookingEmail(body, subject, from);
        
        if (bookingData) {
          parsedBookings.push({
            ...bookingData,
            threadId: thread.id,
            emailDate: date,
          });
        }
      }

      return {
        parsedBookings,
        totalEmails: messages.length,
        successfulParsing: parsedBookings.length,
      };
    }),
});
