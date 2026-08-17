package com.example.faceattendance.dto.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Attendance summary for a specific date")
public class AttendanceSummaryResponse {

    @Schema(description = "The date this summary is for")
    private LocalDate date;

    @Schema(description = "Total number of registered students")
    private long totalStudents;

    @Schema(description = "Number of students present")
    private long presentCount;

    @Schema(description = "Number of students absent")
    private long absentCount;

    @Schema(description = "Attendance percentage (0.00 to 100.00)")
    private double attendancePercentage;
}
