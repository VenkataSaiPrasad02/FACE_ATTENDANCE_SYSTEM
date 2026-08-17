package com.example.faceattendance.dto.teacher;

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
@Schema(description = "Teacher data returned by the API")
public class TeacherResponse {

    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String department;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String profilePhotoUrl;
}