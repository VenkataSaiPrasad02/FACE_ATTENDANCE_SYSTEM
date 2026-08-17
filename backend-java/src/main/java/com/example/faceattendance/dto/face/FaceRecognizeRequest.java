package com.example.faceattendance.dto.face;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body sent to the Python face service for recognition")
public class FaceRecognizeRequest {

    @NotBlank(message = "Image is required")
    @Schema(description = "Base64-encoded face image")
    private String imageBase64;

    @Schema(description = "Candidate embeddings to match against")
    private List<FaceCandidate> candidates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "A candidate embedding entry for recognition")
    public static class FaceCandidate {
        @Schema(description = "Student ID")
        private Long studentId;

        @Schema(description = "512-dimensional embedding vector")
        private List<Double> embedding;
    }
}
