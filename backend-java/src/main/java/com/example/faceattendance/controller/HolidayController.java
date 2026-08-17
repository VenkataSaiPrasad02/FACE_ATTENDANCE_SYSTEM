package com.example.faceattendance.controller;

import com.example.faceattendance.dto.holiday.CreateHolidayRequest;
import com.example.faceattendance.dto.holiday.HolidayResponse;
import com.example.faceattendance.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
@Tag(
        name = "Holidays",
        description = "Holiday management and calendar endpoints"
)
@SecurityRequirement(name = "bearerAuth")
public class HolidayController {

    private final HolidayService holidayService;


    // =========================================================
    // CREATE
    // ADMIN ONLY
    // =========================================================

    @Operation(
            summary = "Create holiday",
            description = "Marks a date as a holiday"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Holiday created successfully"
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<HolidayResponse> create(
            @Valid @RequestBody CreateHolidayRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        holidayService.create(request)
                );
    }


    // =========================================================
    // GET BY ID
    // ADMIN / TEACHER
    // =========================================================

    @Operation(
            summary = "Get holiday by ID"
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN', 'TEACHER')")
    public ResponseEntity<HolidayResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                holidayService.getById(id)
        );
    }


    // =========================================================
    // GET BY DATE
    // ADMIN / TEACHER
    // =========================================================

    @Operation(
            summary = "Get holiday for a date"
    )
    @GetMapping("/date")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN', 'TEACHER')")
    public ResponseEntity<HolidayResponse> getByDate(

            @Parameter(
                    description = "Date to check",
                    example = "2026-08-15"
            )
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date

    ) {

        return ResponseEntity.ok(
                holidayService.getByDate(date)
        );
    }


    // =========================================================
    // GET HOLIDAYS BETWEEN DATES
    // ADMIN / TEACHER
    // =========================================================

    @Operation(
            summary = "Get holidays between dates"
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN', 'TEACHER')")
    public ResponseEntity<List<HolidayResponse>> getBetweenDates(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate

    ) {

        return ResponseEntity.ok(
                holidayService.getBetweenDates(
                        startDate,
                        endDate
                )
        );
    }


    // =========================================================
    // DELETE
    // ADMIN ONLY
    // =========================================================

    @Operation(
            summary = "Delete holiday"
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        holidayService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}