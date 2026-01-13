import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    // Parse body for POST requests (Vercel auto-parses JSON, but ensure it's available)
    let body = req.body;
    if (req.method === 'POST' && !body && typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        // Body might already be parsed or empty
        body = req.body;
      }
    }

    // Convert Vercel request/response to Express-like format
    // Vercel passes the path in req.url - need to construct full URL
    const url = req.url || '/';
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const expressReq = {
      ...req,
      headers: req.headers || {},
      method: req.method || "GET",
      url: url,
      originalUrl: url,
      query: req.query || {},
      body: body || req.body,
      // Add protocol for cookies.ts compatibility
      protocol: (req.headers?.['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || 
                (process.env.VERCEL === "1" ? "https" : "http"),
    } as any;

    let responseSent = false;

    const expressRes = {
      setHeader: (key: string, value: string | string[]) => {
        if (!responseSent) {
          res.setHeader(key, value);
        }
      },
      getHeader: (key: string) => res.getHeader(key),
      removeHeader: (key: string) => {
        if (!responseSent) {
          res.removeHeader(key);
        }
      },
      status: (code: number) => {
        if (!responseSent) {
          res.status(code);
        }
        return expressRes;
      },
      json: (data: any) => {
        if (!responseSent) {
          responseSent = true;
          res.json(data);
        }
      },
      send: (data: any) => {
        if (!responseSent) {
          responseSent = true;
          res.send(data);
        }
      },
      end: () => {
        if (!responseSent) {
          responseSent = true;
          res.end();
        }
      },
      clearCookie: (name: string, options?: any) => {
        // Vercel serverless functions: clear cookie by setting it with maxAge=0
        if (!responseSent) {
          const cookieOptions = options || {};
          const cookieValue = `${name}=; Path=${cookieOptions.path || '/'}; Max-Age=0; HttpOnly=${cookieOptions.httpOnly !== false}; SameSite=${cookieOptions.sameSite || 'None'}; Secure=${cookieOptions.secure !== false}`;
          res.setHeader('Set-Cookie', cookieValue);
        }
      },
    } as any;

    // Use Express middleware adapter with type assertion
    const middleware = createExpressMiddleware({
      router: appRouter,
      createContext: async () => createContext({ req: expressReq, res: expressRes } as CreateExpressContextOptions),
    });

    // Call middleware function - createExpressMiddleware returns an Express middleware
    // Express middleware signature: (req, res, next) => void
    return new Promise<void>((resolve, reject) => {
      const next = (err?: any) => {
        if (err) {
          console.error("[Vercel tRPC Handler] Middleware error:", err);
          reject(err);
        } else if (!responseSent) {
          // If middleware didn't send a response, resolve
          resolve();
        } else {
          // Response was sent, resolve
          resolve();
        }
      };
      
      try {
        // Call middleware with req, res, next
        const result = (middleware as any)(expressReq, expressRes, next);
        // If middleware returns a Promise, wait for it
        if (result && typeof result.then === 'function') {
          result.catch(reject);
        }
      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    console.error("[Vercel tRPC Handler] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
