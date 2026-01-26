/**
 * AI Agents Router
 * Autonomous AI agents with permission-based execution (ClawdBot, Cowork, Marketing AI)
 *
 * Features:
 * - Agent CRUD operations
 * - Task management with approval workflow
 * - Weekly/Monthly plan generation and management
 * - Execution logging and audit trail
 * - Permission-based action control
 */

import { z } from "zod";
import { eq, desc, and, sql, gte, lte, inArray } from "drizzle-orm";
import { protectedProcedure, router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import {
  aiAgents,
  aiAgentTasks,
  aiAgentPlans,
  aiAgentExecutionLog,
  aiAgentPermissions,
  aiAgentConversations,
} from "../../drizzle/schema";
import { nanoid } from "nanoid";

// ============================================================================
// AGENT PROMPTS
// ============================================================================

const AGENT_PROMPTS = {
  marketingAI: {
    ka: `შენ ხარ AI მარკეტინგის დირექტორი ORBI City Batumi-სთვის - 60 აპარტამენტიანი ლუქსის სასტუმროსთვის ბათუმში, საქართველო.

შენი პასუხისმგებლობები:
- სოციალური მედიის კონტენტის შექმნა და მართვა
- სარეკლამო კამპანიების დაგეგმვა და ოპტიმიზაცია
- მიმოხილვებზე პასუხის გაცემა
- ბრენდის იდენტობის შენარჩუნება
- მარკეტინგული მეტრიკების ანალიზი

ყოველთვის მიაწოდე კონკრეტული, აქციონირებადი რეკომენდაციები.`,
    en: `You are an AI Marketing Director for ORBI City Batumi - a 60-unit luxury aparthotel in Batumi, Georgia.

Your responsibilities:
- Create and manage social media content
- Plan and optimize advertising campaigns
- Respond to reviews
- Maintain brand identity
- Analyze marketing metrics

Always provide specific, actionable recommendations.`
  },
  clawdbot: {
    ka: `შენ ხარ ClawdBot - AI ასისტენტი რომელიც ეხმარება ORBI City-ის გუნდს ყოველდღიურ ოპერაციებში.

შენი უნარები:
- კითხვებზე პასუხის გაცემა
- მონაცემების ანალიზი
- დოკუმენტების შექმნა
- ამოცანების კოორდინაცია

იყავი თავაზიანი, პროფესიონალური და ეფექტური.`,
    en: `You are ClawdBot - an AI assistant helping the ORBI City team with daily operations.

Your capabilities:
- Answering questions
- Data analysis
- Document creation
- Task coordination

Be polite, professional, and efficient.`
  },
  cowork: {
    ka: `შენ ხარ Cowork - კოლაბორაციული AI აგენტი რომელიც აკოორდინირებს მრავალ დეპარტამენტს.

შენი როლი:
- დეპარტამენტებს შორის კომუნიკაციის გაუმჯობესება
- კროს-ფუნქციური პროექტების მართვა
- რესურსების ოპტიმიზაცია
- ანგარიშების კონსოლიდაცია`,
    en: `You are Cowork - a collaborative AI agent coordinating multiple departments.

Your role:
- Improve inter-department communication
- Manage cross-functional projects
- Optimize resources
- Consolidate reports`
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateTaskId = () => `at_${nanoid(12)}`;
const generatePlanId = () => `plan_${nanoid(12)}`;

// Get week dates
const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1 + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { startDate: monday, endDate: sunday };
};

// Get month dates
const getMonthDates = (monthOffset = 0) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

// ============================================================================
// ROUTER
// ============================================================================

export const aiAgentsRouter = router({
  // ==========================================================================
  // AGENT MANAGEMENT
  // ==========================================================================

  /**
   * Get all agents
   */
  getAgents: protectedProcedure
    .input(
      z.object({
        module: z.string().optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return default agents when DB is not available
        return {
          agents: [
            {
              id: 1,
              agentId: "marketing-ai",
              name: "Marketing AI Director",
              nameGe: "მარკეტინგის AI დირექტორი",
              avatar: "📈",
              description: "Autonomous marketing agent for social media, ads, and content",
              descriptionGe: "ავტონომიური მარკეტინგის აგენტი სოციალური მედიის, რეკლამებისა და კონტენტისთვის",
              agentType: "marketing" as const,
              capabilities: ["social_media", "ads", "content", "analytics", "reviews"],
              assignedModules: ["marketing"],
              autoApprove: ["analytics_report", "content_draft"],
              requiresApproval: ["ad_campaign", "social_post", "review_response"],
              isActive: true,
              model: "claude-3-haiku",
            },
            {
              id: 2,
              agentId: "clawdbot",
              name: "ClawdBot",
              nameGe: "კლაუდბოტი",
              avatar: "🤖",
              description: "General purpose AI assistant for daily operations",
              descriptionGe: "ზოგადი დანიშნულების AI ასისტენტი ყოველდღიური ოპერაციებისთვის",
              agentType: "general" as const,
              capabilities: ["chat", "research", "documents", "coordination"],
              assignedModules: ["all"],
              autoApprove: ["chat", "research"],
              requiresApproval: ["document_creation", "task_assignment"],
              isActive: true,
              model: "claude-3-haiku",
            },
            {
              id: 3,
              agentId: "cowork",
              name: "Cowork",
              nameGe: "კოვორკ",
              avatar: "🤝",
              description: "Cross-department coordination and collaboration agent",
              descriptionGe: "დეპარტამენტებს შორის კოორდინაციის და თანამშრომლობის აგენტი",
              agentType: "executive" as const,
              capabilities: ["coordination", "reporting", "optimization"],
              assignedModules: ["marketing", "finance", "logistics", "reservations"],
              autoApprove: ["report_generation"],
              requiresApproval: ["cross_department_task", "resource_allocation"],
              isActive: true,
              model: "claude-3-haiku",
            },
          ],
        };
      }

      try {
        let query = db.select().from(aiAgents);

        if (input?.isActive !== undefined) {
          query = query.where(eq(aiAgents.isActive, input.isActive)) as typeof query;
        }

        const agents = await query.orderBy(desc(aiAgents.createdAt));

        // Filter by module if specified
        const filteredAgents = input?.module
          ? agents.filter(a =>
              a.assignedModules?.includes(input.module!) ||
              a.assignedModules?.includes("all")
            )
          : agents;

        return { agents: filteredAgents };
      } catch (error) {
        console.error("[AI Agents] Failed to fetch agents:", error);
        return { agents: [] };
      }
    }),

  /**
   * Get single agent by ID
   */
  getAgent: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { agent: null };
      }

      const [agent] = await db
        .select()
        .from(aiAgents)
        .where(eq(aiAgents.agentId, input.agentId))
        .limit(1);

      return { agent: agent || null };
    }),

  /**
   * Create or update agent (Admin only)
   */
  upsertAgent: adminProcedure
    .input(
      z.object({
        agentId: z.string(),
        name: z.string(),
        nameGe: z.string().optional(),
        avatar: z.string().optional(),
        description: z.string().optional(),
        descriptionGe: z.string().optional(),
        agentType: z.enum(["marketing", "finance", "logistics", "reservations", "general", "executive"]),
        capabilities: z.array(z.string()).optional(),
        assignedModules: z.array(z.string()).optional(),
        autoApprove: z.array(z.string()).optional(),
        requiresApproval: z.array(z.string()).optional(),
        systemPrompt: z.string().optional(),
        temperature: z.string().optional(),
        model: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const [existing] = await db
        .select()
        .from(aiAgents)
        .where(eq(aiAgents.agentId, input.agentId))
        .limit(1);

      if (existing) {
        await db
          .update(aiAgents)
          .set({
            name: input.name,
            nameGe: input.nameGe,
            avatar: input.avatar,
            description: input.description,
            descriptionGe: input.descriptionGe,
            agentType: input.agentType,
            capabilities: input.capabilities,
            assignedModules: input.assignedModules,
            autoApprove: input.autoApprove,
            requiresApproval: input.requiresApproval,
            systemPrompt: input.systemPrompt,
            temperature: input.temperature,
            model: input.model,
            isActive: input.isActive ?? true,
          })
          .where(eq(aiAgents.agentId, input.agentId));

        return { success: true, action: "updated" };
      }

      await db.insert(aiAgents).values({
        agentId: input.agentId,
        name: input.name,
        nameGe: input.nameGe,
        avatar: input.avatar,
        description: input.description,
        descriptionGe: input.descriptionGe,
        agentType: input.agentType,
        capabilities: input.capabilities,
        assignedModules: input.assignedModules,
        autoApprove: input.autoApprove,
        requiresApproval: input.requiresApproval,
        systemPrompt: input.systemPrompt,
        temperature: input.temperature,
        model: input.model,
        isActive: input.isActive ?? true,
      });

      return { success: true, action: "created" };
    }),

  // ==========================================================================
  // TASK MANAGEMENT
  // ==========================================================================

  /**
   * Get tasks for an agent or module
   */
  getTasks: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        module: z.string().optional(),
        status: z.enum(["draft", "scheduled", "active", "completed", "cancelled"]).optional(),
        approvalStatus: z.enum(["pending", "approved", "rejected", "auto_approved"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { tasks: [], total: 0 };
      }

      try {
        const conditions = [];

        if (input?.agentId) {
          conditions.push(eq(aiAgentTasks.agentId, input.agentId));
        }
        if (input?.module) {
          conditions.push(eq(aiAgentTasks.module, input.module));
        }
        if (input?.status) {
          conditions.push(eq(aiAgentTasks.status, input.status));
        }
        if (input?.approvalStatus) {
          conditions.push(eq(aiAgentTasks.approvalStatus, input.approvalStatus));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const tasks = await db
          .select()
          .from(aiAgentTasks)
          .where(whereClause)
          .orderBy(desc(aiAgentTasks.createdAt))
          .limit(input?.limit || 20)
          .offset(input?.offset || 0);

        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(aiAgentTasks)
          .where(whereClause);

        return { tasks, total: countResult?.count || 0 };
      } catch (error) {
        console.error("[AI Agents] Failed to fetch tasks:", error);
        return { tasks: [], total: 0 };
      }
    }),

  /**
   * Create a new task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        title: z.string(),
        titleGe: z.string().optional(),
        description: z.string().optional(),
        descriptionGe: z.string().optional(),
        taskType: z.enum([
          "social_post", "ad_campaign", "content_creation", "analytics_report",
          "review_response", "email_campaign", "booking_management", "pricing_update",
          "financial_analysis", "maintenance_schedule", "inventory_check", "general"
        ]).default("general"),
        module: z.string(),
        frequency: z.enum(["once", "daily", "weekly", "monthly"]).default("once"),
        scheduledFor: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        assignedBy: z.string().default("human"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        // Return mock task in demo mode
        return {
          task: {
            id: Date.now(),
            taskId: generateTaskId(),
            ...input,
            approvalStatus: "pending" as const,
            executionStatus: "not_started" as const,
            status: "draft" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      }

      const taskId = generateTaskId();

      // Check if agent exists and if this action needs approval
      const [agent] = await db
        .select()
        .from(aiAgents)
        .where(eq(aiAgents.agentId, input.agentId))
        .limit(1);

      const needsApproval = agent?.requiresApproval?.includes(input.taskType) ?? true;
      const approvalStatus = needsApproval ? "pending" : "auto_approved";

      const [insertResult] = await db.insert(aiAgentTasks).values({
        taskId,
        agentId: input.agentId,
        assignedBy: input.assignedBy,
        title: input.title,
        titleGe: input.titleGe,
        description: input.description,
        descriptionGe: input.descriptionGe,
        taskType: input.taskType,
        module: input.module,
        frequency: input.frequency,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        priority: input.priority,
        approvalStatus,
        executionStatus: "not_started",
        status: "draft",
      }).$returningId();

      const [task] = await db
        .select()
        .from(aiAgentTasks)
        .where(eq(aiAgentTasks.id, insertResult.id))
        .limit(1);

      return { task };
    }),

  /**
   * Approve a task
   */
  approveTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: true };
      }

      await db
        .update(aiAgentTasks)
        .set({
          approvalStatus: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
          humanFeedback: input.feedback,
          status: "scheduled",
          executionStatus: "queued",
        })
        .where(eq(aiAgentTasks.taskId, input.taskId));

      return { success: true };
    }),

  /**
   * Reject a task
   */
  rejectTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: true };
      }

      await db
        .update(aiAgentTasks)
        .set({
          approvalStatus: "rejected",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
          rejectionReason: input.reason,
          status: "cancelled",
        })
        .where(eq(aiAgentTasks.taskId, input.taskId));

      return { success: true };
    }),

  /**
   * Update task execution status
   */
  updateTaskExecution: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        executionStatus: z.enum(["not_started", "queued", "running", "completed", "failed", "paused"]),
        resultSummary: z.string().optional(),
        resultData: z.any().optional(),
        aiNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: true };
      }

      const updateData: Record<string, unknown> = {
        executionStatus: input.executionStatus,
      };

      if (input.executionStatus === "running") {
        updateData.executionStartedAt = new Date();
      }

      if (input.executionStatus === "completed" || input.executionStatus === "failed") {
        updateData.executionCompletedAt = new Date();
        updateData.status = input.executionStatus === "completed" ? "completed" : "active";
      }

      if (input.resultSummary) {
        updateData.resultSummary = input.resultSummary;
      }
      if (input.resultData) {
        updateData.resultData = input.resultData;
      }
      if (input.aiNotes) {
        updateData.aiNotes = input.aiNotes;
      }

      await db
        .update(aiAgentTasks)
        .set(updateData)
        .where(eq(aiAgentTasks.taskId, input.taskId));

      return { success: true };
    }),

  // ==========================================================================
  // PLAN MANAGEMENT
  // ==========================================================================

  /**
   * Get plans
   */
  getPlans: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        module: z.string().optional(),
        planType: z.enum(["weekly", "monthly", "quarterly"]).optional(),
        status: z.enum(["draft", "pending_approval", "approved", "active", "completed", "cancelled"]).optional(),
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { plans: [] };
      }

      try {
        const conditions = [];

        if (input?.agentId) {
          conditions.push(eq(aiAgentPlans.agentId, input.agentId));
        }
        if (input?.module) {
          conditions.push(eq(aiAgentPlans.module, input.module));
        }
        if (input?.planType) {
          conditions.push(eq(aiAgentPlans.planType, input.planType));
        }
        if (input?.status) {
          conditions.push(eq(aiAgentPlans.status, input.status));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const plans = await db
          .select()
          .from(aiAgentPlans)
          .where(whereClause)
          .orderBy(desc(aiAgentPlans.startDate))
          .limit(input?.limit || 10);

        return { plans };
      } catch (error) {
        console.error("[AI Agents] Failed to fetch plans:", error);
        return { plans: [] };
      }
    }),

  /**
   * Generate a weekly/monthly marketing plan using AI
   */
  generatePlan: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        module: z.string(),
        planType: z.enum(["weekly", "monthly"]),
        language: z.enum(["ka", "en"]).default("ka"),
        budget: z.number().optional(),
        goals: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const planId = generatePlanId();

      // Calculate date range
      const dateRange = input.planType === "weekly"
        ? getWeekDates(0)
        : getMonthDates(0);

      // Generate AI plan
      const systemPrompt = input.language === "ka"
        ? `შენ ხარ AI მარკეტინგის სტრატეგი. შექმენი დეტალური ${input.planType === "weekly" ? "კვირის" : "თვის"} მარკეტინგული გეგმა ORBI City Batumi-სთვის.

გეგმამ უნდა შეიცავდეს:
1. მიზნები (3-5 კონკრეტული, გაზომვადი მიზანი)
2. დავალებები (თითოეული მიზნისთვის 2-4 დავალება, თარიღებით)
3. ბიუჯეტის გადანაწილება

პასუხი დააბრუნე JSON ფორმატში.`
        : `You are an AI marketing strategist. Create a detailed ${input.planType} marketing plan for ORBI City Batumi.

The plan should include:
1. Goals (3-5 specific, measurable goals)
2. Tasks (2-4 tasks per goal, with dates)
3. Budget allocation

Return response in JSON format.`;

      const userPrompt = input.language === "ka"
        ? `შექმენი ${input.planType === "weekly" ? "კვირის" : "თვის"} გეგმა პერიოდისთვის: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}
${input.budget ? `ბიუჯეტი: $${input.budget}` : ""}
${input.goals?.length ? `პრიორიტეტული მიზნები: ${input.goals.join(", ")}` : ""}

დააბრუნე JSON:
{
  "title": "გეგმის სათაური",
  "description": "მოკლე აღწერა",
  "goals": [{"id": "g1", "title": "მიზანი", "targetMetric": "მეტრიკა", "targetValue": 100}],
  "tasks": [{"id": "t1", "title": "დავალება", "scheduledDate": "2025-01-27", "taskType": "social_post", "estimatedBudget": 50}],
  "budget": {"total": 500, "breakdown": [{"category": "ads", "amount": 300}]},
  "recommendations": ["რეკომენდაცია 1"]
}`
        : `Create a ${input.planType} plan for period: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}
${input.budget ? `Budget: $${input.budget}` : ""}
${input.goals?.length ? `Priority goals: ${input.goals.join(", ")}` : ""}

Return JSON:
{
  "title": "Plan title",
  "description": "Brief description",
  "goals": [{"id": "g1", "title": "Goal", "targetMetric": "metric", "targetValue": 100}],
  "tasks": [{"id": "t1", "title": "Task", "scheduledDate": "2025-01-27", "taskType": "social_post", "estimatedBudget": 50}],
  "budget": {"total": 500, "breakdown": [{"category": "ads", "amount": 300}]},
  "recommendations": ["Recommendation 1"]
}`;

      let planContent: {
        title: string;
        titleEn?: string;
        description: string;
        descriptionEn?: string;
        goals: Array<{id: string; title: string; titleGe?: string; targetMetric?: string; targetValue?: number}>;
        tasks: Array<{id: string; title: string; titleGe?: string; scheduledDate?: string; taskType?: string; estimatedBudget?: number}>;
        budget: {total: number; breakdown: Array<{category: string; amount: number}>};
        recommendations: string[];
      };

      try {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          maxTokens: 2000,
          responseFormat: { type: "json_object" }
        });

        const content = typeof llmResponse.choices[0]?.message?.content === 'string'
          ? llmResponse.choices[0].message.content
          : "{}";

        planContent = JSON.parse(content);
      } catch (error) {
        console.error("[AI Agents] Plan generation error:", error);
        // Fallback to default plan
        planContent = {
          title: input.language === "ka" ? "მარკეტინგული გეგმა" : "Marketing Plan",
          description: input.language === "ka" ? "ავტომატურად გენერირებული გეგმა" : "Auto-generated plan",
          goals: [
            { id: "g1", title: input.language === "ka" ? "სოციალური მედიის აქტივობის გაზრდა" : "Increase social media engagement", targetMetric: "engagement_rate", targetValue: 5 }
          ],
          tasks: [
            { id: "t1", title: input.language === "ka" ? "ყოველდღიური პოსტის გამოქვეყნება" : "Daily post publication", scheduledDate: dateRange.startDate.toISOString().split('T')[0], taskType: "social_post", estimatedBudget: 0 }
          ],
          budget: { total: input.budget || 500, breakdown: [{ category: "ads", amount: input.budget || 500 }] },
          recommendations: []
        };
      }

      // Save plan to database
      if (db) {
        try {
          const [insertResult] = await db.insert(aiAgentPlans).values({
            planId,
            agentId: input.agentId,
            module: input.module,
            title: planContent.title,
            titleGe: input.language === "ka" ? planContent.title : planContent.titleEn,
            description: planContent.description,
            descriptionGe: input.language === "ka" ? planContent.description : planContent.descriptionEn,
            planType: input.planType,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            goals: planContent.goals,
            tasks: planContent.tasks,
            budget: planContent.budget,
            status: "pending_approval",
            totalTasksCount: planContent.tasks.length,
            aiRecommendations: planContent.recommendations,
          }).$returningId();

          const [plan] = await db
            .select()
            .from(aiAgentPlans)
            .where(eq(aiAgentPlans.id, insertResult.id))
            .limit(1);

          return { plan, generated: true };
        } catch (error) {
          console.error("[AI Agents] Failed to save plan:", error);
        }
      }

      // Return plan without saving (demo mode)
      return {
        plan: {
          id: Date.now(),
          planId,
          agentId: input.agentId,
          module: input.module,
          ...planContent,
          planType: input.planType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          status: "pending_approval" as const,
          createdAt: new Date(),
        },
        generated: true,
      };
    }),

  /**
   * Approve a plan
   */
  approvePlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        createTasks: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: true };
      }

      // Get the plan
      const [plan] = await db
        .select()
        .from(aiAgentPlans)
        .where(eq(aiAgentPlans.planId, input.planId))
        .limit(1);

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Update plan status
      await db
        .update(aiAgentPlans)
        .set({
          status: "active",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        })
        .where(eq(aiAgentPlans.planId, input.planId));

      // Create tasks from plan if requested
      if (input.createTasks && plan.tasks) {
        for (const task of plan.tasks) {
          await db.insert(aiAgentTasks).values({
            taskId: generateTaskId(),
            agentId: plan.agentId,
            assignedBy: "plan",
            title: task.title,
            titleGe: task.titleGe,
            description: task.description,
            taskType: (task.taskType as typeof aiAgentTasks.$inferInsert.taskType) || "general",
            module: plan.module,
            frequency: (task.frequency as typeof aiAgentTasks.$inferInsert.frequency) || "once",
            scheduledFor: task.scheduledDate ? new Date(task.scheduledDate) : null,
            priority: "medium",
            approvalStatus: "approved",
            executionStatus: "queued",
            status: "scheduled",
          });
        }
      }

      return { success: true, tasksCreated: plan.tasks?.length || 0 };
    }),

  /**
   * Reject a plan
   */
  rejectPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: true };
      }

      await db
        .update(aiAgentPlans)
        .set({
          status: "cancelled",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
          aiAnalysis: input.reason ? `უარყოფილია: ${input.reason}` : "უარყოფილია",
        })
        .where(eq(aiAgentPlans.planId, input.planId));

      return { success: true };
    }),

  // ==========================================================================
  // AGENT CHAT
  // ==========================================================================

  /**
   * Chat with an agent
   */
  chat: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        message: z.string(),
        language: z.enum(["ka", "en"]).default("ka"),
        context: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get agent configuration
      let systemPrompt = "";
      if (input.agentId === "marketing-ai") {
        systemPrompt = AGENT_PROMPTS.marketingAI[input.language];
      } else if (input.agentId === "clawdbot") {
        systemPrompt = AGENT_PROMPTS.clawdbot[input.language];
      } else if (input.agentId === "cowork") {
        systemPrompt = AGENT_PROMPTS.cowork[input.language];
      } else {
        // Fetch from DB if available
        if (db) {
          const [agent] = await db
            .select()
            .from(aiAgents)
            .where(eq(aiAgents.agentId, input.agentId))
            .limit(1);

          if (agent?.systemPrompt) {
            systemPrompt = agent.systemPrompt;
          }
        }
      }

      if (!systemPrompt) {
        systemPrompt = input.language === "ka"
          ? "შენ ხარ AI ასისტენტი ORBI City Batumi-სთვის."
          : "You are an AI assistant for ORBI City Batumi.";
      }

      // Add context if provided
      if (input.context) {
        systemPrompt += `\n\nკონტექსტი: ${JSON.stringify(input.context)}`;
      }

      try {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message }
          ],
          maxTokens: 1000
        });

        const response = typeof llmResponse.choices[0]?.message?.content === 'string'
          ? llmResponse.choices[0].message.content
          : input.language === "ka" ? "პასუხის გენერირება ვერ მოხერხდა" : "Failed to generate response";

        // Save conversation if DB is available
        if (db) {
          try {
            await db.insert(aiAgentConversations).values({
              agentId: input.agentId,
              userId: ctx.user.id,
              messages: [
                { role: "user" as const, content: input.message, timestamp: Date.now() },
                { role: "agent" as const, content: response, timestamp: Date.now() }
              ],
              status: "completed",
            });
          } catch (saveError) {
            console.warn("[AI Agents] Failed to save conversation:", saveError);
          }
        }

        return { response, tokens: llmResponse.usage?.total_tokens };
      } catch (error) {
        console.error("[AI Agents] Chat error:", error);
        throw new Error("Chat failed");
      }
    }),

  // ==========================================================================
  // EXECUTION LOG
  // ==========================================================================

  /**
   * Get execution logs
   */
  getExecutionLogs: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        taskId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { logs: [] };
      }

      try {
        const conditions = [];

        if (input?.agentId) {
          conditions.push(eq(aiAgentExecutionLog.agentId, input.agentId));
        }
        if (input?.taskId) {
          conditions.push(eq(aiAgentExecutionLog.taskId, input.taskId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const logs = await db
          .select()
          .from(aiAgentExecutionLog)
          .where(whereClause)
          .orderBy(desc(aiAgentExecutionLog.executedAt))
          .limit(input?.limit || 50);

        return { logs };
      } catch (error) {
        console.error("[AI Agents] Failed to fetch execution logs:", error);
        return { logs: [] };
      }
    }),

  /**
   * Log an execution action
   */
  logExecution: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        taskId: z.number().optional(),
        planId: z.number().optional(),
        actionType: z.string(),
        actionDescription: z.string().optional(),
        inputData: z.any().optional(),
        outputData: z.any().optional(),
        externalId: z.string().optional(),
        externalUrl: z.string().optional(),
        success: z.boolean().default(true),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: true, logId: Date.now() };
      }

      const [insertResult] = await db.insert(aiAgentExecutionLog).values({
        agentId: input.agentId,
        taskId: input.taskId,
        planId: input.planId,
        actionType: input.actionType,
        actionDescription: input.actionDescription,
        inputData: input.inputData,
        outputData: input.outputData,
        externalId: input.externalId,
        externalUrl: input.externalUrl,
        success: input.success,
        errorMessage: input.errorMessage,
        executedAt: new Date(),
      }).$returningId();

      return { success: true, logId: insertResult.id };
    }),

  // ==========================================================================
  // PENDING APPROVALS
  // ==========================================================================

  /**
   * Get all pending approvals (tasks and plans)
   */
  getPendingApprovals: protectedProcedure
    .input(
      z.object({
        module: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { pendingTasks: [], pendingPlans: [], totalPending: 0 };
      }

      try {
        // Get pending tasks
        let taskConditions = [eq(aiAgentTasks.approvalStatus, "pending")];
        if (input?.module) {
          taskConditions.push(eq(aiAgentTasks.module, input.module));
        }

        const pendingTasks = await db
          .select()
          .from(aiAgentTasks)
          .where(and(...taskConditions))
          .orderBy(desc(aiAgentTasks.createdAt))
          .limit(20);

        // Get pending plans
        let planConditions = [eq(aiAgentPlans.status, "pending_approval")];
        if (input?.module) {
          planConditions.push(eq(aiAgentPlans.module, input.module));
        }

        const pendingPlans = await db
          .select()
          .from(aiAgentPlans)
          .where(and(...planConditions))
          .orderBy(desc(aiAgentPlans.createdAt))
          .limit(10);

        return {
          pendingTasks,
          pendingPlans,
          totalPending: pendingTasks.length + pendingPlans.length,
        };
      } catch (error) {
        console.error("[AI Agents] Failed to fetch pending approvals:", error);
        return { pendingTasks: [], pendingPlans: [], totalPending: 0 };
      }
    }),

  // ==========================================================================
  // SEED DEFAULT AGENTS
  // ==========================================================================

  /**
   * Seed default agents (Admin only)
   */
  seedDefaultAgents: adminProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) {
        return { success: false, message: "Database not available" };
      }

      const defaultAgents = [
        {
          agentId: "marketing-ai",
          name: "Marketing AI Director",
          nameGe: "მარკეტინგის AI დირექტორი",
          avatar: "📈",
          description: "Autonomous marketing agent for social media, advertising campaigns, content creation, and analytics",
          descriptionGe: "ავტონომიური მარკეტინგის აგენტი სოციალური მედიის, სარეკლამო კამპანიების, კონტენტის შექმნისა და ანალიტიკისთვის",
          agentType: "marketing" as const,
          capabilities: ["social_media", "ads", "content", "analytics", "reviews", "email"],
          assignedModules: ["marketing"],
          autoApprove: ["analytics_report", "content_draft", "research"],
          requiresApproval: ["ad_campaign", "social_post", "review_response", "email_campaign"],
          systemPrompt: AGENT_PROMPTS.marketingAI.ka,
          temperature: "0.7",
          model: "claude-3-haiku",
          isActive: true,
        },
        {
          agentId: "clawdbot",
          name: "ClawdBot",
          nameGe: "კლაუდბოტი",
          avatar: "🤖",
          description: "General purpose AI assistant for daily operations, questions, and task coordination",
          descriptionGe: "ზოგადი დანიშნულების AI ასისტენტი ყოველდღიური ოპერაციებისთვის, კითხვებისთვის და დავალებების კოორდინაციისთვის",
          agentType: "general" as const,
          capabilities: ["chat", "research", "documents", "coordination", "translation"],
          assignedModules: ["all"],
          autoApprove: ["chat", "research", "translation"],
          requiresApproval: ["document_creation", "task_assignment", "data_modification"],
          systemPrompt: AGENT_PROMPTS.clawdbot.ka,
          temperature: "0.5",
          model: "claude-3-haiku",
          isActive: true,
        },
        {
          agentId: "cowork",
          name: "Cowork",
          nameGe: "კოვორკ",
          avatar: "🤝",
          description: "Cross-department coordination and collaboration agent for multi-team projects",
          descriptionGe: "დეპარტამენტებს შორის კოორდინაციისა და თანამშრომლობის აგენტი მრავალ-გუნდიანი პროექტებისთვის",
          agentType: "executive" as const,
          capabilities: ["coordination", "reporting", "optimization", "scheduling", "analysis"],
          assignedModules: ["marketing", "finance", "logistics", "reservations"],
          autoApprove: ["report_generation", "analysis", "scheduling"],
          requiresApproval: ["cross_department_task", "resource_allocation", "budget_adjustment"],
          systemPrompt: AGENT_PROMPTS.cowork.ka,
          temperature: "0.6",
          model: "claude-3-haiku",
          isActive: true,
        },
      ];

      let created = 0;
      let updated = 0;

      for (const agent of defaultAgents) {
        const [existing] = await db
          .select()
          .from(aiAgents)
          .where(eq(aiAgents.agentId, agent.agentId))
          .limit(1);

        if (existing) {
          await db
            .update(aiAgents)
            .set(agent)
            .where(eq(aiAgents.agentId, agent.agentId));
          updated++;
        } else {
          await db.insert(aiAgents).values(agent);
          created++;
        }
      }

      return { success: true, created, updated };
    }),
});
