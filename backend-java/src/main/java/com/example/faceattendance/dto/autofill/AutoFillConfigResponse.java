package com.example.faceattendance.dto.autofill;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Student auto-fill configuration returned by the API")
public class AutoFillConfigResponse {

    private Long id;

    private String name;

    private String course;

    private String batch;

    private String year;

    private String semester;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
