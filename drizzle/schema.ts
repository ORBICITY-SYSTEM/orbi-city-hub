import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

// Google OAuth tokens
export const googleTokens = mysqlTable("google_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Gmail messages
export const gmailMessages = mysqlTable("gmail_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  messageId: varchar("message_id", { length: 255 }).notNull(),
  threadId: varchar("thread_id", { length: 255 }),
  subject: text("subject"),
  fromEmail: varchar("from_email", { length: 500 }),
  toEmail: varchar("to_email", { length: 500 }),
  snippet: text("snippet"),
  bodyText: text("body_text"),
  bodyHtml: text("body_html"),
  receivedDate: timestamp("received_date"),
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  labels: json("labels"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Email categories (AI categorization)
export const emailCategories = mysqlTable("email_categories", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(),
  category: mysqlEnum("category", [
    "booking",
    "review",
    "complaint",
    "question",
    "financial",
    "marketing",
    "spam",
    "important",
    "general",
  ]).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0.00"),
  aiReasoning: text("ai_reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email responses (AI-generated)
export const emailResponses = mysqlTable("email_responses", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(),
  responseText: text("response_text").notNull(),
  templateUsed: varchar("template_used", { length: 100 }),
  language: varchar("language", { length: 10 }).default("en"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email booking revenue tracking
export const emailBookingRevenue = mysqlTable("email_booking_revenue", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(),
  guestName: varchar("guest_name", { length: 255 }),
  checkInDate: timestamp("check_in_date"),
  checkOutDate: timestamp("check_out_date"),
  studioNumber: varchar("studio_number", { length: 50 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("GEL"),
  bookingSource: varchar("booking_source", { length: 100 }),
  extractedAt: timestamp("extracted_at").defaultNow().notNull(),
});

// Email sync log
export const emailSyncLog = mysqlTable("email_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  syncType: varchar("sync_type", { length: 50 }).notNull(),
  messagesFetched: int("messages_fetched").default(0),
  messagesNew: int("messages_new").default(0),
  messagesUpdated: int("messages_updated").default(0),
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  errorMessage: text("error_message"),
  syncStartedAt: timestamp("sync_started_at").notNull(),
  syncCompletedAt: timestamp("sync_completed_at"),
});
