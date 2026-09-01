package backend.service;

import backend.entity.LearningMaterial;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LectureTitleUtilTest {

    @Test
    void cleanLectureNameStripsExtensionsAndWhitespace() {
        assertThat(LectureTitleUtil.cleanLectureName("Introduction to Spring Boot.pdf"))
                .isEqualTo("Introduction to Spring Boot");
        assertThat(LectureTitleUtil.cleanLectureName("REST APIs and Controllers.docx"))
                .isEqualTo("REST APIs and Controllers");
        assertThat(LectureTitleUtil.cleanLectureName("  Advanced Architecture.pptx  "))
                .isEqualTo("Advanced Architecture");
        assertThat(LectureTitleUtil.cleanLectureName("Notes.txt"))
                .isEqualTo("Notes");
        assertThat(LectureTitleUtil.cleanLectureName("diagram.png"))
                .isEqualTo("diagram");
        assertThat(LectureTitleUtil.cleanLectureName("NoExtension"))
                .isEqualTo("NoExtension");
        assertThat(LectureTitleUtil.cleanLectureName(""))
                .isEqualTo("");
        assertThat(LectureTitleUtil.cleanLectureName(null))
                .isEqualTo("");
    }

    @Test
    void formatCombinedTitleSingleLecture() {
        assertThat(LectureTitleUtil.formatCombinedTitle(List.of("Introduction to Spring Boot.pdf"), "Fallback"))
                .isEqualTo("Introduction to Spring Boot");
    }

    @Test
    void formatCombinedTitleTwoLectures() {
        assertThat(LectureTitleUtil.formatCombinedTitle(
                List.of("Spring Boot.pdf", "REST APIs.pdf"), "Fallback"))
                .isEqualTo("Spring Boot + REST APIs");
    }

    @Test
    void formatCombinedTitleThreeLectures() {
        assertThat(LectureTitleUtil.formatCombinedTitle(
                List.of("Spring Boot.pdf", "REST APIs.pdf", "Security.pdf"), "Fallback"))
                .isEqualTo("Spring Boot + REST APIs + Security");
    }

    @Test
    void formatCombinedTitleMoreThanThreeLectures() {
        assertThat(LectureTitleUtil.formatCombinedTitle(
                List.of("Spring Boot.pdf", "REST APIs.pdf", "Security.pdf", "Database.pdf", "Testing.pdf"), "Fallback"))
                .isEqualTo("Spring Boot + 4 more lectures");
    }

    @Test
    void formatTitleFromMaterialsPreservesOrderAndHandlesNulls() {
        LearningMaterial m1 = new LearningMaterial();
        m1.setFileName("Lecture 1 - Overview.pdf");
        m1.setOriginalFileName("Lecture 1 - Overview.pdf");

        LearningMaterial m2 = new LearningMaterial();
        m2.setFileName("Lecture 2 - Deep Dive.pdf");
        m2.setOriginalFileName("Lecture 2 - Deep Dive.pdf");

        org.springframework.test.util.ReflectionTestUtils.setField(m1, "id", 10L);
        org.springframework.test.util.ReflectionTestUtils.setField(m2, "id", 20L);

        String title = LectureTitleUtil.formatTitleFromMaterials(
                List.of(20L, 10L),
                List.of(m1, m2),
                "Fallback");

        assertThat(title).isEqualTo("Lecture 2 - Deep Dive + Lecture 1 - Overview");
    }

    @Test
    void formatTitleFromMaterialsHandlesEmptyOrDeleted() {
        assertThat(LectureTitleUtil.formatTitleFromMaterials(List.of(999L), List.of(), "Fallback Title"))
                .isEqualTo("Fallback Title");
    }
}
