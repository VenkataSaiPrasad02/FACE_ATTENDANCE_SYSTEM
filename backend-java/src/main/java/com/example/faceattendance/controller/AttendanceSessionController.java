package com.example.faceattendance.controller;

import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.session.AttendanceSessionResponse;
import com.example.faceattendance.dto.session.OpenSessionRequest;
import com.example.faceattendance.dto.session.StudentAttendanceAttemptRequest;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.exception.NotEligibleForSessionException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.security.CustomUserDetails;
import com.example.faceattendance.service.AttendanceSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Teacher-controlled attendance sessions with student self-enrollment
 * from mobile devices.
 *
 * <p>Authorization is enforced twice: by the URL rules in
 * SecurityConfig and by method-level annotations here. Identity always
 * comes from the authenticated principal — never from request bodies.</p>
 */
@RestController
@RequestMapping("/api/attendance-sessions")
@RequiredArgsConstructor
@Tag(name = "Attendance Sessions", description = "Teacher-controlled attendance sessions")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceSessionController {

    private final AttendanceSessionService attendanceSessionService;
    private final StudentRepository studentRepository;

    // ============================================================
    // TEACHER / ADMIN / SUPER-ADMIN
    // ============================================================

    @Operation(summary = "Open an attendance session (staff)")
    @PostMapping("/open")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AttendanceSessionResponse> open(
            @Valid @RequestBody OpenSessionRequest request,
            Authentication authentication) {

        CustomUserDetails me = currentUser(authentication);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceSessionService.openSession(me.getUserId(), request));
    }

    @Operation(summary = "List active attendance sessions (staff)")
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<AttendanceSessionResponse>> active() {
        return ResponseEntity.ok(attendanceSessionService.getActiveSessions());
    }

    /**
     * Read-only picker feed for the Open Attendance form. Teachers have
     * no access to academic-period management, so active periods are
     * surfaced here instead.
     */
    @Operation(summary = "Academic periods that can be opened for a session (staff)")
    @GetMapping("/periods")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<AcademicPeriodResponse>> openablePeriods() {
        return ResponseEntity.ok(attendanceSessionService.getOpenablePeriods());
    }

    @Operation(summary = "Get a session by id (staff)")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AttendanceSessionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceSessionService.getSession(id));
    }

    @Operation(summary = "Close a session before expiry (own session for teachers; all for admins)")
    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AttendanceSessionResponse> close(
            @PathVariable Long id,
            Authentication authentication) {

        CustomUserDetails me = currentUser(authentication);
        boolean privileged = me.getRole().equals("ADMIN") || me.getRole().equals("SUPER_ADMIN");

        return ResponseEntity.ok(
                attendanceSessionService.closeSession(id, me.getUserId(), privileged));
    }

    // ============================================================
    // STUDENT
    // ============================================================

    @Operation(summary = "The open session this student can currently attend")
    @GetMapping("/my-session")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttendanceSessionResponse> mySession(Authentication authentication) {

        Student student = currentStudent(authentication);

        return attendanceSessionService.findActiveForStudent(student)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * The complete server-validated attendance chain: session state →
     * batch eligibility → 50 m geofence → duplicate prevention →
     * anti-proxy face identity check → PRESENT.
     */
    @Operation(summary = "Take attendance inside an open session (student)")
    @PostMapping("/{id}/attendance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttendanceResponse> takeAttendance(
            @PathVariable Long id,
            @Valid @RequestBody StudentAttendanceAttemptRequest request,
            Authentication authentication) {

        Student student = currentStudent(authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                attendanceSessionService.markAttendanceFromSession(id, student, request));
    }

    // ------------------------------------------------------------

    private CustomUserDetails currentUser(Authentication authentication) {
        return (CustomUserDetails) authentication.getPrincipal();
    }

    private Student currentStudent(Authentication authentication) {
        CustomUserDetails me = currentUser(authentication);
        return studentRepository.findByUserId(me.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No student profile is linked to your account. Please contact your teacher or admin."));
    }
}
