package com.example.faceattendance.dto.face;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Detected face location used by the attendance camera")
public class FaceDetectResponse {

    @Schema(description = "Whether exactly one usable face was detected")
    private boolean faceDetected;

    @Schema(description = "Face bounding-box left coordinate in source image pixels")
    private int x;

    @Schema(description = "Face bounding-box top coordinate in source image pixels")
    private int y;

    @Schema(description = "Face bounding-box width in source image pixels")
    private int width;

    @Schema(description = "Face bounding-box height in source image pixels")
    private int height;

    @Schema(description = "InsightFace detection score")
    private double qualityScore;

    @Schema(description = "Source image width in pixels")
    private int imageWidth;

    @Schema(description = "Source image height in pixels")
    private int imageHeight;

    @Schema(description = "Human-readable detection status")
    private String message;
}
