package com.example.faceattendance.dto.session;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Student self-attendance attempt inside an open session")
public class StudentAttendanceAttemptRequest {

    @NotNull(message = "Location permission is required to take attendance")
    @Min(value = -90, message = "Invalid latitude")
    @Max(value = 90, message = "Invalid latitude")
    @Schema(description = "Latitude of the student's current position", example = "17.443500")
    private Double latitude;

    @NotNull(message = "Location permission is required to take attendance")
    @Min(value = -180, message = "Invalid longitude")
    @Max(value = 180, message = "Invalid longitude")
    @Schema(description = "Longitude of the student's current position", example = "78.382895")
    private Double longitude;

    @NotBlank(message = "A face image is required for verification")
    @Schema(description = "Captured face frame as base64 (no data-URI prefix)")
    private String imageBase64;
}
