package backend.service;

import java.util.List;
import java.util.stream.Collectors;
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

import backend.security.JwtService;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public StudentService(StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public StudentDTO createStudent(Student student) {

        student.setPassword(
                passwordEncoder.encode(student.getPassword()));

        Student savedStudent = studentRepository.save(student);

        StudentDTO dto = new StudentDTO();

        dto.setUniversityId(savedStudent.getUniversityId());
        dto.setName(savedStudent.getName());
        dto.setEmail(savedStudent.getEmail());
        dto.setBatch(savedStudent.getBatch());
        dto.setDepartment(savedStudent.getDepartment());
        dto.setYear(savedStudent.getYear());
        dto.setSection(savedStudent.getSection());
        dto.setBio(savedStudent.getBio());
        dto.setAvatarInitials(savedStudent.getAvatarInitials());

        return dto;
    }

    public List<StudentDTO> getAllStudents() {

        List<Student> students = studentRepository.findAll();

        return students.stream()
                .map(student -> {

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

                    return dto;

                })
                .collect(Collectors.toList());
    }

    public StudentDTO getCurrentStudent() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Student student = studentRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

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

        return dto;
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

}
