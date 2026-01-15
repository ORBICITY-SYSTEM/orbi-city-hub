import "dotenv/config";
import express from "express";
import { errorLoggerMiddleware } from "./errorLogger";
import { apiLimiter, authLimiter } from "./rateLimiter";
import { startBackupSchedule } from "../backupScheduler";
import { startTawktoRowsSchedule } from "../tawktoRowsScheduler";
import { initRedis } from "./cache";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { BUTLER_KNOWLEDGE } from "../butler-knowledge";

// Helper function to detect review language
function detectReviewLanguage(text: string): string {
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka'; // Georgian
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  if (/[\u00C0-\u017F]/.test(text) && /ş|ğ|ı|ö|ü|ç/i.test(text)) return 'tr'; // Turkish
  return 'en';
}

// AI Response Generation using Gemini
async function generateAIReviewResponse(params: {
  reviewerName: string;
  rating: number;
  content: string;
  language: string;
  source: string;
}): Promise<string> {
  const { reviewerName, rating, content, language, source } = params;
  
  // Determine tone based on rating
  let tone = "grateful, warm, inviting";
  if (rating <= 2) tone = "apologetic, empathetic, solution-focused";
  else if (rating <= 4) tone = "professional, appreciative, improvement-oriented";
  
  // Language-specific greeting
  const greetings: Record<string, string> = {
    ka: "მოგესალმებით",
    ru: "Здравствуйте",
    tr: "Merhaba",
    en: "Dear"
  };
  const greeting = greetings[language] || greetings.en;
  
  // P0 FIX: Clean prompt - plain text only, no automatic compensation
  // AI may SUGGEST actions, never DECIDE on discounts or compensation
  const languageInstruction = language === 'ka' ? 'Georgian' : language === 'ru' ? 'Russian' : language === 'tr' ? 'Turkish' : 'English';
  
  let ratingGuideline = '';
  if (rating <= 2) {
    ratingGuideline = 'Apologize sincerely for their experience. Express genuine concern. Do NOT offer any discounts or compensation - only management can approve that.';
  } else if (rating <= 4) {
    ratingGuideline = 'Thank them for their feedback and acknowledge any concerns mentioned.';
  } else {
    ratingGuideline = 'Thank them warmly and invite them to visit again.';
  }
  
  const prompt = `You are the customer service manager for Orbi City - Sea View Aparthotel in Batumi.
Generate a professional response to this ${source} review.

Review Details:
Guest Name: ${reviewerName}
Rating: ${rating} out of 5 stars
Review Text: ${content}
Detected Language: ${language}

Response Guidelines:
1. Write ONLY in ${languageInstruction} language
2. Start with greeting: ${greeting} ${reviewerName}
3. Tone: ${tone}
4. ${ratingGuideline}
5. Keep response under 150 words
6. Sign as Orbi City Team
7. IMPORTANT: Do NOT offer any discounts, compensation, or free services. Only management can approve such offers.

Generate the response:`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("[AI Response] No Gemini API key, using template");
      return getTemplateResponse(reviewerName, rating, language);
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });
    
    if (!response.ok) {
      console.error("[AI Response] Gemini API error:", await response.text());
      return getTemplateResponse(reviewerName, rating, language);
    }
    
    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (generatedText) {
      return generatedText.trim();
    }
    
    return getTemplateResponse(reviewerName, rating, language);
  } catch (error) {
    console.error("[AI Response] Error:", error);
    return getTemplateResponse(reviewerName, rating, language);
  }
}

// P0 FIX: Fallback template response - NO automatic compensation
// AI may SUGGEST, manager must APPROVE any discounts
function getTemplateResponse(guestName: string, rating: number, language: string): string {
  if (rating <= 2) {
    // P0 FIX: Removed automatic 20% discount - requires manager approval
    if (language === 'ka') {
      return `მოგესალმებით ${guestName},\n\nგმადლობთ თქვენი გულწრფელი შეფასებისთვის. ღრმად ვწუხვარ რომ თქვენმა გამოცდილებამ ვერ გაამართლა მოლოდინი.\n\nთქვენი კომენტარები ძალიან მნიშვნელოვანია ჩვენთვის და ვმუშაობთ გაუმჯობესებაზე. ჩვენი მენეჯერი დაგიკავშირდებათ პირადად.\n\nპატივისცემით,\nOrbi City Team`;
    }
    if (language === 'ru') {
      return `Уважаемый ${guestName},\n\nБлагодарим вас за честный отзыв. Мы искренне сожалеем, что ваш опыт не оправдал ожиданий.\n\nВаши комментарии очень важны для нас, и мы работаем над улучшением. Наш менеджер свяжется с вами лично.\n\nС уважением,\nOrbi City Team`;
    }
    return `Dear ${guestName},\n\nThank you for your honest feedback. We sincerely apologize that your experience did not meet your expectations.\n\nYour comments are very important to us and we are working on improvements. Our manager will contact you personally.\n\nBest regards,\nOrbi City Team`;
  }
  
  if (language === 'ka') {
    return `გმადლობთ ${guestName}!\n\nძალიან გვიხარია რომ მოგეწონათ ჩვენთან ყოფნა! თქვენი თბილი სიტყვები დიდი მოტივაციაა ჩვენი გუნდისთვის.\n\nველოდებით თქვენს მომავალ ვიზიტს!\n\nOrbi City Team`;
  }
  if (language === 'ru') {
    return `Спасибо, ${guestName}!\n\nМы очень рады, что вам понравилось пребывание у нас! Ваши теплые слова - большая мотивация для нашей команды.\n\nЖдем вас снова!\n\nOrbi City Team`;
  }
  return `Dear ${guestName},\n\nThank you so much for your wonderful review! We're delighted that you enjoyed your stay with us.\n\nWe look forward to welcoming you back!\n\nBest regards,\nOrbi City Team`;
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Security headers (Helmet)
  
  // Trust proxy (for rate limiting behind reverse proxy)
  app.set("trust proxy", 1);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Apply rate limiting to all API routes
  app.use("/api/", apiLimiter);
  
  // Stricter rate limiting for OAuth/auth routes
  app.use("/api/oauth/", authLimiter);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Outscraper webhook endpoint (raw Express, not tRPC)
  // Supports: Google, Booking.com, Airbnb, TripAdvisor, Expedia
  // P0 FIX: Strict property whitelist validation added 2025-12-21
  app.post("/api/webhooks/outscraper", async (req, res) => {
    try {
      const data = req.body;
      console.log("[Outscraper Webhook] Received data:", JSON.stringify(data).slice(0, 500));
      
      // ============================================
      // P0 FIX: PROPERTY WHITELIST VALIDATION
      // Only accept reviews for Orbi City Batumi properties
      // Reject any foreign property reviews (e.g., Empoli, Italy)
      // ============================================
      const ALLOWED_PROPERTIES = {
        // Booking.com Property ID
        bookingIds: ["10172179"],
        // Google Place IDs / Names
        googleNames: [
          "orbi city",
          "orbi city batumi",
          "orbi city - sea view aparthotel",
          "orbi city sea view",
          "orbi city aparthotel"
        ],
        // Airbnb Listing IDs
        airbnbIds: [],
        // TripAdvisor IDs / Names
        tripadvisorNames: [
          "orbi city",
          "orbi city batumi",
          "orbi city aparthotel"
        ],
        // Location whitelist (must contain one of these)
        allowedLocations: ["batumi", "georgia", "საქართველო", "ბათუმი"]
      };
      
      // Detect source platform from task name or data structure
      let source = "google"; // default
      const taskName = data.task_name || data.taskName || "";
      if (taskName.toLowerCase().includes("booking")) source = "booking";
      else if (taskName.toLowerCase().includes("airbnb")) source = "airbnb";
      else if (taskName.toLowerCase().includes("tripadvisor")) source = "tripadvisor";
      else if (taskName.toLowerCase().includes("expedia")) source = "expedia";
      else if (data.source) source = data.source.toLowerCase();
      
      console.log(`[Outscraper Webhook] Detected source: ${source}`);
      
      // Import database and schema
      const { getDb } = await import("../db");
      const { guestReviews, notifications } = await import("../../drizzle/schema");
      const { eq, and, or } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, error: "Database not available" });
      }
      
      // Outscraper sends reviews in different formats
      let reviews: any[] = [];
      let placeName = "";
      let placeLocation = "";
      
      if (data.data && Array.isArray(data.data)) {
        // Format: { data: [{ reviews_data: [...], name: "...", address: "..." }] }
        for (const place of data.data) {
          // P0 FIX: Validate property before processing
          placeName = (place.name || place.title || "").toLowerCase();
          placeLocation = (place.address || place.location || place.full_address || "").toLowerCase();
          
          // Check if this is an allowed property
          const isAllowedProperty = 
            ALLOWED_PROPERTIES.googleNames.some(name => placeName.includes(name)) ||
            ALLOWED_PROPERTIES.allowedLocations.some(loc => placeLocation.includes(loc));
          
          if (!isAllowedProperty) {
            console.warn(`[Outscraper Webhook] REJECTED: Foreign property detected - "${placeName}" at "${placeLocation}". Only Orbi City Batumi reviews are accepted.`);
            continue; // Skip this place entirely
          }
          
          if (place.reviews_data && Array.isArray(place.reviews_data)) {
            reviews = reviews.concat(place.reviews_data);
          }
        }
      } else if (Array.isArray(data)) {
        // Format: direct array of reviews - validate via task name
        const isAllowedTask = ALLOWED_PROPERTIES.googleNames.some(name => taskName.toLowerCase().includes(name));
        if (isAllowedTask) {
          reviews = data;
        } else {
          console.warn(`[Outscraper Webhook] REJECTED: Task name "${taskName}" does not match allowed properties.`);
        }
      } else if (data.reviews_data) {
        // Format: { reviews_data: [...] } - validate via task name or place info
        placeName = (data.name || data.title || taskName || "").toLowerCase();
        placeLocation = (data.address || data.location || "").toLowerCase();
        
        const isAllowedProperty = 
          ALLOWED_PROPERTIES.googleNames.some(name => placeName.includes(name)) ||
          ALLOWED_PROPERTIES.allowedLocations.some(loc => placeLocation.includes(loc));
        
        if (isAllowedProperty) {
          reviews = data.reviews_data;
        } else {
          console.warn(`[Outscraper Webhook] REJECTED: Property "${placeName}" at "${placeLocation}" is not in whitelist.`);
        }
      }
      
      // P0 FIX: Log rejection if no reviews passed validation
      if (reviews.length === 0 && (data.data?.length > 0 || data.reviews_data?.length > 0)) {
        console.warn(`[Outscraper Webhook] All reviews rejected due to property whitelist validation.`);
        return res.json({ 
          success: true, 
          imported: 0, 
          skipped: 0,
          rejected: true,
          reason: "Property not in whitelist. Only Orbi City Batumi reviews are accepted."
        });
      }
      
      console.log(`[Outscraper Webhook] Processing ${reviews.length} reviews`);
      
      let imported = 0;
      let skipped = 0;
      
      for (const review of reviews) {
        // Check if review already exists by reviewer name and source
        const reviewerName = review.author_title || review.reviewer_name || "Anonymous";
        const existingReviews = await db.select()
          .from(guestReviews)
          .where(and(
            eq(guestReviews.reviewerName, reviewerName),
            eq(guestReviews.source, source as any)
          ))
          .limit(1);
        
        if (existingReviews.length > 0) {
          skipped++;
          continue;
        }
        
        // Parse rating
        const rating = review.review_rating || review.rating || 5;
        
        // Determine sentiment
        let sentiment = "neutral";
        if (rating >= 4) sentiment = "positive";
        else if (rating <= 2) sentiment = "negative";
        
        // Parse date
        let reviewDate = new Date();
        if (review.review_datetime_utc) {
          reviewDate = new Date(review.review_datetime_utc);
        } else if (review.review_timestamp) {
          reviewDate = new Date(review.review_timestamp * 1000);
        }
        
        // Insert review (using correct column names from schema)
        const [insertedReview] = await db.insert(guestReviews).values({
          reviewerName: reviewerName,
          source: source as any,
          rating,
          content: review.review_text || review.text || "",
          sentiment,
          language: review.review_language || "en",
          topics: [],
          externalId: review.review_id || null,
          hasReply: !!review.owner_answer,
          replyContent: review.owner_answer || null,
          replyDate: review.owner_answer_timestamp_datetime_utc 
            ? new Date(review.owner_answer_timestamp_datetime_utc) 
            : null,
          reviewDate,
        });
        
        imported++;
        
        // Create notification for new review
        const isNegative = rating <= 2;
        const sourceNames: Record<string, string> = {
          google: "Google",
          booking: "Booking.com",
          airbnb: "Airbnb",
          tripadvisor: "TripAdvisor",
          expedia: "Expedia"
        };
        const sourceName = sourceNames[source] || source;
        
        await db.insert(notifications).values({
          type: isNegative ? "warning" : "info",
          priority: isNegative ? "urgent" : "normal",
          title: isNegative ? `⚠️ უარყოფითი ${sourceName} მიმოხილვა` : `ახალი ${sourceName} მიმოხილვა`,
          message: `${reviewerName} - ${rating}⭐: ${(review.review_text || "").slice(0, 100)}...`,
          isRead: false,
        });
        
        // Auto-generate AI response and create Butler task for approval
        try {
          const reviewContent = review.review_text || review.text || "";
          const reviewLanguage = review.review_language || detectReviewLanguage(reviewContent);
          
          // Generate AI response using Gemini
          const aiResponse = await generateAIReviewResponse({
            reviewerName,
            rating,
            content: reviewContent,
            language: reviewLanguage,
            source: sourceName
          });
          
          // Create Butler task for manager approval
          const { createButlerTask } = await import("../butlerDb");
          await createButlerTask({
            user_id: 1, // Default user
            task_type: "review_response",
            priority: rating <= 2 ? "urgent" : rating <= 3 ? "high" : "medium",
            status: "pending",
            title: `პასუხი ${sourceName} მიმოხილვაზე: ${reviewerName} (${rating}★)`,
            description: `მიმოხილვა: "${reviewContent.substring(0, 150)}${reviewContent.length > 150 ? '...' : ''}"`,
            ai_suggestion: {
              reviewId: (insertedReview as any).id || insertedReview,
              responseText: aiResponse,
              language: reviewLanguage,
              source: source,
              reviewerName,
              rating,
              originalReview: reviewContent
            },
            context: {
              source,
              externalId: review.review_id || null,
              reviewDate: reviewDate.toISOString()
            }
          });
          
          console.log(`[Outscraper Webhook] Created Butler task for ${sourceName} review from ${reviewerName}`);
        } catch (aiError) {
          console.error("[Outscraper Webhook] AI response generation failed:", aiError);
          // Continue without AI response - task can be created manually
        }
      }
      
      console.log(`[Outscraper Webhook] Imported: ${imported}, Skipped: ${skipped}`);
      
      res.json({ 
        success: true, 
        imported, 
        skipped,
        total: reviews.length 
      });
    } catch (error) {
      console.error("[Outscraper Webhook] Error:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Tawk.to Webhook endpoint (raw POST, not tRPC)
  app.post("/api/webhooks/tawkto", express.json(), async (req, res) => {
    console.log("[Tawk.to Webhook] Received event:", req.body?.event);
    
    try {
      const { event, chatId, visitor, agent, property, message, ticket, time } = req.body;
      
      let eventType = "chat:start";
      if (event === "chat:start") eventType = "chat:start";
      else if (event === "chat:end") eventType = "chat:end";
      else if (event === "ticket:create") eventType = "ticket:create";
      else if (event === "chat:transcript") eventType = "chat:transcript";
      
      // Import db and schema
      const { getDb } = await import("../db");
      const { tawktoMessages } = await import("../../drizzle/schema");
      
      const db = await getDb();
      if (!db) {
        console.error("[Tawk.to Webhook] Database not available");
        return res.status(500).json({ success: false, error: "Database not available" });
      }
      
      await db.insert(tawktoMessages).values({
        chatId: chatId || `chat_${Date.now()}`,
        eventType: eventType as any,
        visitorName: visitor?.name || null,
        visitorEmail: visitor?.email || null,
        visitorPhone: visitor?.phone || null,
        visitorCountry: visitor?.country || null,
        visitorCity: visitor?.city || null,
        message: message?.text || ticket?.message || null,
        agentName: agent?.name || null,
        agentId: agent?.id || null,
        propertyId: property?.id || null,
        status: event === "chat:end" ? "ended" : "active",
        metadata: req.body,
        chatStartedAt: event === "chat:start" ? new Date() : null,
        chatEndedAt: event === "chat:end" ? new Date() : null,
      });
      
      console.log("[Tawk.to Webhook] Event saved successfully");
      res.json({ success: true });
    } catch (error) {
      console.error("[Tawk.to Webhook] Error:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Error logging middleware
  app.use(errorLoggerMiddleware);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Initialize Redis cache
    initRedis();
    
    // Start automated backup schedule
    if (process.env.NODE_ENV === "production") {
      startBackupSchedule();
      console.log("[Backup] Automated backup schedule started");
      startTawktoRowsSchedule();
      console.log("[Axiom Automation] Tawk.to → Rows scheduler started");
    } else {
      console.log("[Backup] Automated backups disabled in development mode");
      console.log("[Axiom Automation] Scheduler disabled in development mode");
    }
  });
}

startServer().catch(console.error);
