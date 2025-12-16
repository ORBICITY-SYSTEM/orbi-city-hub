import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@orbicitybatumi.com",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("ai.chat", () => {
  it("returns a valid AI response for CEO module", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      module: "CEO",
      userMessage: "What is ORBI City?",
    });

    expect(result).toHaveProperty("response");
    expect(result).toHaveProperty("responseTime");
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
    expect(result.responseTime).toBeGreaterThan(0);
  }, 30000); // 30s timeout for LLM call

  it("handles file context in Finance module", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      module: "Finance",
      userMessage: "Analyze this financial report",
      fileUrl: "https://example.com/report.xlsx",
      fileName: "october_report.xlsx",
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    expect(result).toHaveProperty("response");
    expect(result.response).toContain("report");
  }, 30000);
});

describe("ai.getHistory", () => {
  it("returns conversation history for a module", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a conversation
    await caller.ai.chat({
      module: "Marketing",
      userMessage: "Suggest TikTok content ideas",
    });

    // Then get history
    const history = await caller.ai.getHistory({
      module: "Marketing",
      limit: 5,
    });

    expect(Array.isArray(history)).toBe(true);
    if (history.length > 0) {
      expect(history[0]).toHaveProperty("userMessage");
      expect(history[0]).toHaveProperty("aiResponse");
      expect(history[0]).toHaveProperty("module");
    }
  }, 30000);
});
