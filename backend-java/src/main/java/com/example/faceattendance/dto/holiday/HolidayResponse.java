package com.example.faceattendance.dto.holiday;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "Holiday information returned by the API")
public class HolidayResponse {

    private Long id;

    private LocalDate holidayDate;

    private String reason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}