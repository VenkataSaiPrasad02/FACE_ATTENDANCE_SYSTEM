package com.example.faceattendance.dto.teacher;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body for creating a new teacher")
public class CreateTeacherRequest {


    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Login username for the teacher account", example = "jsmith")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "Initial password for the teacher account")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    @Schema(description = "Teacher's full name", example = "John Smith")
    private String fullName;

    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Schema(description = "Teacher's email address", example = "john@college.edu")
    private String email;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Schema(description = "Teacher's phone number", example = "9876543210")
    private String phone;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    @Schema(description = "Department or subject area", example = "Computer Science")
    private String department;
}