import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Convert Vercel request/response to Express-like format
  const expressReq = {
    ...req,
    headers: req.headers || {},
    method: req.method || "GET",
    url: req.url || "/",
    query: req.query || {},
    body: req.body,
  } as any;

  const expressRes = {
    setHeader: (key: string, value: string | string[]) => {
      res.setHeader(key, value);
    },
    getHeader: (key: string) => res.getHeader(key),
    removeHeader: (key: string) => res.removeHeader(key),
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
  } as any;

  // Use Express middleware adapter
  const middleware = createExpressMiddleware({
    router: appRouter,
    createContext: async () => createContext({ req: expressReq, res: expressRes }),
  });

  return middleware(expressReq, expressRes);
}
