import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Google OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Emails table for AI-categorized email storage
 * Stores emails from Gmail with AI-powered categorization
 */
export const emails = mysqlTable("emails", {
  id: varchar("id", { length: 255 }).primaryKey(),
  threadId: varchar("threadId", { length: 255 }).notNull(),
  subject: text("subject"),
  sender: varchar("sender", { length: 320 }),
  recipient: varchar("recipient", { length: 320 }),
  emailDate: timestamp("emailDate"),
  snippet: text("snippet"),
  body: text("body"),
  labels: json("labels").$type<string[]>(),
  isRead: boolean("isRead").default(false),
  
  // AI categorization fields
  category: mysqlEnum("category", [
    "bookings", 
    "questions", 
    "payments", 
    "complaints", 
    "general", 
    "technical", 
    "newsletters", 
    "spam", 
    "partnerships", 
    "reports"
  ]).default("general").notNull(),
  language: mysqlEnum("language", ["Georgian", "English", "Russian"]).default("English").notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral").notNull(),
  priority: mysqlEnum("priority", ["urgent", "high", "normal", "low"]).default("normal").notNull(),
  reasoning: text("reasoning"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;


/**
 * Files table for user uploaded files
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 128 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * AI Conversations table for chat history
 */
export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  module: varchar("module", { length: 64 }).notNull(),
  messages: json("messages").$type<Array<{role: string, content: string, timestamp: number}>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * Error logs table for system monitoring
 */
export const errorLogs = mysqlTable("errorLogs", {
  id: int("id").autoincrement().primaryKey(),
  errorType: varchar("errorType", { length: 64 }).notNull(),
  message: text("message").notNull(),
  stack: text("stack"),
  userId: int("userId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;

/**
 * Financial data table for dashboard
 * Stores monthly financial performance data from OTELMS Excel reports
 */
export const financialData = mysqlTable("financialData", {
  id: int("id").autoincrement().primaryKey(),
  
  // Period
  month: varchar("month", { length: 50 }).notNull(), // "November 2025"
  year: int("year").notNull(),
  monthNumber: int("monthNumber").notNull(), // 1-12
  
  // Operational Metrics
  studios: int("studios").notNull(),
  daysAvailable: int("daysAvailable").notNull(),
  daysOccupied: int("daysOccupied").notNull(),
  occupancyRate: decimal("occupancyRate", { precision: 5, scale: 2 }).notNull(), // 80.50
  avgPrice: decimal("avgPrice", { precision: 10, scale: 2 }).notNull(),
  
  // Revenue
  totalRevenue: decimal("totalRevenue", { precision: 15, scale: 2 }).notNull(),
  
  // Expenses
  cleaningTech: decimal("cleaningTech", { precision: 15, scale: 2 }).notNull(),
  marketing: decimal("marketing", { precision: 15, scale: 2 }).notNull(),
  salaries: decimal("salaries", { precision: 15, scale: 2 }).notNull(),
  utilities: decimal("utilities", { precision: 15, scale: 2 }).notNull(),
  totalExpenses: decimal("totalExpenses", { precision: 15, scale: 2 }).notNull(),
  
  // Profit
  totalProfit: decimal("totalProfit", { precision: 15, scale: 2 }).notNull(),
  companyProfit: decimal("companyProfit", { precision: 15, scale: 2 }).notNull(),
  ownersProfit: decimal("ownersProfit", { precision: 15, scale: 2 }).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = typeof financialData.$inferInsert;

/**
 * System config table for module management
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: json("value"),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;


/**
 * Admin users table for admin panel
 */
export const adminUsers = mysqlTable("adminUsers", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["super_admin", "admin", "moderator"]).default("admin").notNull(),
  isActive: boolean("isActive").default(true),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * Modules table for module management
 */
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  aiPrompt: text("aiPrompt"),
  settings: json("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

/**
 * System settings table
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  type: varchar("type", { length: 32 }).default("string"),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Reservations table
 */
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: varchar("bookingId", { length: 128 }).unique(),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  roomNumber: varchar("roomNumber", { length: 16 }),
  checkIn: timestamp("checkIn").notNull(),
  checkOut: timestamp("checkOut").notNull(),
  totalPrice: int("totalPrice"),
  currency: varchar("currency", { length: 8 }).default("GEL"),
  channel: varchar("channel", { length: 64 }),
  status: mysqlEnum("status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

/**
 * Logistics activity log
 */
export const logisticsActivityLog = mysqlTable("logisticsActivityLog", {
  id: int("id").autoincrement().primaryKey(),
  activityType: varchar("activityType", { length: 64 }).notNull(),
  description: text("description"),
  roomNumber: varchar("roomNumber", { length: 16 }),
  staffId: int("staffId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LogisticsActivityLog = typeof logisticsActivityLog.$inferSelect;
export type InsertLogisticsActivityLog = typeof logisticsActivityLog.$inferInsert;

/**
 * Rooms table
 */
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  roomNumber: varchar("roomNumber", { length: 16 }).notNull().unique(),
  building: varchar("building", { length: 8 }),
  roomType: varchar("roomType", { length: 64 }),
  floor: int("floor"),
  status: mysqlEnum("status", ["available", "occupied", "cleaning", "maintenance", "blocked"]).default("available").notNull(),
  lastCleaned: timestamp("lastCleaned"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

/**
 * Inventory items table
 */
export const inventoryItems = mysqlTable("inventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }),
  quantity: int("quantity").default(0),
  minQuantity: int("minQuantity").default(0),
  unit: varchar("unit", { length: 32 }),
  location: varchar("location", { length: 128 }),
  lastRestocked: timestamp("lastRestocked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

/**
 * Housekeeping tasks table
 */
export const housekeepingTasks = mysqlTable("housekeepingTasks", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId"),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  assignedTo: int("assignedTo"),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  notes: text("notes"),
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HousekeepingTask = typeof housekeepingTasks.$inferSelect;
export type InsertHousekeepingTask = typeof housekeepingTasks.$inferInsert;

/**
 * Email categories table
 */
export const emailCategories = mysqlTable("emailCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 16 }),
  icon: varchar("icon", { length: 32 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailCategory = typeof emailCategories.$inferSelect;
export type InsertEmailCategory = typeof emailCategories.$inferInsert;

/**
 * Unsubscribe suggestions table
 */
export const unsubscribeSuggestions = mysqlTable("unsubscribeSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  emailId: varchar("emailId", { length: 255 }),
  sender: varchar("sender", { length: 320 }),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UnsubscribeSuggestion = typeof unsubscribeSuggestions.$inferSelect;
export type InsertUnsubscribeSuggestion = typeof unsubscribeSuggestions.$inferInsert;

/**
 * Email summaries table
 */
export const emailSummaries = mysqlTable("emailSummaries", {
  id: int("id").autoincrement().primaryKey(),
  emailId: varchar("emailId", { length: 255 }),
  summary: text("summary"),
  keyPoints: json("keyPoints").$type<string[]>(),
  actionItems: json("actionItems").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSummary = typeof emailSummaries.$inferSelect;
export type InsertEmailSummary = typeof emailSummaries.$inferInsert;

/**
 * OTELMS daily reports table
 */
export const otelmsDailyReports = mysqlTable("otelmsDailyReports", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: timestamp("reportDate").notNull(),
  occupancy: int("occupancy"),
  revenue: int("revenue"),
  adr: int("adr"),
  revpar: int("revpar"),
  bookingsCount: int("bookingsCount"),
  checkInsCount: int("checkInsCount"),
  checkOutsCount: int("checkOutsCount"),
  rawData: json("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtelmsDailyReport = typeof otelmsDailyReports.$inferSelect;
export type InsertOtelmsDailyReport = typeof otelmsDailyReports.$inferInsert;

/**
 * Integrations table
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  type: varchar("type", { length: 64 }),
  status: mysqlEnum("status", ["active", "inactive", "error", "pending"]).default("inactive").notNull(),
  config: json("config"),
  lastSync: timestamp("lastSync"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Chat messages table
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId"),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Guests table
 */
export const guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  nationality: varchar("nationality", { length: 64 }),
  passportNumber: varchar("passportNumber", { length: 64 }),
  notes: text("notes"),
  totalStays: int("totalStays").default(0),
  totalSpent: int("totalSpent").default(0),
  vipStatus: boolean("vipStatus").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;


/**
 * Standard inventory items table
 */
export const standardInventoryItems = mysqlTable("standardInventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }),
  defaultQuantity: int("defaultQuantity").default(1),
  unit: varchar("unit", { length: 32 }),
  isRequired: boolean("isRequired").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StandardInventoryItem = typeof standardInventoryItems.$inferSelect;
export type InsertStandardInventoryItem = typeof standardInventoryItems.$inferInsert;

/**
 * Room inventory items table
 */
export const roomInventoryItems = mysqlTable("roomInventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  itemId: int("itemId").notNull(),
  quantity: int("quantity").default(0),
  lastChecked: timestamp("lastChecked"),
  status: mysqlEnum("status", ["ok", "missing", "damaged", "needs_replacement"]).default("ok").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RoomInventoryItem = typeof roomInventoryItems.$inferSelect;
export type InsertRoomInventoryItem = typeof roomInventoryItems.$inferInsert;

/**
 * Housekeeping schedules table
 */
export const housekeepingSchedules = mysqlTable("housekeepingSchedules", {
  id: int("id").autoincrement().primaryKey(),
  batchId: varchar("batchId", { length: 64 }),
  roomId: int("roomId").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  scheduledTime: varchar("scheduledTime", { length: 16 }),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  assignedTo: int("assignedTo"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled", "skipped"]).default("scheduled").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HousekeepingSchedule = typeof housekeepingSchedules.$inferSelect;
export type InsertHousekeepingSchedule = typeof housekeepingSchedules.$inferInsert;

/**
 * Maintenance schedules table
 */
export const maintenanceSchedules = mysqlTable("maintenanceSchedules", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId"),
  equipmentName: varchar("equipmentName", { length: 255 }),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  maintenanceType: varchar("maintenanceType", { length: 64 }).notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  assignedTo: int("assignedTo"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled", "postponed"]).default("scheduled").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  estimatedDuration: int("estimatedDuration"),
  actualDuration: int("actualDuration"),
  cost: int("cost"),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = typeof maintenanceSchedules.$inferInsert;


/**
 * Activity Logs table for audit trail
 * Tracks all user and AI actions with rollback capability
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  actionType: varchar("actionType", { length: 64 }).notNull(),
  targetEntity: varchar("targetEntity", { length: 64 }),
  targetId: varchar("targetId", { length: 128 }),
  oldValue: json("oldValue"),
  newValue: json("newValue"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  module: varchar("module", { length: 64 }),
  isRollbackable: boolean("isRollbackable").default(true),
  rolledBackAt: timestamp("rolledBackAt"),
  rolledBackBy: int("rolledBackBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Notifications table for in-app notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: mysqlEnum("type", ["info", "success", "warning", "error", "approval"]).default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  actionUrl: varchar("actionUrl", { length: 512 }),
  actionLabel: varchar("actionLabel", { length: 64 }),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  emailSent: boolean("emailSent").default(false),
  whatsappSent: boolean("whatsappSent").default(false),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * White-label settings table
 */
export const whitelabelSettings = mysqlTable("whitelabelSettings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).default("ORBI City Hub"),
  logoUrl: text("logoUrl"),
  faviconUrl: text("faviconUrl"),
  primaryColor: varchar("primaryColor", { length: 32 }).default("#10b981"),
  secondaryColor: varchar("secondaryColor", { length: 32 }).default("#1e293b"),
  accentColor: varchar("accentColor", { length: 32 }).default("#3b82f6"),
  customCss: text("customCss"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhitelabelSetting = typeof whitelabelSettings.$inferSelect;
export type InsertWhitelabelSetting = typeof whitelabelSettings.$inferInsert;

/**
 * AI Task Analytics table
 */
export const aiTaskAnalytics = mysqlTable("aiTaskAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed", "failed"]).default("pending").notNull(),
  userId: int("userId"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  completedAt: timestamp("completedAt"),
  executionTimeMs: int("executionTimeMs"),
  errorMessage: text("errorMessage"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiTaskAnalytic = typeof aiTaskAnalytics.$inferSelect;
export type InsertAiTaskAnalytic = typeof aiTaskAnalytics.$inferInsert;


/**
 * Guest Reviews table for multi-platform review management
 * Stores reviews from Google, Booking.com, Airbnb, TripAdvisor, Facebook, etc.
 */
export const guestReviews = mysqlTable("guestReviews", {
  id: int("id").autoincrement().primaryKey(),
  
  // Source information
  source: mysqlEnum("source", ["google", "booking", "airbnb", "expedia", "tripadvisor", "facebook", "agoda", "hostelworld", "direct"]).notNull(),
  externalId: varchar("externalId", { length: 255 }), // Original review ID from platform
  reviewUrl: text("reviewUrl"),
  
  // Reviewer info
  reviewerName: varchar("reviewerName", { length: 255 }),
  reviewerAvatar: text("reviewerAvatar"),
  reviewerCountry: varchar("reviewerCountry", { length: 64 }),
  
  // Review content
  rating: int("rating").notNull(), // 1-5 or 1-10 normalized to 1-5
  title: varchar("title", { length: 500 }),
  content: text("content"),
  language: varchar("language", { length: 16 }).default("en"),
  
  // Categorization
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral"),
  topics: json("topics").$type<string[]>(), // ["cleanliness", "location", "service", "value"]
  
  // Property info
  apartmentCode: varchar("apartmentCode", { length: 32 }),
  stayDate: timestamp("stayDate"),
  
  // Response tracking
  hasReply: boolean("hasReply").default(false),
  replyContent: text("replyContent"),
  replyDate: timestamp("replyDate"),
  repliedBy: int("repliedBy"),
  
  // AI analysis
  aiSummary: text("aiSummary"),
  aiSuggestedReply: text("aiSuggestedReply"),
  
  // Metadata
  reviewDate: timestamp("reviewDate").notNull(),
  importedAt: timestamp("importedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuestReview = typeof guestReviews.$inferSelect;
export type InsertGuestReview = typeof guestReviews.$inferInsert;


/**
 * Google Business Profile tokens storage
 */
export const googleBusinessTokens = mysqlTable("googleBusinessTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiryDate: bigint("expiryDate", { mode: "number" }),
  accountId: varchar("accountId", { length: 255 }),
  locationId: varchar("locationId", { length: 255 }),
  locationName: varchar("locationName", { length: 255 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GoogleBusinessToken = typeof googleBusinessTokens.$inferSelect;
export type InsertGoogleBusinessToken = typeof googleBusinessTokens.$inferInsert;

/**
 * Review notifications table
 */
export const reviewNotifications = mysqlTable("reviewNotifications", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId"),
  type: mysqlEnum("type", ["new_review", "negative_review", "response_needed", "response_posted"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReviewNotification = typeof reviewNotifications.$inferSelect;
export type InsertReviewNotification = typeof reviewNotifications.$inferInsert;


/**
 * Tawk.to Live Chat Messages
 * Stores messages received via Tawk.to webhooks for real-time display
 */
export const tawktoMessages = mysqlTable("tawktoMessages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: varchar("chatId", { length: 255 }).notNull(),
  messageId: varchar("messageId", { length: 255 }),
  eventType: mysqlEnum("eventType", [
    "chat:start", 
    "chat:end", 
    "ticket:create",
    "chat:transcript"
  ]).notNull(),
  visitorName: varchar("visitorName", { length: 255 }),
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  visitorPhone: varchar("visitorPhone", { length: 50 }),
  visitorCountry: varchar("visitorCountry", { length: 100 }),
  visitorCity: varchar("visitorCity", { length: 100 }),
  message: text("message"),
  agentName: varchar("agentName", { length: 255 }),
  agentId: varchar("agentId", { length: 255 }),
  propertyId: varchar("propertyId", { length: 255 }),
  isRead: boolean("isRead").default(false),
  status: mysqlEnum("status", ["active", "ended", "missed"]).default("active"),
  metadata: json("metadata"),
  chatStartedAt: timestamp("chatStartedAt"),
  chatEndedAt: timestamp("chatEndedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TawktoMessage = typeof tawktoMessages.$inferSelect;
export type InsertTawktoMessage = typeof tawktoMessages.$inferInsert;


// ============================================================================
// POWERHUB INFRASTRUCTURE TABLES
// Event-driven architecture for Apps Script ↔ Hub communication
// ============================================================================

/**
 * Integration Outbox - Reliable event delivery to external systems
 * Implements the Outbox Pattern for guaranteed delivery with retry logic
 */
export const integrationEvents = mysqlTable("integrationEvents", {
  id: varchar("id", { length: 36 }).primaryKey(), // CUID
  
  // Event metadata
  eventType: varchar("eventType", { length: 64 }).notNull(), // e.g., "Booking.Upserted"
  destination: varchar("destination", { length: 64 }).notNull(), // e.g., "APPS_SCRIPT_SHEETS", "TELEGRAM"
  
  // Payload
  payload: json("payload").notNull(),
  
  // Processing status
  status: mysqlEnum("status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "DEAD_LETTER"]).default("PENDING").notNull(),
  retryCount: int("retryCount").default(0).notNull(),
  maxRetries: int("maxRetries").default(5).notNull(),
  nextRetryAt: timestamp("nextRetryAt").defaultNow().notNull(),
  
  // Error tracking
  lastError: text("lastError"),
  errorHistory: json("errorHistory").$type<Array<{timestamp: string, error: string}>>(),
  
  // Timing
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
});

export type IntegrationEvent = typeof integrationEvents.$inferSelect;
export type InsertIntegrationEvent = typeof integrationEvents.$inferInsert;

/**
 * Used Nonces - Replay attack prevention
 * Stores nonces from Apps Script requests to prevent replay attacks
 */
export const usedNonces = mysqlTable("usedNonces", {
  nonce: varchar("nonce", { length: 64 }).primaryKey(),
  source: varchar("source", { length: 64 }).notNull(), // e.g., "APPS_SCRIPT_GMAIL"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // TTL for cleanup
});

export type UsedNonce = typeof usedNonces.$inferSelect;
export type InsertUsedNonce = typeof usedNonces.$inferInsert;

/**
 * Processed Events - Idempotency tracking
 * Ensures each event is processed exactly once
 */
export const processedEvents = mysqlTable("processedEvents", {
  eventId: varchar("eventId", { length: 64 }).primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  entityType: varchar("entityType", { length: 64 }), // e.g., "Booking", "RoomStatus"
  entityId: varchar("entityId", { length: 64 }),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
  result: mysqlEnum("result", ["SUCCESS", "IGNORED", "FAILED"]).default("SUCCESS").notNull(),
  metadata: json("metadata"),
});

export type ProcessedEvent = typeof processedEvents.$inferSelect;
export type InsertProcessedEvent = typeof processedEvents.$inferInsert;

// ============================================================================
// POWERHUB CORE ENTITY TABLES
// Main business entities with version tracking for conflict detection
// ============================================================================

/**
 * Bookings - Central reservation management
 * Source of truth for all bookings from any channel
 */
export const bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 36 }).primaryKey(), // b_xxx
  
  // External reference (for OTA bookings)
  channel: mysqlEnum("channel", ["DIRECT", "WEBSITE", "BOOKING", "AIRBNB", "EXPEDIA", "AGODA", "MANUAL", "OTHER"]).default("DIRECT").notNull(),
  externalReservationId: varchar("externalReservationId", { length: 128 }),
  
  // Status
  status: mysqlEnum("status", ["NEW", "CONFIRMED", "MODIFIED", "CANCELLED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW"]).default("NEW").notNull(),
  
  // Dates
  checkIn: timestamp("checkIn").notNull(),
  checkOut: timestamp("checkOut").notNull(),
  nights: int("nights").notNull(),
  
  // Unit/Room
  unitId: varchar("unitId", { length: 36 }),
  unitCode: varchar("unitCode", { length: 32 }),
  
  // Guest info
  guestId: varchar("guestId", { length: 36 }),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 50 }),
  guestCountry: varchar("guestCountry", { length: 64 }),
  guestLanguage: varchar("guestLanguage", { length: 16 }),
  
  // Occupancy
  adults: int("adults").default(1).notNull(),
  children: int("children").default(0).notNull(),
  
  // Pricing
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Notes
  notes: text("notes"),
  internalNotes: text("internalNotes"),
  
  // Raw data (for debugging/audit)
  rawEmailId: varchar("rawEmailId", { length: 255 }),
  rawData: json("rawData"),
  parseConfidence: decimal("parseConfidence", { precision: 3, scale: 2 }),
  
  // Version tracking (for conflict detection)
  version: int("version").default(1).notNull(),
  lastUpdatedSource: varchar("lastUpdatedSource", { length: 64 }), // HUB_UI, APPS_SCRIPT, WEBSITE
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Units/Rooms - Property inventory
 */
export const units = mysqlTable("units", {
  id: varchar("id", { length: 36 }).primaryKey(), // u_xxx
  code: varchar("code", { length: 32 }).notNull().unique(), // e.g., "4501"
  name: varchar("name", { length: 128 }),
  type: mysqlEnum("type", ["STUDIO", "1BR", "2BR", "3BR", "PENTHOUSE", "OTHER"]).default("STUDIO").notNull(),
  floor: int("floor"),
  building: varchar("building", { length: 64 }),
  
  // Status
  status: mysqlEnum("status", ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE").notNull(),
  cleaningStatus: mysqlEnum("cleaningStatus", ["CLEAN", "DIRTY", "CLEANING", "INSPECTED"]).default("CLEAN").notNull(),
  
  // Owner info
  ownerId: varchar("ownerId", { length: 36 }),
  ownerName: varchar("ownerName", { length: 255 }),
  
  // Version tracking
  version: int("version").default(1).notNull(),
  lastUpdatedSource: varchar("lastUpdatedSource", { length: 64 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

/**
 * Tasks - Operational task management
 */
export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(), // t_xxx
  
  type: mysqlEnum("type", ["CLEANING", "MAINTENANCE", "GUEST_REQUEST", "ADMIN", "SALES", "FINANCE", "OTHER"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  priority: mysqlEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM").notNull(),
  status: mysqlEnum("status", ["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]).default("OPEN").notNull(),
  
  // Assignments
  assignedTo: varchar("assignedTo", { length: 36 }),
  assignedToName: varchar("assignedToName", { length: 255 }),
  
  // Links
  bookingId: varchar("bookingId", { length: 36 }),
  unitId: varchar("unitId", { length: 36 }),
  guestId: varchar("guestId", { length: 36 }),
  
  // Timing
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  
  // Source tracking
  sourceRef: json("sourceRef"), // { sheetRowId, telegramMsgId, etc. }
  tags: json("tags").$type<string[]>(),
  
  // Version tracking
  version: int("version").default(1).notNull(),
  lastUpdatedSource: varchar("lastUpdatedSource", { length: 64 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Messages - Unified communication log
 */
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey(), // m_xxx
  
  channel: mysqlEnum("channel", ["EMAIL", "TELEGRAM", "WHATSAPP", "SMS", "PHONE_NOTE", "WEBSITE_CHAT", "OTHER"]).notNull(),
  direction: mysqlEnum("direction", ["INBOUND", "OUTBOUND"]).notNull(),
  
  threadId: varchar("threadId", { length: 255 }),
  
  fromAddress: varchar("fromAddress", { length: 320 }),
  toAddress: varchar("toAddress", { length: 320 }),
  
  subject: varchar("subject", { length: 500 }),
  bodySnippet: text("bodySnippet"),
  bodyRef: json("bodyRef"), // { driveFileId, etc. }
  attachments: json("attachments").$type<Array<{name: string, url: string, size?: number}>>(),
  
  // Links
  bookingId: varchar("bookingId", { length: 36 }),
  guestId: varchar("guestId", { length: 36 }),
  unitId: varchar("unitId", { length: 36 }),
  
  // Raw reference
  rawRef: json("rawRef"), // { gmailMessageId, telegramUpdateId, etc. }
  
  sentAt: timestamp("sentAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Payments - Financial transaction tracking
 */
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(), // p_xxx
  
  bookingId: varchar("bookingId", { length: 36 }),
  
  direction: mysqlEnum("direction", ["IN", "OUT"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  method: mysqlEnum("method", ["CASH", "CARD", "BANK", "ONLINE", "OTA_PAYOUT", "OTHER"]).notNull(),
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "FAILED", "REFUNDED"]).default("PENDING").notNull(),
  
  providerRef: varchar("providerRef", { length: 255 }), // Bank transaction ID, etc.
  note: text("note"),
  
  paidAt: timestamp("paidAt"),
  
  // Version tracking
  version: int("version").default(1).notNull(),
  lastUpdatedSource: varchar("lastUpdatedSource", { length: 64 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Leads - Marketing lead capture
 */
export const leads = mysqlTable("leads", {
  id: varchar("id", { length: 36 }).primaryKey(), // l_xxx
  
  source: mysqlEnum("source", ["WEBSITE", "FORM", "CALL", "INSTAGRAM", "WHATSAPP", "TELEGRAM", "EMAIL", "OTHER"]).notNull(),
  
  // Contact info
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  
  // Intent
  intent: mysqlEnum("intent", ["BOOKING_QUESTION", "PRICE_REQUEST", "AVAILABILITY", "PARTNERSHIP", "OTHER"]).default("OTHER").notNull(),
  message: text("message"),
  
  // UTM tracking
  utmSource: varchar("utmSource", { length: 128 }),
  utmMedium: varchar("utmMedium", { length: 128 }),
  utmCampaign: varchar("utmCampaign", { length: 128 }),
  utmContent: varchar("utmContent", { length: 128 }),
  utmTerm: varchar("utmTerm", { length: 128 }),
  
  // Status
  status: mysqlEnum("status", ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).default("NEW").notNull(),
  
  // Conversion
  convertedBookingId: varchar("convertedBookingId", { length: 36 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
