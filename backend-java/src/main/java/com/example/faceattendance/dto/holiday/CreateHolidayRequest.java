package com.example.faceattendance.dto.holiday;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request body for creating a holiday")
public class CreateHolidayRequest {

    @NotNull(message = "Holiday date is required")
    @Schema(
            description = "Date to mark as holiday",
            example = "2026-08-15"
    )
    private LocalDate holidayDate;

    @NotBlank(message = "Holiday reason is required")
    @Size(
            max = 255,
            message = "Holiday reason must not exceed 255 characters"
    )
    @Schema(
            description = "Reason for the holiday",
            example = "Independence Day"
    )
    private String reason;
}