package backend.service;

import backend.entity.FlashcardDifficulty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FlashcardResponseParser {

    public record ParsedFlashcard(String question, String answer, FlashcardDifficulty difficulty) {
    }

    private final ObjectMapper objectMapper;

    public FlashcardResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<ParsedFlashcard> parse(String rawContent) {
        if (rawContent == null || rawContent.isBlank()) {
            throw new FlashcardGenerationException("AI returned an empty flashcard response.");
        }

        String content = stripJsonFences(rawContent);
        JsonNode root;
        try {
            root = objectMapper.readTree(content);
        } catch (JsonProcessingException ex) {
            throw new FlashcardGenerationException("AI returned flashcards that could not be parsed as JSON.", ex);
        }

        if (root == null || !root.isArray()) {
            throw new FlashcardGenerationException("AI flashcard response must be a JSON array.");
        }

        List<ParsedFlashcard> cards = new ArrayList<>();
        for (JsonNode node : root) {
            String question = textField(node, "question");
            String answer = textField(node, "answer");
            FlashcardDifficulty difficulty = parseDifficulty(node.get("difficulty"));

            if (question == null || question.isBlank()
                    || answer == null || answer.isBlank()
                    || difficulty == null) {
                throw new FlashcardGenerationException("AI returned a flashcard with missing question, answer or difficulty.");
            }

            cards.add(new ParsedFlashcard(question, answer, difficulty));
        }

        if (cards.isEmpty()) {
            throw new FlashcardGenerationException("AI returned no flashcards.");
        }

        return cards;
    }

    private String stripJsonFences(String content) {
        String stripped = content.strip();
        if (stripped.startsWith("```")) {
            int firstNewline = stripped.indexOf('\n');
            stripped = firstNewline >= 0 ? stripped.substring(firstNewline + 1) : stripped.substring(3);
            if (stripped.endsWith("```")) {
                stripped = stripped.substring(0, stripped.length() - 3);
            }
            stripped = stripped.strip();
        }
        return stripped;
    }

    private String textField(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        if (value == null || value.isNull() || !value.isTextual()) return null;
        return value.asText();
    }

    private FlashcardDifficulty parseDifficulty(JsonNode value) {
        if (value == null || value.isNull() || !value.isTextual()) return null;
        try {
            return FlashcardDifficulty.valueOf(value.asText().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}