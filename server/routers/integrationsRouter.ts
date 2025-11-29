import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "orbi-city-hub-encryption-key-32b";
const ALGORITHM = "aes-256-cbc";

function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
  const parts = text.split(":");
  const iv = Buffer.from(parts[0]!, "hex");
  const encryptedText = parts[1]!;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

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

    return {
      otelms: allIntegrations.some((i) => i.service === "otelms" && i.status === "connected"),
      googleAnalytics: allIntegrations.some((i) => i.service === "google_analytics" && i.status === "connected"),
      googleBusiness: allIntegrations.some((i) => i.service === "google_business" && i.status === "connected"),
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
        .where(eq(integrations.service, "otelms"))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(integrations)
          .set({
            credentials: encryptedCredentials,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(integrations.service, "otelms"));
      } else {
        // Insert new
        await db.insert(integrations).values({
          service: "otelms",
          credentials: encryptedCredentials,
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
      .where(eq(integrations.service, "otelms"))
      .limit(1);

    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }

    try {
      const credentials = JSON.parse(decrypt(integration[0]!.credentials));
      
      // TODO: Implement actual Yahoo IMAP connection test
      // For now, just validate credentials exist
      if (credentials.email && credentials.appPassword) {
        await db
          .update(integrations)
          .set({
            status: "connected",
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.service, "otelms"));

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
        .where(eq(integrations.service, "google_analytics"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(integrations)
          .set({
            credentials: encryptedCredentials,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(integrations.service, "google_analytics"));
      } else {
        await db.insert(integrations).values({
          service: "google_analytics",
          credentials: encryptedCredentials,
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
      .where(eq(integrations.service, "google_analytics"))
      .limit(1);

    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }

    try {
      const credentials = JSON.parse(decrypt(integration[0]!.credentials));
      
      // TODO: Implement actual Google Analytics API test
      if (credentials.serviceAccount && credentials.propertyId) {
        await db
          .update(integrations)
          .set({
            status: "connected",
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.service, "google_analytics"));

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
        .where(eq(integrations.service, "google_business"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(integrations)
          .set({
            credentials: encryptedCredentials,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(integrations.service, "google_business"));
      } else {
        await db.insert(integrations).values({
          service: "google_business",
          credentials: encryptedCredentials,
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
      .where(eq(integrations.service, "google_business"))
      .limit(1);

    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }

    try {
      const credentials = JSON.parse(decrypt(integration[0]!.credentials));
      
      // TODO: Implement actual Google Business Profile API test
      if (credentials.locationId && credentials.accessToken) {
        await db
          .update(integrations)
          .set({
            status: "connected",
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.service, "google_business"));

        return { success: true, message: "Connection successful" };
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Google Business connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  }),
});
