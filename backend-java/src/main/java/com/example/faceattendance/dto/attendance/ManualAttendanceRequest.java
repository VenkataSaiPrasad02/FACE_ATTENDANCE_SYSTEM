package com.example.faceattendance.dto.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Manual attendance marking by teacher/admin/super-admin")
public class ManualAttendanceRequest {

    @NotNull(message = "Student must be selected")
    @Schema(description = "Id of the student to mark present")
    private Long studentId;

    @Schema(description = "Attendance date — defaults to today")
    private LocalDate date;
}
