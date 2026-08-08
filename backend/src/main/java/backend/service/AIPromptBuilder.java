package backend.service;

import org.springframework.stereotype.Component;

@Component
public class AIPromptBuilder {

    public String buildSummaryPrompt() {
        return """
                Create a structured university study summary from the lecture material provided.
                Return plain text using exactly these clear headings:
                Lecture title
                Overview
                Main concepts
                Important definitions
                Key points
                Exam-focused notes
                Use concise bullet points. Do not invent information not present in the lecture material.
                """;
    }

    public String buildSmartNotesPrompt() {
        return """
                Generate concise, structured university study notes from the lecture material provided.
                Return plain text using exactly these headings:
                # Title
                ## Overview
                ## Key Concepts
                ## Definitions
                ## Important Points
                ## Examples
                ## Exam Tips
                Use bullet lists where appropriate. Definitions should use “Term → explanation”.
                Keep the notes suitable for revision and do not invent information not present in the material.
                """;
    }

    public String buildFlashcardPrompt() {
        return """
                Generate revision flashcards from the lecture material provided.

                Requirements:
                - Generate between 15 and 25 flashcards.
                - Each card must contain:
                    Question
                    Answer
                    Difficulty
                - Use JSON only.

                Return exactly:

                [
                  {
                    "question": "",
                    "answer": "",
                    "difficulty": "EASY"
                  }
                ]

                Rules:
                - Questions should test understanding.
                - Avoid yes/no questions.
                - Keep answers concise.
                - Cover the entire lecture.
                - Mix factual recall and conceptual understanding.
                - Use only EASY, MEDIUM or HARD.

                No markdown.
                No explanations.
                Only JSON.
                """;
    }

    public String buildQuizPrompt(int questionCount) {
        return """
                Generate university-level multiple-choice questions from the lecture material provided.
                Return JSON only.

                Format:

                [
                  {
                    "question": "Question text",
                    "options": [
                      "Option A",
                      "Option B",
                      "Option C",
                      "Option D"
                    ],
                    "correctIndex": 0,
                    "explanation": "Brief explanation of why this answer is correct.",
                    "difficulty": "MEDIUM"
                  }
                ]

                Rules:
                - Generate exactly %d questions.
                - Every question must have exactly four options.
                - Only one option may be correct.
                - Questions must be answerable from the supplied lecture material.
                - Cover different concepts from the material.
                - Mix EASY, MEDIUM and HARD questions.
                - Avoid duplicate questions.
                - Avoid questions where multiple answers could reasonably be correct.
                - correctIndex is the zero-based index of the correct option within the options array.
                - Do not invent information outside the supplied material.
                - Keep explanations concise.
                - Use difficulty values EASY, MEDIUM or HARD only.
                - Return valid JSON only.
                - No markdown.
                - No additional text.
                """.formatted(questionCount);
    }

    public String buildMockExamPrompt() {
        return "Generate a structured university mock exam from the lecture material. Return valid JSON only.";
    }
}
