package backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class PdfTextExtractionService {

    public String extractText(Path pdfPath) {
        if (!Files.isRegularFile(pdfPath)) {
            throw new LearningMaterialException("Stored lecture file could not be found.");
        }

        try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {
            String text = new PDFTextStripper().getText(document);
            return text == null ? "" : text.strip();
        } catch (IOException ex) {
            throw new LearningMaterialException("Could not extract text from the PDF.", ex);
        }
    }
}
