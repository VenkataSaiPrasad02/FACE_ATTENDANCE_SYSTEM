package com.example.faceattendance.dto.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request body for marking attendance via face recognition")
public class RecognizeAttendanceRequest {

    @NotBlank(message = "Image is required")
    @Schema(
            description = "Base64-encoded face image (JPEG or PNG)"
    )
    private String imageBase64;

    @Schema(
            description = "Optional notes about this attendance"
    )
    private String notes;

    // Note: classId removed - attendance is now per-student-per-day without ClassRoom dependency
}