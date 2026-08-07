package backend.service.impl;

import backend.service.OcrService;
import backend.service.OcrServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;

@Service
public class OcrServiceImpl implements OcrService {

    private final RestClient restClient;
    private final String ocrServiceUrl;

    public OcrServiceImpl(@Value("${ocr.service.url}") String ocrServiceUrl) {
        this.restClient = RestClient.builder().build();
        this.ocrServiceUrl = ocrServiceUrl;
    }

    @Override
    public String extractText(MultipartFile file) {
        try {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return Objects.requireNonNullElse(file.getOriginalFilename(), "upload");
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            ResponseEntity<OcrResponse> response = restClient.post()
                    .uri(ocrServiceUrl)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .toEntity(OcrResponse.class);

            String text = response.getBody() == null ? "" : response.getBody().text();
            return text == null ? "" : text.strip();
        } catch (IOException | RestClientException ex) {
            throw new OcrServiceException("Unable to process image text currently.", ex);
        }
    }

    private record OcrResponse(String text) {
    }
}
