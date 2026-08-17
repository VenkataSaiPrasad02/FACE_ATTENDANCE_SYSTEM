package com.example.faceattendance.dto.academicperiod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request to create an academic period")
public class CreateAcademicPeriodRequest {

    @NotBlank(message = "Branch is required")
    @Size(max = 50)
    @Schema(
            description = "Course or branch",
            example = "MCA"
    )
    private String course;

    @NotBlank(message = "Batch is required")
    @Size(max = 20)
    @Schema(
            description = "Student batch",
            example = "2025-2027"
    )
    private String batch;

    @NotBlank(message = "Semester is required")
    @Size(max = 50)
    @Schema(
            description = "Semester name",
            example = "3rd Semester"
    )
    private String semester;

    @NotNull(message = "Start date is required")
    @Schema(
            example = "2026-08-01"
    )
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Schema(
            example = "2026-12-31"
    )
    private LocalDate endDate;
}