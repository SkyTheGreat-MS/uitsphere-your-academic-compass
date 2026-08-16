package backend.controller;

import backend.dto.ClaimRequest;
import backend.dto.ClaimResponse;
import backend.dto.LostFoundPostRequest;
import backend.dto.LostFoundPostResponse;
import backend.dto.MessageRequest;
import backend.dto.MessageResponse;
import backend.service.LostFoundService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lost-found")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    public LostFoundController(LostFoundService lostFoundService) {
        this.lostFoundService = lostFoundService;
    }

    @GetMapping
    public List<LostFoundPostResponse> browse(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {
        return lostFoundService.browse(type, q, category);
    }

    @GetMapping("/mine")
    public List<LostFoundPostResponse> myReports() {
        return lostFoundService.myReports();
    }

    @PostMapping
    public LostFoundPostResponse create(
            @RequestParam String type,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam String location,
            @RequestParam(required = false) String dateOccurred,
            @RequestParam(required = false) MultipartFile file) {
        LostFoundPostRequest request = new LostFoundPostRequest(type, title, description, category, location, dateOccurred);
        return lostFoundService.create(request, file);
    }

    @PutMapping("/{id}")
    public LostFoundPostResponse update(
            @PathVariable Long id,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String dateOccurred,
            @RequestParam(required = false) MultipartFile file) {
        LostFoundPostRequest request = new LostFoundPostRequest(type, title, description, category, location, dateOccurred);
        return lostFoundService.update(id, request, file);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lostFoundService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/returned")
    public LostFoundPostResponse markReturned(@PathVariable Long id) {
        return lostFoundService.markReturned(id);
    }

    @GetMapping("/{id}/claims")
    public List<ClaimResponse> claimsForPost(@PathVariable Long id) {
        return lostFoundService.claimsForPost(id);
    }

    @PostMapping("/{id}/claims")
    public ClaimResponse submitClaim(@PathVariable Long id, @RequestBody ClaimRequest request) {
        return lostFoundService.submitClaim(id, request);
    }

    @GetMapping("/claims/mine")
    public List<ClaimResponse> myClaims() {
        return lostFoundService.myClaims();
    }

    @PutMapping("/claims/{claimId}/accept")
    public ClaimResponse acceptClaim(@PathVariable Long claimId) {
        return lostFoundService.acceptClaim(claimId);
    }

    @PutMapping("/claims/{claimId}/reject")
    public ClaimResponse rejectClaim(@PathVariable Long claimId) {
        return lostFoundService.rejectClaim(claimId);
    }

    @GetMapping("/claims/{claimId}/messages")
    public List<MessageResponse> messagesForClaim(@PathVariable Long claimId) {
        return lostFoundService.messagesForClaim(claimId);
    }

    @PostMapping("/claims/{claimId}/messages")
    public MessageResponse sendMessage(@PathVariable Long claimId, @RequestBody MessageRequest request) {
        return lostFoundService.sendMessage(claimId, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {
    }
}