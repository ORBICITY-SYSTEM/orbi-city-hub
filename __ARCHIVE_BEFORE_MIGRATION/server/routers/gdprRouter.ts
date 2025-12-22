/**
 * GDPR Router
 * 
 * Provides GDPR compliance endpoints:
 * - Data export
 * - Data deletion
 * - Consent management
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  exportUserData,
  deleteUserData,
  recordConsent,
  getUserConsents,
  runGDPRComplianceCheck,
  PRIVACY_POLICY,
} from "../gdpr";

export const gdprRouter = router({
  /**
   * Export user data (GDPR Right to Access)
   */
  exportData: protectedProcedure.query(async ({ ctx }) => {
    return await exportUserData(ctx.user.id);
  }),

  /**
   * Delete user data (GDPR Right to Erasure)
   */
  deleteData: protectedProcedure.mutation(async ({ ctx }) => {
    return await deleteUserData(ctx.user.id);
  }),

  /**
   * Record user consent
   */
  recordConsent: protectedProcedure
    .input(
      z.object({
        consentType: z.enum(["privacy_policy", "terms_of_service", "marketing", "analytics"]),
        consentGiven: z.boolean(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await recordConsent({
        userId: ctx.user.id,
        consentType: input.consentType,
        consentGiven: input.consentGiven,
        consentDate: new Date(),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
    }),

  /**
   * Get user consents
   */
  getConsents: protectedProcedure.query(async ({ ctx }) => {
    return await getUserConsents(ctx.user.id);
  }),

  /**
   * Get privacy policy
   */
  getPrivacyPolicy: protectedProcedure.query(() => {
    return {
      policy: PRIVACY_POLICY,
      lastUpdated: "November 27, 2025",
    };
  }),

  /**
   * Run GDPR compliance check (admin only)
   */
  complianceCheck: protectedProcedure.query(({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run GDPR compliance checks");
    }

    return runGDPRComplianceCheck();
  }),
});
