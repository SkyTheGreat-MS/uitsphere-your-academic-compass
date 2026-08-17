package backend.config;

import backend.entity.Subject;
import backend.entity.TimetableEntry;
import backend.repository.SubjectRepository;
import backend.repository.TimetableEntryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalTime;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class TimetableDataConfig {
    private static final String YEAR = "2025-2026";
    private static final String SEMESTER = "Semester IV";
    private static final String SECTION = "Second Year A";

    @Bean
    CommandLineRunner seedTimetable(SubjectRepository subjects, TimetableEntryRepository entries) {
        return args -> {
            String[][] subjectData = {
                    {"CST-4104", "Artificial Intelligence", "Dr. Thet Thet Zin"},
                    {"CST-4204", "Linear Algebra", "Daw Phyu Phyu Aung"},
                    {"CST-4306", "Management Principles and Engineering Economics", "Daw Lay Myat Myat Thein"},
                    {"CST-4404", "Network Design and Engineering", "Dr. Thiri Thitsar Khaing"},
                    {"CST-4405", "Computer Architecture and Organization", "Daw Shwe Sin Myat Than"},
                    {"CST-4503", "IELTS Academic Skills and Strategies", "Daw Khin Cho Latt"},
                    {"CST-4105", "Enterprise Applications Development using Java (Keystone Project)", "Dr. Ei Moh Moh Aung"},
                    {"CST-4307", "Advanced Web Technology with PHP (Keystone Project)", "Daw May Thet Swe"},
                    {"CST-4406", "Data and Computer Communications", "Daw Akari Myint Soe"},
                    {"CST-4407", "Engineering Circuits", "Dr. Thiri Thitsar Khaing"},
                    {"CST-4408", "Foundations of Cybersecurity", "Dr. Aung Htein Maw"}
            };
            Map<String, Subject> subjectMap = java.util.Arrays.stream(subjectData)
                    .map(row -> subjects.findByCode(row[0]).orElseGet(() -> subjects.save(new Subject(row[0], row[1], row[2]))))
                    .collect(Collectors.toMap(s -> s.getCode(), Function.identity()));

            // The four-code elective slot is represented only by CST-4105, per the current section choice.
            String[][] timetable = {
                    {"Monday", "08:30", "09:30", "235", "TDA", "CST-4405"}, {"Monday", "09:40", "10:40", "244 E-Lab", "TDA", "CST-4503"},
                    {"Monday", "10:50", "11:50", "322", "L", "CST-4204"}, {"Monday", "12:40", "13:40", "321", "L", "CST-4104"},
                    {"Monday", "13:50", "14:50", "321", "L", "CST-4306"}, {"Monday", "15:00", "16:00", "321", "L", "CST-4404"},
                    {"Tuesday", "08:30", "09:30", "231", "TDA", "CST-4105"}, {"Tuesday", "09:40", "10:40", "421", "TDA", "CST-4503"},
                    {"Tuesday", "10:50", "11:50", "421", "TDA", "CST-4404"}, {"Tuesday", "12:40", "13:40", "321", "L", "CST-4503"},
                    {"Tuesday", "13:50", "14:50", "321", "L", "CST-4405"}, {"Tuesday", "15:00", "16:00", "321", "L", "CST-4104"},
                    {"Wednesday", "09:40", "10:40", "421", "TDA", "CST-4306"}, {"Wednesday", "10:50", "11:50", "421", "TDA", "CST-4405"},
                    {"Wednesday", "12:40", "13:40", "425", "TDA", "CST-4204"}, {"Wednesday", "13:50", "14:50", "232", "TDA", "CST-4105"},
                    {"Thursday", "08:30", "09:30", "421", "TDA", "CST-4204"}, {"Thursday", "09:40", "10:40", "421", "TDA", "CST-4404"},
                    {"Thursday", "10:50", "11:50", "421", "TDA", "CST-4104"}, {"Thursday", "12:40", "13:40", "321", "L", "CST-4306"},
                    {"Thursday", "13:50", "14:50", "321", "L", "CST-4503"}, {"Thursday", "15:00", "16:00", "336", "L", "CST-4405"},
                    {"Friday", "08:30", "09:30", "233", "L", "CST-4105"}, {"Friday", "09:40", "10:40", "421", "TDA", "CST-4306"},
                    {"Friday", "10:50", "11:50", "421", "TDA", "CST-4104"}, {"Friday", "12:40", "13:40", "321", "L", "CST-4204"},
                    {"Friday", "13:50", "14:50", "321", "L", "CST-4404"}, {"Friday", "15:00", "16:00", "233", "L", "CST-4105"}
            };
            for (String[] row : timetable) {
                if (!entries.existsByDayOfWeekAndStartTimeAndSectionAndAcademicYearAndSemester(
                        row[0], LocalTime.parse(row[1]), SECTION, YEAR, SEMESTER)) {
                    entries.save(new TimetableEntry(subjectMap.get(row[5]), row[0], row[1], row[2], row[3], row[4], YEAR, SEMESTER, SECTION));
                }
            }
        };
    }
}
