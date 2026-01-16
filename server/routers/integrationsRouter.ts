import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { decrypt, encrypt } from "../utils/encryption";

export const integrationsRouter = router({
  // Get integration status
  getStatus: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        otelms: false,
        googleAnalytics: false,
        googleBusiness: false,
      };
    }

    const allIntegrations = await db.select().from(integrations);

    // TODO: integrations schema doesn't have service column
    // Should use slug or type instead
    return {
      otelms: allIntegrations.some((i) => i.slug === "otelms" && i.status === "active"),
      googleAnalytics: allIntegrations.some((i) => i.slug === "google-analytics" && i.status === "active"),
      googleBusiness: allIntegrations.some((i) => i.slug === "google-business" && i.status === "active"),
    };
  }),

  // Save OTELMS credentials
  saveOtelmsCredentials: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        appPassword: z.string().min(16),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const credentials = {
        email: input.email,
        appPassword: input.appPassword,
      };

      const encryptedCredentials = encrypt(JSON.stringify(credentials));

      // Check if OTELMS integration exists
      const existing = await db
        .select()
        .from(integrations)
        .where(eq(integrations.slug, "otelms"))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(integrations)
          .set({
            config: encryptedCredentials as any,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(integrations.slug, "otelms"));
      } else {
        // Insert new
        await db.insert(integrations).values({
          name: "OTELMS",
          slug: "otelms",
          type: "email",
          config: encryptedCredentials as any,
          status: "pending",
        });
      }

      return { success: true };
    }),

  // Test OTELMS connection
  testOtelmsConnection: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.slug, "otelms"))
      .limit(1);

    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }

    try {
      const config = integration[0]!.config as any;
      const credentials = JSON.parse(decrypt(config || "{}"));
      
      // TODO: Implement actual Yahoo IMAP connection test
      // For now, just validate credentials exist
      if (credentials.email && credentials.appPassword) {
        await db
          .update(integrations)
          .set({
            status: "active",
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.slug, "otelms"));

        return { success: true, message: "Connection successful" };
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("OTELMS connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  }),

  // Save Google Analytics credentials
  saveGoogleAnalytics: protectedProcedure
    .input(
      z.object({
        credentials: z.any(),
        propertyId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const credentialsData = {
        serviceAccount: input.credentials,
        propertyId: input.propertyId,
      };

      const encryptedCredentials = encrypt(JSON.stringify(credentialsData));

      const existing = await db
        .select()
        .from(integrations)
        .where(eq(integrations.slug, "google-analytics"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(integrations)
          .set({
            config: encryptedCredentials as any,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(integrations.slug, "google-analytics"));
      } else {
        await db.insert(integrations).values({
          name: "Google Analytics",
          slug: "google-analytics",
          type: "analytics",
          config: encryptedCredentials as any,
          status: "pending",
        });
      }

      return { success: true };
    }),

  // Test Google Analytics connection
  testGoogleAnalytics: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.slug, "google-analytics"))
        .limit(1);

    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }

    try {
      const config = integration[0]!.config as any;
      const credentials = JSON.parse(decrypt(config || "{}"));
      
      // TODO: Implement actual Google Analytics API test
      if (credentials.serviceAccount && credentials.propertyId) {
        await db
          .update(integrations)
          .set({
            status: "active",
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.slug, "google-analytics"));

        return { success: true, message: "Connection successful" };
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Google Analytics connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  }),

  // Save Google Business Profile credentials
  saveGoogleBusiness: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const credentialsData = {
        locationId: input.locationId,
        accessToken: input.accessToken,
      };

      const encryptedCredentials = encrypt(JSON.stringify(credentialsData));

      const existing = await db
        .select()
        .from(integrations)
        .where(eq(integrations.slug, "google-business"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(integrations)
          .set({
            config: encryptedCredentials as any,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(integrations.slug, "google-business"));
      } else {
        await db.insert(integrations).values({
          name: "Google Business Profile",
          slug: "google-business",
          type: "business",
          config: encryptedCredentials as any,
          status: "pending",
        });
      }

      return { success: true };
    }),

  // Test Google Business Profile connection
  testGoogleBusiness: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const integration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.slug, "google-business"))
        .limit(1);

    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }

    try {
      const config = integration[0]!.config as any;
      const credentials = JSON.parse(decrypt(config || "{}"));
      
      // TODO: Implement actual Google Business Profile API test
      if (credentials.locationId && credentials.accessToken) {
        await db
          .update(integrations)
          .set({
            status: "active",
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.slug, "google-business"));

        return { success: true, message: "Connection successful" };
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Google Business connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  }),
});
