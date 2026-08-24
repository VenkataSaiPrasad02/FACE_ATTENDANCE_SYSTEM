package com.example.faceattendance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Reusable "common academic values" preset for student creation.
 *
 * A configuration stores the fields that are identical for a whole
 * group of students (course/batch/year/semester). Selecting one on the
 * Add Student form pre-fills those fields; values always stay editable
 * and changing a configuration never rewrites existing students — it
 * only affects future creations.
 */
@Entity
@Table(
        name = "student_auto_fill_configs",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_auto_fill_name",
                        columnNames = "name"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAutoFillConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Human label, e.g. 'MCA 2025-2027'.
     */
    @Column(
            nullable = false,
            length = 100
    )
    private String name;

    /*
     * Example: MCA. Mirrors students.course.
     */
    @Column(
            nullable = false,
            length = 100
    )
    private String course;

    /*
     * Example: 2025-2027. Mirrors students.batch.
     */
    @Column(
            nullable = false,
            length = 20
    )
    private String batch;

    /*
     * Example: 1st Year. Mirrors students.academic_year.
     */
    @Column(
            name = "year_level",
            nullable = false,
            length = 30
    )
    private String year;

    /*
     * Example: 2nd Semester. Mirrors students.semester.
     */
    @Column(
            nullable = false,
            length = 50
    )
    private String semester;

    /*
     * When true this configuration is pre-selected by default on the
     * Add Student form. Activating one deactivates the others.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = false;

    @CreationTimestamp
    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
