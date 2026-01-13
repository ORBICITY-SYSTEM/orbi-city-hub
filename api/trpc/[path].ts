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
      body: req.body,
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
        // Vercel serverless functions don't support clearCookie directly
        // This is a no-op for now
      },
    } as any;

    // Use Express middleware adapter with type assertion
    const middleware = createExpressMiddleware({
      router: appRouter,
      createContext: async () => createContext({ req: expressReq, res: expressRes } as CreateExpressContextOptions),
    });

    await middleware(expressReq as any, expressRes as any);
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
