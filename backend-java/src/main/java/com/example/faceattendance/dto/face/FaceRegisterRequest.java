package com.example.faceattendance.dto.face;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Schema(description = "Request body for face registration")
public class FaceRegisterRequest {

    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be a positive number")
    @Schema(description = "ID of the student to register the face for", example = "1")
    private Long studentId;

    @NotBlank(message = "Image is required")
    @Schema(description = "Base64-encoded face image (JPEG or PNG)")
    private String imageBase64;
}
