/**
 * Security Router
 * 
 * Provides security audit and testing endpoints
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  runSecurityAudit,
  validateEmail,
  validatePhone,
  validateURL,
  sanitizeInput,
} from "../security";

export const securityRouter = router({
  /**
   * Run security audit (admin only)
   */
  audit: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run security audits");
    }

    return runSecurityAudit();
  }),

  /**
   * Validate email address
   */
  validateEmail: protectedProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        valid: validateEmail(input.email),
        email: input.email,
      };
    }),

  /**
   * Validate phone number
   */
  validatePhone: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        valid: validatePhone(input.phone),
        phone: input.phone,
      };
    }),

  /**
   * Validate URL
   */
  validateURL: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        valid: validateURL(input.url),
        url: input.url,
      };
    }),

  /**
   * Sanitize input (test endpoint)
   */
  sanitize: protectedProcedure
    .input(
      z.object({
        input: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        original: input.input,
        sanitized: sanitizeInput(input.input),
      };
    }),
});
