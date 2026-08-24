package com.example.faceattendance.service.impl;

import com.example.faceattendance.client.FaceRecognitionClient;
import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.session.AttendanceSessionResponse;
import com.example.faceattendance.dto.session.OpenSessionRequest;
import com.example.faceattendance.dto.session.StudentAttendanceAttemptRequest;
import com.example.faceattendance.entity.AcademicPeriod;
import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.Attendance.AttendanceMethod;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.entity.AttendanceSession;
import com.example.faceattendance.entity.AttendanceSession.SessionStatus;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.exception.*;
import com.example.faceattendance.mapper.AttendanceMapper;
import com.example.faceattendance.repository.AcademicPeriodRepository;
import com.example.faceattendance.repository.AttendanceRepository;
import com.example.faceattendance.repository.AttendanceSessionRepository;
import com.example.faceattendance.repository.UserRepository;
import com.example.faceattendance.service.AttendanceSessionService;
import com.example.faceattendance.service.EmbeddingCacheService;
import com.example.faceattendance.service.HolidayService;
import com.example.faceattendance.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceSessionServiceImpl implements AttendanceSessionService {

    private final AttendanceSessionRepository sessionRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmbeddingCacheService embeddingCacheService;
    private final FaceRecognitionClient faceRecognitionClient;
    private final HolidayService holidayService;
    private final AttendanceMapper attendanceMapper;

    /*
     * Server-side policy: the geofence radius and session duration are
     * configured here — never trusted from the client.
     */
    @Value("${app.attendance.radius-meters:50}")
    private int radiusMeters;

    @Value("${app.attendance.session-duration-minutes:10}")
    private long sessionDurationMinutes;

    /*
     * Same recognition threshold as the kiosk flow.
     */
    @Value("${face.recognition.threshold:0.6}")
    private double recognitionThreshold;

    // ============================================================
    // OPEN
    // ============================================================

    @Override
    @Transactional
    public AttendanceSessionResponse openSession(Long teacherUserId, OpenSessionRequest request) {

        expireStaleSessions();

        AcademicPeriod period = academicPeriodRepository.findById(request.getAcademicPeriodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Academic period not found with id: " + request.getAcademicPeriodId()));

        if (sessionRepository.existsByAcademicPeriodIdAndStatus(period.getId(), SessionStatus.OPEN)) {
            throw new SessionConflictException(
                    "Attendance is already open for this academic period. Close it before opening a new one.");
        }

        if (!sessionRepository
                .findOpenByPeriodTriple(period.getCourse(), period.getBatch(), period.getSemester())
                .isEmpty()) {
            throw new SessionConflictException(
                    "Attendance is already open for this batch (" + period.getCourse() + " / "
                            + period.getBatch() + " / " + period.getSemester()
                            + "). Only one session per batch can be active at a time.");
        }

        User teacher = userRepository.getReferenceById(teacherUserId);

        LocalDateTime now = LocalDateTime.now();

        AttendanceSession session = AttendanceSession.builder()
                .academicPeriodId(period.getId())
                .teacher(teacher)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .radiusMeters(radiusMeters)
                .openedAt(now)
                .expiresAt(now.plusMinutes(sessionDurationMinutes))
                .status(SessionStatus.OPEN)
                .build();

        AttendanceSession saved = sessionRepository.save(session);

        log.info("Attendance session {} opened by user {} for period {} ({}/{}/{}) at {},{} r={}m expires at {}",
                saved.getId(), teacherUserId, period.getId(), period.getCourse(), period.getBatch(),
                period.getSemester(), saved.getLatitude(), saved.getLongitude(), saved.getRadiusMeters(),
                saved.getExpiresAt());

        return toResponse(saved, period);
    }

    // ============================================================
    // CLOSE / LOOKUPS
    // ============================================================

    @Override
    @Transactional
    public AttendanceSessionResponse closeSession(Long sessionId, Long actingUserId, boolean privileged) {

        AttendanceSession session = findOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new SessionUnavailableException("This session has already been closed.",
                    SessionUnavailableException.Reason.SESSION_CLOSED);
        }

        if (isExpired(session)) {
            markExpired(session);
            throw new SessionUnavailableException("This attendance session has already expired.",
                    SessionUnavailableException.Reason.SESSION_EXPIRED);
        }

        if (!privileged && !session.getTeacher().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You can only close your own attendance sessions");
        }

        session.setStatus(SessionStatus.CLOSED);
        session.setClosedAt(LocalDateTime.now());
        sessionRepository.save(session);

        log.info("Attendance session {} manually closed by user {}", sessionId, actingUserId);

        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> getActiveSessions() {
        expireStaleSessions();
        return sessionRepository.findByStatusOrderByOpenedAtDesc(SessionStatus.OPEN).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicPeriodResponse> getOpenablePeriods() {
        return academicPeriodRepository.findByActiveTrueOrderByStartDateDesc().stream()
                .map(this::toPeriodResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSessionResponse getSession(Long id) {
        AttendanceSession session = findOrThrow(id);
        if (session.getStatus() == SessionStatus.OPEN && isExpired(session)) {
            markExpired(session);
        }
        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AttendanceSessionResponse> findActiveForStudent(Student student) {
        expireStaleSessions();
        return sessionRepository
                .findOpenByPeriodTriple(student.getCourse(), student.getBatch(), student.getSemester())
                .stream()
                .filter(s -> !isExpired(s))
                .reduce((a, b) -> a.getOpenedAt().isAfter(b.getOpenedAt()) ? a : b)
                .map(this::toResponse);
    }

    // ============================================================
    // STUDENT SELF-ATTENDANCE — FULL VALIDATION CHAIN
    // ============================================================

    @Override
    @Transactional
    public AttendanceResponse markAttendanceFromSession(
            Long sessionId,
            Student student,
            StudentAttendanceAttemptRequest request) {

        // 1-2. Session must exist and be usable.
        AttendanceSession session = findOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new SessionUnavailableException("This attendance session has been closed.",
                    SessionUnavailableException.Reason.SESSION_CLOSED);
        }
        if (session.getStatus() == SessionStatus.EXPIRED || isExpired(session)) {
            if (session.getStatus() == SessionStatus.OPEN) {
                markExpired(session);
            }
            throw new SessionUnavailableException("This attendance session has expired.",
                    SessionUnavailableException.Reason.SESSION_EXPIRED);
        }

        // 3. Batch eligibility — derived from the authenticated student,
        //    never from client-submitted ids.
        AcademicPeriod period = academicPeriodRepository.findById(session.getAcademicPeriodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Academic period for this session no longer exists."));

        boolean sameCourse = equalsIgnoreCaseTrimmed(student.getCourse(), period.getCourse());
        boolean sameBatch = equalsIgnoreCaseTrimmed(student.getBatch(), period.getBatch());
        boolean sameSemester = equalsIgnoreCaseTrimmed(student.getSemester(), period.getSemester());

        if (!(sameCourse && sameBatch && sameSemester)) {
            log.warn("Eligibility rejected: student {} ({}/{}/{}) vs session {} ({}/{}/{})",
                    student.getId(), student.getCourse(), student.getBatch(), student.getSemester(),
                    session.getId(), period.getCourse(), period.getBatch(), period.getSemester());
            throw new NotEligibleForSessionException(
                    "You are not eligible for this attendance session.");
        }

        // 4. Geofence — authoritative Haversine check on the server.
        double distance = GeoUtil.distanceMeters(
                request.getLatitude(), request.getLongitude(),
                session.getLatitude(), session.getLongitude());

        if (distance > session.getRadiusMeters()) {
            log.warn("Geofence rejected: student {} is {} m away from session {} (radius {} m)",
                    student.getId(), Math.round(distance), session.getId(), session.getRadiusMeters());
            throw new OutsideAttendanceAreaException(
                    "You are outside the attendance area (about " + Math.round(distance)
                            + " m away). Please move closer to the attendance location and try again.");
        }

        // 5. Duplicate prevention.
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing =
                attendanceRepository.findByStudentIdAndAttendanceDate(student.getId(), today);
        if (existing.isPresent()) {
            Attendance previous = existing.get();
            String time = previous.getAttendanceTime() != null
                    ? previous.getAttendanceTime()
                            .format(DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH))
                    : "";
            throw new DuplicateAttendanceException(
                    "Attendance already marked. You were marked present at " + time + ".");
        }

        if (!Boolean.TRUE.equals(student.getFaceRegistered())) {
            throw new IllegalArgumentException(
                    "Your face is not registered yet. Please contact your teacher or admin.");
        }

        // 6-7. Face recognition + anti-proxy identity verification.
        FaceRecognitionClient.RecognizeResponse pythonResponse =
                faceRecognitionClient.recognizeFace(request.getImageBase64());

        if (pythonResponse == null || !Boolean.TRUE.equals(pythonResponse.getMatched())) {
            throw new FaceNotRecognizedException(
                    "Face not recognized — please retake the photo in better lighting.");
        }

        double confidence = pythonResponse.getConfidence() != null ? pythonResponse.getConfidence() : 0.0;

        Long matchedStudentId = pythonResponse.getStudentId();

        if (matchedStudentId != null && !matchedStudentId.equals(student.getId())) {
            // CRITICAL anti-proxy guard: someone else's face was presented.
            log.error("ANTI-PROXY BLOCKED: student account {} attempted attendance with face of student {}",
                    student.getId(), matchedStudentId);
            throw new FaceMismatchException(
                    "The detected face does not match your account. Attendance was not marked.");
        }

        // Reuse the system-wide recognition threshold.
        if (confidence < recognitionThreshold) {
            throw new LowConfidenceException(confidence, recognitionThreshold);
        }

        // 8. Academic-period window + working day checks (same rules as kiosk flow).
        if (today.isBefore(period.getStartDate()) || today.isAfter(period.getEndDate())) {
            throw new IllegalStateException(
                    "Attendance cannot be marked because today is outside the academic period ("
                            + period.getStartDate() + " to " + period.getEndDate() + ")");
        }

        if (!holidayService.isWorkingDay(today)) {
            throw new IllegalStateException(
                    "Attendance cannot be marked on a non-working day: " + today);
        }

        // All validations passed → mark PRESENT.
        Attendance attendance = Attendance.builder()
                .student(student)
                .attendanceDate(today)
                .attendanceTime(LocalTime.now())
                .status(AttendanceStatus.PRESENT)
                .confidenceScore(confidence)
                .attendanceMethod(AttendanceMethod.FACE)
                .attendanceSessionId(session.getId())
                .build();

        Attendance saved = attendanceRepository.save(attendance);

        log.info("Session attendance marked: student={} via session={} confidence={}",
                student.getId(), session.getId(), confidence);

        return attendanceMapper.toDto(saved);
    }

    // ============================================================
    // EXPIRY
    // ============================================================

    @Override
    @Transactional
    public void expireStaleSessions() {
        List<AttendanceSession> open = sessionRepository.findByStatusOrderByOpenedAtDesc(SessionStatus.OPEN);
        List<AttendanceSession> stale = open.stream()
                .filter(this::isExpired)
                .toList();
        if (stale.isEmpty()) {
            return;
        }
        stale.forEach(s -> s.setStatus(SessionStatus.EXPIRED));
        sessionRepository.saveAll(stale);
        log.info("Auto-expired {} attendance session(s)", stale.size());
    }

    private boolean isExpired(AttendanceSession session) {
        return session.getExpiresAt() != null && LocalDateTime.now().isAfter(session.getExpiresAt());
    }

    private void markExpired(AttendanceSession session) {
        session.setStatus(SessionStatus.EXPIRED);
        sessionRepository.save(session);
    }

    private AttendanceSession findOrThrow(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attendance session not found with id: " + id));
    }

    private AttendanceSessionResponse toResponse(AttendanceSession session) {
        AcademicPeriod period = academicPeriodRepository
                .findById(session.getAcademicPeriodId())
                .orElse(null);
        return toResponse(session, period);
    }

    private AcademicPeriodResponse toPeriodResponse(AcademicPeriod period) {
        return AcademicPeriodResponse.builder()
                .id(period.getId())
                .name(period.getName())
                .course(period.getCourse())
                .batch(period.getBatch())
                .semester(period.getSemester())
                .startDate(period.getStartDate())
                .endDate(period.getEndDate())
                .active(period.isActive())
                .build();
    }

    private AttendanceSessionResponse toResponse(AttendanceSession session, AcademicPeriod period) {

        long remaining = Duration.between(LocalDateTime.now(), session.getExpiresAt()).getSeconds();

        AttendanceSessionResponse.AttendanceSessionResponseBuilder builder = AttendanceSessionResponse.builder()
                .id(session.getId())
                .academicPeriodId(session.getAcademicPeriodId())
                .teacherUserId(session.getTeacher() != null ? session.getTeacher().getId() : null)
                .teacherName(session.getTeacher() != null ? session.getTeacher().getFullName() : null)
                .latitude(session.getLatitude())
                .longitude(session.getLongitude())
                .radiusMeters(session.getRadiusMeters())
                .openedAt(session.getOpenedAt())
                .expiresAt(session.getExpiresAt())
                .closedAt(session.getClosedAt())
                .status(session.getStatus())
                .remainingSeconds(Math.max(0, remaining));

        if (period != null) {
            builder.periodName(period.getName())
                    .course(period.getCourse())
                    .batch(period.getBatch())
                    .semester(period.getSemester())
                    .periodStartDate(period.getStartDate() != null ? period.getStartDate().atStartOfDay() : null)
                    .periodEndDate(period.getEndDate() != null ? period.getEndDate().atStartOfDay() : null);
        }

        return builder.build();
    }

    private boolean equalsIgnoreCaseTrimmed(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return a.trim().toLowerCase(Locale.ROOT).equals(b.trim().toLowerCase(Locale.ROOT));
    }
}
