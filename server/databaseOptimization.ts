/**
 * Database Optimization
 * 
 * Analyzes and optimizes database queries and indexes
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Database Optimization Report
 */
export interface DatabaseOptimizationReport {
  timestamp: Date;
  tables: {
    name: string;
    rows: number;
    dataSize: string;
    indexSize: string;
    totalSize: string;
  }[];
  indexes: {
    table: string;
    index: string;
    columns: string;
    cardinality: number;
  }[];
  slowQueries: {
    query: string;
    executionTime: number;
    rowsExamined: number;
  }[];
  recommendations: string[];
}

/**
 * Get table sizes
 */
export async function getTableSizes() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db.execute(sql`
    SELECT 
      table_name AS tableName,
      table_rows AS rows,
      ROUND(data_length / 1024 / 1024, 2) AS dataSizeMB,
      ROUND(index_length / 1024 / 1024, 2) AS indexSizeMB,
      ROUND((data_length + index_length) / 1024 / 1024, 2) AS totalSizeMB
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
    ORDER BY (data_length + index_length) DESC
  `);

  return ((result as any) as any[]).map((row: any) => ({
    name: row.tableName,
    rows: row.rows || 0,
    dataSize: `${row.dataSizeMB || 0} MB`,
    indexSize: `${row.indexSizeMB || 0} MB`,
    totalSize: `${row.totalSizeMB || 0} MB`,
  }));
}

/**
 * Get index information
 */
export async function getIndexes() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db.execute(sql`
    SELECT 
      table_name AS tableName,
      index_name AS indexName,
      GROUP_CONCAT(column_name ORDER BY seq_in_index) AS columns,
      cardinality
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    GROUP BY table_name, index_name
    ORDER BY table_name, index_name
  `);

  return ((result as any) as any[]).map((row: any) => ({
    table: row.tableName,
    index: row.indexName,
    columns: row.columns,
    cardinality: row.cardinality || 0,
  }));
}

/**
 * Create missing indexes
 */
export async function createMissingIndexes() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const indexesCreated: string[] = [];

  try {
    // Index for files table (userId + createdAt for faster queries)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_files_userId_createdAt 
      ON files(userId, createdAt DESC)
    `);
    indexesCreated.push("idx_files_userId_createdAt");

    // Index for aiConversations (userId + createdAt)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_aiConversations_userId_createdAt 
      ON aiConversations(userId, createdAt DESC)
    `);
    indexesCreated.push("idx_aiConversations_userId_createdAt");

    // Index for userFeedback (status + type)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_userFeedback_status_type 
      ON userFeedback(status, type)
    `);
    indexesCreated.push("idx_userFeedback_status_type");

    // Index for errorLogs (createdAt for cleanup)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_errorLogs_createdAt 
      ON errorLogs(createdAt DESC)
    `);
    indexesCreated.push("idx_errorLogs_createdAt");

    // Index for performanceMetrics (endpoint + timestamp)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_performanceMetrics_endpoint_timestamp 
      ON performanceMetrics(endpoint, timestamp DESC)
    `);
    indexesCreated.push("idx_performanceMetrics_endpoint_timestamp");

    // Index for alerts (status + severity)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_alerts_status_severity 
      ON alerts(status, severity)
    `);
    indexesCreated.push("idx_alerts_status_severity");

    // Index for roomInventoryItems (roomId + itemId)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_roomInventoryItems_roomId_itemId 
      ON roomInventoryItems(roomId, itemId)
    `);
    indexesCreated.push("idx_roomInventoryItems_roomId_itemId");

    // Index for reservations (checkIn + checkOut for date range queries)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_reservations_checkIn_checkOut 
      ON reservations(checkIn, checkOut)
    `);
    indexesCreated.push("idx_reservations_checkIn_checkOut");

    // Index for reservations (status for filtering)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_reservations_status 
      ON reservations(status)
    `);
    indexesCreated.push("idx_reservations_status");

  } catch (error) {
    console.error("[Database Optimization] Error creating indexes:", error);
  }

  return indexesCreated;
}

/**
 * Analyze slow queries
 */
export async function analyzeSlowQueries() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    // This would require slow query log to be enabled
    // For now, return recommendations based on table structure
    return [];
  } catch (error) {
    console.error("[Database Optimization] Error analyzing slow queries:", error);
    return [];
  }
}

/**
 * Run database optimization
 */
export async function runDatabaseOptimization(): Promise<DatabaseOptimizationReport> {
  const tables = await getTableSizes();
  const indexes = await getIndexes();
  const slowQueries = await analyzeSlowQueries();
  const indexesCreated = await createMissingIndexes();

  const recommendations: string[] = [];

  // Check for tables without indexes
  const tablesWithoutIndexes = tables.filter(
    (table) => !indexes.some((idx) => idx.table === table.name && idx.index !== "PRIMARY")
  );

  if (tablesWithoutIndexes.length > 0) {
    recommendations.push(
      `Add indexes to tables: ${tablesWithoutIndexes.map((t) => t.name).join(", ")}`
    );
  }

  // Check for large tables
  const largeTables = tables.filter((table) => {
    const sizeMB = parseFloat(table.totalSize.replace(" MB", ""));
    return sizeMB > 100;
  });

  if (largeTables.length > 0) {
    recommendations.push(
      `Consider partitioning large tables: ${largeTables.map((t) => t.name).join(", ")}`
    );
  }

  // Check for tables with many rows
  const tablesWithManyRows = tables.filter((table) => table.rows > 100000);

  if (tablesWithManyRows.length > 0) {
    recommendations.push(
      `Consider archiving old data from: ${tablesWithManyRows.map((t) => t.name).join(", ")}`
    );
  }

  if (indexesCreated.length > 0) {
    recommendations.push(`Created ${indexesCreated.length} new indexes for better performance`);
  }

  recommendations.push("Enable Redis caching to reduce database load");
  recommendations.push("Configure slow query log for detailed query analysis");
  recommendations.push("Run ANALYZE TABLE periodically to update statistics");

  return {
    timestamp: new Date(),
    tables,
    indexes,
    slowQueries,
    recommendations,
  };
}
