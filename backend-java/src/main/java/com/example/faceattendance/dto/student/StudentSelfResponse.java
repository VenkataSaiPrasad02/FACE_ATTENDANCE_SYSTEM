package com.example.faceattendance.dto.student;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Student self-view DTO - limited information visible to the student themselves.
 * Does NOT expose sensitive information like phone, email, or face data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Limited student data exposed to the student themselves")
public class StudentSelfResponse {

    @Schema(description = "Student roll number")
    private String studentNumber;

    @Schema(description = "Student name")
    private String fullName;

    @Schema(description = "Student course")
    private String course;

    @Schema(description = "Academic year")
    private String year;

    @Schema(description = "Whether face has been registered")
    private Boolean faceRegistered;
}