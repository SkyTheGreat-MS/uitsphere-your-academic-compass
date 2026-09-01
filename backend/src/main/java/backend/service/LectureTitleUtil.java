package backend.service;

import backend.entity.LearningMaterial;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public final class LectureTitleUtil {

    private LectureTitleUtil() {}

    /**
     * Cleans a lecture / file name by stripping file extensions and whitespace.
     */
    public static String cleanLectureName(String name) {
        if (name == null || name.isBlank()) {
            return "";
        }
        String trimmed = name.trim();
        int lastDot = trimmed.lastIndexOf('.');
        if (lastDot > 0 && lastDot > trimmed.lastIndexOf('/') && lastDot > trimmed.lastIndexOf('\\')) {
            String ext = trimmed.substring(lastDot + 1).toLowerCase();
            if (ext.matches("[a-z0-9]{1,5}")) {
                trimmed = trimmed.substring(0, lastDot).trim();
            }
        }
        return trimmed;
    }

    /**
     * Formats a combined title from a list of clean lecture names.
     */
    public static String formatCombinedTitle(List<String> rawNames, String fallback) {
        if (rawNames == null || rawNames.isEmpty()) {
            return fallback != null && !fallback.isBlank() ? fallback : "Lecture";
        }

        List<String> cleanNames = rawNames.stream()
                .map(LectureTitleUtil::cleanLectureName)
                .filter(s -> !s.isBlank())
                .toList();

        if (cleanNames.isEmpty()) {
            return fallback != null && !fallback.isBlank() ? fallback : "Lecture";
        }

        if (cleanNames.size() == 1) {
            return cleanNames.get(0);
        }

        if (cleanNames.size() == 2) {
            return cleanNames.get(0) + " + " + cleanNames.get(1);
        }

        if (cleanNames.size() == 3) {
            String combined = cleanNames.get(0) + " + " + cleanNames.get(1) + " + " + cleanNames.get(2);
            if (combined.length() <= 45) {
                return combined;
            }
            return cleanNames.get(0) + " + 2 more lectures";
        }

        return cleanNames.get(0) + " + " + (cleanNames.size() - 1) + " more lectures";
    }

    /**
     * Formats the title given a list of material IDs and the list of fetched materials.
     * Preserves the ordering of materialIds.
     */
    public static String formatTitleFromMaterials(List<Long> materialIds, List<LearningMaterial> materials, String fallback) {
        if (materialIds == null || materialIds.isEmpty() || materials == null || materials.isEmpty()) {
            return fallback != null && !fallback.isBlank() ? fallback : "Lecture";
        }

        Map<Long, LearningMaterial> map = materials.stream()
                .collect(Collectors.toMap(LearningMaterial::getId, m -> m, (a, b) -> a));

        List<String> names = materialIds.stream()
                .map(map::get)
                .filter(Objects::nonNull)
                .map(LearningMaterial::getTitle)
                .toList();

        return formatCombinedTitle(names, fallback);
    }
}
