import type { LearningMaterial } from "@/api/materialsApi";

const GENERIC_TITLES = new Set([
  "lecture summary",
  "combined lecture summary",
  "lecture smart notes",
  "combined lecture smart notes",
  "lecture flashcards",
  "combined lecture flashcards",
  "lecture quiz",
  "combined lecture quiz",
  "lecture",
  "summary",
  "smart notes",
  "flashcards",
  "quiz",
]);

/**
 * Strips file extensions and surrounding whitespace from a lecture file name.
 * e.g. "Introduction to Spring Boot.pdf" -> "Introduction to Spring Boot"
 */
export function cleanLectureName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return trimmed.replace(/\.[a-zA-Z0-9]{1,5}$/, "").trim();
}

/**
 * Derives a lecture-specific title for a generated AI Studio resource (Summary, Notes, Flashcards, Quiz).
 *
 * Rules:
 * 1. Resolves against the materials actually used when generated (using materialIds).
 * 2. 1 lecture -> "Introduction to Spring Boot"
 * 3. 2 lectures -> "Spring Boot + REST APIs"
 * 4. 3 lectures -> "Spring Boot + REST APIs + Security"
 * 5. >3 lectures -> "Spring Boot + N more lectures"
 * 6. Handles deleted source materials gracefully ("Deleted lecture" / "Deleted lectures" or preserved snapshot title).
 */
export function getLectureTitle(
  materialIds: number[] | null | undefined,
  materials: LearningMaterial[],
  fallbackTitle?: string,
): string {
  const ids = materialIds ?? [];

  if (ids.length > 0) {
    const foundMaterials: LearningMaterial[] = [];
    for (const id of ids) {
      const match = materials.find((m) => m.id === id);
      if (match) {
        foundMaterials.push(match);
      }
    }

    const cleanNames = foundMaterials
      .map((m) => cleanLectureName(m.title || m.fileName))
      .filter(Boolean);

    const missingCount = ids.length - foundMaterials.length;

    if (cleanNames.length > 0) {
      if (missingCount === 0) {
        if (cleanNames.length === 1) {
          return cleanNames[0];
        }
        if (cleanNames.length === 2) {
          return `${cleanNames[0]} + ${cleanNames[1]}`;
        }
        if (cleanNames.length === 3) {
          const combined = `${cleanNames[0]} + ${cleanNames[1]} + ${cleanNames[2]}`;
          if (combined.length <= 45) {
            return combined;
          }
          return `${cleanNames[0]} + 2 more lectures`;
        }
        return `${cleanNames[0]} + ${cleanNames.length - 1} more lectures`;
      }

      // Some materials found, but some deleted
      if (cleanNames.length === 1) {
        return `${cleanNames[0]} + ${missingCount} deleted lecture${missingCount > 1 ? "s" : ""}`;
      }
      return `${cleanNames[0]} + ${cleanNames.length - 1 + missingCount} more lectures`;
    }

    // All referenced materials were deleted
    const cleanFallback = fallbackTitle ? cleanLectureName(fallbackTitle) : "";
    const isGeneric = !cleanFallback || GENERIC_TITLES.has(cleanFallback.toLowerCase());

    if (!isGeneric) {
      return cleanFallback;
    }
    return ids.length > 1 ? "Deleted lectures" : "Deleted lecture";
  }

  // No materialIds provided
  if (fallbackTitle && !GENERIC_TITLES.has(fallbackTitle.trim().toLowerCase())) {
    return cleanLectureName(fallbackTitle);
  }
  return "Lecture";
}
