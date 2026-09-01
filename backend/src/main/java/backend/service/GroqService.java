package backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GroqService(
            RestClient groqRestClient,
            ObjectMapper objectMapper,
            @Value("${groq.api.key:}") String apiKey,
            @Value("${groq.api.model:openai/gpt-oss-120b}") String model) {
        this.restClient = groqRestClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        log.info("Groq API initialized (model={}, keyConfigured={})", model, (apiKey != null && !apiKey.isBlank()));
    }

    public String ask(String question, String context) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new GroqServiceException("Groq API key is not configured.");
        }

        Map<String, Object> request = new HashMap<>();
        request.put("model", model);
        request.put("temperature", 0.7);

        String prompt = context == null || context.isBlank()
                ? question
                : "You are an AI university tutor.\n"
                        + "Answer using the provided lecture context. "
                        + "If the answer is not found in the lecture, clearly say it is not covered.\n\n"
                        + "Context:\n" + context + "\n\nQuestion:\n" + question;
        request.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        try {
            ResponseEntity<String> response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(request)
                    .retrieve()
                    .toEntity(String.class);

            String responseBody = response.getBody();
            log.debug("Groq HTTP status: {}", response.getStatusCode());

            JsonNode responseJson = objectMapper.readTree(responseBody);

            JsonNode answer = responseJson == null
                    ? null
                    : responseJson.path("choices").path(0).path("message").path("content");

            if (answer == null || answer.isMissingNode() || answer.isNull() || answer.asText().isBlank()) {
                throw new GroqServiceException("Groq returned an empty response.");
            }

            return answer.asText();
        } catch (RestClientResponseException ex) {
            String responseBody = ex.getResponseBodyAsString();
            log.warn("Groq HTTP error: status={}, body={}", ex.getStatusCode(), responseBody);
            throw new GroqServiceException(
                    "Groq request failed with HTTP " + ex.getStatusCode().value()
                            + ". Response body: " + responseBody,
                    ex);
        } catch (JsonProcessingException ex) {
            throw new GroqServiceException("Groq returned invalid JSON.", ex);
        } catch (RestClientException ex) {
            throw new GroqServiceException("Could not connect to Groq.", ex);
        }
    }
}
