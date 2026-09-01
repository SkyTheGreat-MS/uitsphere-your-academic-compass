import type { PlannerClass, StudyTask, TaskPriority, TaskStatus } from "@/api/plannerApi";
import { formatTime12 } from "./date";

export const YANGON_TIMEZONE = "Asia/Yangon";

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type YangonDateTimeParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  weekday: string; // "Monday", "Tuesday", etc.
  isoDate: string; // "YYYY-MM-DD"
  time24: string; // "HH:mm"
  timeWithSeconds: string; // "HH:mm:ss"
  epochMs: number;
};

/**
 * Extracts date and time parts in Asia/Yangon (+06:30).
 */
export function getYangonParts(date: Date = new Date()): YangonDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: YANGON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  let hour = parseInt(partMap.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);
  const weekday = partMap.weekday;

  const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const time24 = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const timeWithSeconds = `${time24}:${String(second).padStart(2, "0")}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday,
    isoDate,
    time24,
    timeWithSeconds,
    epochMs: date.getTime(),
  };
}

/**
 * Parses an ISO date (YYYY-MM-DD) and local 24h time (HH:mm or HH:mm:ss) in Asia/Yangon (+06:30)
 * to an exact UTC millisecond timestamp.
 */
export function yangonDateTimeToMs(isoDate: string, time24?: string | null): number {
  const cleanTime = time24 && time24.trim() ? time24.trim() : "00:00";
  const timeParts = cleanTime.split(":");
  const hh = String(Number(timeParts[0] || "0")).padStart(2, "0");
  const mm = String(Number(timeParts[1] || "0")).padStart(2, "0");
  const ss = String(Number(timeParts[2] || "0")).padStart(2, "0");

  const isoString = `${isoDate}T${hh}:${mm}:${ss}+06:30`;
  const parsed = Date.parse(isoString);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  // Fallback calculation if Date.parse does not support explicit offset
  const [y, m, d] = isoDate.split("-").map(Number);
  const offsetMinutes = 6 * 60 + 30; // +06:30 = 390 min
  return Date.UTC(y, m - 1, d, Number(hh), Number(mm), Number(ss)) - offsetMinutes * 60 * 1000;
}

/**
 * Adds or subtracts days from an ISO date string (YYYY-MM-DD).
 */
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  const ny = date.getUTCFullYear();
  const nm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(date.getUTCDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

/**
 * Gets the weekday name for an ISO date string (YYYY-MM-DD).
 */
export function weekdayOfIsoDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return WEEKDAY_NAMES[date.getUTCDay()];
}

/**
 * Formats date label for headers (e.g. "Tuesday, September 1").
 */
export function formatGroupDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Formats short date (e.g. "Sep 1").
 */
export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Formats 24h time "HH:mm" to 12h "h:mm AM/PM".
 */
export function formatTime12(time24: string): string {
  if (!time24 || time24 === "Anytime") return time24;
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Calculates human-readable dynamic countdown based on target timestamp and current time.
 * Examples:
 *  - "Starts in 2 days 4 hours"
 *  - "Starts in 5 hours 23 minutes"
 *  - "Starts in 42 minutes"
 *  - "Starts in 8 minutes"
 *  - "Starts in 1 day 30 minutes"
 *  - "Starts in 1 day 6 hours"
 *  - "Starts in 1 minute"
 */
export function formatCountdown(targetMs: number, nowMs: number): string {
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) {
    return "Starting now";
  }

  // Ceiling to the next whole minute
  const totalMinutes = Math.max(1, Math.ceil(diffMs / (60 * 1000)));

  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (minutes > 0) {
    // When days > 0 and hours > 0, standard style shows days + hours (e.g. "1 day 6 hours", "2 days 4 hours")
    // When days === 0 or hours === 0, include minutes (e.g. "5 hours 23 minutes", "42 minutes", "1 day 30 minutes")
    if (days === 0 || hours === 0) {
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    }
  }

  if (parts.length === 0) {
    return "Starts in 1 minute";
  }

  return `Starts in ${parts.join(" ")}`;
}

export type UnifiedPlannerEvent = {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // "HH:mm" (24h) or "Anytime"
  displayTime: string; // Formatted 24h or 12h for UI display
  endTime?: string;
  type: "class" | "task" | "study";
  targetDateTimeMs: number;
  room?: string;
  lecturer?: string;
  subjectCode?: string;
  classType?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  originalTask?: StudyTask;
  originalClass?: PlannerClass;
};

export type GroupedPlannerEvents = {
  dateKey: string;
  label: string; // "Today", "Tomorrow", "Wednesday, September 2"
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  events: UnifiedPlannerEvent[];
};

/**
 * Builds normalized, unified list of upcoming scheduled events for the Study Planner.
 * Filters strictly to events where eventDateTime > currentDateTime.
 */
export function getUpcomingEvents(
  classes: PlannerClass[] = [],
  tasks: StudyTask[] = [],
  now: Date = new Date(),
): UnifiedPlannerEvent[] {
  const nowMs = now.getTime();
  const yangon = getYangonParts(now);
  const todayIso = yangon.isoDate;

  const events: UnifiedPlannerEvent[] = [];

  // 1. Process weekly timetable classes (find next future occurrence in the 7-day rolling window)
  for (const c of classes) {
    for (let offset = 0; offset <= 7; offset += 1) {
      const targetDate = addDaysToIsoDate(todayIso, offset);
      const targetDay = weekdayOfIsoDate(targetDate);
      if (targetDay === c.day) {
        const targetMs = yangonDateTimeToMs(targetDate, c.startTime);
        // An event belongs in Upcoming only when its scheduled datetime is still in the future
        if (targetMs > nowMs) {
          const displayStart = formatTime12(c.startTime);
          const displayEnd = c.endTime ? formatTime12(c.endTime) : "";
          events.push({
            id: `class-${c.subjectCode}-${c.day}-${c.startTime}-${targetDate}`,
            title: `${c.subjectName} (${c.subjectCode})`,
            subtitle: `Room ${c.room} · ${c.type}${displayEnd ? ` · ends ${displayEnd}` : ""}`,
            date: targetDate,
            time: c.startTime,
            displayTime: displayStart,
            endTime: displayEnd,
            type: "class",
            targetDateTimeMs: targetMs,
            room: c.room,
            lecturer: c.lecturer,
            subjectCode: c.subjectCode,
            classType: c.type,
            originalClass: c,
          });
          // Found the next upcoming occurrence of this weekly class
          break;
        }
      }
    }
  }

  // 2. Process study tasks
  for (const t of tasks) {
    if (t.status === "completed") continue;
    if (!t.dueDate) continue; // Unscheduled tasks are kept in task list, not upcoming timeline

    const targetMs = t.dueTime
      ? yangonDateTimeToMs(t.dueDate, t.dueTime)
      : yangonDateTimeToMs(t.dueDate, "23:59:59");

    if (targetMs > nowMs) {
      events.push({
        id: `task-${t.id}`,
        title: t.title,
        subtitle: t.description || `Priority: ${t.priority}`,
        date: t.dueDate,
        time: t.dueTime ?? "Anytime",
        displayTime: t.dueTime ? formatTime12(t.dueTime) : "Anytime",
        type: "task",
        targetDateTimeMs: targetMs,
        priority: t.priority,
        status: t.status,
        originalTask: t,
      });
    }
  }

  // Sort all events chronologically: earliest upcoming first
  events.sort((a, b) => a.targetDateTimeMs - b.targetDateTimeMs);

  return events;
}

/**
 * Groups upcoming events by day (Today, Tomorrow, etc.).
 */
export function groupUpcomingEvents(
  events: UnifiedPlannerEvent[],
  now: Date = new Date(),
): GroupedPlannerEvents[] {
  const yangon = getYangonParts(now);
  const todayIso = yangon.isoDate;
  const tomorrowIso = addDaysToIsoDate(todayIso, 1);

  const groups: GroupedPlannerEvents[] = [];

  for (const event of events) {
    let group = groups.find((g) => g.dateKey === event.date);
    if (!group) {
      const isToday = event.date === todayIso;
      const isTomorrow = event.date === tomorrowIso;
      let label = formatGroupDate(event.date);
      if (isToday) label = "Today";
      else if (isTomorrow) label = "Tomorrow";

      group = {
        dateKey: event.date,
        label,
        formattedDate: formatGroupDate(event.date),
        isToday,
        isTomorrow,
        events: [],
      };
      groups.push(group);
    }
    group.events.push(event);
  }

  return groups;
}
