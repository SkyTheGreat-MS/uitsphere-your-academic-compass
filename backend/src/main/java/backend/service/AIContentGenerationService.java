package backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIContentGenerationService {

    private final MaterialContextService materialContextService;
    private final GroqService groqService;
    private final AIPromptBuilder promptBuilder;

    public AIContentGenerationService(
            MaterialContextService materialContextService,
            GroqService groqService,
            AIPromptBuilder promptBuilder) {
        this.materialContextService = materialContextService;
        this.groqService = groqService;
        this.promptBuilder = promptBuilder;
    }

    public String generateSummary(List<Long> materialIds) {
        return generate(promptBuilder.buildSummaryPrompt(), materialIds);
    }

    public String generateSmartNotes(List<Long> materialIds) {
        return generate(promptBuilder.buildSmartNotesPrompt(), materialIds);
    }

    public String generateFlashcards(List<Long> materialIds) {
        return generate(promptBuilder.buildFlashcardPrompt(), materialIds);
    }

    public String generateQuiz(List<Long> materialIds) {
        return generate(promptBuilder.buildQuizPrompt(10), materialIds);
    }

    public String generateQuiz(List<Long> materialIds, int questionCount) {
        return generate(promptBuilder.buildQuizPrompt(questionCount), materialIds);
    }

    public String generateMockExam(List<Long> materialIds) {
        return generate(promptBuilder.buildMockExamPrompt(), materialIds);
    }

    private String generate(String prompt, List<Long> materialIds) {
        if (materialIds == null || materialIds.isEmpty()) {
            throw new LearningMaterialException("Select at least one learning material.");
        }
        List<Long> distinctIds = materialIds.stream().distinct().toList();
        String context = materialContextService.getMaterialContext(distinctIds);
        if (context == null || context.isBlank()) {
            throw new LearningMaterialException("Selected learning materials have no extracted text.");
        }
        String content = groqService.ask(prompt, context);
        if (content == null || content.isBlank()) {
            throw new GroqServiceException("AI returned an empty response.");
        }
        return content.strip();
    }
}
