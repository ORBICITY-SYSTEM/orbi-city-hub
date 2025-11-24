import { exec } from "child_process";
import { promisify } from "util";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

const execAsync = promisify(exec);

interface BackupResult {
  success: boolean;
  filename: string;
  size: string;
  url?: string;
  error?: string;
}

/**
 * Create a database backup and upload to S3
 * This can be called manually or scheduled via cron
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `orbi-city-hub-backup-${timestamp}.sql`;
  const tempPath = `/tmp/${filename}`;

  try {
    console.log("[Backup] Starting database backup...");

    // Get database connection details from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not configured");
    }

    // Parse connection string
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (!urlMatch) {
      throw new Error("Invalid DATABASE_URL format");
    }

    const [, user, password, host, port, database] = urlMatch;

    // Create database dump using mysqldump
    const dumpCommand = `mysqldump \
      --host=${host} \
      --port=${port} \
      --user=${user} \
      --password='${password}' \
      --single-transaction \
      --routines \
      --triggers \
      --events \
      ${database} > ${tempPath}`;

    console.log(`[Backup] Dumping database: ${database}@${host}:${port}`);
    await execAsync(dumpCommand);

    // Compress the backup
    console.log("[Backup] Compressing backup...");
    await execAsync(`gzip ${tempPath}`);
    const gzPath = `${tempPath}.gz`;

    // Get file size
    const { stdout: sizeOutput } = await execAsync(`du -h ${gzPath} | cut -f1`);
    const size = sizeOutput.trim();

    // Read compressed file
    const fs = require("fs").promises;
    const fileBuffer = await fs.readFile(gzPath);

    // Upload to S3
    console.log("[Backup] Uploading to S3...");
    const s3Key = `backups/database/${filename}.gz`;
    const { url } = await storagePut(s3Key, fileBuffer, "application/gzip");

    // Clean up local file
    await execAsync(`rm -f ${gzPath}`);

    console.log(`[Backup] ✓ Backup completed successfully: ${filename}.gz (${size})`);

    // Notify owner
    await notifyOwner({
      title: "✅ Database Backup Success",
      content: `Daily backup completed successfully:\n\n` +
        `• File: ${filename}.gz\n` +
        `• Size: ${size}\n` +
        `• Time: ${new Date().toLocaleString()}\n\n` +
        `Backup is stored securely in S3.`
    });

    return {
      success: true,
      filename: `${filename}.gz`,
      size,
      url
    };

  } catch (error) {
    console.error("[Backup] ✗ Backup failed:", error);

    // Notify owner of failure
    await notifyOwner({
      title: "❌ Database Backup Failed",
      content: `Backup failed at ${new Date().toLocaleString()}:\n\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}\n\n` +
        `Please check the logs and retry manually.`
    });

    return {
      success: false,
      filename,
      size: "0",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Clean up old backups (older than retention days)
 */
export async function cleanupOldBackups(retentionDays: number = 30): Promise<number> {
  console.log(`[Backup] Cleaning up backups older than ${retentionDays} days...`);
  
  // This would require listing S3 objects and deleting old ones
  // For now, we'll return 0 (no deletions)
  // TODO: Implement S3 object listing and deletion
  
  return 0;
}
