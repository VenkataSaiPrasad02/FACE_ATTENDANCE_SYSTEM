package com.example.faceattendance.controller;

import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.attendance.AttendanceSummaryResponse;
import com.example.faceattendance.dto.attendance.RecognizeAttendanceRequest;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Attendance endpoints: face-based recognition marking and history retrieval.
 * All business logic resides in AttendanceService.
 */
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance marking via face recognition and history endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Operation(summary = "Mark attendance via face recognition",
            description = "Submits a face image; backend recognizes the student and marks PRESENT if confident.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Attendance marked"),
        @ApiResponse(responseCode = "404", description = "Face not recognized"),
        @ApiResponse(responseCode = "409", description = "Duplicate attendance for today"),
        @ApiResponse(responseCode = "422", description = "Confidence too low or face detection failed"),
        @ApiResponse(responseCode = "503", description = "Python face service unavailable")
    })
    @PostMapping("/recognize")
    public ResponseEntity<AttendanceResponse> recognize(@Valid @RequestBody RecognizeAttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.recognize(request));
    }

    @Operation(summary = "List attendance records",
            description = "Returns paginated records. Supports filters: studentId, date, startDate, endDate, status.")
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping
    public ResponseEntity<Page<AttendanceResponse>> getAll(
            Pageable pageable,
            @Parameter(description = "Filter by student ID")
            @RequestParam(required = false) Long studentId,
            @Parameter(description = "Filter by exact date (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Range start (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Range end (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Filter by status: PRESENT or ABSENT")
            @RequestParam(required = false) AttendanceStatus status) {
        return ResponseEntity.ok(attendanceService.getAll(pageable, studentId, date, startDate, endDate, status));
    }

    @Operation(summary = "List students absent on a date",
            description = "Returns students without a PRESENT attendance record for the selected date.")
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping("/absent")
    public ResponseEntity<Page<AttendanceResponse>> getAbsentStudents(
            Pageable pageable,
            @Parameter(description = "Date to evaluate (YYYY-MM-DD); defaults to today")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAbsentStudents(pageable, date == null ? LocalDate.now() : date));
    }

    @Operation(summary = "Today's attendance summary")
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping("/summary/today")
    public ResponseEntity<AttendanceSummaryResponse> summaryToday() {
        return ResponseEntity.ok(attendanceService.getSummaryToday());
    }
}
