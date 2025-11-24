import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
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

describe("ceoDashboard.getKPIs", () => {
  it("returns KPI data with correct structure", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getKPIs();

    expect(result).toHaveProperty("revenue");
    expect(result).toHaveProperty("occupancy");
    expect(result).toHaveProperty("rating");
    expect(result).toHaveProperty("aiTasks");

    expect(result.revenue).toHaveProperty("value");
    expect(result.revenue).toHaveProperty("change");
    expect(result.revenue).toHaveProperty("formatted");

    expect(typeof result.revenue.value).toBe("number");
    expect(typeof result.revenue.change).toBe("number");
    expect(typeof result.revenue.formatted).toBe("string");
  });

  it("returns valid occupancy percentage (0-100)", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getKPIs();

    expect(result.occupancy.value).toBeGreaterThanOrEqual(0);
    expect(result.occupancy.value).toBeLessThanOrEqual(100);
  });

  it("returns valid rating (0-10)", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getKPIs();

    expect(result.rating.value).toBeGreaterThanOrEqual(0);
    expect(result.rating.value).toBeLessThanOrEqual(10);
  });
});

describe("ceoDashboard.getRevenueByChannel", () => {
  it("returns array of channel data", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getRevenueByChannel();

    expect(Array.isArray(result)).toBe(true);
    
    if (result.length > 0) {
      const firstChannel = result[0];
      expect(firstChannel).toHaveProperty("channel");
      expect(firstChannel).toHaveProperty("revenue");
      expect(firstChannel).toHaveProperty("percentage");
      
      expect(typeof firstChannel.channel).toBe("string");
      expect(typeof firstChannel.revenue).toBe("number");
      expect(typeof firstChannel.percentage).toBe("number");
    }
  });

  it("channel percentages are valid (0-100)", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getRevenueByChannel();

    result.forEach((channel) => {
      expect(channel.percentage).toBeGreaterThanOrEqual(0);
      expect(channel.percentage).toBeLessThanOrEqual(100);
    });
  });
});

describe("ceoDashboard.getMonthlyOverview", () => {
  it("returns monthly overview with correct structure", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getMonthlyOverview();

    expect(result).toHaveProperty("totalBookings");
    expect(result).toHaveProperty("bookingsChange");
    expect(result).toHaveProperty("avgStay");
    expect(result).toHaveProperty("avgStayChange");
    expect(result).toHaveProperty("avgPrice");
    expect(result).toHaveProperty("avgPriceChange");
    expect(result).toHaveProperty("cancellationRate");
    expect(result).toHaveProperty("cancellationRateChange");

    expect(typeof result.totalBookings).toBe("number");
    expect(typeof result.avgStay).toBe("number");
    expect(typeof result.avgPrice).toBe("number");
    expect(typeof result.cancellationRate).toBe("number");
  });

  it("returns valid cancellation rate (0-100)", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getMonthlyOverview();

    expect(result.cancellationRate).toBeGreaterThanOrEqual(0);
    expect(result.cancellationRate).toBeLessThanOrEqual(100);
  });

  it("returns positive values for bookings and prices", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ceoDashboard.getMonthlyOverview();

    expect(result.totalBookings).toBeGreaterThanOrEqual(0);
    expect(result.avgStay).toBeGreaterThanOrEqual(0);
    expect(result.avgPrice).toBeGreaterThanOrEqual(0);
  });
});
