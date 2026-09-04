package backend.controller;

import backend.dto.StudentDTO;
import backend.entity.Student;
import jakarta.validation.Valid;
import backend.service.StudentService;
import org.springframework.web.bind.annotation.*;
import backend.dto.LoginRequest;
import backend.dto.LoginResponse;
import backend.dto.UpdateProfileRequest;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "http://localhost:8081")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {

        this.studentService = studentService;
    }

    @PostMapping
    public StudentDTO createStudent(@RequestBody Student student) {

        return studentService.createStudent(student);

    }

    @GetMapping("/profile")
    public StudentDTO getProfile() {

        return studentService.getCurrentStudent();

    }

    @PutMapping("/profile")
    public StudentDTO updateProfile(@Valid @RequestBody UpdateProfileRequest updates) {
        return studentService.updateCurrentStudent(updates);
    }

    @PostMapping("/profile/avatar")
    public StudentDTO uploadAvatar(@RequestParam("file") MultipartFile file) {
        return studentService.uploadAvatar(file);
    }

    @DeleteMapping("/profile/avatar")
    public StudentDTO removeAvatar() {
        return studentService.removeAvatar();
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {

        return studentService.login(request);

    }

}
