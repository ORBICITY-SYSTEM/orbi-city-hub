import { createDatabaseBackup, cleanupOldBackups } from "./backup";

/**
 * Automated backup scheduler
 * Runs daily backups at 3 AM and cleanup weekly
 */

let backupInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start automated backup schedule
 */
export function startBackupSchedule() {
  if (backupInterval) {
    console.log("[Backup Scheduler] Already running");
    return;
  }

  console.log("[Backup Scheduler] Starting automated backup schedule...");

  // Calculate time until next 3 AM
  const now = new Date();
  const next3AM = new Date();
  next3AM.setHours(3, 0, 0, 0);
  
  // If it's already past 3 AM today, schedule for tomorrow
  if (now > next3AM) {
    next3AM.setDate(next3AM.getDate() + 1);
  }

  const msUntil3AM = next3AM.getTime() - now.getTime();

  console.log(`[Backup Scheduler] First backup scheduled for: ${next3AM.toLocaleString()}`);

  // Schedule first backup
  setTimeout(() => {
    // Run backup immediately
    runScheduledBackup();

    // Then run every 24 hours
    backupInterval = setInterval(() => {
      runScheduledBackup();
    }, 24 * 60 * 60 * 1000); // 24 hours

  }, msUntil3AM);

  // Schedule weekly cleanup (every Sunday at 4 AM)
  scheduleWeeklyCleanup();
}

/**
 * Stop automated backup schedule
 */
export function stopBackupSchedule() {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log("[Backup Scheduler] Stopped");
  }

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Run scheduled backup
 */
async function runScheduledBackup() {
  console.log("[Backup Scheduler] Running scheduled backup...");
  
  try {
    const result = await createDatabaseBackup();
    
    if (result.success) {
      console.log(`[Backup Scheduler] ✓ Backup completed: ${result.filename} (${result.size})`);
    } else {
      console.error(`[Backup Scheduler] ✗ Backup failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[Backup Scheduler] ✗ Backup error:", error);
  }
}

/**
 * Schedule weekly cleanup
 */
function scheduleWeeklyCleanup() {
  const now = new Date();
  const nextSunday = new Date();
  nextSunday.setHours(4, 0, 0, 0);
  
  // Calculate days until next Sunday
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  nextSunday.setDate(now.getDate() + daysUntilSunday);

  const msUntilSunday = nextSunday.getTime() - now.getTime();

  console.log(`[Backup Scheduler] First cleanup scheduled for: ${nextSunday.toLocaleString()}`);

  setTimeout(() => {
    // Run cleanup immediately
    runScheduledCleanup();

    // Then run every 7 days
    cleanupInterval = setInterval(() => {
      runScheduledCleanup();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

  }, msUntilSunday);
}

/**
 * Run scheduled cleanup
 */
async function runScheduledCleanup() {
  console.log("[Backup Scheduler] Running scheduled cleanup...");
  
  try {
    const deletedCount = await cleanupOldBackups(30); // Keep last 30 days
    console.log(`[Backup Scheduler] ✓ Cleanup completed: ${deletedCount} old backups deleted`);
  } catch (error) {
    console.error("[Backup Scheduler] ✗ Cleanup error:", error);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    running: backupInterval !== null,
    cleanupRunning: cleanupInterval !== null,
  };
}
