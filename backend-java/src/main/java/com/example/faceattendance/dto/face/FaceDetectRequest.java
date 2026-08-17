package com.example.faceattendance.dto.face;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for automatic face detection")
public class FaceDetectRequest {

    @NotBlank(message = "Image is required")
    @Schema(description = "Base64-encoded camera frame")
    private String imageBase64;
}
