package com.example.faceattendance.dto.attendance;

import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.entity.Attendance;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Attendance record returned by the API")
public class AttendanceResponse {

    private Long id;

    private Long studentId;

    private String studentName;

    private String studentNumber;

    private String course;

    private String batch;

    private String semester;

    private String year;

    /*
     * Attendance percentage for this student, based on the
     * student's active academic period. Null when there is no
     * active academic period configured for this student.
     */
    private Double attendancePercentage;

    private LocalDate attendanceDate;

    private LocalTime attendanceTime;

    private AttendanceStatus status;

    private Double confidenceScore;

    @Schema(description = "How attendance was recorded", example = "FACE")
    private Attendance.AttendanceMethod attendanceMethod;

    @Schema(description = "Id of the staff user who manually marked this record")
    private Long markedByUserId;

    @Schema(description = "Name of the staff user who manually marked this record")
    private String markedByName;

    @Schema(description = "Attendance session during which this record was created")
    private Long attendanceSessionId;

    private String notes;

    private LocalDateTime createdAt;
}