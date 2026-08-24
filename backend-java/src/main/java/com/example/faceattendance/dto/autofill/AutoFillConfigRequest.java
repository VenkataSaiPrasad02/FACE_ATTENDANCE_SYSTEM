package com.example.faceattendance.dto.autofill;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body for creating/updating a student auto-fill configuration")
public class AutoFillConfigRequest {

    @NotBlank(message = "Configuration name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Course is required")
    @Size(max = 100, message = "Course must not exceed 100 characters")
    private String course;

    @NotBlank(message = "Batch is required")
    @Size(max = 20, message = "Batch must not exceed 20 characters")
    private String batch;

    @NotBlank(message = "Year is required")
    @Size(max = 30, message = "Year must not exceed 30 characters")
    private String year;

    @NotBlank(message = "Semester is required")
    @Size(max = 50, message = "Semester must not exceed 50 characters")
    private String semester;

    @Schema(description = "When true, this configuration becomes the default pre-selected option on the Add Student form")
    private Boolean active;
}
