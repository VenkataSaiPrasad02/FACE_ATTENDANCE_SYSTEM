package com.example.faceattendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * A teacher-controlled window during which students of the session's
 * academic period (course / batch / semester) may mark their own
 * attendance from their mobile devices.
 *
 * <p>The session pins the teacher's current location as the center
 * point with a fixed radius (50 m) and auto-expires after a fixed
 * duration (10 minutes). Both values are enforced server-side.</p>
 */
@Entity
@Table(
        name = "attendance_sessions",
        indexes = {
                @Index(
                        name = "ix_att_sessions_status",
                        columnList = "status"
                ),
                @Index(
                        name = "ix_att_sessions_period",
                        columnList = "academic_period_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * The academic period this session belongs to. Referenced by id
     * so course/batch/semester are resolved through AcademicPeriod
     * instead of being duplicated here.
     */
    @Column(name = "academic_period_id", nullable = false)
    private Long academicPeriodId;

    /*
     * The teacher who opened the session.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_user_id", nullable = false)
    private User teacher;

    /*
     * Center point of the attendance area — captured from the
     * teacher's device when the session was opened.
     */
    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    /*
     * Attendance radius in metres (default 50).
     */
    @Column(name = "radius_meters", nullable = false)
    @Builder.Default
    private int radiusMeters = 50;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private SessionStatus status = SessionStatus.OPEN;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum SessionStatus {
        OPEN,
        CLOSED,
        EXPIRED
    }
}
