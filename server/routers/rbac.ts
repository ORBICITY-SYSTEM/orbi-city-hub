import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  hasRole,
  hasPermission,
  requireRole,
  requirePermission,
  getAccessibleModules,
  getModulePermissions,
  PERMISSIONS,
  type Role,
} from "../rbac";

export const rbacRouter = router({
  /**
   * Get current user's permissions
   */
  getMyPermissions: protectedProcedure.query(({ ctx }) => {
    const accessibleModules = getAccessibleModules(ctx.user);
    const modulePermissions: Record<string, string[]> = {};
    
    for (const module of accessibleModules) {
      modulePermissions[module] = getModulePermissions(
        ctx.user,
        module as keyof typeof PERMISSIONS
      );
    }
    
    return {
      role: ctx.user.role,
      accessibleModules,
      modulePermissions,
    };
  }),

  /**
   * Check if current user has specific permission
   */
  checkPermission: protectedProcedure
    .input(z.object({
      module: z.string(),
      action: z.string(),
    }))
    .query(({ ctx, input }) => {
      return hasPermission(
        ctx.user,
        input.module as keyof typeof PERMISSIONS,
        input.action
      );
    }),

  /**
   * List all users (admin only)
   */
  listUsers: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx.user, "admin");
    
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const allUsers = await db.select().from(users);
    
    return allUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastSignedIn: user.lastSignedIn,
      createdAt: user.createdAt,
    }));
  }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: protectedProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["admin", "manager", "staff", "guest"]),
    }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user, "admin");
      
      // Prevent self-demotion
      if (ctx.user.id === input.userId && input.role !== "admin") {
        throw new Error("Cannot change your own admin role");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // TODO: users.role enum is ["user", "admin"], not ["admin", "manager", "staff", "guest"]
      // Map input role to valid enum value
      const validRole = input.role === "admin" ? "admin" : "user";
      await db
        .update(users)
        .set({ role: validRole })
        .where(eq(users.id, input.userId));
      
      return {
        success: true,
        message: `User role updated to ${input.role}`,
      };
    }),

  /**
   * Get role definitions
   */
  getRoleDefinitions: protectedProcedure.query(() => {
    return {
      roles: [
        {
          id: "admin",
          name: "Administrator",
          description: "Full system access, can manage users and settings",
          level: 3,
        },
        {
          id: "manager",
          name: "Manager",
          description: "Can view and manage most modules except system settings",
          level: 2,
        },
        {
          id: "staff",
          name: "Staff",
          description: "Can view and create in Reservations and Logistics",
          level: 1,
        },
        {
          id: "guest",
          name: "Guest",
          description: "Limited read-only access",
          level: 0,
        },
      ],
      permissions: PERMISSIONS,
    };
  }),
});
