package backend.service;

import backend.dto.TimetableResponse;
import backend.entity.TimetableEntry;
import backend.repository.StudentRepository;
import backend.repository.TimetableEntryRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class TimetableService {
    private static final String ACADEMIC_YEAR = "2025-2026";
    private static final String SEMESTER = "Semester IV";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<String> DAYS = List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");

    private final StudentRepository studentRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public TimetableService(StudentRepository studentRepository, TimetableEntryRepository timetableEntryRepository) {
        this.studentRepository = studentRepository;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    public List<TimetableResponse> getForCurrentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String section = studentRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Student not found")).getSection();
        if (section == null || section.isBlank()) section = "Second Year A";
        return timetableEntryRepository.findBySectionAndAcademicYearAndSemester(section, ACADEMIC_YEAR, SEMESTER).stream()
                .sorted(Comparator.comparingInt((TimetableEntry e) -> DAYS.indexOf(e.getDayOfWeek()))
                        .thenComparing(TimetableEntry::getStartTime))
                .map(e -> new TimetableResponse(e.getDayOfWeek(), e.getSubject().getCode(), e.getSubject().getName(),
                        e.getSubject().getLecturer(), e.getStartTime().format(TIME_FORMAT), e.getEndTime().format(TIME_FORMAT),
                        e.getRoom(), e.getClassType()))
                .toList();
    }
}
