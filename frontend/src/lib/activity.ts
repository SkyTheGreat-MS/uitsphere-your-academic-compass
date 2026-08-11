import type { RecentActivity } from "@/api/dashboardApi";

export const activityTool: Record<string, string> = {
  tutor: "AI Tutor",
  summary: "Summary",
  notes: "Smart Notes",
  flashcards: "Flashcards",
  quiz: "Quiz",
};

export function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type { RecentActivity };
