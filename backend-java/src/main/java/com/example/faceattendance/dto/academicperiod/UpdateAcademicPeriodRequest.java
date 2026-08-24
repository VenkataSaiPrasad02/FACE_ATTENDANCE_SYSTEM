package com.example.faceattendance.dto.academicperiod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request to update an academic period")
public class UpdateAcademicPeriodRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String course;

    @Size(max = 20)
    private String batch;

    @Size(max = 50)
    private String semester;

    private LocalDate startDate;

    private LocalDate endDate;
}