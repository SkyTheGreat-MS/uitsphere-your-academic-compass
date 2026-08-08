package backend.service;

import backend.entity.LearningMaterialFileType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Path;

@Service
public class DocumentProcessingService {

    private static final String OCR_NOT_CONFIGURED = "OCR processing is not configured yet.";
    private static final Logger log = LoggerFactory.getLogger(DocumentProcessingService.class);

    private final PdfTextExtractionService pdfTextExtractionService;
    private final OcrService ocrService;

    public DocumentProcessingService(
            PdfTextExtractionService pdfTextExtractionService,
            OcrService ocrService) {
        this.pdfTextExtractionService = pdfTextExtractionService;
        this.ocrService = ocrService;
    }

    public ProcessingResult process(
            MultipartFile uploadedFile,
            Path storedFile,
            LearningMaterialFileType fileType,
            Long materialId) {
        if (fileType == LearningMaterialFileType.PDF) {
            String extractedText = pdfTextExtractionService.extractText(storedFile);
            if (!extractedText.isBlank()) {
                return ProcessingResult.ready(extractedText);
            }
        }

        if (fileType == LearningMaterialFileType.IMAGE) {
            log.info("[OCR] Starting extraction for materialId={}", materialId);
            log.info("[OCR] File type={}", uploadedFile.getContentType());
            String ocrText = ocrService.extractText(uploadedFile);
            if (ocrText != null && !ocrText.isBlank()) {
                log.info("[OCR] Extracted characters={}", ocrText.length());
                return ProcessingResult.ready(ocrText);
            }
            log.warn("[OCR] Extracted no text for materialId={}", materialId);
            return ProcessingResult.failed(
                    OCR_NOT_CONFIGURED.equals(ocrText)
                            ? OCR_NOT_CONFIGURED
                            : "OCR did not detect any text.");
        }

        if (fileType == LearningMaterialFileType.PDF) {
            String ocrText = ocrService.extractText(uploadedFile);
            if (ocrText != null && !ocrText.isBlank()) {
                return ProcessingResult.ready(ocrText);
            }
            return ProcessingResult.failed("PDF contains no extractable text.");
        }

        return ProcessingResult.failed("Text extraction is not configured for this file type.");
    }

    public record ProcessingResult(String extractedText, boolean successful, String message) {

        private static ProcessingResult ready(String extractedText) {
            return new ProcessingResult(extractedText, true, null);
        }

        private static ProcessingResult failed(String message) {
            return new ProcessingResult("", false, message);
        }
    }
}
