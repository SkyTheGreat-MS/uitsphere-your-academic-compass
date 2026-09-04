package backend.service;

import backend.dto.StudentDTO;
import backend.entity.Student;
import backend.repository.StudentRepository;
import backend.security.JwtService;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import backend.dto.LoginRequest;
import backend.dto.LoginResponse;
import backend.dto.UpdateProfileRequest;
import java.util.Optional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Path storageRoot;

    public StudentService(StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            @Value("${file.upload-dir:uploads}") String storagePath) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.storageRoot = Path.of(storagePath).toAbsolutePath().normalize();
    }

    public StudentDTO createStudent(Student student) {

        student.setPassword(
                passwordEncoder.encode(student.getPassword()));

        Student savedStudent = studentRepository.save(student);

        return toDto(savedStudent);
    }

    public StudentDTO getCurrentStudent() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Student student = studentRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return toDto(student);
    }

    public LoginResponse login(LoginRequest request) {

        Optional<Student> optionalStudent = studentRepository.findByEmail(request.getEmail());

        if (optionalStudent.isEmpty()) {
            return new LoginResponse(
                    false,
                    "Invalid email or password.",
                    null,
                    null);
        }

        Student student = optionalStudent.get();

        if (!passwordEncoder.matches(
                request.getPassword(),
                student.getPassword())) {

            return new LoginResponse(
                    false,
                    "Invalid email or password.",
                    null,
                    null);
        }

        StudentDTO dto = toDto(student);

        String token = jwtService.generateToken(student.getEmail());
        return new LoginResponse(
                true,
                "Login successful.",
                token,
                dto);
    }

    public StudentDTO updateCurrentStudent(UpdateProfileRequest updates) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (updates.getName() != null) student.setName(updates.getName());
        if (updates.getDepartment() != null) student.setDepartment(updates.getDepartment());
        student.setYear(updates.getAcademicYear());
        if (updates.getBatch() != null) student.setBatch(updates.getBatch());
        if (updates.getBio() != null) student.setBio(updates.getBio());
        if (updates.getAvatarInitials() != null) student.setAvatarInitials(updates.getAvatarInitials());

        studentRepository.save(student);
        return getCurrentStudent();
    }

    public StudentDTO uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Please select an image to upload.");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Profile images must be 5 MB or smaller.");
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT) : "";
        Set<String> allowedExtensions = Set.of(".png", ".jpg", ".jpeg", ".webp");
        Set<String> allowedTypes = Set.of("image/png", "image/jpeg", "image/webp");
        if (!allowedExtensions.contains(extension) || !allowedTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException("Unsupported image. Upload a PNG, JPG, JPEG, or WEBP file.");
        }

        Student student = currentStudentEntity();
        String filename = UUID.randomUUID() + extension;
        Path avatarDirectory = storageRoot.resolve("avatars").normalize();
        Path destination = avatarDirectory.resolve(filename).normalize();
        if (!destination.startsWith(avatarDirectory)) throw new IllegalArgumentException("Invalid image file name.");
        try {
            Files.createDirectories(avatarDirectory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            String previousUrl = student.getAvatarUrl();
            student.setAvatarUrl("/uploads/avatars/" + filename);
            studentRepository.save(student);
            deleteAvatarFile(previousUrl);
            return toDto(student);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not store the profile image.");
        }
    }

    public StudentDTO removeAvatar() {
        Student student = currentStudentEntity();
        String previousUrl = student.getAvatarUrl();
        student.setAvatarUrl(null);
        studentRepository.save(student);
        deleteAvatarFile(previousUrl);
        return toDto(student);
    }

    private Student currentStudentEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    private void deleteAvatarFile(String avatarUrl) {
        if (avatarUrl == null || !avatarUrl.startsWith("/uploads/avatars/")) return;
        Path avatarDirectory = storageRoot.resolve("avatars").normalize();
        Path file = avatarDirectory.resolve(avatarUrl.substring("/uploads/avatars/".length())).normalize();
        if (!file.startsWith(avatarDirectory)) return;
        try { Files.deleteIfExists(file); }
        catch (IOException ignored) { }
    }

    private StudentDTO toDto(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setUniversityId(student.getUniversityId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setBatch(student.getBatch());
        dto.setDepartment(student.getDepartment());
        dto.setYear(student.getYear());
        dto.setSection(student.getSection());
        dto.setBio(student.getBio());
        dto.setAvatarInitials(student.getAvatarInitials());
        dto.setAvatarUrl(student.getAvatarUrl());
        return dto;
    }

}
