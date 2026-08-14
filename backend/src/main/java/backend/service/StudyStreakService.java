package backend.service;

import backend.entity.Student;
import backend.entity.StudyActivity;
import backend.entity.StudyActivityType;
import backend.repository.StudyActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class StudyStreakService {
    private final StudyActivityRepository activityRepository;

    public StudyStreakService(StudyActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional
    public void record(Student student, StudyActivityType type) {
        LocalDate today = LocalDate.now();
        if (activityRepository.findByStudentAndActivityDate(student, today).isPresent()) return;
        StudyActivity activity = new StudyActivity();
        activity.setStudent(student);
        activity.setActivityDate(today);
        activity.setActivityType(type);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public int currentStreak(Student student) {
        LocalDate today = LocalDate.now();
        List<StudyActivity> activities = activityRepository.findByStudentOrderByActivityDateDesc(student);
        if (activities.isEmpty()) return 0;
        LocalDate expected = activities.get(0).getActivityDate();
        if (!expected.equals(today) && !expected.equals(today.minusDays(1))) return 0;
        int streak = 0;
        for (StudyActivity activity : activities) {
            if (!activity.getActivityDate().equals(expected)) break;
            streak++;
            expected = expected.minusDays(1);
        }
        return streak;
    }

    @Transactional(readOnly = true)
    public boolean studiedToday(Student student) {
        return activityRepository.findByStudentAndActivityDate(student, LocalDate.now()).isPresent();
    }
}
