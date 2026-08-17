package backend.service;

import backend.dto.TimetableImportResult;
import backend.dto.TimetableImportRow;
import backend.dto.TimetableResponse;
import backend.entity.Student;
import backend.entity.Subject;
import backend.entity.TimetableEntry;
import backend.repository.StudentRepository;
import backend.repository.SubjectRepository;
import backend.repository.TimetableEntryRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TimetableService {
    private static final String ACADEMIC_YEAR = "2025-2026";
    private static final String SEMESTER = "Semester IV";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final Set<String> DAYS = Set.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");

    private final StudentRepository studentRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final SubjectRepository subjectRepository;

    public TimetableService(StudentRepository studentRepository, TimetableEntryRepository timetableEntryRepository, SubjectRepository subjectRepository) {
        this.studentRepository = studentRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<TimetableResponse> getForCurrentStudent() {
        String section = currentStudentSection();
        return timetableEntryRepository.findBySectionAndAcademicYearAndSemester(section, ACADEMIC_YEAR, SEMESTER).stream()
                .sorted(Comparator.comparingInt((TimetableEntry e) -> DAYS.stream().toList().indexOf(e.getDayOfWeek()))
                        .thenComparing(e -> e.getStartTime()))
                .map(e -> new TimetableResponse(e.getDayOfWeek(), e.getSubject().getCode(), e.getSubject().getName(),
                        e.getSubject().getLecturer(), e.getStartTime().format(TIME_FORMAT), e.getEndTime().format(TIME_FORMAT),
                        e.getRoom(), e.getClassType()))
                .toList();
    }

    @Transactional
    public TimetableImportResult importTimetable(List<TimetableImportRow> rows) {
        String section = currentStudentSection();

        List<TimetableEntry> valid = new ArrayList<>();
        int skipped = 0;
        Set<String> seen = new HashSet<>();
        for (TimetableImportRow row : rows) {
            if (row == null
                    || row.day() == null || row.subjectCode() == null
                    || row.startTime() == null || row.endTime() == null
                    || row.day().isBlank() || row.subjectCode().isBlank()
                    || row.startTime().isBlank() || row.endTime().isBlank()) {
                skipped++;
                continue;
            }
            String day = normalizeDay(row.day());
            if (day == null) {
                skipped++;
                continue;
            }
            LocalTime start = parseTime(row.startTime());
            LocalTime end = parseTime(row.endTime());
            if (start == null || end == null || !start.isBefore(end)) {
                skipped++;
                continue;
            }
            String subjectCode = row.subjectCode().trim();
            String key = day + "|" + start + "|" + end + "|" + subjectCode;
            if (!seen.add(key)) {
                skipped++;
                continue;
            }
            Subject subject = subjectRepository.findByCode(subjectCode)
                    .orElseGet(() -> subjectRepository.save(new Subject(
                            subjectCode,
                            valueOr(row.subjectName(), subjectCode),
                            valueOr(row.lecturer(), "TBA"))));
            TimetableEntry entry = new TimetableEntry(
                    subject, day, start.format(TIME_FORMAT), end.format(TIME_FORMAT),
                    valueOr(row.room(), "TBA"),
                    valueOr(row.type(), "Lecture"),
                    ACADEMIC_YEAR, SEMESTER, section);
            valid.add(entry);
        }

        timetableEntryRepository.deleteBySectionAndAcademicYearAndSemester(section, ACADEMIC_YEAR, SEMESTER);
        if (!valid.isEmpty()) {
            timetableEntryRepository.saveAll(valid);
        }
        return new TimetableImportResult(valid.size(), skipped);
    }

    private String currentStudentSection() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        String section = student.getSection();
        return (section == null || section.isBlank()) ? "Second Year A" : section;
    }

    private static String normalizeDay(String day) {
        if (day == null) return null;
        String trimmed = day.trim();
        if (trimmed.isEmpty()) return null;
        String capitalized = trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
        return DAYS.contains(capitalized) ? capitalized : null;
    }

    private static LocalTime parseTime(String value) {
        if (value == null) return null;
        try {
            return LocalTime.parse(value.trim(), TIME_FORMAT);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static String valueOr(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }
}
