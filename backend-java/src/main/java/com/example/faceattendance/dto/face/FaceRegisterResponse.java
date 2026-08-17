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
@Schema(description = "Response for a successful face registration")
public class FaceRegisterResponse {

    @Schema(description = "Student ID for which the face was registered")
    private Long studentId;

    @Schema(description = "Student full name")
    private String studentName;

    @Schema(description = "Result message")
    private String message;
}
