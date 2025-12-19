import "dotenv/config";
import express from "express";
import { errorLoggerMiddleware } from "./errorLogger";
import { apiLimiter, authLimiter } from "./rateLimiter";
import { securityHeadersMiddleware } from "../security";
import { startBackupSchedule } from "../backupScheduler";
import { initRedis } from "./cache";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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
  app.use(securityHeadersMiddleware());
  
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
  app.post("/api/webhooks/outscraper", async (req, res) => {
    try {
      const data = req.body;
      console.log("[Outscraper Webhook] Received data:", JSON.stringify(data).slice(0, 500));
      
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
      
      if (data.data && Array.isArray(data.data)) {
        // Format: { data: [{ reviews_data: [...] }] }
        for (const place of data.data) {
          if (place.reviews_data && Array.isArray(place.reviews_data)) {
            reviews = reviews.concat(place.reviews_data);
          }
        }
      } else if (Array.isArray(data)) {
        // Format: direct array of reviews
        reviews = data;
      } else if (data.reviews_data) {
        // Format: { reviews_data: [...] }
        reviews = data.reviews_data;
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
            eq(guestReviews.source, "google")
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
        await db.insert(guestReviews).values({
          reviewerName: reviewerName,
          source: "google",
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
        await db.insert(notifications).values({
          type: isNegative ? "warning" : "info",
          priority: isNegative ? "urgent" : "normal",
          title: isNegative ? "⚠️ უარყოფითი მიმოხილვა" : "ახალი Google მიმოხილვა",
          message: `${reviewerName} - ${rating}⭐: ${(review.review_text || "").slice(0, 100)}...`,
          isRead: false,
        });
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
    } else {
      console.log("[Backup] Automated backups disabled in development mode");
    }
  });
}

startServer().catch(console.error);
