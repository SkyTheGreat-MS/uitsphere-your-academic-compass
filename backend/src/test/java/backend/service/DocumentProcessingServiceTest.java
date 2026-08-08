package backend.service;

import backend.entity.LearningMaterialFileType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentProcessingServiceTest {

    @Mock
    private PdfTextExtractionService pdfTextExtractionService;

    @Mock
    private OcrService ocrService;

    @Test
    void imageUploadUsesOcrAndReturnsExtractedText() {
        DocumentProcessingService service = new DocumentProcessingService(
                pdfTextExtractionService, ocrService);
        MockMultipartFile image = new MockMultipartFile(
                "file", "lecture.png", "image/png", "visible text".getBytes());
        when(ocrService.extractText(image)).thenReturn("Visible lecture text");

        DocumentProcessingService.ProcessingResult result = service.process(
                image, Path.of("lecture.png"), LearningMaterialFileType.IMAGE, 5L);

        assertThat(result.successful()).isTrue();
        assertThat(result.extractedText()).isEqualTo("Visible lecture text");
        verify(ocrService).extractText(image);
        verify(pdfTextExtractionService, never()).extractText(Path.of("lecture.png"));
    }

    @Test
    void imageUploadFailsMeaningfullyWhenOcrReturnsNoText() {
        DocumentProcessingService service = new DocumentProcessingService(
                pdfTextExtractionService, ocrService);
        MockMultipartFile image = new MockMultipartFile(
                "file", "lecture.jpg", "image/jpeg", "image".getBytes());
        when(ocrService.extractText(image)).thenReturn("");

        DocumentProcessingService.ProcessingResult result = service.process(
                image, Path.of("lecture.jpg"), LearningMaterialFileType.IMAGE, 6L);

        assertThat(result.successful()).isFalse();
        assertThat(result.extractedText()).isEmpty();
        assertThat(result.message()).isEqualTo("OCR did not detect any text.");
    }

    @Test
    void pdfWithEmbeddedTextDoesNotCallOcr() {
        DocumentProcessingService service = new DocumentProcessingService(
                pdfTextExtractionService, ocrService);
        MockMultipartFile pdf = new MockMultipartFile(
                "file", "lecture.pdf", "application/pdf", "pdf".getBytes());
        Path path = Path.of("lecture.pdf");
        when(pdfTextExtractionService.extractText(path)).thenReturn("PDF text");

        DocumentProcessingService.ProcessingResult result = service.process(
                pdf, path, LearningMaterialFileType.PDF, 7L);

        assertThat(result.successful()).isTrue();
        assertThat(result.extractedText()).isEqualTo("PDF text");
        verify(ocrService, never()).extractText(pdf);
    }
}
