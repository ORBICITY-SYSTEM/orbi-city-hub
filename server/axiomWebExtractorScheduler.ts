import { getWebExtractorIntegration, triggerWebExtractorRun, WebExtractorSchedule } from "./services/axiomWebExtractor";

let extractorTimeout: NodeJS.Timeout | null = null;

export function getNextRunAt(schedule: WebExtractorSchedule, from: Date = new Date()) {
  const [hour, minute] = schedule.time.split(":").map(Number);
  const nextRun = new Date(from);
  nextRun.setSeconds(0, 0);

  if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
    nextRun.setHours(hour, minute, 0, 0);
  }

  if (schedule.frequency === "daily") {
    if (nextRun <= from) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun;
  }

  const targetDay = schedule.dayOfWeek ?? 1;
  const currentDay = nextRun.getDay();
  let daysUntil = (targetDay - currentDay + 7) % 7;

  if (daysUntil === 0 && nextRun <= from) {
    daysUntil = 7;
  }

  nextRun.setDate(nextRun.getDate() + daysUntil);
  return nextRun;
}

export async function refreshWebExtractorSchedule() {
  if (extractorTimeout) {
    clearTimeout(extractorTimeout);
    extractorTimeout = null;
  }

  const { integration, config } = await getWebExtractorIntegration();
  if (!integration || !config) {
    console.log("[Axiom Web Extractor] No config found.");
    return;
  }

  if (integration.status !== "active") {
    console.log("[Axiom Web Extractor] Automation inactive. Scheduler paused.");
    return;
  }

  const nextRun = getNextRunAt(config.schedule);
  const delayMs = Math.max(nextRun.getTime() - Date.now(), 1000);

  console.log(`[Axiom Web Extractor] Next run scheduled for ${nextRun.toLocaleString()}`);

  extractorTimeout = setTimeout(async () => {
    try {
      await triggerWebExtractorRun("schedule");
    } catch (error) {
      console.error("[Axiom Web Extractor] Scheduled run failed:", error);
    } finally {
      await refreshWebExtractorSchedule();
    }
  }, delayMs);
}

export async function startWebExtractorSchedule() {
  if (extractorTimeout) {
    console.log("[Axiom Web Extractor] Scheduler already running.");
    return;
  }
  await refreshWebExtractorSchedule();
}

export function stopWebExtractorSchedule() {
  if (extractorTimeout) {
    clearTimeout(extractorTimeout);
    extractorTimeout = null;
    console.log("[Axiom Web Extractor] Scheduler stopped.");
  }
}
