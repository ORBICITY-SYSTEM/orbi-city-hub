import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";

/**
 * Role hierarchy (higher number = more permissions)
 */
export const ROLE_HIERARCHY = {
  guest: 0,
  staff: 1,
  manager: 2,
  admin: 3,
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Permission definitions for each module
 */
export const PERMISSIONS = {
  // CEO Dashboard
  ceo: {
    view: ["admin", "manager"],
    edit: ["admin"],
  },
  
  // Reservations
  reservations: {
    view: ["admin", "manager", "staff"],
    create: ["admin", "manager", "staff"],
    edit: ["admin", "manager"],
    delete: ["admin"],
  },
  
  // Finance
  finance: {
    view: ["admin", "manager"],
    create: ["admin", "manager"],
    edit: ["admin"],
    delete: ["admin"],
  },
  
  // Marketing
  marketing: {
    view: ["admin", "manager"],
    create: ["admin", "manager"],
    edit: ["admin", "manager"],
    delete: ["admin"],
  },
  
  // Logistics
  logistics: {
    view: ["admin", "manager", "staff"],
    create: ["admin", "manager", "staff"],
    edit: ["admin", "manager"],
    delete: ["admin"],
  },
  
  // Reports
  reports: {
    view: ["admin", "manager"],
    export: ["admin", "manager"],
  },
  
  // System
  system: {
    backup: ["admin"],
    users: ["admin"],
    settings: ["admin"],
  },
} as const;

/**
 * Check if user has required role
 */
export function hasRole(user: User | null | undefined, requiredRole: Role): boolean {
  if (!user) return false;
  
  const userRoleLevel = ROLE_HIERARCHY[user.role as Role] ?? 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
  
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if user has permission for a module action
 */
export function hasPermission(
  user: User | null | undefined,
  module: keyof typeof PERMISSIONS,
  action: string
): boolean {
  if (!user) return false;
  
  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) return false;
  
  const allowedRoles = modulePermissions[action as keyof typeof modulePermissions];
  if (!allowedRoles) return false;
  
  return (allowedRoles as readonly string[]).includes(user.role);
}

/**
 * Require specific role (throws error if not authorized)
 */
export function requireRole(user: User | null | undefined, requiredRole: Role): void {
  if (!hasRole(user, requiredRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires ${requiredRole} role or higher`,
    });
  }
}

/**
 * Require specific permission (throws error if not authorized)
 */
export function requirePermission(
  user: User | null | undefined,
  module: keyof typeof PERMISSIONS,
  action: string
): void {
  if (!hasPermission(user, module, action)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You don't have permission to ${action} in ${module} module`,
    });
  }
}

/**
 * Get user's accessible modules
 */
export function getAccessibleModules(user: User | null | undefined): string[] {
  if (!user) return [];
  
  const modules: string[] = [];
  
  for (const [module, permissions] of Object.entries(PERMISSIONS)) {
    // If user can view the module, add it to accessible list
    if (hasPermission(user, module as keyof typeof PERMISSIONS, "view")) {
      modules.push(module);
    }
  }
  
  return modules;
}

/**
 * Get user's permissions for a specific module
 */
export function getModulePermissions(
  user: User | null | undefined,
  module: keyof typeof PERMISSIONS
): string[] {
  if (!user) return [];
  
  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) return [];
  
  const userPermissions: string[] = [];
  
  for (const [action, allowedRoles] of Object.entries(modulePermissions)) {
    if ((allowedRoles as readonly string[]).includes(user.role)) {
      userPermissions.push(action);
    }
  }
  
  return userPermissions;
}
