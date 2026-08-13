import apiClient from "./apiClient";

export type PlannerClass = {
  day: string;
  subjectCode: string;
  subjectName: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
};

export type PlannerMaterial = {
  id: number;
  title: string;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  uploadedAt: string;
  hasSummary: boolean;
  hasNotes: boolean;
  hasFlashcards: boolean;
  hasQuiz: boolean;
};

export type PlannerQuiz = {
  id: number;
  title: string;
  completedAttempts: number;
  bestScorePercent: number | null;
  completed: boolean;
};

export type PlannerFlashcard = {
  id: number;
  deckId: number;
  title: string;
  total: number;
  learned: number;
};

export type PlannerResource = {
  id: number;
  title: string;
  type: "summary" | "notes";
  updatedAt: string;
};

export type Recommendation = {
  id: string;
  title: string;
  detail: string;
  type: "material" | "quiz" | "flashcards" | "task" | "process";
  priority: number;
  targetId: number | null;
  dueDate: string | null;
  dueTime: string | null;
};

export type PlannerData = {
  classes: PlannerClass[];
  materials: PlannerMaterial[];
  quizzes: PlannerQuiz[];
  flashcards: PlannerFlashcard[];
  summaries: PlannerResource[];
  notes: PlannerResource[];
  tasks: StudyTask[];
  recommendations: Recommendation[];
};

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "completed";

export type StudyTask = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type StudyTaskInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority: TaskPriority;
  status?: TaskStatus;
};

export async function getPlanner() {
  const response = await apiClient.get<PlannerData>("/api/planner");
  return response.data;
}

export async function getStudyTasks() {
  const response = await apiClient.get<StudyTask[]>("/api/study-tasks");
  return response.data;
}

export async function createStudyTask(task: StudyTaskInput) {
  const response = await apiClient.post<StudyTask>("/api/study-tasks", task);
  return response.data;
}

export async function updateStudyTask(id: number, task: StudyTaskInput) {
  const response = await apiClient.put<StudyTask>(`/api/study-tasks/${id}`, task);
  return response.data;
}

export async function toggleStudyTask(id: number) {
  const response = await apiClient.put<StudyTask>(`/api/study-tasks/${id}/toggle`);
  return response.data;
}

export async function deleteStudyTask(id: number) {
  await apiClient.delete(`/api/study-tasks/${id}`);
}
