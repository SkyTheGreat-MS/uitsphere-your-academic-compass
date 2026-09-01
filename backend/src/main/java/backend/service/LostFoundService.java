package backend.service;

import backend.dto.ClaimRequest;
import backend.dto.ClaimResponse;
import backend.dto.LostFoundPostRequest;
import backend.dto.LostFoundPostResponse;
import backend.dto.MessageRequest;
import backend.dto.MessageResponse;
import backend.entity.ClaimMessage;
import backend.entity.ClaimStatus;
import backend.entity.LostFoundClaim;
import backend.entity.LostFoundPost;
import backend.entity.LostFoundStatus;
import backend.entity.LostFoundType;
import backend.entity.Student;
import backend.repository.ClaimMessageRepository;
import backend.repository.LostFoundClaimRepository;
import backend.repository.LostFoundPostRepository;
import backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class LostFoundService {

    private final LostFoundPostRepository postRepository;
    private final LostFoundClaimRepository claimRepository;
    private final ClaimMessageRepository messageRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final Path storageRoot;

    public LostFoundService(LostFoundPostRepository postRepository, LostFoundClaimRepository claimRepository,
            ClaimMessageRepository messageRepository, StudentRepository studentRepository,
            NotificationService notificationService, @Value("${file.upload-dir:uploads}") String storagePath) {
        this.postRepository = postRepository;
        this.claimRepository = claimRepository;
        this.messageRepository = messageRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
        this.storageRoot = Path.of(storagePath).toAbsolutePath().normalize();
    }

    @Transactional(readOnly = true)
    public List<LostFoundPostResponse> browse(String type, String query, String category) {
        Student student = currentStudent();
        List<LostFoundPost> posts = postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> p.getStatus() != LostFoundStatus.CLOSED)
                .filter(p -> type == null || type.isBlank() || p.getType().name().equalsIgnoreCase(type))
                .filter(p -> category == null || category.isBlank() || "all".equalsIgnoreCase(category)
                        || p.getCategory().equalsIgnoreCase(category))
                .filter(p -> matches(p, query))
                .toList();
        return posts.stream()
                .map(p -> LostFoundPostResponse.from(p, student.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LostFoundPostResponse> myReports() {
        Student student = currentStudent();
        return postRepository.findByReporterOrderByCreatedAtDesc(student)
                .stream()
                .map(p -> LostFoundPostResponse.from(p, student.getId()))
                .toList();
    }

    @Transactional
    public LostFoundPostResponse create(LostFoundPostRequest request, MultipartFile file) {
        Student student = currentStudent();
        LostFoundPost post = new LostFoundPost();
        post.setReporter(student);
        apply(post, request);
        post.setStatus(LostFoundStatus.ACTIVE);
        if (file != null && !file.isEmpty()) {
            post.setImageUrl(storeImage(file));
        }
        return LostFoundPostResponse.from(postRepository.save(post), student.getId());
    }

    @Transactional
    public LostFoundPostResponse update(Long id, LostFoundPostRequest request, MultipartFile file) {
        Student student = currentStudent();
        LostFoundPost post = postRepository.findByIdAndReporter(id, student)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        apply(post, request);
        if (file != null && !file.isEmpty()) {
            String previousUrl = post.getImageUrl();
            post.setImageUrl(storeImage(file));
            deleteImageFile(previousUrl);
        }
        return LostFoundPostResponse.from(postRepository.save(post), student.getId());
    }

    @Transactional
    public void delete(Long id) {
        Student student = currentStudent();
        LostFoundPost post = postRepository.findByIdAndReporter(id, student)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        List<LostFoundClaim> claims = claimRepository.findByPostOrderByCreatedAtDesc(post);
        for (LostFoundClaim claim : claims) {
            messageRepository.deleteAll(messageRepository.findByClaimOrderByCreatedAtAsc(claim));
        }
        claimRepository.deleteAll(claims);
        deleteImageFile(post.getImageUrl());
        postRepository.delete(post);
    }

    @Transactional
    public LostFoundPostResponse markReturned(Long id) {
        Student student = currentStudent();
        LostFoundPost post = postRepository.findByIdAndReporter(id, student)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        if (post.getStatus() == LostFoundStatus.RETURNED || post.getStatus() == LostFoundStatus.CLOSED) {
            throw new IllegalArgumentException("This item has already been resolved.");
        }
        post.setStatus(LostFoundStatus.RETURNED);
        LostFoundPostResponse response = LostFoundPostResponse.from(postRepository.save(post), student.getId());

        claimRepository.findByPostAndStatusOrderByCreatedAtDesc(post, ClaimStatus.ACCEPTED)
                .stream()
                .findFirst()
                .ifPresent(claim -> {
                    notificationService.notify(
                            claim.getClaimant(),
                            "item-returned",
                            "Item returned",
                            "\"" + post.getTitle() + "\" has been marked as returned.",
                            "/lost-found?tab=activity");
                    notificationService.notify(
                            student,
                            "item-returned",
                            "Item returned",
                            "\"" + post.getTitle() + "\" was marked as returned.",
                            "/lost-found?tab=activity");
                });
        return response;
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> claimsForPost(Long postId) {
        Student student = currentStudent();
        LostFoundPost post = postRepository.findByIdAndReporter(postId, student)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        return claimRepository.findByPostOrderByCreatedAtDesc(post)
                .stream()
                .map(ClaimResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> myClaims() {
        Student student = currentStudent();
        return claimRepository.findByClaimantOrderByCreatedAtDesc(student)
                .stream()
                .map(ClaimResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClaimResponse getClaim(Long claimId) {
        Student student = currentStudent();
        LostFoundClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        requireParticipant(claim, student);
        return ClaimResponse.from(claim);
    }

    @Transactional
    public ClaimResponse submitClaim(Long postId, ClaimRequest request) {
        Student student = currentStudent();
        LostFoundPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        if (post.getReporter().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You cannot claim your own report.");
        }
        if (post.getStatus() != LostFoundStatus.ACTIVE) {
            throw new IllegalArgumentException("This item can no longer be claimed.");
        }
        LostFoundClaim claim = new LostFoundClaim();
        claim.setPost(post);
        claim.setClaimant(student);
        claim.setMessage(request.message());
        claim.setDetails(request.details());
        claim.setStatus(ClaimStatus.PENDING);
        LostFoundClaim saved = claimRepository.save(claim);

        notificationService.notify(
                post.getReporter(),
                "claim",
                "New claim on your item",
                student.getName() + " claims \"" + post.getTitle() + "\".",
                "/lost-found?tab=activity&postId=" + post.getId());
        return ClaimResponse.from(saved);
    }

    @Transactional
    public ClaimResponse acceptClaim(Long claimId) {
        Student student = currentStudent();
        LostFoundClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        LostFoundPost post = claim.getPost();
        if (!post.getReporter().getId().equals(student.getId())) {
            throw new IllegalArgumentException("Only the reporter can respond to claims.");
        }
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalArgumentException("This claim has already been resolved.");
        }
        claim.setStatus(ClaimStatus.ACCEPTED);
        post.setStatus(LostFoundStatus.CLAIMED);
        postRepository.save(post);
        LostFoundClaim saved = claimRepository.save(claim);

        notificationService.notify(
                claim.getClaimant(),
                "claim-accepted",
                "Claim accepted",
                "Your claim on \"" + post.getTitle() + "\" was accepted.",
                "/lost-found?tab=activity&claimId=" + claim.getId());
        return ClaimResponse.from(saved);
    }

    @Transactional
    public ClaimResponse rejectClaim(Long claimId) {
        Student student = currentStudent();
        LostFoundClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        LostFoundPost post = claim.getPost();
        if (!post.getReporter().getId().equals(student.getId())) {
            throw new IllegalArgumentException("Only the reporter can respond to claims.");
        }
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalArgumentException("This claim has already been resolved.");
        }
        claim.setStatus(ClaimStatus.REJECTED);
        LostFoundClaim saved = claimRepository.save(claim);

        notificationService.notify(
                claim.getClaimant(),
                "claim-rejected",
                "Claim rejected",
                "Your claim on \"" + post.getTitle() + "\" was not accepted.",
                "/lost-found?tab=activity");
        return ClaimResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> messagesForClaim(Long claimId) {
        Student student = currentStudent();
        LostFoundClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        requireParticipant(claim, student);
        if (claim.getStatus() != ClaimStatus.ACCEPTED) {
            throw new IllegalArgumentException("Conversation starts after the claim is accepted.");
        }
        return messageRepository.findByClaimOrderByCreatedAtAsc(claim)
                .stream()
                .map(MessageResponse::from)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(Long claimId, MessageRequest request) {
        Student student = currentStudent();
        LostFoundClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        requireParticipant(claim, student);
        if (claim.getStatus() != ClaimStatus.ACCEPTED) {
            throw new IllegalArgumentException("Conversation starts after the claim is accepted.");
        }
        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        ClaimMessage message = new ClaimMessage();
        message.setClaim(claim);
        message.setSender(student);
        message.setContent(request.content().trim());
        ClaimMessage saved = messageRepository.save(message);

        Student other = claim.getPost().getReporter().getId().equals(student.getId())
                ? claim.getClaimant()
                : claim.getPost().getReporter();
        notificationService.notify(
                other,
                "message",
                "New message",
                student.getName() + " messaged you about \"" + claim.getPost().getTitle() + "\".",
                "/lost-found?tab=activity&claimId=" + claim.getId());
        return MessageResponse.from(saved);
    }

    private void requireParticipant(LostFoundClaim claim, Student student) {
        boolean isReporter = claim.getPost().getReporter().getId().equals(student.getId());
        boolean isClaimant = claim.getClaimant().getId().equals(student.getId());
        if (!isReporter && !isClaimant) {
            throw new IllegalArgumentException("You are not part of this conversation.");
        }
    }

    private boolean matches(LostFoundPost post, String query) {
        if (query == null || query.isBlank()) return true;
        String q = query.trim().toLowerCase(Locale.ROOT);
        return contains(post.getTitle(), q)
                || contains(post.getDescription(), q)
                || contains(post.getLocation(), q)
                || contains(post.getCategory(), q);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private void apply(LostFoundPost post, LostFoundPostRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Item title is required.");
        }
        LostFoundType type;
        try {
            type = LostFoundType.valueOf(request.type().trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Report type must be LOST or FOUND.");
        }
        if (request.location() == null || request.location().isBlank()) {
            throw new IllegalArgumentException("Location is required.");
        }
        post.setType(type);
        post.setTitle(request.title().trim());
        post.setDescription(request.description());
        post.setCategory(request.category() == null || request.category().isBlank() ? "Other" : request.category().trim());
        post.setLocation(request.location().trim());
        post.setDateOccurred(parseDate(request.dateOccurred()));
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private String storeImage(MultipartFile file) {
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Photos must be 5 MB or smaller.");
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT)
                : "";
        Set<String> allowedExtensions = Set.of(".png", ".jpg", ".jpeg", ".webp");
        Set<String> allowedTypes = Set.of("image/png", "image/jpeg", "image/webp");
        if (!allowedExtensions.contains(extension) || !allowedTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException("Unsupported image. Upload a PNG, JPG, JPEG, or WEBP file.");
        }

        String filename = UUID.randomUUID() + extension;
        Path directory = storageRoot.resolve("lost-found").normalize();
        Path destination = directory.resolve(filename).normalize();
        if (!destination.startsWith(directory)) {
            throw new IllegalArgumentException("Invalid image file name.");
        }
        try {
            Files.createDirectories(directory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/lost-found/" + filename;
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not store the photo.");
        }
    }

    private void deleteImageFile(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/lost-found/")) return;
        Path directory = storageRoot.resolve("lost-found").normalize();
        Path file = directory.resolve(imageUrl.substring("/uploads/lost-found/".length())).normalize();
        if (!file.startsWith(directory)) return;
        try {
            Files.deleteIfExists(file);
        } catch (IOException ignored) {
        }
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated student not found."));
    }
}