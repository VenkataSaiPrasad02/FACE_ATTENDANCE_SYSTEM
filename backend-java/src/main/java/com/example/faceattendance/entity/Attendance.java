package com.example.faceattendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_attendance_student_date",
                        columnNames = {
                                "student_id",
                                "attendance_date"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private Student student;

    @Column(
            name = "attendance_date",
            nullable = false
    )
    private LocalDate attendanceDate;

    @Column(
            name = "attendance_time",
            nullable = false
    )
    private LocalTime attendanceTime;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 10
    )
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    /*
     * How this attendance record was created:
     * FACE  — face recognition (student device or kiosk)
     * MANUAL— manually marked by teacher/admin/super-admin.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "attendance_method",
            nullable = false,
            length = 10
    )
    @Builder.Default
    private AttendanceMethod attendanceMethod = AttendanceMethod.FACE;

    /*
     * Audit trail: the User.id of the teacher/admin/super-admin who
     * manually marked this attendance. Null for FACE records.
     */
    @Column(name = "marked_by_user_id")
    private Long markedByUserId;

    /*
     * The attendance session during which this record was created
     * (student self-attendance). Plain id reference so history is
     * preserved even if sessions are ever removed. Null for manual
     * and legacy records.
     */
    @Column(name = "attendance_session_id")
    private Long attendanceSessionId;


    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public enum AttendanceStatus {
        PRESENT,
        ABSENT
    }

    public enum AttendanceMethod {
        FACE,
        MANUAL
    }
}