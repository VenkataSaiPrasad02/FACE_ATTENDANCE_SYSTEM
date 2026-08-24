package com.example.faceattendance.service;

import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.session.AttendanceSessionResponse;
import com.example.faceattendance.dto.session.OpenSessionRequest;
import com.example.faceattendance.dto.session.StudentAttendanceAttemptRequest;
import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.entity.Student;

import java.util.List;
import java.util.Optional;

public interface AttendanceSessionService {

    /**
     * Opens a new attendance session for an academic period centered
     * on the teacher's current location.
     */
    AttendanceSessionResponse openSession(Long teacherUserId, OpenSessionRequest request);

    /**
     * Manually closes a session before its expiry. Non-privileged
     * actors may only close their own sessions.
     */
    AttendanceSessionResponse closeSession(Long sessionId, Long actingUserId, boolean privileged);

    /**
     * All currently open sessions (backend-authoritative expiry applied).
     */
    List<AttendanceSessionResponse> getActiveSessions();

    /**
     * Academic periods that can currently be opened for a session
     * (active only). Teachers cannot list /api/academic-periods
     * directly — this read-only view powers their picker.
     */
    List<AcademicPeriodResponse> getOpenablePeriods();

    /**
     * Single session lookup with lazy expiry enforcement.
     */
    AttendanceSessionResponse getSession(Long id);

    /**
     * The open session the given student is currently eligible to
     * attend, if any.
     */
    Optional<AttendanceSessionResponse> findActiveForStudent(Student student);

    /**
     * Full server-side validation chain (session state, batch
     * eligibility, 50 m geofence, duplicate prevention, anti-proxy
     * face identity check) followed by marking attendance PRESENT.
     */
    AttendanceResponse markAttendanceFromSession(
            Long sessionId,
            Student student,
            StudentAttendanceAttemptRequest request);

    /**
     * Marks OPEN sessions whose expiresAt has passed as EXPIRED.
     * Called lazily on reads and from the scheduler.
     */
    void expireStaleSessions();
}
