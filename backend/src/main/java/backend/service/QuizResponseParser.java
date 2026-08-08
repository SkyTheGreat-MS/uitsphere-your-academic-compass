package backend.service;

import backend.entity.QuizCorrectOption;
import backend.entity.QuizDifficulty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class QuizResponseParser {

    public record ParsedQuestion(
            String question,
            List<String> options,
            QuizCorrectOption correctOption,
            String explanation,
            QuizDifficulty difficulty) {
    }

    private final ObjectMapper objectMapper;

    public QuizResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<ParsedQuestion> parse(String rawContent, int expectedCount) {
        if (rawContent == null || rawContent.isBlank()) {
            throw new QuizGenerationException("AI returned an empty quiz response.");
        }

        String content = stripJsonFences(rawContent);
        JsonNode root;
        try {
            root = objectMapper.readTree(content);
        } catch (JsonProcessingException ex) {
            throw new QuizGenerationException("AI returned quiz questions that could not be parsed as JSON.", ex);
        }

        if (root == null || !root.isArray()) {
            throw new QuizGenerationException("AI quiz response must be a JSON array.");
        }

        List<ParsedQuestion> questions = new ArrayList<>();
        for (JsonNode node : root) {
            String question = textField(node, "question");
            JsonNode optionsNode = node == null ? null : node.get("options");
            List<String> options = optionsNode != null && optionsNode.isArray()
                    ? toStrings(optionsNode)
                    : List.of();
            QuizCorrectOption correctOption = parseCorrectOption(node.get("correctIndex"));
            String explanation = textField(node, "explanation");
            QuizDifficulty difficulty = parseDifficulty(node.get("difficulty"));

            if (question == null || question.isBlank()
                    || options.size() != 4
                    || options.stream().anyMatch(option -> option == null || option.isBlank())
                    || correctOption == null
                    || explanation == null || explanation.isBlank()
                    || difficulty == null) {
                throw new QuizGenerationException(
                        "AI returned a question with missing text, fewer than four options, "
                                + "an invalid correct option or an invalid difficulty.");
            }

            questions.add(new ParsedQuestion(question, options, correctOption, explanation, difficulty));
        }

        if (questions.isEmpty()) {
            throw new QuizGenerationException("AI returned no quiz questions.");
        }

        if (questions.size() != expectedCount) {
            throw new QuizGenerationException(
                    "AI returned " + questions.size() + " questions instead of the requested " + expectedCount + ".");
        }

        return questions;
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

    private List<String> toStrings(JsonNode array) {
        List<String> values = new ArrayList<>();
        for (JsonNode item : array) {
            values.add(item == null || item.isNull() ? null : item.asText());
        }
        return values;
    }

    private QuizCorrectOption parseCorrectOption(JsonNode value) {
        if (value == null || value.isNull() || !value.canConvertToInt()) return null;
        int index = value.asInt();
        if (index < 0 || index > 3) return null;
        return QuizCorrectOption.values()[index];
    }

    private QuizDifficulty parseDifficulty(JsonNode value) {
        if (value == null || value.isNull() || !value.isTextual()) return null;
        try {
            return QuizDifficulty.valueOf(value.asText().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}