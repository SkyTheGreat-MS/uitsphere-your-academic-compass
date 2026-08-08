package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration
public class AiRequestLoggingConfig {

    @Bean
    public CommonsRequestLoggingFilter aiRequestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter() {
            @Override
            protected boolean shouldLog(jakarta.servlet.http.HttpServletRequest request) {
                return "/ai/chat".equals(request.getRequestURI())
                        && "POST".equalsIgnoreCase(request.getMethod());
            }
        };
        filter.setIncludeQueryString(false);
        filter.setIncludePayload(true);
        filter.setMaxPayloadLength(10_000);
        filter.setIncludeHeaders(false);
        filter.setBeforeMessagePrefix("Incoming AI request: ");
        filter.setAfterMessagePrefix("Completed AI request: ");
        filter.setIncludeClientInfo(false);
        return filter;
    }
}
