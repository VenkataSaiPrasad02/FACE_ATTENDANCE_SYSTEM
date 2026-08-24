package com.example.faceattendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "students",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_student_number",
                        columnNames = "student_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Student number is used as the Roll Number.
     */
    @Column(
            name = "student_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String studentNumber;

    @Column(
            name = "full_name",
            nullable = false,
            length = 100
    )
    private String fullName;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    /*
     * Example: MCA, BCA, B.Sc.
     */
    @Column(length = 100)
    private String course;


    /*
     * Batch.
     *
     * Example:
     * 2025-2027
     * 2026-2028
     */
    @Column(length = 20)
    private String batch;

    /*
     * Semester.
     *
     * Example:
     * 1st Semester
     * 2nd Semester
     * 3rd Semester
     */
    @Column(length = 50)
    private String semester;

    /*
     * Existing academic year/year field.
     *
     * Example:
     * 1st Year
     * 2nd Year
     */
    @Column(
            name = "academic_year",
            length = 30
    )
    private String year;

    /*
     * Whether a face has been registered
     * for this student.
     */
    @Column(
            name = "face_registered",
            nullable = false
    )
    @Builder.Default
    private Boolean faceRegistered = false;

    /*
     * Optional teacher/advisor assigned to this student. Used for
     * organizing and filtering students in the management UI.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    /*
     * Login account for this student. Created automatically when the
     * student is registered: username = roll number, role = STUDENT.
     * Nullable because legacy rows are linked at startup.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            unique = true
    )
    private User user;

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