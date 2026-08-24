package com.example.faceattendance.dto.session;

import com.example.faceattendance.entity.AttendanceSession.SessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "An attendance session opened by a teacher")
public class AttendanceSessionResponse {

    private Long id;

    private Long academicPeriodId;

    /*
     * Optional subject/display name of the academic period.
     */
    private String periodName;

    private String course;

    private String batch;

    private String semester;

    private LocalDateTime periodStartDate;

    private LocalDateTime periodEndDate;

    @Schema(description = "Teacher who opened the session")
    private String teacherName;

    private Long teacherUserId;

    private double latitude;

    private double longitude;

    @Schema(description = "Attendance radius in metres")
    private int radiusMeters;

    private LocalDateTime openedAt;

    private LocalDateTime expiresAt;

    private LocalDateTime closedAt;

    private SessionStatus status;

    /*
     * Seconds left until expiry — computed server-side at response time.
     * Negative or zero means the session has expired (backend remains
     * authoritative regardless of this value).
     */
    @Schema(description = "Seconds remaining before auto-expiry")
    private Long remainingSeconds;
}
