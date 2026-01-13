import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

// Type guard to check if request has protocol property (Express Request)
function hasProtocol(req: any): req is Request & { protocol: string } {
  return typeof req.protocol === "string";
}

// Type guard to check if request has headers property
function hasHeaders(req: any): req is { headers: Record<string, string | string[] | undefined> } {
  return req.headers && typeof req.headers === "object";
}

function isSecureRequest(req: any): boolean {
  // Check if it's Express Request with protocol
  if (hasProtocol(req) && req.protocol === "https") {
    return true;
  }

  // Check x-forwarded-proto header (works for both Express and Vercel)
  if (hasHeaders(req)) {
    const forwardedProto = req.headers["x-forwarded-proto"];
    if (!forwardedProto) return false;

    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : String(forwardedProto).split(",");

    return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
  }

  // Default to secure in production (Vercel always uses HTTPS)
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export function getSessionCookieOptions(
  req: any
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
    domain: undefined, // Required by TypeScript, but optional in runtime
  };
}
