import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

// Vercel serverless function handler - using createExpressMiddleware with proper error handling
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const protocol = (req.headers?.['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || 
                     (process.env.VERCEL === "1" ? "https" : "http");
    
    const expressReq = {
      ...req,
      headers: req.headers || {},
      method: req.method || "GET",
      url: req.url || '/',
      originalUrl: req.url || '/',
      query: req.query || {},
      body: body || req.body,
      protocol: protocol,
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

    // Use Express middleware adapter
    const middleware = createExpressMiddleware({
      router: appRouter,
      createContext: async () => {
        try {
          return await createContext({ req: expressReq, res: expressRes } as CreateExpressContextOptions);
        } catch (error) {
          console.error("[Vercel tRPC Handler] Context creation error:", error);
          // Return minimal context on error
          return {
            req: expressReq,
            res: expressRes,
            user: null,
          };
        }
      },
    });

    // Call middleware function - createExpressMiddleware returns an Express middleware
    return new Promise<void>((resolve, reject) => {
      const next = (err?: any) => {
        if (err) {
          console.error("[Vercel tRPC Handler] Middleware error:", err);
          if (!responseSent) {
            res.status(500).json({ 
              error: "Internal server error",
              message: err instanceof Error ? err.message : String(err)
            });
            responseSent = true;
          }
          reject(err);
        } else if (!responseSent) {
          // If middleware didn't send a response, send 404
          res.status(404).json({ error: "Not found" });
          responseSent = true;
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
          result.then(() => {
            if (!responseSent) {
              res.status(404).json({ error: "Not found" });
              responseSent = true;
            }
            resolve();
          }).catch((err: any) => {
            console.error("[Vercel tRPC Handler] Promise rejection:", err);
            if (!responseSent) {
              res.status(500).json({ 
                error: "Internal server error",
                message: err instanceof Error ? err.message : String(err)
              });
              responseSent = true;
            }
            reject(err);
          });
        }
      } catch (err) {
        console.error("[Vercel tRPC Handler] Synchronous error:", err);
        if (!responseSent) {
          res.status(500).json({ 
            error: "Internal server error",
            message: err instanceof Error ? err.message : String(err)
          });
          responseSent = true;
        }
        reject(err);
      }
    });
  } catch (error) {
    console.error("[Vercel tRPC Handler] Top-level error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
