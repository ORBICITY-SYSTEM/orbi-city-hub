import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

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
