package com.example.faceattendance.dto.student;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body for creating a new student")
public class CreateStudentRequest {

    @NotBlank(message = "Roll number is required")
    @Size(max = 20, message = "Roll number must not exceed 20 characters")
    private String studentNumber;

    @NotBlank(message = "Student name is required")
    @Size(max = 100, message = "Student name must not exceed 100 characters")
    private String fullName;

    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Student email must not exceed 100 characters")
    private String email;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @NotBlank(message = "Course is required")
    @Size(max = 100, message = "Course must not exceed 100 characters")
    private String course;


    @NotBlank(message = "Batch is required")
    @Size(max = 20, message = "Batch must not exceed 20 characters")
    private String batch;

    @NotBlank(message = "Semester is required")
    @Size(max = 50, message = "Semester must not exceed 50 characters")
    private String semester;

    @NotBlank(message = "Year is required")
    @Size(max = 30, message = "Year must not exceed 30 characters")
    private String year;
}