import apiClient from "./apiClient";

export type QuizOption = "A" | "B" | "C" | "D";
export type QuizDifficulty = "EASY" | "MEDIUM" | "HARD";

export type Quiz = {
  id: number;
  studentId: number;
  title: string;
  materialIds: number[];
  questionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type QuizQuestion = {
  id: number;
  quizId: number;
  question: string;
  options: string[];
  correctOption: QuizOption;
  explanation: string;
  difficulty: QuizDifficulty;
  order: number;
};

export type QuizDetail = {
  quiz: Quiz;
  questions: QuizQuestion[];
};

export type QuizAttemptStart = {
  attemptId: number;
  quizId: number;
  totalQuestions: number;
  startedAt: string;
};

export type QuizAnswerResult = {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOption: QuizOption;
  correct: boolean;
};

export type QuizReviewItem = {
  questionId: number;
  question: string;
  selectedOption: QuizOption | null;
  correctOption: QuizOption;
  correct: boolean;
  explanation: string;
};

export type QuizResult = {
  attemptId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  startedAt: string;
  completedAt: string;
  review: QuizReviewItem[];
};

export type QuizAttemptSummary = {
  attemptId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string;
};

export async function generateQuiz(materialIds: number[], questionCount: number) {
  const response = await apiClient.post<QuizDetail>("/api/ai/quiz/generate", {
    materialIds,
    questionCount,
  });
  return response.data;
}

export async function getQuizzes() {
  const response = await apiClient.get<Quiz[]>("/api/ai/quiz");
  return response.data;
}

export async function getQuiz(quizId: number) {
  const response = await apiClient.get<QuizDetail>(`/api/ai/quiz/${quizId}`);
  return response.data;
}

export async function deleteQuiz(quizId: number) {
  await apiClient.delete(`/api/ai/quiz/${quizId}`);
}

export async function getQuizAttempts(quizId: number) {
  const response = await apiClient.get<QuizAttemptSummary[]>(`/api/ai/quiz/${quizId}/attempts`);
  return response.data;
}

export async function startQuizAttempt(quizId: number) {
  const response = await apiClient.post<QuizAttemptStart>(`/api/ai/quiz/${quizId}/attempt`);
  return response.data;
}

export async function submitAnswer(
  attemptId: number,
  questionId: number,
  selectedOption: QuizOption,
) {
  const response = await apiClient.post<QuizAnswerResult>(`/api/ai/quiz/attempt/${attemptId}/answer`, {
    questionId,
    selectedOption,
  });
  return response.data;
}

export async function completeQuizAttempt(attemptId: number) {
  const response = await apiClient.post<QuizResult>(`/api/ai/quiz/attempt/${attemptId}/complete`);
  return response.data;
}