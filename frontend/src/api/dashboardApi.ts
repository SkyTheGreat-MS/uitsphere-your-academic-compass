import apiClient from "./apiClient";
import type { LearningMaterial } from "./materialsApi";

export type QuizStats = {
  completed: number;
  averageScore: number;
  bestScore: number;
  latestResult: {
    quizTitle: string;
    scorePercent: number;
    completedAt: string;
  } | null;
};

export type FlashcardStats = {
  decks: number;
  total: number;
  learned: number;
};

export type RecentActivity = {
  id: string;
  type: "tutor" | "summary" | "notes" | "flashcards" | "quiz";
  label: string;
  at: string;
};

export type StudyProgress = {
  overall: number | null;
  components: { label: string; percent: number }[];
};

export type DashboardData = {
  quizStats: QuizStats;
  flashcardStats: FlashcardStats;
  recentMaterials: LearningMaterial[];
  recentActivity: RecentActivity[];
  studyProgress: StudyProgress;
};

export async function getDashboard() {
  const response = await apiClient.get<DashboardData>("/api/dashboard");
  return response.data;
}