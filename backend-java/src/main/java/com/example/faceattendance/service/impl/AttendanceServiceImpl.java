package com.example.faceattendance.service.impl;

import com.example.faceattendance.client.FaceRecognitionClient;
import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.attendance.AttendanceSummaryResponse;
import com.example.faceattendance.dto.attendance.RecognizeAttendanceRequest;
import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.exception.DuplicateAttendanceException;
import com.example.faceattendance.exception.FaceNotRecognizedException;
import com.example.faceattendance.exception.LowConfidenceException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.mapper.AttendanceMapper;
import com.example.faceattendance.repository.AttendanceRepository;
import com.example.faceattendance.repository.FaceDataRepository;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.AcademicPeriodService;
import com.example.faceattendance.service.AttendanceService;
import com.example.faceattendance.service.EmbeddingCacheService;
import com.example.faceattendance.service.HolidayService;
import com.example.faceattendance.util.PerfMonitor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final FaceDataRepository faceDataRepository;

    // NEW: In-memory embedding cache
    private final EmbeddingCacheService embeddingCacheService;

    private final FaceRecognitionClient faceRecognitionClient;
    private final AttendanceMapper attendanceMapper;
    private final HolidayService holidayService;
    private final AcademicPeriodService academicPeriodService;

    @Value("${face.recognition.threshold:0.6}")
    private double recognitionThreshold;

    private final PerfMonitor perf;


    // ============================================================
    // RECOGNIZE AND MARK ATTENDANCE
    // ============================================================

    @Override
    @Transactional
    public AttendanceResponse recognize(
            RecognizeAttendanceRequest request) {

        PerfMonitor.Snapshot totalSnap = perf.start();

        if (perf.isEnabled() && request.getImageBase64() != null) {
            String b64 = request.getImageBase64();

            perf.logInfo(
                    "Base64 string received : {} KB ({} chars)",
                    String.format("%.1f", b64.length() / 1024.0),
                    b64.length()
            );
        }


        // --------------------------------------------------------
        // 1. Load embeddings from IN-MEMORY CACHE
        // --------------------------------------------------------

        PerfMonitor.Snapshot cacheSnap = perf.start();

        List<FaceRecognitionClient.CandidateEmbedding> candidates =
                embeddingCacheService.getCandidates();

        perf.stop(
                "Recognize - get embeddings from memory cache",
                cacheSnap
        );

        perf.logInfo(
                "Candidate count from cache : {}",
                candidates.size()
        );

        if (candidates.isEmpty()) {

            throw new FaceNotRecognizedException(
                    "No faces are registered in the system yet."
            );
        }


        // --------------------------------------------------------
        // 2. Call Python face recognition service
        // --------------------------------------------------------

        PerfMonitor.Snapshot pythonSnap = perf.start();

        FaceRecognitionClient.RecognizeResponse pythonResponse =
                faceRecognitionClient.recognizeFace(
                        request.getImageBase64());

        perf.stop(
                "Recognize - Python service call (network + CV pipeline, "
                        + candidates.size()
                        + " candidates)",
                pythonSnap
        );


        // --------------------------------------------------------
        // 3. Validate recognition result
        // --------------------------------------------------------

        if (pythonResponse == null
                || !Boolean.TRUE.equals(
                pythonResponse.getMatched())) {

            throw new FaceNotRecognizedException(
                    "Face not recognized — no matching student found."
            );
        }

        double confidence =
                pythonResponse.getConfidence() != null
                        ? pythonResponse.getConfidence()
                        : 0.0;

        if (confidence < recognitionThreshold) {

            throw new LowConfidenceException(
                    confidence,
                    recognitionThreshold
            );
        }

        Long matchedStudentId =
                pythonResponse.getStudentId();

        if (matchedStudentId == null) {

            throw new FaceNotRecognizedException(
                    "Face recognition service returned a match "
                            + "but no student ID."
            );
        }


        // --------------------------------------------------------
        // 4. Find ONLY the matched student
        // --------------------------------------------------------

        PerfMonitor.Snapshot studentLookupSnap = perf.start();

        Student student =
                studentRepository.findById(matchedStudentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Matched student not found: "
                                                + matchedStudentId
                                )
                        );

        perf.stop(
                "Recognize - matched student DB lookup",
                studentLookupSnap
        );


        LocalDate today = LocalDate.now();


        // --------------------------------------------------------
        // 5. Find active academic period
        // --------------------------------------------------------

        log.info(
                "DEBUG BEFORE ACADEMIC PERIOD LOOKUP: "
                        + "studentId={}, name={}, branch=[{}], semester=[{}]",
                student.getId(),
                student.getFullName(),
                student.getBatch(),
                student.getSemester()
        );

        AcademicPeriodResponse period =
                academicPeriodService.getActive(
                        student.getCourse(),
                        student.getBatch(),
                        student.getSemester()
                );

        log.info(
                "DEBUG AcademicPeriod lookup: "
                        + "studentId={}, name={}, batch=[{}], semester=[{}]",
                student.getId(),
                student.getFullName(),
                student.getBatch(),
                student.getSemester()
        );


        // --------------------------------------------------------
        // 6. Make sure today is inside active semester
        // --------------------------------------------------------

        if (today.isBefore(period.getStartDate())
                || today.isAfter(period.getEndDate())) {

            throw new IllegalStateException(
                    "Attendance cannot be marked because today "
                            + "is outside the active academic period: "
                            + period.getSemester()
                            + " ("
                            + period.getStartDate()
                            + " to "
                            + period.getEndDate()
                            + ")"
            );
        }


        // --------------------------------------------------------
        // 7. Check working day
        // --------------------------------------------------------

        if (!holidayService.isWorkingDay(today)) {

            throw new IllegalStateException(
                    "Attendance cannot be marked on a "
                            + "non-working day: "
                            + today
            );
        }


        // --------------------------------------------------------
        // 8. Prevent duplicate attendance
        // --------------------------------------------------------

        if (attendanceRepository
                .existsByStudentIdAndAttendanceDate(
                        student.getId(),
                        today
                )) {

            throw new DuplicateAttendanceException(
                    "Attendance already marked for student '"
                            + student.getFullName()
                            + "' on "
                            + today
            );
        }


        // --------------------------------------------------------
        // 9. Save attendance
        // --------------------------------------------------------

        Attendance attendance =
                Attendance.builder()
                        .student(student)
                        .attendanceDate(today)
                        .attendanceTime(LocalTime.now())
                        .status(AttendanceStatus.PRESENT)
                        .confidenceScore(confidence)
                        .build();

        PerfMonitor.Snapshot saveSnap = perf.start();

        Attendance saved =
                attendanceRepository.save(attendance);

        perf.stop(
                "Recognize - Attendance DB save",
                saveSnap
        );

        log.info(
                "Attendance marked: studentId={}, date={}, confidence={}",
                student.getId(),
                today,
                confidence
        );

        perf.stop(
                "Recognize - TOTAL (end-to-end)",
                totalSnap
        );

        return attendanceMapper.toDto(saved);
    }


    // ============================================================
    // HISTORY / FILTERING
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getAll(
            Pageable pageable,
            Long studentId,
            LocalDate date,
            LocalDate startDate,
            LocalDate endDate,
            AttendanceStatus status) {

        if (date != null) {
            startDate = date;
            endDate = date;
        }

        Page<Attendance> page =
                attendanceRepository.findWithFilters(
                        studentId,
                        startDate,
                        endDate,
                        status,
                        pageable
                );

        // Batch-compute attendance percentage for students
        // appearing on this page.
        List<Student> studentsOnPage =
                page.getContent().stream()
                        .map(Attendance::getStudent)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        Map<Long, Double> percentageByStudentId =
                getAttendancePercentages(studentsOnPage);

        return page.map(attendance -> {

            AttendanceResponse response =
                    attendanceMapper.toDto(attendance);

            Student student =
                    attendance.getStudent();

            if (student != null) {
                response.setAttendancePercentage(
                        percentageByStudentId.get(student.getId())
                );
            }

            return response;
        });
    }


    // ============================================================
    // ABSENT STUDENTS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getAbsentStudents(
            Pageable pageable,
            LocalDate date) {

        if (!holidayService.isWorkingDay(date)) {
            return Page.empty(pageable);
        }

        return studentRepository
                .findAbsentOnDate(
                        date,
                        AttendanceStatus.PRESENT,
                        pageable
                )
                .map(student ->
                        toAbsentResponse(
                                student,
                                date
                        )
                );
    }


    // ============================================================
    // TODAY'S DASHBOARD SUMMARY
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getSummaryToday() {

        LocalDate today = LocalDate.now();

        long totalStudents =
                faceDataRepository.count();


        // --------------------------------------------------------
        // Today is not a working day
        // --------------------------------------------------------

        if (!holidayService.isWorkingDay(today)) {

            return AttendanceSummaryResponse.builder()
                    .date(today)
                    .totalStudents(totalStudents)
                    .presentCount(0L)
                    .absentCount(0L)
                    .attendancePercentage(0.0)
                    .build();
        }


        // --------------------------------------------------------
        // Count today's present students
        // --------------------------------------------------------

        long presentCount =
                attendanceRepository
                        .countByAttendanceDateAndStatus(
                                today,
                                AttendanceStatus.PRESENT
                        );


        // --------------------------------------------------------
        // Calculate absent students
        // --------------------------------------------------------

        long absentCount =
                Math.max(
                        0,
                        totalStudents - presentCount
                );


        // --------------------------------------------------------
        // Calculate percentage
        // --------------------------------------------------------

        double percentage =
                totalStudents == 0
                        ? 0.0
                        : Math.round(
                        (
                                presentCount
                                * 100.0
                                / totalStudents
                        ) * 100.0
                ) / 100.0;


        return AttendanceSummaryResponse.builder()
                .date(today)
                .totalStudents(totalStudents)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .attendancePercentage(percentage)
                .build();
    }


    // ============================================================
    // ATTENDANCE PERCENTAGE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Double> getAttendancePercentages(
            List<Student> students) {

        Map<Long, Double> result =
                new HashMap<>();

        if (students == null || students.isEmpty()) {
            return result;
        }


        // Group students sharing the same academic period.
        Map<String, List<Student>> groupedByPeriod =
                new HashMap<>();

        for (Student student : students) {

            if (student.getCourse() == null
                    || student.getBatch() == null
                    || student.getSemester() == null) {

                continue;
            }

            String key =
                    student.getCourse()
                            + "||"
                            + student.getBatch()
                            + "||"
                            + student.getSemester();

            groupedByPeriod
                    .computeIfAbsent(
                            key,
                            k -> new ArrayList<>()
                    )
                    .add(student);
        }

        LocalDate today = LocalDate.now();

        for (List<Student> group :
                groupedByPeriod.values()) {

            Student sample = group.get(0);

            Optional<AcademicPeriodResponse> maybePeriod =
                    academicPeriodService.findActive(
                            sample.getCourse(),
                            sample.getBatch(),
                            sample.getSemester()
                    );

            if (maybePeriod.isEmpty()) {

                continue;
            }

            AcademicPeriodResponse period =
                    maybePeriod.get();

            LocalDate end =
                    today.isBefore(period.getEndDate())
                            ? today
                            : period.getEndDate();

            if (end.isBefore(
                    period.getStartDate())) {

                for (Student s : group) {
                    result.put(
                            s.getId(),
                            0.0
                    );
                }

                continue;
            }

            long totalApplicableClasses =
                    holidayService.countWorkingDays(
                            period.getStartDate(),
                            end
                    );

            if (totalApplicableClasses <= 0) {

                for (Student s : group) {
                    result.put(
                            s.getId(),
                            0.0
                    );
                }

                continue;
            }

            List<Long> studentIds =
                    group.stream()
                            .map(Student::getId)
                            .toList();

            Map<Long, Long> presentCountByStudentId =
                    attendanceRepository
                            .countPresentByStudentIds(
                                    studentIds,
                                    AttendanceStatus.PRESENT,
                                    period.getStartDate(),
                                    end
                            )
                            .stream()
                            .collect(
                                    Collectors.toMap(
                                            row -> (Long) row[0],
                                            row -> (Long) row[1]
                                    )
                            );

            for (Student s : group) {

                long present =
                        presentCountByStudentId
                                .getOrDefault(
                                        s.getId(),
                                        0L
                                );

                double percentage =
                        Math.round(
                                (
                                        present * 100.0
                                                / totalApplicableClasses
                                ) * 100.0
                        ) / 100.0;

                result.put(
                        s.getId(),
                        percentage
                );
            }
        }

        return result;
    }


    // ============================================================
    // HELPER — ABSENT RESPONSE
    // ============================================================

    private AttendanceResponse toAbsentResponse(
            Student student,
            LocalDate date) {

        return AttendanceResponse.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .studentNumber(student.getStudentNumber())
                .course(student.getCourse())
                .batch(student.getBatch())
                .semester(student.getSemester())
                .year(student.getYear())
                .attendancePercentage(
                        getAttendancePercentages(
                                List.of(student)
                        ).get(student.getId())
                )
                .attendanceDate(date)
                .status(AttendanceStatus.ABSENT)
                .build();
    }
}