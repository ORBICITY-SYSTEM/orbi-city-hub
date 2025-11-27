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
