/**
 * Daily Operations Automation
 * Auto-generate tasks based on calendar events
 */

export interface DailyOperation {
  type: "cleaning" | "guest_arrival" | "guest_departure";
  roomNumber: string;
  guestName: string;
  bookingId: number;
  priority: "high" | "medium" | "low";
  scheduledFor: Date;
  description: string;
}

export interface CalendarEvent {
  id: number;
  roomNumber: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
}

/**
 * Generate daily operations from calendar events
 */
export function generateDailyOperations(
  events: CalendarEvent[],
  targetDate: Date = new Date()
): DailyOperation[] {
  const operations: DailyOperation[] = [];
  
  // Normalize target date to start of day
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  for (const event of events) {
    const checkIn = new Date(event.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    
    const checkOut = new Date(event.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    
    // Check-out today → Cleaning task
    if (checkOut.getTime() === target.getTime()) {
      operations.push({
        type: "cleaning",
        roomNumber: event.roomNumber,
        guestName: event.guestName,
        bookingId: event.id,
        priority: "high",
        scheduledFor: new Date(target.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
        description: `Clean Room ${event.roomNumber} after ${event.guestName} check-out`,
      });
      
      operations.push({
        type: "guest_departure",
        roomNumber: event.roomNumber,
        guestName: event.guestName,
        bookingId: event.id,
        priority: "medium",
        scheduledFor: new Date(target.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
        description: `Guest departure: ${event.guestName} from Room ${event.roomNumber}`,
      });
    }
    
    // Check-in today → Guest arrival alert
    if (checkIn.getTime() === target.getTime()) {
      operations.push({
        type: "guest_arrival",
        roomNumber: event.roomNumber,
        guestName: event.guestName,
        bookingId: event.id,
        priority: "high",
        scheduledFor: new Date(target.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        description: `Guest arrival: ${event.guestName} to Room ${event.roomNumber}`,
      });
    }
  }
  
  // Sort by priority and time
  return operations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.scheduledFor.getTime() - b.scheduledFor.getTime();
  });
}

/**
 * Check if a task should be created for a specific event
 */
export function shouldCreateTask(
  event: CalendarEvent,
  taskType: "cleaning" | "guest_arrival" | "guest_departure",
  targetDate: Date = new Date()
): boolean {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(event.checkIn);
  checkIn.setHours(0, 0, 0, 0);
  
  const checkOut = new Date(event.checkOut);
  checkOut.setHours(0, 0, 0, 0);
  
  switch (taskType) {
    case "cleaning":
    case "guest_departure":
      return checkOut.getTime() === target.getTime();
    case "guest_arrival":
      return checkIn.getTime() === target.getTime();
    default:
      return false;
  }
}

/**
 * Format operation as a task description
 */
export function formatOperationTask(operation: DailyOperation): {
  title: string;
  description: string;
  priority: string;
  dueTime: string;
} {
  const timeStr = operation.scheduledFor.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const icons = {
    cleaning: "🧹",
    guest_arrival: "👋",
    guest_departure: "👋",
  };
  
  const titles = {
    cleaning: `Clean Room ${operation.roomNumber}`,
    guest_arrival: `Guest Arrival - Room ${operation.roomNumber}`,
    guest_departure: `Guest Departure - Room ${operation.roomNumber}`,
  };
  
  return {
    title: `${icons[operation.type]} ${titles[operation.type]}`,
    description: operation.description,
    priority: operation.priority.toUpperCase(),
    dueTime: timeStr,
  };
}

/**
 * Get operations summary for a date
 */
export function getOperationsSummary(
  operations: DailyOperation[]
): {
  total: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  urgent: DailyOperation[];
} {
  const byType: Record<string, number> = {
    cleaning: 0,
    guest_arrival: 0,
    guest_departure: 0,
  };
  
  const byPriority: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  
  const urgent: DailyOperation[] = [];
  
  for (const op of operations) {
    byType[op.type]++;
    byPriority[op.priority]++;
    
    if (op.priority === "high") {
      urgent.push(op);
    }
  }
  
  return {
    total: operations.length,
    byType,
    byPriority,
    urgent,
  };
}
