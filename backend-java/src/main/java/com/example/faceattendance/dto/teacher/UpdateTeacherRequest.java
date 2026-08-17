package com.example.faceattendance.dto.teacher;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body for updating a teacher")
public class UpdateTeacherRequest {


    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "New password")
    private String password;

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    @Schema(description = "Teacher's full name")
    private String fullName;

    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Schema(description = "Teacher's email address")
    private String email;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Schema(description = "Teacher's phone number")
    private String phone;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    @Schema(description = "Teacher's department")
    private String department;
}