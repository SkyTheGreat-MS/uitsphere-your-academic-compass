package backend.service;

import backend.entity.Student;
import backend.entity.StudyActivity;
import backend.entity.StudyActivityType;
import backend.repository.StudyActivityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudyStreakServiceTest {
    @Mock
    private StudyActivityRepository activityRepository;

    @Test
    void recordsOnlyOneStudyDayForMultipleActivities() {
        Student student = new Student();
        when(activityRepository.findByStudentAndActivityDate(eq(student), any(LocalDate.class)))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(new StudyActivity()));
        StudyStreakService service = new StudyStreakService(activityRepository);

        service.record(student, StudyActivityType.TASK_COMPLETED);
        service.record(student, StudyActivityType.QUIZ_COMPLETED);

        ArgumentCaptor<StudyActivity> saved = ArgumentCaptor.forClass(StudyActivity.class);
        verify(activityRepository).save(saved.capture());
        assertThat(saved.getValue().getActivityDate()).isEqualTo(LocalDate.now());
    }

    @Test
    void keepsYesterdaysStreakActiveUntilTodayEnds() {
        Student student = new Student();
        when(activityRepository.findByStudentOrderByActivityDateDesc(student))
                .thenReturn(List.of(activityOn(LocalDate.now().minusDays(1)), activityOn(LocalDate.now().minusDays(2))));

        assertThat(new StudyStreakService(activityRepository).currentStreak(student)).isEqualTo(2);
    }

    @Test
    void gapBreaksTheCurrentStreak() {
        Student student = new Student();
        when(activityRepository.findByStudentOrderByActivityDateDesc(student))
                .thenReturn(List.of(activityOn(LocalDate.now()), activityOn(LocalDate.now().minusDays(2))));

        assertThat(new StudyStreakService(activityRepository).currentStreak(student)).isEqualTo(1);
    }

    private StudyActivity activityOn(LocalDate date) {
        StudyActivity activity = new StudyActivity();
        activity.setActivityDate(date);
        return activity;
    }
}
