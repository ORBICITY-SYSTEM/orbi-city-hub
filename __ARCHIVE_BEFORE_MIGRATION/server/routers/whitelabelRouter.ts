import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { whitelabelSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const whitelabelRouter = router({
  // Get current settings
  get: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const [settings] = await db.select().from(whitelabelSettings).limit(1);
    
    // Return defaults if no settings exist
    if (!settings) {
      return {
        id: 0,
        companyName: "ORBI City Hub",
        logoUrl: null,
        faviconUrl: null,
        primaryColor: "#10b981",
        secondaryColor: "#1e293b",
        accentColor: "#3b82f6",
        customCss: null,
      };
    }

    return settings;
  }),

  // Update settings
  update: publicProcedure
    .input(z.object({
      companyName: z.string().optional(),
      logoUrl: z.string().optional(),
      faviconUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      customCss: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Check if settings exist
      const [existing] = await db.select().from(whitelabelSettings).limit(1);

      if (existing) {
        // Update existing
        await db.update(whitelabelSettings)
          .set(input)
          .where(eq(whitelabelSettings.id, existing.id));
      } else {
        // Create new
        await db.insert(whitelabelSettings).values(input);
      }

      return { success: true };
    }),

  // Generate CSS variables from settings
  getCssVariables: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return `:root {
        --primary-color: #10b981;
        --secondary-color: #1e293b;
        --accent-color: #3b82f6;
      }`;
    }

    const [settings] = await db.select().from(whitelabelSettings).limit(1);

    const primaryColor = settings?.primaryColor || "#10b981";
    const secondaryColor = settings?.secondaryColor || "#1e293b";
    const accentColor = settings?.accentColor || "#3b82f6";

    let css = `:root {
  --primary-color: ${primaryColor};
  --secondary-color: ${secondaryColor};
  --accent-color: ${accentColor};
  --primary-rgb: ${hexToRgb(primaryColor)};
  --secondary-rgb: ${hexToRgb(secondaryColor)};
  --accent-rgb: ${hexToRgb(accentColor)};
}`;

    if (settings?.customCss) {
      css += `\n${settings.customCss}`;
    }

    return css;
  }),

  // Reset to defaults
  reset: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) return { success: false };

    const [existing] = await db.select().from(whitelabelSettings).limit(1);

    if (existing) {
      await db.update(whitelabelSettings)
        .set({
          companyName: "ORBI City Hub",
          logoUrl: null,
          faviconUrl: null,
          primaryColor: "#10b981",
          secondaryColor: "#1e293b",
          accentColor: "#3b82f6",
          customCss: null,
        })
        .where(eq(whitelabelSettings.id, existing.id));
    }

    return { success: true };
  }),
});

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
