package com.example.faceattendance.controller;

import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.session.AttendanceSessionResponse;
import com.example.faceattendance.dto.student.StudentResponse;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.mapper.StudentMapper;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.AcademicPeriodService;
import com.example.faceattendance.service.AttendanceService;
import com.example.faceattendance.service.AttendanceSessionService;
import com.example.faceattendance.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Student self-service endpoints. Everything is scoped to the
 * authenticated student — a student can only ever read their own
 * profile, attendance history, and active attendance session.
 */
@RestController
@RequestMapping("/api/student-portal")
@RequiredArgsConstructor
@Tag(name = "Student Portal", description = "Self-service endpoints for students")
@SecurityRequirement(name = "bearerAuth")
public class StudentPortalController {

    private final StudentRepository studentRepository;
    private final AttendanceService attendanceService;
    private final AttendanceSessionService attendanceSessionService;
    private final AcademicPeriodService academicPeriodService;
    private final HolidayService holidayService;
    private final StudentMapper studentMapper;

    @Operation(summary = "Own profile (student)")
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentResponse> me(Authentication authentication) {
        return ResponseEntity.ok(toDtoWithPercentage(currentStudent(authentication)));
    }

    @Operation(summary = "The open session this student can attend (available flag instead of 404)")
    @GetMapping("/me/session")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> mySession(Authentication authentication) {
        Student student = currentStudent(authentication);

        AttendanceSessionResponse session = attendanceSessionService
                .findActiveForStudent(student)
                .orElse(null);

        Map<String, Object> body = new HashMap<>();
        body.put("available", session != null);
        body.put("session", session);
        return ResponseEntity.ok(body);
    }

    @Operation(summary = "Own attendance history, paginated (student)")
    @GetMapping("/me/attendance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<AttendanceResponse>> myAttendance(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) AttendanceStatus status) {

        Student student = currentStudent(authentication);

        Pageable effective = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                        Sort.by(Sort.Direction.DESC, "attendanceDate", "attendanceTime"))
                : pageable;

        return ResponseEntity.ok(attendanceService.getAll(
                effective,
                student.getId(),
                null,
                startDate,
                endDate,
                status));
    }

    @Operation(summary = "Own attendance summary for the active academic period (student)")
    @GetMapping("/me/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> mySummary(Authentication authentication) {
        Student student = currentStudent(authentication);

        Double percentage = attendanceService
                .getAttendancePercentages(List.of(student))
                .get(student.getId());

        LocalDate start = null;
        LocalDate end = null;
        var maybePeriod = academicPeriodService.findActive(
                student.getCourse(), student.getBatch(), student.getSemester());
        if (maybePeriod.isPresent()) {
            AcademicPeriodResponse period = maybePeriod.get();
            start = period.getStartDate();
            end = period.getEndDate();
            if (end != null && end.isAfter(LocalDate.now())) {
                end = LocalDate.now();
            }
        }

        long presentDays = 0;
        long totalWorkingDays = 0;
        if (start != null && end != null && !end.isBefore(start)) {
            presentDays = attendanceService.countPresent(student.getId(), start, end);
            totalWorkingDays = holidayService.countWorkingDays(start, end);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("percentage", percentage);
        body.put("presentDays", presentDays);
        body.put("totalWorkingDays", totalWorkingDays);
        return ResponseEntity.ok(body);
    }

    // ------------------------------------------------------------

    private Student currentStudent(Authentication authentication) {
        var principal = (com.example.faceattendance.security.CustomUserDetails)
                authentication.getPrincipal();

        return studentRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No student profile is linked to your account. Please contact your teacher or admin."));
    }

    private StudentResponse toDtoWithPercentage(Student student) {
        StudentResponse response = studentMapper.toDto(student);
        response.setAttendancePercentage(
                attendanceService.getAttendancePercentages(List.of(student)).get(student.getId()));
        return response;
    }
}
