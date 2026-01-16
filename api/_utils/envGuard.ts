import { z } from "zod";

export function validateEnv(keys: string[]) {
  const shape: Record<string, z.ZodString> = {};
  keys.forEach((k) => {
    shape[k] = z.string().min(1, `${k} is required`);
  });
  const schema = z.object(shape);
  schema.parse(process.env);
}

export function setSecurityHeaders(res: { setHeader(name: string, value: string): void }) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
}
