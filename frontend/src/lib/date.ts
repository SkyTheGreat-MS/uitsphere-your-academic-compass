export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatFullDate(value: string) {
  const date = fromISODate(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Formats a 24-hour time string ("HH:mm" or "HH:mm:ss") or Date object into
 * consistent 12-hour time with AM/PM (e.g. "1:40 PM", "8:30 AM", "12:15 AM", "12:00 PM").
 */
export function formatTime12(time: string | Date | null | undefined): string {
  if (!time) return "";
  if (time instanceof Date) {
    if (Number.isNaN(time.getTime())) return "";
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minuteStr = String(minutes).padStart(2, "0");
    return `${hours}:${minuteStr} ${ampm}`;
  }

  const str = String(time).trim();
  if (!str) return "";

  // Check if string contains an ISO datetime (contains 'T' or space with year)
  if (str.includes("T") || (str.includes("-") && str.length > 10)) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) {
      return formatTime12(d);
    }
  }

  // Parse "HH:mm" or "HH:mm:ss" or "H:mm"
  const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const minuteStr = String(minutes).padStart(2, "0");
      return `${hours}:${minuteStr} ${ampm}`;
    }
  }

  return str;
}

/**
 * Formats a start and end time into a 12-hour range (e.g. "8:30 AM – 10:00 AM").
 */
export function formatTimeRange12(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const s = formatTime12(start);
  const e = formatTime12(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

/**
 * Formats a date + time string or Date into "MMM d, h:mm a" (e.g. "Sep 1, 1:40 PM").
 */
export function formatDateTime12(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return typeof value === "string" ? value : "";
  const month = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = formatTime12(d);
  return `${month}, ${time}`;
}
