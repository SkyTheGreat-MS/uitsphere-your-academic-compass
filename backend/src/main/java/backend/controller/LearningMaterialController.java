package backend.controller;

import backend.dto.LearningMaterialResponse;
import backend.service.LearningMaterialException;
import backend.service.LearningMaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/materials")
public class LearningMaterialController {

    private final LearningMaterialService materialService;

    public LearningMaterialController(LearningMaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping("/upload")
    public LearningMaterialResponse upload(@RequestParam("file") MultipartFile file) {
        return materialService.upload(file);
    }

    @GetMapping
    public List<LearningMaterialResponse> getMaterials() {
        return materialService.getMaterials();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<ErrorResponse> handleMaterialError(LearningMaterialException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {
    }
}
