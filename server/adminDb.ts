import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { adminUsers, modules, systemSettings, type AdminUser, type InsertAdminUser, type Module, type InsertModule, type SystemSetting, type InsertSystemSetting } from "../drizzle/schema";

// ============================================================================
// ADMIN USERS
// ============================================================================

export async function createAdminUser(data: InsertAdminUser): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot create admin user: database not available");
    return null;
  }

  try {
    const result = await db.insert(adminUsers).values(data);
    const insertId = result[0].insertId;
    
    // Fetch the created user
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, insertId)).limit(1);
    return user || null;
  } catch (error) {
    console.error("[AdminDB] Failed to create admin user:", error);
    throw error;
  }
}

export async function getAdminUserByUsername(username: string): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get admin user: database not available");
    return null;
  }

  try {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return user || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get admin user:", error);
    return null;
  }
}

export async function getAdminUserById(id: number): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get admin user: database not available");
    return null;
  }

  try {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    return user || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get admin user:", error);
    return null;
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot update last login: database not available");
    return;
  }

  try {
    await db.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, id));
  } catch (error) {
    console.error("[AdminDB] Failed to update last login:", error);
  }
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get admin users: database not available");
    return [];
  }

  try {
    return await db.select().from(adminUsers);
  } catch (error) {
    console.error("[AdminDB] Failed to get admin users:", error);
    return [];
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot delete admin user: database not available");
    return false;
  }

  try {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return true;
  } catch (error) {
    console.error("[AdminDB] Failed to delete admin user:", error);
    return false;
  }
}

// ============================================================================
// MODULES
// ============================================================================

export async function createModule(data: InsertModule): Promise<Module | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot create module: database not available");
    return null;
  }

  try {
    const result = await db.insert(modules).values(data);
    const insertId = result[0].insertId;
    
    const [module] = await db.select().from(modules).where(eq(modules.id, insertId)).limit(1);
    return module || null;
  } catch (error) {
    console.error("[AdminDB] Failed to create module:", error);
    throw error;
  }
}

export async function getAllModules(): Promise<Module[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get modules: database not available");
    return [];
  }

  try {
    return await db.select().from(modules);
  } catch (error) {
    console.error("[AdminDB] Failed to get modules:", error);
    return [];
  }
}

export async function getModuleById(id: number): Promise<Module | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get module: database not available");
    return null;
  }

  try {
    const [module] = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    return module || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get module:", error);
    return null;
  }
}

export async function getModuleBySlug(slug: string): Promise<Module | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get module: database not available");
    return null;
  }

  try {
    const [module] = await db.select().from(modules).where(eq(modules.slug, slug)).limit(1);
    return module || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get module:", error);
    return null;
  }
}

export async function updateModule(id: number, data: Partial<InsertModule>): Promise<Module | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot update module: database not available");
    return null;
  }

  try {
    await db.update(modules).set(data).where(eq(modules.id, id));
    return await getModuleById(id);
  } catch (error) {
    console.error("[AdminDB] Failed to update module:", error);
    throw error;
  }
}

export async function deleteModule(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot delete module: database not available");
    return false;
  }

  try {
    await db.delete(modules).where(eq(modules.id, id));
    return true;
  } catch (error) {
    console.error("[AdminDB] Failed to delete module:", error);
    return false;
  }
}

export async function reorderModules(moduleOrders: { id: number; order: number }[]): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot reorder modules: database not available");
    return false;
  }

  try {
    // Update all module orders in a transaction-like manner
    for (const { id, order } of moduleOrders) {
      await db.update(modules).set({ sortOrder: order }).where(eq(modules.id, id));
    }
    return true;
  } catch (error) {
    console.error("[AdminDB] Failed to reorder modules:", error);
    return false;
  }
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function createOrUpdateSetting(data: InsertSystemSetting): Promise<SystemSetting | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot create/update setting: database not available");
    return null;
  }

  try {
    // Try to get existing setting
    const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, data.key)).limit(1);
    
    if (existing) {
      // Update existing
      await db.update(systemSettings).set({ value: data.value, category: data.category }).where(eq(systemSettings.key, data.key));
      const [updated] = await db.select().from(systemSettings).where(eq(systemSettings.key, data.key)).limit(1);
      return updated || null;
    } else {
      // Create new
      const result = await db.insert(systemSettings).values(data);
      const insertId = result[0].insertId;
      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.id, insertId)).limit(1);
      return setting || null;
    }
  } catch (error) {
    console.error("[AdminDB] Failed to create/update setting:", error);
    throw error;
  }
}

export async function getSettingByKey(key: string): Promise<SystemSetting | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get setting: database not available");
    return null;
  }

  try {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    return setting || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get setting:", error);
    return null;
  }
}

export async function getSettingsByCategory(category: string): Promise<SystemSetting[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get settings: database not available");
    return [];
  }

  try {
    return await db.select().from(systemSettings).where(eq(systemSettings.category, category));
  } catch (error) {
    console.error("[AdminDB] Failed to get settings:", error);
    return [];
  }
}

export async function getAllSettings(): Promise<SystemSetting[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get settings: database not available");
    return [];
  }

  try {
    return await db.select().from(systemSettings);
  } catch (error) {
    console.error("[AdminDB] Failed to get settings:", error);
    return [];
  }
}

export async function deleteSetting(key: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot delete setting: database not available");
    return false;
  }

  try {
    await db.delete(systemSettings).where(eq(systemSettings.key, key));
    return true;
  } catch (error) {
    console.error("[AdminDB] Failed to delete setting:", error);
    return false;
  }
}
