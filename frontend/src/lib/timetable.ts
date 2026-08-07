import type { TimetableEntry } from "@/api/timetableApi";

export type TimetableState = {
  today: TimetableEntry[];
  current: TimetableEntry | null;
  nextToday: TimetableEntry | null;
  remaining: TimetableEntry[];
  nextUpcoming: TimetableEntry | null;
  nextUpcomingDay: string | null;
  isBreak: boolean;
  breakLabel: "Break" | "Lunch break";
  hasFinishedToday: boolean;
};

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesUntil(minutes: number) {
  if (minutes <= 0) return "now";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function getTimetableState(entries: TimetableEntry[], now: Date): TimetableState {
  const todayName = weekdayNames[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const byStart = (a: TimetableEntry, b: TimetableEntry) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  const today = entries.filter((entry) => entry.day === todayName).sort(byStart);
  const current = today.find((entry) => timeToMinutes(entry.startTime) <= currentMinutes && currentMinutes < timeToMinutes(entry.endTime)) ?? null;
  const nextToday = today.find((entry) => timeToMinutes(entry.startTime) > currentMinutes) ?? null;
  // The active class is represented separately. Remaining means classes that
  // have not started yet, so dashboard widgets do not show the same class twice.
  const remaining = today.filter((entry) => timeToMinutes(entry.startTime) > currentMinutes);
  const hasFinishedToday = today.length === 0 || today.every((entry) => timeToMinutes(entry.endTime) <= currentMinutes);
  let nextUpcoming = nextToday;
  let nextUpcomingDay = nextToday ? todayName : null;
  if (!nextUpcoming) {
    for (let offset = 1; offset <= 7; offset += 1) {
      const day = weekdayNames[(now.getDay() + offset) % 7];
      const first = entries.filter((entry) => entry.day === day).sort(byStart)[0];
      if (first) { nextUpcoming = first; nextUpcomingDay = day; break; }
    }
  }
  // A break exists only after at least one class has ended and before the next
  // class starts. Before the first class, this is simply the start of the day.
  const isBreak = !current && Boolean(nextToday) && today.some((entry) => timeToMinutes(entry.endTime) <= currentMinutes);
  const previous = [...today].reverse().find((entry) => timeToMinutes(entry.endTime) <= currentMinutes);
  const breakDuration = previous && nextToday
    ? timeToMinutes(nextToday.startTime) - timeToMinutes(previous.endTime)
    : 0;
  const breakLabel = breakDuration >= 30 ? "Lunch break" : "Break";
  return { today, current, nextToday, remaining, nextUpcoming, nextUpcomingDay, isBreak, breakLabel, hasFinishedToday };
}
