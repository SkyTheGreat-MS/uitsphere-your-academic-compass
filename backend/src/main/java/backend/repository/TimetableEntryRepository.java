package backend.repository;

import backend.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findBySectionAndAcademicYearAndSemester(String section, String academicYear, String semester);
    boolean existsByDayOfWeekAndStartTimeAndSectionAndAcademicYearAndSemester(
            String dayOfWeek, java.time.LocalTime startTime, String section, String academicYear, String semester);
    void deleteBySectionAndAcademicYearAndSemester(String section, String academicYear, String semester);
}
