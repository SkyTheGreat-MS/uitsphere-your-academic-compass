package backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GroqConfig {

    private static final Logger log = LoggerFactory.getLogger(GroqConfig.class);

    @Bean
    public RestClient groqRestClient(@Value("${groq.api.url}") String apiUrl) {
        log.info("Groq URL configured: {}", apiUrl);
        return RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }
}
