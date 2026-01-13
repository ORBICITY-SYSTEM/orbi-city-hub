import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

// Vercel serverless function handler - using fetchRequestHandler (correct for Vercel)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    // Convert Vercel request to Fetch API Request
    const protocol = (req.headers?.['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || 
                     (process.env.VERCEL === "1" ? "https" : "http");
    const host = req.headers?.host || process.env.VERCEL_URL || 'localhost:3000';
    const url = `${protocol}://${host}${req.url || '/api/trpc'}`;
    
    // Create Fetch API Request from Vercel request (using global Request if available, otherwise create manually)
    let fetchReq: Request;
    if (typeof Request !== 'undefined') {
      // Use global Request if available (Node.js 18+)
      fetchReq = new Request(url, {
        method: req.method || 'GET',
        headers: new Headers(req.headers as Record<string, string>),
        body: req.method !== 'GET' && req.method !== 'HEAD' 
          ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))
          : undefined,
      });
    } else {
      // Manual Request creation for older Node.js versions
      const headers = new (globalThis as any).Headers?.(req.headers as Record<string, string>) || req.headers as Record<string, string>;
      const body = req.method !== 'GET' && req.method !== 'HEAD' 
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))
        : undefined;
      
      fetchReq = {
        url,
        method: req.method || 'GET',
        headers: headers instanceof Headers ? headers : new (globalThis as any).Headers?.(headers) || headers,
        body: body,
        // Add other required Request properties
        signal: null,
        redirect: 'follow',
        cache: 'default',
        credentials: 'include',
        integrity: '',
        keepalive: false,
        mode: 'cors',
        referrer: '',
        referrerPolicy: '',
      } as any as Request;
    }

    // Convert Vercel response to Express-like for createContext
    const expressReq = {
      ...req,
      headers: req.headers || {},
      method: req.method || "GET",
      url: req.url || '/',
      originalUrl: req.url || '/',
      query: req.query || {},
      body: req.body,
      protocol: protocol,
    } as any;

    const expressRes = {
      setHeader: (key: string, value: string | string[]) => {
        res.setHeader(key, value);
      },
      getHeader: (key: string) => res.getHeader(key),
      removeHeader: (key: string) => {
        res.removeHeader(key);
      },
      status: (code: number) => {
        res.status(code);
        return expressRes;
      },
      json: (data: any) => {
        res.json(data);
      },
      send: (data: any) => {
        res.send(data);
      },
      end: () => {
        res.end();
      },
      clearCookie: (name: string, options?: any) => {
        // Vercel serverless functions: clear cookie by setting it with maxAge=0
        const cookieOptions = options || {};
        const cookieValue = `${name}=; Path=${cookieOptions.path || '/'}; Max-Age=0; HttpOnly=${cookieOptions.httpOnly !== false}; SameSite=${cookieOptions.sameSite || 'None'}; Secure=${cookieOptions.secure !== false}`;
        res.setHeader('Set-Cookie', cookieValue);
      },
    } as any;

    // Use fetchRequestHandler (correct for Vercel serverless functions)
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: fetchReq,
      router: appRouter,
      createContext: async () => createContext({ req: expressReq, res: expressRes } as CreateExpressContextOptions),
    });

    // Convert Fetch API Response to Vercel response
    const responseData = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Set headers
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set status and send response
    res.status(response.status);
    res.send(responseData);
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
