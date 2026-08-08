import apiClient from "./apiClient";

export type FlashcardDifficulty = "EASY" | "MEDIUM" | "HARD";

export type Flashcard = {
  id: number;
  deckId: number;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  order: number;
  learned: boolean;
};

export type FlashcardDeck = {
  id: number;
  studentId: number;
  title: string;
  materialIds: number[];
  cardCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardDeckDetail = {
  deck: FlashcardDeck;
  cards: Flashcard[];
  learnedCount: number;
};

export async function generateFlashcards(materialIds: number[]) {
  const response = await apiClient.post<FlashcardDeckDetail>("/api/ai/flashcards/generate", {
    materialIds,
  });
  return response.data;
}

export async function getFlashcardDecks() {
  const response = await apiClient.get<FlashcardDeck[]>("/api/ai/flashcards");
  return response.data;
}

export async function getFlashcardDeck(deckId: number) {
  const response = await apiClient.get<FlashcardDeckDetail>(`/api/ai/flashcards/${deckId}`);
  return response.data;
}

export async function deleteFlashcardDeck(deckId: number) {
  await apiClient.delete(`/api/ai/flashcards/${deckId}`);
}

export async function markFlashcardLearned(flashcardId: number, learned: boolean) {
  const response = await apiClient.post("/api/ai/flashcards/progress", { flashcardId, learned });
  return response.data;
}