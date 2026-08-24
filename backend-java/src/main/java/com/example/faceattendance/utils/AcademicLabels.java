package com.example.faceattendance.utils;

import java.util.regex.Pattern;

/**
 * Normalizes academic labels stored as plain strings
 * (there are no dedicated Course/Batch/Year/Semester entities,
 * so these values live directly on students and academic periods).
 *
 * Semester examples: '3' -> '3rd Semester', '2nd Semester' passthrough.
 * Year examples:     '1' -> '1st Year',      '1st Year'  passthrough.
 */
public final class AcademicLabels {

    private static final Pattern SEMESTER_FORMAT =
            Pattern.compile("\\d+(st|nd|rd|th) Semester");

    private static final Pattern YEAR_FORMAT =
            Pattern.compile("\\d+(st|nd|rd|th) Year");

    private AcademicLabels() {
    }

    public static boolean isFormattedSemester(String value) {
        return value != null && SEMESTER_FORMAT.matcher(value.trim()).matches();
    }

    public static boolean isFormattedYear(String value) {
        return value != null && YEAR_FORMAT.matcher(value.trim()).matches();
    }

    public static String formatSemester(String semester) {
        if (semester == null || semester.isBlank()) {
            return semester;
        }

        String value = semester.trim();

        if (SEMESTER_FORMAT.matcher(value).matches()) {
            return value;
        }

        return switch (value) {
            case "1" -> "1st Semester";
            case "2" -> "2nd Semester";
            case "3" -> "3rd Semester";
            case "4" -> "4th Semester";
            case "5" -> "5th Semester";
            case "6" -> "6th Semester";
            case "7" -> "7th Semester";
            case "8" -> "8th Semester";
            default -> value;
        };
    }

    public static String formatYear(String year) {
        if (year == null || year.isBlank()) {
            return year;
        }

        String value = year.trim();

        if (YEAR_FORMAT.matcher(value).matches()) {
            return value;
        }

        return switch (value) {
            case "1" -> "1st Year";
            case "2" -> "2nd Year";
            case "3" -> "3rd Year";
            case "4" -> "4th Year";
            case "5" -> "5th Year";
            default -> value;
        };
    }
}
