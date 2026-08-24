package com.example.faceattendance.dto.student;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Student data returned by the API")
public class StudentResponse {

    private Long id;

    private String studentNumber;

    private String fullName;

    private String email;

    private String phone;

    private String course;


    private String batch;

    private String semester;

    private String year;

    private Long teacherId;

    private String teacherName;

    private Boolean faceRegistered;

    /*
     * Attendance percentage for the student's active academic
     * period (course + batch + semester). Null when there is no
     * active academic period configured for this student yet.
     */
    private Double attendancePercentage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}