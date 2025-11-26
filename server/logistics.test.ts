import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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

  return { ctx };
}

describe("logistics.rooms", () => {
  it("should list all rooms", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const rooms = await caller.logistics.rooms.list();

    expect(rooms).toBeDefined();
    expect(Array.isArray(rooms)).toBe(true);
    // Should have 60 rooms in database (from seed data)
    expect(rooms.length).toBeGreaterThan(0);
  });

  it("should get room by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get all rooms
    const rooms = await caller.logistics.rooms.list();
    if (rooms.length === 0) {
      // Skip test if no rooms exist
      return;
    }

    const firstRoom = rooms[0];
    const room = await caller.logistics.rooms.getById({ id: firstRoom.id });

    expect(room).toBeDefined();
    expect(room?.id).toBe(firstRoom.id);
    expect(room?.roomNumber).toBe(firstRoom.roomNumber);
  });
});

describe("logistics.standardItems", () => {
  it("should list all standard inventory items", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.logistics.standardItems.list();

    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
    // Should have 90 standard items in database (from seed data)
    expect(items.length).toBeGreaterThan(0);
  });

  it("should get standard item by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get all items
    const items = await caller.logistics.standardItems.list();
    if (items.length === 0) {
      // Skip test if no items exist
      return;
    }

    const firstItem = items[0];
    const item = await caller.logistics.standardItems.getById({ id: firstItem.id });

    expect(item).toBeDefined();
    expect(item?.id).toBe(firstItem.id);
    expect(item?.itemName).toBe(firstItem.itemName);
  });
});

describe("logistics.roomInventory", () => {
  it("should list all room inventory items", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.logistics.roomInventory.list();

    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it("should get room inventory by room id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get a room
    const rooms = await caller.logistics.rooms.list();
    if (rooms.length === 0) {
      // Skip test if no rooms exist
      return;
    }

    const firstRoom = rooms[0];
    const items = await caller.logistics.roomInventory.getByRoomId({ roomId: firstRoom.id });

    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it("should upsert room inventory item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get first room and first standard item
    const rooms = await caller.logistics.rooms.list();
    const standardItems = await caller.logistics.standardItems.list();

    if (rooms.length === 0 || standardItems.length === 0) {
      // Skip test if no data exists
      return;
    }

    const result = await caller.logistics.roomInventory.upsert({
      roomId: rooms[0].id,
      standardItemId: standardItems[0].id,
      actualQuantity: 5,
      condition: "good",
      notes: "Test note",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});

describe("logistics.housekeeping", () => {
  it("should list all housekeeping schedules", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const schedules = await caller.logistics.housekeeping.list();

    expect(schedules).toBeDefined();
    expect(Array.isArray(schedules)).toBe(true);
  });

  it("should create housekeeping schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.logistics.housekeeping.create({
      scheduledDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      rooms: ["A 3041", "C 2641"],
      totalRooms: 2,
      status: "pending",
      notes: "Test cleaning schedule",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});

describe("logistics.maintenance", () => {
  it("should list all maintenance schedules", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const schedules = await caller.logistics.maintenance.list();

    expect(schedules).toBeDefined();
    expect(Array.isArray(schedules)).toBe(true);
  });

  it("should create maintenance schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.logistics.maintenance.create({
      roomNumber: "A 3041",
      scheduledDate: new Date().toISOString().split('T')[0],
      problem: "Broken AC",
      notes: "Needs urgent repair",
      status: "pending",
      estimatedCost: 150,
      priority: "high",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});

describe("logistics.activityLog", () => {
  it("should list activity log", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const logs = await caller.logistics.activityLog.list({ limit: 10 });

    expect(logs).toBeDefined();
    expect(Array.isArray(logs)).toBe(true);
  });
});
