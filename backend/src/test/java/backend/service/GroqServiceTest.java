package backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroqServiceTest {

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private GroqService groqService;

    @BeforeEach
    void setUp() {
        groqService = new GroqService(
                restClient,
                objectMapper,
                "dummy-api-key",
                "openai/gpt-oss-120b"
        );
    }

    @Test
    void throwsExceptionWhenApiKeyIsMissing() {
        GroqService unconfigured = new GroqService(restClient, objectMapper, "", "openai/gpt-oss-120b");

        assertThatThrownBy(() -> unconfigured.ask("Question", null))
                .isInstanceOf(GroqServiceException.class)
                .hasMessage("Groq API key is not configured.");
    }

    @Test
    void parsesAndReturnsAssistantMessageOnSuccessfulResponse() {
        String mockResponse = """
                {
                    "choices": [
                        {
                            "message": {
                                "role": "assistant",
                                "content": "Polymorphism enables objects to be treated as instances of their parent class."
                            }
                        }
                    ]
                }
                """;

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.header(eq("Authorization"), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toEntity(String.class)).thenReturn(ResponseEntity.ok(mockResponse));

        String answer = groqService.ask("What is polymorphism?", "OOP lecture context");

        assertThat(answer).isEqualTo("Polymorphism enables objects to be treated as instances of their parent class.");
    }

    @Test
    void wrapsRestClientResponseExceptionWithStatusAndBody() {
        String errorResponseBody = "{\"error\":{\"message\":\"model_not_found\",\"code\":\"model_not_found\"}}";
        HttpClientErrorException exception = HttpClientErrorException.create(
                HttpStatusCode.valueOf(404),
                "Not Found",
                HttpHeaders.EMPTY,
                errorResponseBody.getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.header(eq("Authorization"), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toEntity(String.class)).thenThrow(exception);

        assertThatThrownBy(() -> groqService.ask("Question", null))
                .isInstanceOf(GroqServiceException.class)
                .hasMessageContaining("Groq request failed with HTTP 404")
                .hasMessageContaining("model_not_found");
    }
}
