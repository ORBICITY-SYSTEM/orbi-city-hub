import { describe, expect, it, beforeAll } from "vitest";
import * as adminDb from "./adminDb";
import * as bcrypt from "bcryptjs";

describe("Admin Database Helpers", () => {
  describe("AdminUsers", () => {
    it("should create an admin user", async () => {
      const passwordHash = await bcrypt.hash("testpassword123", 10);
      
      const adminUser = await adminDb.createAdminUser({
        username: `testadmin_${Date.now()}`,
        passwordHash,
        role: "admin",
        permissions: {
          modules: { add: true, edit: true, delete: true },
          users: { manage: true },
        },
      });

      expect(adminUser).toBeTruthy();
      expect(adminUser?.username).toContain("testadmin_");
      expect(adminUser?.role).toBe("admin");
    });

    it("should get admin user by username", async () => {
      const passwordHash = await bcrypt.hash("testpassword123", 10);
      const username = `testadmin2_${Date.now()}`;
      
      await adminDb.createAdminUser({
        username,
        passwordHash,
        role: "admin",
        permissions: { modules: { add: true } },
      });

      const user = await adminDb.getAdminUserByUsername(username);
      expect(user).toBeTruthy();
      expect(user?.username).toBe(username);
    });

    it("should get all admin users", async () => {
      const users = await adminDb.getAllAdminUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe("Modules", () => {
    it("should create a module", async () => {
      const module = await adminDb.createModule({
        name: "Test Module",
        slug: `test-module-${Date.now()}`,
        icon: "TestIcon",
        route: "/test",
        order: 99,
        isActive: true,
        aiPrompt: "Test AI prompt",
      });

      expect(module).toBeTruthy();
      expect(module?.name).toBe("Test Module");
      expect(module?.slug).toContain("test-module-");
    });

    it("should get all modules", async () => {
      const modules = await adminDb.getAllModules();
      expect(Array.isArray(modules)).toBe(true);
    });

    it("should get module by slug", async () => {
      const slug = `test-module-slug-${Date.now()}`;
      
      await adminDb.createModule({
        name: "Test Module 2",
        slug,
        icon: "TestIcon",
        route: "/test2",
        order: 100,
      });

      const module = await adminDb.getModuleBySlug(slug);
      expect(module).toBeTruthy();
      expect(module?.slug).toBe(slug);
    });

    it("should update a module", async () => {
      const slug = `test-module-update-${Date.now()}`;
      
      const created = await adminDb.createModule({
        name: "Original Name",
        slug,
        icon: "TestIcon",
        route: "/test3",
        order: 101,
      });

      expect(created).toBeTruthy();

      const updated = await adminDb.updateModule(created!.id, {
        name: "Updated Name",
      });

      expect(updated?.name).toBe("Updated Name");
      expect(updated?.slug).toBe(slug);
    });

    it("should delete a module", async () => {
      const slug = `test-module-delete-${Date.now()}`;
      
      const created = await adminDb.createModule({
        name: "To Delete",
        slug,
        icon: "TestIcon",
        route: "/test4",
        order: 102,
      });

      expect(created).toBeTruthy();

      const deleted = await adminDb.deleteModule(created!.id);
      expect(deleted).toBe(true);

      const found = await adminDb.getModuleBySlug(slug);
      expect(found).toBeNull();
    });
  });

  describe("SystemSettings", () => {
    it("should create a setting", async () => {
      const key = `test_setting_${Date.now()}`;
      
      const setting = await adminDb.createOrUpdateSetting({
        key,
        value: { enabled: true, theme: "dark" },
        category: "design",
      });

      expect(setting).toBeTruthy();
      expect(setting?.key).toBe(key);
      expect(setting?.value).toEqual({ enabled: true, theme: "dark" });
    });

    it("should update an existing setting", async () => {
      const key = `test_setting_update_${Date.now()}`;
      
      await adminDb.createOrUpdateSetting({
        key,
        value: { version: 1 },
        category: "general",
      });

      const updated = await adminDb.createOrUpdateSetting({
        key,
        value: { version: 2 },
        category: "general",
      });

      expect(updated?.value).toEqual({ version: 2 });
    });

    it("should get setting by key", async () => {
      const key = `test_setting_get_${Date.now()}`;
      
      await adminDb.createOrUpdateSetting({
        key,
        value: { test: true },
        category: "ai",
      });

      const setting = await adminDb.getSettingByKey(key);
      expect(setting).toBeTruthy();
      expect(setting?.key).toBe(key);
    });

    it("should get settings by category", async () => {
      const category = `test_category_${Date.now()}`;
      
      await adminDb.createOrUpdateSetting({
        key: `${category}_1`,
        value: { a: 1 },
        category,
      });

      await adminDb.createOrUpdateSetting({
        key: `${category}_2`,
        value: { b: 2 },
        category,
      });

      const settings = await adminDb.getSettingsByCategory(category);
      expect(settings.length).toBeGreaterThanOrEqual(2);
    });

    it("should get all settings", async () => {
      const settings = await adminDb.getAllSettings();
      expect(Array.isArray(settings)).toBe(true);
    });

    it("should delete a setting", async () => {
      const key = `test_setting_delete_${Date.now()}`;
      
      await adminDb.createOrUpdateSetting({
        key,
        value: { toDelete: true },
        category: "general",
      });

      const deleted = await adminDb.deleteSetting(key);
      expect(deleted).toBe(true);

      const found = await adminDb.getSettingByKey(key);
      expect(found).toBeNull();
    });
  });
});
