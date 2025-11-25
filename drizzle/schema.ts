import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * ORBI City Hub Database Schema
 * Complete schema for aparthotel management system
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "manager", "staff", "guest"]).default("guest").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// FILES & UPLOADS
// ============================================================================

export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // File details
  fileName: varchar("fileName", { length: 255 }).notNull(), // Generated unique filename
  originalName: varchar("originalName", { length: 255 }).notNull(), // User's original filename
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileSize: int("fileSize").notNull(), // in bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  // Metadata
  module: varchar("module", { length: 100 }), // finance, marketing, logistics, etc.
  tags: json("tags"), // Array of tags for search
  description: text("description"),
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// ============================================================================
// RESERVATIONS & GUESTS
// ============================================================================

export const guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }),
  language: varchar("language", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  guestId: int("guestId").notNull(),
  
  // Booking details
  bookingNumber: varchar("bookingNumber", { length: 100 }).notNull().unique(),
  channel: varchar("channel", { length: 100 }).notNull(), // Booking.com, Airbnb, etc.
  status: mysqlEnum("status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).default("pending").notNull(),
  
  // Dates (store as UTC timestamps in milliseconds)
  checkIn: timestamp("checkIn").notNull(),
  checkOut: timestamp("checkOut").notNull(),
  bookedAt: timestamp("bookedAt").defaultNow().notNull(),
  
  // Room & guests
  roomNumber: varchar("roomNumber", { length: 20 }),
  roomType: varchar("roomType", { length: 100 }).default("Sea View Studio"),
  adults: int("adults").default(2).notNull(),
  children: int("children").default(0).notNull(),
  
  // Pricing (store in cents/tetri to avoid decimal issues)
  totalPrice: int("totalPrice").notNull(), // in tetri (₾ * 100)
  currency: varchar("currency", { length: 3 }).default("GEL").notNull(),
  
  // Special requests
  specialRequests: text("specialRequests"),
  lateCheckIn: boolean("lateCheckIn").default(false),
  earlyCheckOut: boolean("earlyCheckOut").default(false),
  
  // Email reference
  emailId: varchar("emailId", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ============================================================================
// FINANCE
// ============================================================================

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Transaction details
  type: mysqlEnum("type", ["revenue", "expense"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Accommodation, Utilities, Marketing, etc.
  description: text("description").notNull(),
  
  // Amount (in tetri/cents)
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("GEL").notNull(),
  
  // Date
  transactionDate: timestamp("transactionDate").notNull(),
  
  // References
  bookingId: int("bookingId"),
  channel: varchar("channel", { length: 100 }),
  
  // Metadata
  notes: text("notes"),
  createdBy: int("createdBy"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ============================================================================
// MARKETING
// ============================================================================

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 100 }).notNull(), // TikTok, Instagram, Google Ads, etc.
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  
  // Dates
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  
  // Budget (in tetri)
  budget: int("budget"),
  spent: int("spent").default(0),
  
  // Performance metrics
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  revenue: int("revenue").default(0), // in tetri
  
  // Content
  description: text("description"),
  targetAudience: text("targetAudience"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

export const channelPerformance = mysqlTable("channelPerformance", {
  id: int("id").autoincrement().primaryKey(),
  
  channel: varchar("channel", { length: 100 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  
  // Performance metrics
  bookings: int("bookings").default(0),
  revenue: int("revenue").default(0), // in tetri
  commission: int("commission").default(0), // in tetri
  occupancyRate: int("occupancyRate").default(0), // percentage * 100 (e.g., 8500 = 85%)
  
  // Ratings
  averageRating: int("averageRating"), // rating * 10 (e.g., 92 = 9.2)
  reviewCount: int("reviewCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChannelPerformance = typeof channelPerformance.$inferSelect;
export type InsertChannelPerformance = typeof channelPerformance.$inferInsert;

// ============================================================================
// LOGISTICS & INVENTORY
// ============================================================================

export const inventoryItems = mysqlTable("inventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Toiletries, Linens, Cleaning, etc.
  
  // Quantities
  currentQuantity: int("currentQuantity").default(0).notNull(),
  minimumQuantity: int("minimumQuantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }).default("pieces").notNull(),
  
  // Pricing (in tetri)
  unitPrice: int("unitPrice"),
  
  // Status
  status: mysqlEnum("status", ["in_stock", "low_stock", "out_of_stock"]).default("in_stock").notNull(),
  
  // Supplier
  supplier: varchar("supplier", { length: 255 }),
  lastOrderDate: timestamp("lastOrderDate"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

// Rooms table (base for all room-related operations)
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  roomNumber: varchar("roomNumber", { length: 20 }).notNull().unique(),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

// Housekeeping schedules (from Lovable)
export const housekeepingSchedules = mysqlTable("housekeepingSchedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(), // YYYY-MM-DD
  rooms: json("rooms").notNull(), // Array of room numbers
  totalRooms: int("totalRooms").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  additionalNotes: text("additionalNotes"),
  mediaUrls: json("mediaUrls"), // Array of media URLs
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HousekeepingSchedule = typeof housekeepingSchedules.$inferSelect;
export type InsertHousekeepingSchedule = typeof housekeepingSchedules.$inferInsert;

// Maintenance schedules (from Lovable)
export const maintenanceSchedules = mysqlTable("maintenanceSchedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  roomNumber: varchar("roomNumber", { length: 20 }).notNull(),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(), // YYYY-MM-DD
  problem: text("problem").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  cost: int("cost"), // in tetri
  solvingDate: varchar("solvingDate", { length: 10 }), // YYYY-MM-DD
  additionalNotes: text("additionalNotes"),
  mediaUrls: json("mediaUrls"), // Array of media URLs
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = typeof maintenanceSchedules.$inferInsert;

// Standard inventory items (template for room inventory)
export const standardInventoryItems = mysqlTable("standardInventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  standardQuantity: int("standardQuantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StandardInventoryItem = typeof standardInventoryItems.$inferSelect;
export type InsertStandardInventoryItem = typeof standardInventoryItems.$inferInsert;

// Room inventory items (actual inventory per room)
export const roomInventoryItems = mysqlTable("roomInventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  standardItemId: int("standardItemId").notNull(),
  actualQuantity: int("actualQuantity").default(0).notNull(),
  condition: mysqlEnum("condition", ["good", "fair", "poor", "missing"]).default("good"),
  lastChecked: timestamp("lastChecked").defaultNow().notNull(),
  notes: text("notes"),
  issueDetectedAt: timestamp("issueDetectedAt"),
  issueResolvedAt: timestamp("issueResolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RoomInventoryItem = typeof roomInventoryItems.$inferSelect;
export type InsertRoomInventoryItem = typeof roomInventoryItems.$inferInsert;

// Room inventory change history
export const roomInventoryDescriptions = mysqlTable("roomInventoryDescriptions", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  userId: int("userId"),
  descriptionDate: varchar("descriptionDate", { length: 10 }).notNull(), // YYYY-MM-DD
  changeType: varchar("changeType", { length: 50 }), // added, removed, missing, transfer
  itemsAdded: text("itemsAdded"),
  itemsRemoved: text("itemsRemoved"),
  itemsMissing: text("itemsMissing"),
  transferFromRoom: varchar("transferFromRoom", { length: 20 }),
  transferToRoom: varchar("transferToRoom", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RoomInventoryDescription = typeof roomInventoryDescriptions.$inferSelect;
export type InsertRoomInventoryDescription = typeof roomInventoryDescriptions.$inferInsert;

// Logistics activity log (audit trail)
export const logisticsActivityLog = mysqlTable("logisticsActivityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userEmail: varchar("userEmail", { length: 320 }),
  action: varchar("action", { length: 50 }).notNull(), // create, update, delete, complete
  entityType: varchar("entityType", { length: 100 }).notNull(), // housekeeping_schedule, maintenance_schedule, etc.
  entityId: varchar("entityId", { length: 100 }),
  entityName: varchar("entityName", { length: 255 }),
  changes: json("changes"), // JSON object with change details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LogisticsActivityLog = typeof logisticsActivityLog.$inferSelect;
export type InsertLogisticsActivityLog = typeof logisticsActivityLog.$inferInsert;

// ============================================================================
// AI CHAT HISTORY
// ============================================================================

export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  module: varchar("module", { length: 100 }).notNull(), // CEO, Reservations, Finance, etc.
  
  // Message
  userMessage: text("userMessage").notNull(),
  aiResponse: text("aiResponse").notNull(),
  
  // Context
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileName: varchar("fileName", { length: 255 }),
  fileType: varchar("fileType", { length: 50 }),
  
  // Metadata
  responseTime: int("responseTime"), // in milliseconds
  tokensUsed: int("tokensUsed"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

// ============================================================================
// AUDIT LOGS & ACTIVITY TRACKING
// ============================================================================

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "create_booking", "update_price", "delete_guest"
  entity: varchar("entity", { length: 100 }).notNull(), // e.g., "booking", "guest", "transaction"
  entityId: int("entityId"), // ID of the affected entity
  changes: text("changes"), // JSON string of what changed
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
