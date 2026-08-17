package com.example.faceattendance.dto.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dashboard statistics for today")
public class DashboardStatsResponse {

    @Schema(description = "Total number of registered students")
    private long totalStudents;

    @Schema(description = "Number of students present today")
    private long presentToday;

    @Schema(description = "Number of students absent today")
    private long absentToday;

    @Schema(description = "Attendance percentage (0.00 to 100.00)")
    private double attendancePercentage;

    @Schema(description = "Number of students with registered faces")
    private long studentsWithFace;
}
