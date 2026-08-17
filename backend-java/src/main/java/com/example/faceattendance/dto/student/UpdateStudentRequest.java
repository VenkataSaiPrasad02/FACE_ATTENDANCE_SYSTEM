package com.example.faceattendance.dto.student;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body for updating a student")
public class UpdateStudentRequest {

    @Size(max = 100)
    private String fullName;

    @Email(message = "Student email must be valid")
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String course;


    @Size(max = 20)
    private String batch;

    @Size(max = 50)
    private String semester;

    @Size(max = 30)
    private String year;
}