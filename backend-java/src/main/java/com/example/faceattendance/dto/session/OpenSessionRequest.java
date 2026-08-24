package com.example.faceattendance.dto.session;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request to open an attendance session for an academic period")
public class OpenSessionRequest {

    @NotNull(message = "An academic period must be selected")
    @Schema(description = "Id of the academic period to open attendance for")
    private Long academicPeriodId;

    @NotNull(message = "Teacher location is required")
    @Min(value = -90, message = "Invalid latitude")
    @Max(value = 90, message = "Invalid latitude")
    @Schema(description = "Latitude captured from the teacher's device", example = "17.443500")
    private Double latitude;

    @NotNull(message = "Teacher location is required")
    @Min(value = -180, message = "Invalid longitude")
    @Max(value = 180, message = "Invalid longitude")
    @Schema(description = "Longitude captured from the teacher's device", example = "78.382895")
    private Double longitude;
}
