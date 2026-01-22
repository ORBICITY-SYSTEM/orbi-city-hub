/**
 * Finance Copilot Router
 * Proactive AI financial assistant with daily briefings, anomaly detection, and recommendations
 */

import { z } from "zod";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { financeTasks, financeCopilotBriefings, financeCopilotRecommendations, financeAnomalyLog } from "../../drizzle/schema";
import { FINANCE_COPILOT_PROMPTS } from "../../shared/aiKnowledgeBase";

// Types for financial data
type MonthlyFinancial = {
  month: string;
  year: number;
  total_revenue: number;
  total_expenses: number;
  total_profit: number;
  occupancy_percent: number;
  avg_price: number;
  cleaning_tech: number;
  marketing: number;
  salaries: number;
  utilities: number;
};

// Demo data for when database is not available
const DEMO_MONTHLY_DATA: MonthlyFinancial[] = [
  { month: "January", year: 2025, total_revenue: 92000, total_expenses: 34500, total_profit: 57500, occupancy_percent: 78, avg_price: 89, cleaning_tech: 8500, marketing: 11500, salaries: 9500, utilities: 5000 },
  { month: "December", year: 2024, total_revenue: 82000, total_expenses: 32000, total_profit: 50000, occupancy_percent: 75, avg_price: 85, cleaning_tech: 8000, marketing: 8000, salaries: 9500, utilities: 6500 },
  { month: "November", year: 2024, total_revenue: 68000, total_expenses: 28000, total_profit: 40000, occupancy_percent: 65, avg_price: 78, cleaning_tech: 7000, marketing: 7500, salaries: 9000, utilities: 4500 },
  { month: "October", year: 2024, total_revenue: 75000, total_expenses: 30000, total_profit: 45000, occupancy_percent: 70, avg_price: 82, cleaning_tech: 7500, marketing: 8500, salaries: 9000, utilities: 5000 },
  { month: "September", year: 2024, total_revenue: 105000, total_expenses: 38000, total_profit: 67000, occupancy_percent: 92, avg_price: 95, cleaning_tech: 9500, marketing: 12000, salaries: 10000, utilities: 6500 },
  { month: "August", year: 2024, total_revenue: 115000, total_expenses: 42000, total_profit: 73000, occupancy_percent: 95, avg_price: 102, cleaning_tech: 10500, marketing: 13500, salaries: 10500, utilities: 7500 },
];

// Helper to get current date info
const getCurrentDateInfo = () => {
  const now = new Date();
  const months = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    date: now.getDate(),
    month: months[now.getMonth()],
    monthEn: monthsEn[now.getMonth()],
    year: now.getFullYear(),
    dayOfWeek: days[now.getDay()],
    dayOfWeekEn: daysEn[now.getDay()],
    formatted: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
    formattedEn: `${monthsEn[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
  };
};

// Calculate percentage change
const calcChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const financeCopilotRouter = router({
  /**
   * Get daily briefing - AI-generated summary of financial health
   */
  getDailyBriefing: protectedProcedure
    .input(
      z.object({
        language: z.enum(["ka", "en"]).default("ka"),
      }).optional()
    )
    .query(async ({ input }) => {
      const language = input?.language || "ka";
      const db = await getDb();
      const dateInfo = getCurrentDateInfo();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if we have a cached briefing for today (only if DB available)
      if (db) {
        try {
          const [cachedBriefing] = await db
            .select()
            .from(financeCopilotBriefings)
            .where(
              and(
                gte(financeCopilotBriefings.briefingDate, today),
                eq(financeCopilotBriefings.language, language)
              )
            )
            .orderBy(desc(financeCopilotBriefings.generatedAt))
            .limit(1);

          if (cachedBriefing && cachedBriefing.content) {
            return {
              ...cachedBriefing.content as Record<string, unknown>,
              cached: true,
              generatedAt: cachedBriefing.generatedAt,
              dateInfo: language === "ka" ? dateInfo.formatted : dateInfo.formattedEn
            };
          }
        } catch (e) {
          console.warn("Cache check failed:", e);
        }
      }

      // Fetch financial data (use demo data if DB not available)
      let months: MonthlyFinancial[];

      if (db) {
        try {
          const [monthlyData] = await db.execute(
            "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 3"
          ) as unknown as [MonthlyFinancial[]];
          months = monthlyData;
        } catch (e) {
          console.warn("DB query failed, using demo data:", e);
          months = DEMO_MONTHLY_DATA.slice(0, 3);
        }
      } else {
        months = DEMO_MONTHLY_DATA.slice(0, 3);
      }
      const latestMonth = months[0];
      const prevMonth = months[1];

      if (!latestMonth) {
        return {
          greeting: language === "ka" ? "მონაცემები არ არის ხელმისაწვდომი" : "No data available",
          summary: "",
          keyMetrics: [],
          anomalies: [],
          recommendations: [],
          cached: false,
          dateInfo: language === "ka" ? dateInfo.formatted : dateInfo.formattedEn
        };
      }

      // Calculate key metrics
      const keyMetrics = [
        {
          label: language === "ka" ? "შემოსავალი" : "Revenue",
          value: `₾${latestMonth.total_revenue?.toLocaleString() || 0}`,
          change: prevMonth ? calcChange(latestMonth.total_revenue, prevMonth.total_revenue) : 0,
          trend: prevMonth && latestMonth.total_revenue > prevMonth.total_revenue ? "up" : "down"
        },
        {
          label: language === "ka" ? "მოგება" : "Profit",
          value: `₾${latestMonth.total_profit?.toLocaleString() || 0}`,
          change: prevMonth ? calcChange(latestMonth.total_profit, prevMonth.total_profit) : 0,
          trend: prevMonth && latestMonth.total_profit > prevMonth.total_profit ? "up" : "down"
        },
        {
          label: language === "ka" ? "დატვირთვა" : "Occupancy",
          value: `${latestMonth.occupancy_percent || 0}%`,
          change: prevMonth ? Math.round(latestMonth.occupancy_percent - prevMonth.occupancy_percent) : 0,
          trend: prevMonth && latestMonth.occupancy_percent > prevMonth.occupancy_percent ? "up" : "down"
        },
        {
          label: "RevPAR",
          value: `₾${Math.round((latestMonth.total_revenue / 60 / 30) || 0)}`,
          change: prevMonth ? calcChange(latestMonth.total_revenue / 60 / 30, prevMonth.total_revenue / 60 / 30) : 0,
          trend: prevMonth && (latestMonth.total_revenue / 60 / 30) > (prevMonth.total_revenue / 60 / 30) ? "up" : "down"
        }
      ];

      // Detect anomalies (significant changes > 20%)
      const anomalies: Array<{type: string; message: string; severity: string; value: string}> = [];

      if (prevMonth) {
        const marketingChange = calcChange(latestMonth.marketing, prevMonth.marketing);
        if (Math.abs(marketingChange) > 20) {
          anomalies.push({
            type: "expense",
            message: language === "ka"
              ? `მარკეტინგის ხარჯი ${marketingChange > 0 ? '+' : ''}${marketingChange}%`
              : `Marketing expense ${marketingChange > 0 ? '+' : ''}${marketingChange}%`,
            severity: marketingChange > 30 ? "high" : "medium",
            value: `₾${latestMonth.marketing?.toLocaleString()}`
          });
        }

        const utilitiesChange = calcChange(latestMonth.utilities, prevMonth.utilities);
        if (Math.abs(utilitiesChange) > 20) {
          anomalies.push({
            type: "expense",
            message: language === "ka"
              ? `კომუნალურის ხარჯი ${utilitiesChange > 0 ? '+' : ''}${utilitiesChange}%`
              : `Utilities expense ${utilitiesChange > 0 ? '+' : ''}${utilitiesChange}%`,
            severity: utilitiesChange > 30 ? "high" : "medium",
            value: `₾${latestMonth.utilities?.toLocaleString()}`
          });
        }

        const revenueChange = calcChange(latestMonth.total_revenue, prevMonth.total_revenue);
        if (revenueChange < -15) {
          anomalies.push({
            type: "revenue",
            message: language === "ka"
              ? `შემოსავალი შემცირდა ${revenueChange}%-ით`
              : `Revenue decreased by ${Math.abs(revenueChange)}%`,
            severity: revenueChange < -25 ? "high" : "medium",
            value: `₾${latestMonth.total_revenue?.toLocaleString()}`
          });
        }
      }

      // Generate AI summary
      const prompt = FINANCE_COPILOT_PROMPTS.dailyBriefing[language];
      const financialContext = JSON.stringify({
        currentMonth: latestMonth,
        previousMonth: prevMonth,
        keyMetrics,
        anomalies,
        dateInfo: language === "ka" ? dateInfo.formatted : dateInfo.formattedEn
      });

      let aiSummary = "";
      try {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `მონაცემები: ${financialContext}\n\nგენერირე მოკლე (2-3 წინადადება) დილის მიმოხილვა.` }
          ],
          maxTokens: 500
        });

        aiSummary = typeof llmResponse.choices[0]?.message?.content === 'string'
          ? llmResponse.choices[0].message.content
          : "";
      } catch (error) {
        console.error("LLM error for briefing:", error);
        aiSummary = language === "ka"
          ? "ფინანსური სტატუსი სტაბილურია. გთხოვთ შეამოწმოთ დეტალური მეტრიკები."
          : "Financial status is stable. Please review detailed metrics.";
      }

      const briefingContent = {
        greeting: language === "ka"
          ? `დილა მშვიდობისა! ${dateInfo.formatted}`
          : `Good morning! ${dateInfo.formattedEn}`,
        summary: aiSummary,
        keyMetrics,
        anomalies,
        month: latestMonth.month
      };

      // Cache the briefing (only if DB available)
      if (db) {
        try {
          await db.insert(financeCopilotBriefings).values({
            briefingDate: today,
            language,
            content: briefingContent,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          });
        } catch (cacheError) {
          console.warn("Failed to cache briefing:", cacheError);
        }
      }

      return {
        ...briefingContent,
        cached: false,
        dateInfo: language === "ka" ? dateInfo.formatted : dateInfo.formattedEn
      };
    }),

  /**
   * Get anomalies - Detect unusual financial patterns
   */
  getAnomalies: protectedProcedure
    .input(
      z.object({
        lookbackDays: z.number().min(7).max(90).default(30),
        thresholdPercent: z.number().min(10).max(50).default(20),
        language: z.enum(["ka", "en"]).default("ka"),
      }).optional()
    )
    .query(async ({ input }) => {
      const thresholdPercent = input?.thresholdPercent || 20;
      const language = input?.language || "ka";

      const db = await getDb();

      // Fetch last 6 months of data for trend analysis (use demo data if DB not available)
      let months: MonthlyFinancial[];

      if (db) {
        try {
          const [monthlyData] = await db.execute(
            "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 6"
          ) as unknown as [MonthlyFinancial[]];
          months = monthlyData;
        } catch (e) {
          console.warn("DB query failed, using demo data:", e);
          months = DEMO_MONTHLY_DATA;
        }
      } else {
        months = DEMO_MONTHLY_DATA;
      }
      if (months.length < 2) {
        return { anomalies: [], message: "Not enough data" };
      }

      const anomalies: Array<{
        id: string;
        type: string;
        category: string;
        title: string;
        description: string;
        severity: "low" | "medium" | "high";
        metric: string;
        expectedValue: number;
        actualValue: number;
        deviationPercent: number;
        detectedAt: Date;
      }> = [];

      const latestMonth = months[0];
      const avgRevenue = months.slice(1).reduce((sum, m) => sum + m.total_revenue, 0) / (months.length - 1);
      const avgExpenses = months.slice(1).reduce((sum, m) => sum + m.total_expenses, 0) / (months.length - 1);
      const avgMarketing = months.slice(1).reduce((sum, m) => sum + m.marketing, 0) / (months.length - 1);
      const avgOccupancy = months.slice(1).reduce((sum, m) => sum + m.occupancy_percent, 0) / (months.length - 1);

      // Check revenue anomaly
      const revenueDeviation = ((latestMonth.total_revenue - avgRevenue) / avgRevenue) * 100;
      if (Math.abs(revenueDeviation) > thresholdPercent) {
        anomalies.push({
          id: `rev-${Date.now()}`,
          type: revenueDeviation < 0 ? "decrease" : "increase",
          category: "revenue",
          title: language === "ka" ? "შემოსავლის ანომალია" : "Revenue Anomaly",
          description: language === "ka"
            ? `შემოსავალი ${revenueDeviation > 0 ? 'გაიზარდა' : 'შემცირდა'} ${Math.abs(Math.round(revenueDeviation))}%-ით საშუალოსთან შედარებით`
            : `Revenue ${revenueDeviation > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(revenueDeviation))}% compared to average`,
          severity: Math.abs(revenueDeviation) > 30 ? "high" : "medium",
          metric: "total_revenue",
          expectedValue: avgRevenue,
          actualValue: latestMonth.total_revenue,
          deviationPercent: Math.round(revenueDeviation),
          detectedAt: new Date()
        });
      }

      // Check marketing expense anomaly
      const marketingDeviation = ((latestMonth.marketing - avgMarketing) / avgMarketing) * 100;
      if (marketingDeviation > thresholdPercent) {
        anomalies.push({
          id: `mkt-${Date.now()}`,
          type: "increase",
          category: "expense",
          title: language === "ka" ? "მარკეტინგის ხარჯის ზრდა" : "Marketing Expense Spike",
          description: language === "ka"
            ? `მარკეტინგის ხარჯი გაიზარდა ${Math.round(marketingDeviation)}%-ით`
            : `Marketing expense increased by ${Math.round(marketingDeviation)}%`,
          severity: marketingDeviation > 40 ? "high" : "medium",
          metric: "marketing",
          expectedValue: avgMarketing,
          actualValue: latestMonth.marketing,
          deviationPercent: Math.round(marketingDeviation),
          detectedAt: new Date()
        });
      }

      // Check occupancy anomaly
      const occupancyDeviation = latestMonth.occupancy_percent - avgOccupancy;
      if (Math.abs(occupancyDeviation) > 10) {
        anomalies.push({
          id: `occ-${Date.now()}`,
          type: occupancyDeviation < 0 ? "decrease" : "increase",
          category: "operations",
          title: language === "ka" ? "დატვირთვის ცვლილება" : "Occupancy Change",
          description: language === "ka"
            ? `დატვირთვა ${occupancyDeviation > 0 ? 'გაიზარდა' : 'შემცირდა'} ${Math.abs(Math.round(occupancyDeviation))} პუნქტით`
            : `Occupancy ${occupancyDeviation > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(occupancyDeviation))} points`,
          severity: Math.abs(occupancyDeviation) > 15 ? "high" : "low",
          metric: "occupancy_percent",
          expectedValue: avgOccupancy,
          actualValue: latestMonth.occupancy_percent,
          deviationPercent: Math.round((occupancyDeviation / avgOccupancy) * 100),
          detectedAt: new Date()
        });
      }

      return { anomalies, analyzed: months.length, threshold: thresholdPercent };
    }),

  /**
   * Get AI-powered recommendations
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        language: z.enum(["ka", "en"]).default("ka"),
        limit: z.number().min(1).max(10).default(5),
      }).optional()
    )
    .query(async ({ input }) => {
      const language = input?.language || "ka";
      const limit = input?.limit || 5;

      const db = await getDb();

      // Check for existing recommendations (only if DB available)
      let existingRecs: Array<{
        id: number;
        type: string;
        title: string;
        titleGe: string | null;
        description: string | null;
        descriptionGe: string | null;
        estimatedImpact: string | null;
        priority: number | null;
        status: "active" | "converted" | "dismissed" | "expired";
        relatedTaskId: number | null;
        createdAt: Date;
        updatedAt: Date;
      }> = [];

      if (db) {
        try {
          existingRecs = await db
            .select()
            .from(financeCopilotRecommendations)
            .where(eq(financeCopilotRecommendations.status, "active"))
            .orderBy(desc(financeCopilotRecommendations.priority))
            .limit(limit);

          if (existingRecs.length >= limit) {
            return { recommendations: existingRecs };
          }
        } catch (e) {
          console.warn("Failed to fetch existing recommendations:", e);
        }
      }

      // Fetch financial data for AI analysis (use demo data if DB not available)
      let months: MonthlyFinancial[];

      if (db) {
        try {
          const [monthlyData] = await db.execute(
            "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 6"
          ) as unknown as [MonthlyFinancial[]];
          months = monthlyData;
        } catch (e) {
          console.warn("DB query failed, using demo data:", e);
          months = DEMO_MONTHLY_DATA;
        }
      } else {
        months = DEMO_MONTHLY_DATA;
      }

      if (months.length === 0) {
        return { recommendations: existingRecs };
      }

      // Generate recommendations via AI
      const prompt = FINANCE_COPILOT_PROMPTS.recommendations[language];

      try {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: prompt },
            {
              role: "user",
              content: `ფინანსური მონაცემები (ბოლო 6 თვე): ${JSON.stringify(months)}

დააგენერირე 3-5 კონკრეტული, აქშენებელი რეკომენდაცია JSON ფორმატში:
[
  {
    "type": "pricing|expense|revenue|efficiency",
    "title": "მოკლე სათაური",
    "titleEn": "Short title",
    "description": "აღწერა ქართულად",
    "descriptionEn": "Description in English",
    "estimatedImpact": "+₾2,400/თვე",
    "priority": 1-5
  }
]`
            }
          ],
          maxTokens: 1500,
          responseFormat: { type: "json_object" }
        });

        const content = typeof llmResponse.choices[0]?.message?.content === 'string'
          ? llmResponse.choices[0].message.content
          : "[]";

        let parsed: Array<{
          type: string;
          title: string;
          titleEn: string;
          description: string;
          descriptionEn: string;
          estimatedImpact: string;
          priority: number;
        }> = [];

        try {
          const jsonContent = JSON.parse(content);
          parsed = Array.isArray(jsonContent) ? jsonContent : jsonContent.recommendations || [];
        } catch {
          console.warn("Failed to parse AI recommendations");
        }

        // Save recommendations to database (or return as temporary if no DB)
        const recommendations: typeof existingRecs = [];

        if (db) {
          for (const rec of parsed.slice(0, limit)) {
            try {
              const [insertResult] = await db.insert(financeCopilotRecommendations).values({
                type: rec.type || "general",
                title: rec.title,
                titleGe: rec.title,
                description: rec.descriptionEn || rec.description,
                descriptionGe: rec.description,
                estimatedImpact: rec.estimatedImpact,
                priority: rec.priority || 3,
                status: "active"
              }).$returningId();

              const [inserted] = await db
                .select()
                .from(financeCopilotRecommendations)
                .where(eq(financeCopilotRecommendations.id, insertResult.id))
                .limit(1);

              if (inserted) {
                recommendations.push(inserted);
              }
            } catch (insertErr) {
              console.warn("Failed to insert recommendation:", insertErr);
            }
          }
        } else {
          // Return temporary recommendations without saving to DB
          for (const rec of parsed.slice(0, limit)) {
            recommendations.push({
              id: Date.now() + recommendations.length,
              type: rec.type || "general",
              title: rec.title,
              titleGe: rec.title,
              description: rec.descriptionEn || rec.description,
              descriptionGe: rec.description,
              estimatedImpact: rec.estimatedImpact,
              priority: rec.priority || 3,
              status: "active" as const,
              relatedTaskId: null,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }

        return { recommendations: [...existingRecs, ...recommendations].slice(0, limit) };
      } catch (error) {
        console.error("LLM error for recommendations:", error);
        return { recommendations: existingRecs };
      }
    }),

  /**
   * Create task from recommendation
   */
  createTaskFromRecommendation: protectedProcedure
    .input(
      z.object({
        recommendationId: z.number(),
        assignedTo: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return a mock task when DB is not available
        return {
          task: {
            id: Date.now(),
            title: "AI რეკომენდაცია",
            description: "დავალება შეიქმნა (დემო რეჟიმი)",
            category: "general",
            priority: "medium",
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          recommendationId: input.recommendationId
        };
      }

      // Get the recommendation
      const [recommendation] = await db
        .select()
        .from(financeCopilotRecommendations)
        .where(eq(financeCopilotRecommendations.id, input.recommendationId))
        .limit(1);

      if (!recommendation) {
        throw new Error("Recommendation not found");
      }

      // Create a finance task
      const [insertResult] = await db.insert(financeTasks).values({
        title: recommendation.title || "AI რეკომენდაცია",
        description: `${recommendation.description || ""}\n\nპოტენციური გავლენა: ${recommendation.estimatedImpact || "N/A"}`,
        category: "general",
        priority: recommendation.priority && recommendation.priority >= 4 ? "high" : "medium",
        assignedTo: input.assignedTo || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdBy: "ai_copilot",
        aiNotes: `შექმნილია AI Finance Copilot რეკომენდაციიდან #${recommendation.id}`,
        status: "pending"
      }).$returningId();

      // Update recommendation status
      await db
        .update(financeCopilotRecommendations)
        .set({
          status: "converted",
          relatedTaskId: insertResult.id
        })
        .where(eq(financeCopilotRecommendations.id, input.recommendationId));

      // Fetch and return the created task
      const [task] = await db
        .select()
        .from(financeTasks)
        .where(eq(financeTasks.id, insertResult.id))
        .limit(1);

      return { task, recommendationId: input.recommendationId };
    }),

  /**
   * Dismiss a recommendation
   */
  dismissRecommendation: protectedProcedure
    .input(
      z.object({
        recommendationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // In demo mode, just return success
        return { success: true };
      }

      try {
        await db
          .update(financeCopilotRecommendations)
          .set({ status: "dismissed" })
          .where(eq(financeCopilotRecommendations.id, input.recommendationId));
      } catch (e) {
        console.warn("Failed to dismiss recommendation:", e);
      }

      return { success: true };
    }),

  /**
   * Enhanced chat with financial context
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        language: z.enum(["ka", "en"]).default("ka"),
        includeContext: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      let financialContext = "";

      if (input.includeContext) {
        let monthlyData: MonthlyFinancial[] = DEMO_MONTHLY_DATA.slice(0, 3);
        let summaryData = {
          total_revenue: DEMO_MONTHLY_DATA.reduce((sum, m) => sum + m.total_revenue, 0),
          total_expenses: DEMO_MONTHLY_DATA.reduce((sum, m) => sum + m.total_expenses, 0),
          total_profit: DEMO_MONTHLY_DATA.reduce((sum, m) => sum + m.total_profit, 0)
        };

        if (db) {
          try {
            const [dbMonthlyData] = await db.execute(
              "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 3"
            ) as unknown as [MonthlyFinancial[]];

            const [dbSummaryData] = await db.execute(
              "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
            ) as unknown as [Array<{total_revenue: number; total_expenses: number; total_profit: number}>];

            if (dbMonthlyData && dbMonthlyData.length > 0) {
              monthlyData = dbMonthlyData;
            }
            if (dbSummaryData && dbSummaryData[0]) {
              summaryData = dbSummaryData[0];
            }
          } catch (e) {
            console.warn("DB query failed, using demo data:", e);
          }
        }

        financialContext = `
Current Financial Context:
- Monthly Data: ${JSON.stringify(monthlyData)}
- Summary: ${JSON.stringify(summaryData)}
`;
      }

      const systemPrompt = input.language === "ka"
        ? FINANCE_COPILOT_PROMPTS.chat.ka
        : FINANCE_COPILOT_PROMPTS.chat.en;

      try {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt + (financialContext ? `\n\n${financialContext}` : "") },
            { role: "user", content: input.message }
          ],
          maxTokens: 1000
        });

        const response = typeof llmResponse.choices[0]?.message?.content === 'string'
          ? llmResponse.choices[0].message.content
          : "პასუხის გენერირება ვერ მოხერხდა";

        return { response, tokens: llmResponse.usage?.total_tokens };
      } catch (error) {
        console.error("Copilot chat error:", error);
        throw new Error("Chat failed");
      }
    }),

  /**
   * Acknowledge an anomaly
   */
  acknowledgeAnomaly: protectedProcedure
    .input(
      z.object({
        anomalyId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // In demo mode, just return success
        return { success: true };
      }

      try {
        await db
          .update(financeAnomalyLog)
          .set({ acknowledgedAt: new Date() })
          .where(eq(financeAnomalyLog.id, input.anomalyId));
      } catch (e) {
        console.warn("Failed to acknowledge anomaly:", e);
      }

      return { success: true };
    }),
});
