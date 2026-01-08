import { describe, it, expect } from "vitest";
import { appRouter } from ".";
import type { TrpcContext } from "../_core/context";

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

describe("Tawk.to Router", () => {
  const { ctx } = createAuthContext();
  const caller = appRouter.createCaller(ctx);

  describe("getAll", () => {
    it("should return an array of chats", async () => {
      const result = await caller.tawkto.getAll({
        limit: 10,
        offset: 0,
        status: "all",
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter by status", async () => {
      const result = await caller.tawkto.getAll({
        limit: 10,
        offset: 0,
        status: "active",
      });
      expect(Array.isArray(result)).toBe(true);
      // All results should have active status (if any)
      result.forEach((chat: any) => {
        expect(chat.status).toBe("active");
      });
    });

    it("should respect limit parameter", async () => {
      const result = await caller.tawkto.getAll({
        limit: 5,
        offset: 0,
        status: "all",
      });
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getStats", () => {
    it("should return chat statistics", async () => {
      const result = await caller.tawkto.getStats();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("active");
      expect(result).toHaveProperty("ended");
      expect(result).toHaveProperty("missed");
      expect(result).toHaveProperty("unread");
      expect(result).toHaveProperty("todayCount");
      expect(typeof result.total).toBe("number");
      expect(typeof result.active).toBe("number");
    });
  });

  describe("getUnread", () => {
    it("should return unread chats array", async () => {
      const result = await caller.tawkto.getUnread();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getTickets", () => {
    it("should return an array of tickets", async () => {
      const result = await caller.tawkto.getTickets({
        limit: 10,
        offset: 0,
      });
      expect(Array.isArray(result)).toBe(true);
      // All results should be ticket:create events (if any)
      result.forEach((ticket: any) => {
        expect(ticket.eventType).toBe("ticket:create");
      });
    });
  });

  describe("getTicketStats", () => {
    it("should return ticket statistics", async () => {
      const result = await caller.tawkto.getTicketStats();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("open");
      expect(result).toHaveProperty("closed");
      expect(result).toHaveProperty("todayCount");
      expect(typeof result.total).toBe("number");
      expect(typeof result.open).toBe("number");
    });
  });

  describe("markAsRead", () => {
    it("should mark a chat as read", async () => {
      // First get a chat to mark as read
      const chats = await caller.tawkto.getAll({
        limit: 1,
        offset: 0,
        status: "all",
      });

      if (chats.length > 0) {
        const result = await caller.tawkto.markAsRead({ id: chats[0].id });
        expect(result).toHaveProperty("success");
        expect(result.success).toBe(true);
      }
    });
  });
});
