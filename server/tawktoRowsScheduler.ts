import { getTawktoRowsIntegration, triggerTawktoRowsSync, TawktoRowsSchedule } from "./services/tawktoRowsAutomation";

let automationTimeout: NodeJS.Timeout | null = null;

export function getNextRunAt(schedule: TawktoRowsSchedule, from: Date = new Date()) {
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

export async function refreshTawktoRowsSchedule() {
  if (automationTimeout) {
    clearTimeout(automationTimeout);
    automationTimeout = null;
  }

  const { integration, config } = await getTawktoRowsIntegration();
  if (!integration || !config) {
    console.log("[Axiom Automation] No Tawk.to → Rows config found.");
    return;
  }

  if (integration.status !== "active") {
    console.log("[Axiom Automation] Automation is inactive. Scheduler paused.");
    return;
  }

  const nextRun = getNextRunAt(config.schedule);
  const delayMs = Math.max(nextRun.getTime() - Date.now(), 1000);

  console.log(`[Axiom Automation] Next Tawk.to → Rows sync scheduled for ${nextRun.toLocaleString()}`);

  automationTimeout = setTimeout(async () => {
    try {
      await triggerTawktoRowsSync("schedule");
    } catch (error) {
      console.error("[Axiom Automation] Scheduled run failed:", error);
    } finally {
      await refreshTawktoRowsSchedule();
    }
  }, delayMs);
}

export async function startTawktoRowsSchedule() {
  if (automationTimeout) {
    console.log("[Axiom Automation] Scheduler already running.");
    return;
  }
  await refreshTawktoRowsSchedule();
}

export function stopTawktoRowsSchedule() {
  if (automationTimeout) {
    clearTimeout(automationTimeout);
    automationTimeout = null;
    console.log("[Axiom Automation] Scheduler stopped.");
  }
}
