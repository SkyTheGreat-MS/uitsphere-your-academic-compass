package backend.dto;

import java.util.List;

public record DashboardResponse(
        QuizStats quizStats,
        FlashcardStats flashcardStats,
        List<LearningMaterialResponse> recentMaterials,
        List<RecentActivity> recentActivity,
        StudyProgress studyProgress,
        int studyStreak,
        boolean studiedToday,
        StudyOverview studyOverview) {

    public record QuizStats(
            int completed,
            int averageScore,
            int bestScore,
            LatestResult latestResult) {

        public record LatestResult(String quizTitle, int scorePercent, String completedAt) {
        }
    }

    public record FlashcardStats(int decks, int total, int learned) {
    }

    public record RecentActivity(String id, String type, String label, String at) {
    }

    public record StudyProgress(Integer overall, List<Component> components) {

        public record Component(String label, int percent) {
        }
    }

    public record StudyOverview(
            int learningMaterials,
            int summaries,
            int smartNotes,
            int flashcardDecks,
            int quizzesCompleted,
            int currentStreak) {
    }
}
