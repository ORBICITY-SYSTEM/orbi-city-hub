import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as adminDb from "../adminDb";
import * as bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { ENV } from "../_core/env";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_JWT_SECRET = ENV.cookieSecret + "_admin"; // Separate secret for admin sessions

// Helper to create admin JWT token
function createAdminToken(adminId: number, username: string): string {
  return jwt.sign(
    { adminId, username, type: "admin" },
    ADMIN_JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Helper to verify admin JWT token
function verifyAdminToken(token: string): { adminId: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as { adminId: number; username: string; type: string };
    if (decoded.type === "admin") {
      return { adminId: decoded.adminId, username: decoded.username };
    }
    return null;
  } catch {
    return null;
  }
}

export const adminRouter = router({
  // Admin login
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;

      // Get admin user from database
      const adminUser = await adminDb.getAdminUserByUsername(username);
      
      if (!adminUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
      
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // Update last login
      await adminDb.updateAdminUserLastLogin(adminUser.id);

      // Create JWT token
      const token = createAdminToken(adminUser.id, adminUser.username);

      // Set cookie
      ctx.res.cookie(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: ctx.req.protocol === "https",
        sameSite: ctx.req.protocol === "https" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return {
        success: true,
        admin: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
        },
      };
    }),

  // Get current admin user
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies[ADMIN_SESSION_COOKIE];
    
    if (!token) {
      return null;
    }

    const decoded = verifyAdminToken(token);
    
    if (!decoded) {
      return null;
    }

    const adminUser = await adminDb.getAdminUserById(decoded.adminId);
    
    if (!adminUser) {
      return null;
    }

    return {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      permissions: adminUser.permissions,
      lastLogin: adminUser.lastLogin,
    };
  }),

  // Admin logout
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(ADMIN_SESSION_COOKIE, {
      httpOnly: true,
      secure: ctx.req.protocol === "https",
      sameSite: ctx.req.protocol === "https" ? "none" : "lax",
      path: "/",
    });

    return { success: true };
  }),

  // Create first admin user (only if no admins exist)
  createFirstAdmin: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      // Check if any admin users exist
      const existingAdmins = await adminDb.getAllAdminUsers();
      
      if (existingAdmins.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin users already exist. Use admin panel to create new admins.",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create admin user
      const adminUser = await adminDb.createAdminUser({
        username: input.username,
        passwordHash,
        role: "super_admin",
        permissions: {
          modules: { add: true, edit: true, delete: true },
          users: { manage: true },
          settings: { edit: true },
        },
      });

      if (!adminUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create admin user",
        });
      }

      return {
        success: true,
        admin: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
        },
      };
    }),
});
