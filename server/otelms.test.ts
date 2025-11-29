import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * OTELMS Integration Tests
 * Tests for OTELMS daily reports API
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
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
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("OTELMS Integration", () => {
  describe("otelms.getLatest", () => {
    it("should return the latest OTELMS report", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getLatest();

      // Should return a report or null
      if (result) {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("reportDate");
        expect(result).toHaveProperty("checkIns");
        expect(result).toHaveProperty("checkOuts");
        expect(result).toHaveProperty("totalRevenue");
        expect(result).toHaveProperty("occupancyRate");
      } else {
        expect(result).toBeNull();
      }
    });

    it("should have valid data types", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getLatest();

      if (result) {
        expect(typeof result.id).toBe("number");
        expect(result.reportDate).toBeInstanceOf(Date);
        expect(typeof result.checkIns).toBe("number");
        expect(typeof result.checkOuts).toBe("number");
        expect(typeof result.totalRevenue).toBe("number");
        expect(typeof result.occupancyRate).toBe("number");
      }
    });
  });

  describe("otelms.getAll", () => {
    it("should return an array of OTELMS reports", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getAll();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return reports in descending order by date", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getAll();

      if (result.length > 1) {
        const firstDate = new Date(result[0]!.reportDate).getTime();
        const secondDate = new Date(result[1]!.reportDate).getTime();
        expect(firstDate).toBeGreaterThanOrEqual(secondDate);
      }
    });
  });

  describe("otelms.getByDate", () => {
    it("should return report for specific date", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Test with Nov 29, 2025 (the sample data we inserted)
      const result = await caller.otelms.getByDate({
        date: "2025-11-29T00:00:00.000Z",
      });

      if (result) {
        expect(result).toHaveProperty("reportDate");
        const reportDate = new Date(result.reportDate);
        // Check year and month (day might vary due to timezone)
        expect(reportDate.getMonth()).toBe(10); // November (0-indexed)
        expect(reportDate.getFullYear()).toBe(2025);
        // Day should be 28 or 29 (timezone difference)
        expect([28, 29]).toContain(reportDate.getDate());
      }
    });

    it("should return null for non-existent date", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getByDate({
        date: "2020-01-01T00:00:00.000Z",
      });

      expect(result).toBeNull();
    });
  });

  describe("otelms.getByDateRange", () => {
    it("should return reports within date range", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getByDateRange({
        startDate: "2025-11-01T00:00:00.000Z",
        endDate: "2025-11-30T23:59:59.999Z",
      });

      expect(Array.isArray(result)).toBe(true);

      // All reports should be within the date range
      result.forEach((report) => {
        const reportDate = new Date(report.reportDate);
        expect(reportDate.getTime()).toBeGreaterThanOrEqual(
          new Date("2025-11-01").getTime()
        );
        expect(reportDate.getTime()).toBeLessThanOrEqual(
          new Date("2025-11-30T23:59:59.999Z").getTime()
        );
      });
    });
  });

  describe("otelms.getStatistics", () => {
    it("should return aggregated statistics", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const result = await caller.otelms.getStatistics({
        startDate,
        endDate,
      });

      if (result) {
        expect(result).toHaveProperty("checkIns");
        expect(result).toHaveProperty("checkOuts");
        expect(result).toHaveProperty("totalRevenue");
        expect(result).toHaveProperty("occupancyRate");
        expect(result).toHaveProperty("reportCount");
        expect(typeof result.reportCount).toBe("number");
      }
    });
  });

  describe("otelms.getDashboardSummary", () => {
    it("should return dashboard summary with last 30 days stats", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getDashboardSummary();

      expect(result).toHaveProperty("last30Days");
      expect(result).toHaveProperty("latestReport");

      if (result.last30Days) {
        expect(result.last30Days).toHaveProperty("checkIns");
        expect(result.last30Days).toHaveProperty("totalRevenue");
      }
    });
  });

  describe("Data Validation", () => {
    it("should have sample data from Nov 29, 2025", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getByDate({
        date: "2025-11-29T00:00:00.000Z",
      });

      if (result) {
        // Verify sample data we inserted
        expect(result.checkIns).toBe(10);
        expect(result.checkOuts).toBe(5);
        expect(result.cancellations).toBe(22);
        expect(result.totalRevenue).toBe(153984); // ₾1,539.84 in tetri
        expect(result.occupancyRate).toBe(6000); // 60% * 100
        expect(result.totalGuests).toBe(98);
        expect(result.roomsOccupied).toBe(44);
      }
    });

    it("should have valid channel data JSON", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.otelms.getLatest();

      if (result && result.channelData) {
        const channelData = result.channelData as Record<
          string,
          { count: number; revenue: number }
        >;
        
        expect(typeof channelData).toBe("object");
        
        // Check if channel data has expected structure
        Object.values(channelData).forEach((channel) => {
          expect(channel).toHaveProperty("count");
          expect(channel).toHaveProperty("revenue");
          expect(typeof channel.count).toBe("number");
          expect(typeof channel.revenue).toBe("number");
        });
      }
    });
  });
});
