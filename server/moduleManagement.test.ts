import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@orbicitybatumi.com",
    name: "Test Admin",
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

describe("Module Management", () => {
  describe("modules.getConfiguration", () => {
    it("should return default module configuration", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const config = await caller.modules.getConfiguration();

      expect(config).toBeDefined();
      expect(config.modules).toBeInstanceOf(Array);
      expect(config.modules.length).toBe(5); // 5 main modules

      // Check CEO module
      const ceoModule = config.modules.find((m: any) => m.id === "ceo");
      expect(ceoModule).toBeDefined();
      expect(ceoModule.subModules.length).toBe(5); // 5 sub-modules
      expect(ceoModule.aiAgent).toBeDefined();
      expect(ceoModule.aiAgent.name).toBe("Main CEO Agent");
      expect(ceoModule.aiAgent.knowledgeBase).toBeInstanceOf(Array);
    });

    it("should have all 5 main modules", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const config = await caller.modules.getConfiguration();

      const moduleIds = config.modules.map((m: any) => m.id);
      expect(moduleIds).toContain("ceo");
      expect(moduleIds).toContain("reservations");
      expect(moduleIds).toContain("finance");
      expect(moduleIds).toContain("marketing");
      expect(moduleIds).toContain("logistics");
    });

    it("should have 5 sub-modules for each main module", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const config = await caller.modules.getConfiguration();

      config.modules.forEach((module: any) => {
        expect(module.subModules.length).toBe(5);
      });
    });
  });

  describe("modules.renameSubModule", () => {
    it("should rename a sub-module successfully", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.renameSubModule({
        moduleId: "logistics",
        subModuleId: "inventory",
        name: "Stock Management",
        nameGe: "მარაგის მართვა",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("updated successfully");
    });

    it("should return error for non-existent module", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.renameSubModule({
        moduleId: "non-existent",
        subModuleId: "inventory",
        name: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });

    it("should return error for non-existent sub-module", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.renameSubModule({
        moduleId: "logistics",
        subModuleId: "non-existent",
        name: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("modules.addSubModule", () => {
    it("should add a new sub-module successfully", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.addSubModule({
        moduleId: "logistics",
        id: "quality-control",
        name: "Quality Control",
        nameGe: "ხარისხის კონტროლი",
        icon: "CheckCircle",
        path: "/logistics/quality",
        description: "Quality assurance and inspections",
        descriptionGe: "ხარისხის უზრუნველყოფა და ინსპექციები",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("added successfully");
    });

    it("should return error for non-existent module", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.addSubModule({
        moduleId: "non-existent",
        id: "test",
        name: "Test",
        nameGe: "ტესტი",
        icon: "Test",
        path: "/test",
        description: "Test",
        descriptionGe: "ტესტი",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("modules.updateKnowledgeBase", () => {
    it("should update knowledge base successfully", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.updateKnowledgeBase({
        moduleId: "logistics",
        topics: [
          "Inventory Management",
          "Quality Control",
          "Supply Chain Optimization",
          "Staff Training",
        ],
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("updated");
      expect(result.message).toContain("4 topics");
    });

    it("should return error for non-existent module", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.updateKnowledgeBase({
        moduleId: "non-existent",
        topics: ["Test"],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });

    it("should handle empty topics array", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.modules.updateKnowledgeBase({
        moduleId: "logistics",
        topics: [],
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("0 topics");
    });
  });
});
