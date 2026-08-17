package com.example.faceattendance.dto.academicperiod;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AcademicPeriodResponse {

    private Long id;

    private String course;

    private String batch;

    private String semester;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}