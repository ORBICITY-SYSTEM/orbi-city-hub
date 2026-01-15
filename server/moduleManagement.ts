/**
 * Module Management Functions
 * Functions to rename sub-modules, add new sub-modules, and update AI knowledge bases
 */

import { getDb } from "./db";
import { systemConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// Sub-Module Management
// ============================================================================

export interface SubModuleUpdate {
  moduleId: string;
  subModuleId: string;
  name?: string;
  nameGe?: string;
  description?: string;
  descriptionGe?: string;
  icon?: string;
}

export interface NewSubModule {
  moduleId: string;
  id: string;
  name: string;
  nameGe: string;
  icon: string;
  path: string;
  description: string;
  descriptionGe: string;
}

export interface KnowledgeBaseUpdate {
  moduleId: string;
  topics: string[]; // Array of knowledge topics
}

/**
 * Rename or update a sub-module
 */
export async function renameSubModule(update: SubModuleUpdate): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }

    // Get current module configuration
    const configResult = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, "module_configuration"))
      .limit(1);

    let moduleConfig: any;
    if (configResult.length > 0) {
      moduleConfig = JSON.parse(String(configResult[0]!.value));
    } else {
      // Initialize with default configuration
      const { MODULES } = await import("../shared/moduleConfig");
      moduleConfig = { modules: MODULES };
    }

    // Find and update the sub-module
    const module = moduleConfig.modules.find((m: any) => m.id === update.moduleId);
    if (!module) {
      return { success: false, message: `Module ${update.moduleId} not found` };
    }

    const subModule = module.subModules.find((sm: any) => sm.id === update.subModuleId);
    if (!subModule) {
      return { success: false, message: `Sub-module ${update.subModuleId} not found` };
    }

    // Update fields
    if (update.name) subModule.name = update.name;
    if (update.nameGe) subModule.nameGe = update.nameGe;
    if (update.description) subModule.description = update.description;
    if (update.descriptionGe) subModule.descriptionGe = update.descriptionGe;
    if (update.icon) subModule.icon = update.icon;

    // Save back to database
    if (configResult.length > 0) {
      await db
        .update(systemConfig)
        .set({ value: JSON.stringify(moduleConfig), updatedAt: new Date() })
        .where(eq(systemConfig.key, "module_configuration"));
    } else {
      await db.insert(systemConfig).values({
        key: "module_configuration",
        value: JSON.stringify(moduleConfig),
        description: "Custom module configuration with sub-modules",
      });
    }

    return {
      success: true,
      message: `Sub-module ${update.subModuleId} updated successfully`,
    };
  } catch (error) {
    console.error("Error renaming sub-module:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Add a new sub-module to a module
 */
export async function addSubModule(newSubModule: NewSubModule): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }

    // Get current module configuration
    const configResult = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, "module_configuration"))
      .limit(1);

    let moduleConfig: any;
    if (configResult.length > 0) {
      moduleConfig = JSON.parse(String(configResult[0]!.value));
    } else {
      const { MODULES } = await import("../shared/moduleConfig");
      moduleConfig = { modules: MODULES };
    }

    // Find the module
    const module = moduleConfig.modules.find((m: any) => m.id === newSubModule.moduleId);
    if (!module) {
      return { success: false, message: `Module ${newSubModule.moduleId} not found` };
    }

    // Check if sub-module ID already exists
    const exists = module.subModules.some((sm: any) => sm.id === newSubModule.id);
    if (exists) {
      return {
        success: false,
        message: `Sub-module with ID ${newSubModule.id} already exists`,
      };
    }

    // Add new sub-module
    module.subModules.push({
      id: newSubModule.id,
      name: newSubModule.name,
      nameGe: newSubModule.nameGe,
      icon: newSubModule.icon,
      path: newSubModule.path,
      description: newSubModule.description,
      descriptionGe: newSubModule.descriptionGe,
    });

    // Save back to database
    if (configResult.length > 0) {
      await db
        .update(systemConfig)
        .set({ value: JSON.stringify(moduleConfig), updatedAt: new Date() })
        .where(eq(systemConfig.key, "module_configuration"));
    } else {
      await db.insert(systemConfig).values({
        key: "module_configuration",
        value: JSON.stringify(moduleConfig),
        description: "Custom module configuration with sub-modules",
      });
    }

    return {
      success: true,
      message: `Sub-module ${newSubModule.id} added successfully to ${newSubModule.moduleId}`,
    };
  } catch (error) {
    console.error("Error adding sub-module:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Update AI agent knowledge base for a module
 */
export async function updateKnowledgeBase(
  update: KnowledgeBaseUpdate
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }

    // Get current module configuration
    const configResult = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, "module_configuration"))
      .limit(1);

    let moduleConfig: any;
    if (configResult.length > 0) {
      moduleConfig = JSON.parse(String(configResult[0]!.value));
    } else {
      const { MODULES } = await import("../shared/moduleConfig");
      moduleConfig = { modules: MODULES };
    }

    // Find the module
    const module = moduleConfig.modules.find((m: any) => m.id === update.moduleId);
    if (!module) {
      return { success: false, message: `Module ${update.moduleId} not found` };
    }

    // Update knowledge base
    module.aiAgent.knowledgeBase = update.topics;

    // Save back to database
    if (configResult.length > 0) {
      await db
        .update(systemConfig)
        .set({ value: JSON.stringify(moduleConfig), updatedAt: new Date() })
        .where(eq(systemConfig.key, "module_configuration"));
    } else {
      await db.insert(systemConfig).values({
        key: "module_configuration",
        value: JSON.stringify(moduleConfig),
        description: "Custom module configuration with sub-modules",
      });
    }

    return {
      success: true,
      message: `Knowledge base for ${update.moduleId} updated with ${update.topics.length} topics`,
    };
  } catch (error) {
    console.error("Error updating knowledge base:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Get current module configuration
 */
export async function getModuleConfiguration(): Promise<any> {
  try {
    const db = await getDb();
    if (!db) {
      // Return default configuration
      const { MODULES } = await import("../shared/moduleConfig");
      return { modules: MODULES };
    }

    const configResult = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, "module_configuration"))
      .limit(1);

    if (configResult.length > 0) {
      return JSON.parse(String(configResult[0]!.value));
    } else {
      // Return default configuration
      const { MODULES } = await import("../shared/moduleConfig");
      return { modules: MODULES };
    }
  } catch (error) {
    console.error("Error getting module configuration:", error);
    const { MODULES } = await import("../shared/moduleConfig");
    return { modules: MODULES };
  }
}
