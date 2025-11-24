import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("fileManager", () => {
  it("should list files for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fileManager.list({ limit: 10, offset: 0 });

    expect(result).toHaveProperty("files");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.files)).toBe(true);
  });

  it("should get file statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fileManager.stats();

    expect(result).toHaveProperty("totalFiles");
    expect(result).toHaveProperty("totalSize");
    expect(result).toHaveProperty("byModule");
    expect(result).toHaveProperty("byType");
    expect(typeof result.totalFiles).toBe("number");
    expect(typeof result.totalSize).toBe("number");
  });

  it("should search files by query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fileManager.search({ query: "test" });

    expect(result).toHaveProperty("files");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.files)).toBe(true);
  });
});
