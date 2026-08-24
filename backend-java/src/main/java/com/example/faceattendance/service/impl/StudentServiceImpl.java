package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.student.CreateStudentRequest;
import com.example.faceattendance.dto.student.FilterOptionsResponse;
import com.example.faceattendance.dto.student.StudentResponse;
import com.example.faceattendance.dto.student.UpdateStudentRequest;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.entity.Teacher;
import com.example.faceattendance.exception.DuplicateStudentException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.mapper.StudentMapper;
import com.example.faceattendance.repository.AttendanceRepository;
import com.example.faceattendance.repository.FaceDataRepository;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.repository.TeacherRepository;
import com.example.faceattendance.service.AttendanceService;
import com.example.faceattendance.service.EmbeddingCacheService;
import com.example.faceattendance.service.StudentAccountService;
import com.example.faceattendance.service.StudentService;
import com.example.faceattendance.utils.AcademicLabels;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;
    private final FaceDataRepository faceDataRepository;
    private final EmbeddingCacheService embeddingCacheService;
    private final StudentAccountService studentAccountService;
    private final TeacherRepository teacherRepository;

    @Override
    @Transactional
    public StudentResponse create(CreateStudentRequest request) {

        if (studentRepository.existsByStudentNumber(
                request.getStudentNumber())) {

            throw new DuplicateStudentException(
                    "A student with roll number '"
                            + request.getStudentNumber()
                            + "' already exists"
            );
        }

        Student student = studentMapper.toEntity(request);

        // Normalize semester before saving
        if (StringUtils.hasText(request.getSemester())) {
            student.setSemester(
                    formatSemester(request.getSemester())
            );
        }

        // Normalize academic year before saving ('1' -> '1st Year')
        if (StringUtils.hasText(request.getYear())) {
            student.setYear(
                    formatYear(request.getYear())
            );
        }

        student.setTeacher(
                resolveTeacher(request.getTeacherId())
        );

        Student saved = studentRepository.save(student);

        /*
         * Provision the login account (username = roll number,
         * initial password from configuration, mustChangePassword=true)
         * in the same transaction.
         */
        studentAccountService.ensureAccount(saved);
        saved = studentRepository.save(saved);

        log.info(
                "Student created: id={}, rollNumber={}",
                saved.getId(),
                saved.getStudentNumber()
        );

        return studentMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponse> getAll(
            Pageable pageable,
            String search,
            String course,
            String batch,
            String semester,
            String year,
            Long teacherId) {

        String normalizedSearch = StringUtils.hasText(search)
                ? search.trim()
                : null;

        Page<Student> page = studentRepository.findWithFilters(
                normalizedSearch,
                blankToNull(course),
                blankToNull(batch),
                normalizeSemesterFilter(semester),
                normalizeYearFilter(year),
                teacherId,
                pageable
        );

        /*
         * One grouped calculation for the whole page.
         * Avoids one attendance query per student.
         */
        Map<Long, Double> percentageByStudentId =
                attendanceService.getAttendancePercentages(
                        page.getContent()
                );

        return page.map(student -> {

            StudentResponse response =
                    studentMapper.toDto(student);

            response.setAttendancePercentage(
                    percentageByStudentId.get(student.getId())
            );

            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {

        Student student = findOrThrow(id);

        StudentResponse response =
                studentMapper.toDto(student);

        response.setAttendancePercentage(
                attendanceService
                        .getAttendancePercentages(List.of(student))
                        .get(student.getId())
        );

        return response;
    }

    @Override
    @Transactional
    public StudentResponse update(
            Long id,
            UpdateStudentRequest request) {

        Student student = findOrThrow(id);

        if (StringUtils.hasText(request.getFullName())) {
            student.setFullName(request.getFullName());
        }

        if (StringUtils.hasText(request.getEmail())) {
            student.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone())) {
            student.setPhone(request.getPhone());
        }

        if (StringUtils.hasText(request.getCourse())) {
            student.setCourse(request.getCourse());
        }

        if (StringUtils.hasText(request.getYear())) {
            student.setYear(
                    formatYear(request.getYear())
            );
        }

        if (StringUtils.hasText(request.getBatch())) {
            student.setBatch(request.getBatch().trim());
        }

        if (StringUtils.hasText(request.getSemester())) {
            student.setSemester(
                    formatSemester(request.getSemester())
            );
        }

        /*
         * Teacher assignment: the edit form always sends the full
         * academic block, so a null id here means "no teacher".
         */
        student.setTeacher(
                resolveTeacher(request.getTeacherId())
        );

        /*
         * Keep the login account in sync: roll-number changes rename the
         * username, and missing accounts are provisioned on the spot.
         */
        studentAccountService.ensureAccount(student);

        Student saved = studentRepository.save(student);

        log.info(
                "Student updated: id={}",
                saved.getId()
        );

        return studentMapper.toDto(saved);
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    /** Null-safe teacher lookup; a null id clears the assignment. */
    private Teacher resolveTeacher(Long teacherId) {
        if (teacherId == null) {
            return null;
        }
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher not found: " + teacherId));
    }

    @Override
    @Transactional(readOnly = true)
    public FilterOptionsResponse getFilterOptions() {

        /*
         * Year options must contain ONLY academic year/level values
         * ('1st Year', '2nd Year', ...). Legacy rows sometimes hold
         * batch ranges or bare numbers in the same column; those are
         * normalized and, when they are not year-shaped at all,
         * excluded so Batch values never leak into the Year filter.
         * The stored data itself is left untouched.
         */
        List<String> years = studentRepository
                .findDistinctYears()
                .stream()
                .map(this::formatYear)
                .filter(value -> value != null
                        && value.matches("\\d+(st|nd|rd|th) Year"))
                .distinct()
                .sorted()
                .toList();

        List<String> semesters = studentRepository
                .findDistinctSemesters()
                .stream()
                .map(this::formatSemester)
                .filter(StringUtils::hasText)
                .distinct()
                .sorted()
                .toList();

        return FilterOptionsResponse.builder()
                .courses(studentRepository.findDistinctCourses())
                .batches(studentRepository.findDistinctBatches())
                .semesters(semesters)
                .years(years)
                .build();
    }

    private String normalizeSemesterFilter(String semester) {
        String value = blankToNull(semester);
        return value == null ? null : formatSemester(value);
    }

    private String normalizeYearFilter(String year) {
        String value = blankToNull(year);
        return value == null ? null : formatYear(value);
    }

    private String formatYear(String year) {
        return AcademicLabels.formatYear(year);
    }

    private String formatSemester(String semester) {
        return AcademicLabels.formatSemester(semester);
    }

    @Override
    @Transactional
    public void delete(Long id) {

        long totalStart = System.nanoTime();

        log.info(
                "[DELETE] Starting student deletion: studentId={}",
                id
        );

        // ---------------------------------------------------------
        // 1. Verify student exists
        // ---------------------------------------------------------

        long stepStart = System.nanoTime();

        Student student = findOrThrow(id);

        log.info(
                "[DELETE] Student lookup: {} ms",
                elapsedMs(stepStart)
        );

        // ---------------------------------------------------------
        // 2. Delete attendance records FIRST
        // ---------------------------------------------------------
        /*
         * Attendance contains:
         *
         * attendance.student_id
         *        ↓
         * students.id
         *
         * Therefore, attendance MUST be deleted before Student.
         */

        stepStart = System.nanoTime();

        int attendanceDeleted =
                attendanceRepository.deleteByStudentId(id);

        log.info(
                "[DELETE] Attendance records deleted: count={} | {} ms",
                attendanceDeleted,
                elapsedMs(stepStart)
        );

        /*
         * Force the DELETE statement to reach MySQL now.
         *
         * This guarantees the foreign-key dependent rows are gone
         * before we attempt to delete the Student.
         */
        stepStart = System.nanoTime();

        attendanceRepository.flush();

        log.info(
                "[DELETE] Attendance DB flush: {} ms",
                elapsedMs(stepStart)
        );

        // ---------------------------------------------------------
        // 3. Delete FaceData
        // ---------------------------------------------------------

        stepStart = System.nanoTime();

        boolean faceDataExists =
                faceDataRepository.existsByStudentId(id);

        if (faceDataExists) {
            faceDataRepository.deleteByStudentId(id);
            faceDataRepository.flush();
        }

        log.info(
                "[DELETE] FaceData deleted: exists={} | {} ms",
                faceDataExists,
                elapsedMs(stepStart)
        );

        // ---------------------------------------------------------
        // 4. Delete Student
        // ---------------------------------------------------------

        stepStart = System.nanoTime();

        studentRepository.delete(student);

        /*
         * Force the student DELETE to execute immediately.
         *
         * At this point:
         *   Attendance -> deleted
         *   FaceData   -> deleted
         *
         * Therefore, the Student foreign-key constraints are safe.
         */
        studentRepository.flush();

        log.info(
                "[DELETE] Student DB delete + flush: {} ms",
                elapsedMs(stepStart)
        );

        // ---------------------------------------------------------
        // 5. Update Java embedding cache incrementally (no full reload)
        // ---------------------------------------------------------

        stepStart = System.nanoTime();

        embeddingCacheService.removeCandidate(id);

        log.info(
                "[DELETE] Embedding cache updated + background Python sync queued: {} ms | cachedCandidates={}",
                elapsedMs(stepStart),
                embeddingCacheService.size()
        );

        // ---------------------------------------------------------
        // 6. Total
        // ---------------------------------------------------------

        log.info(
                "[DELETE] COMPLETE: studentId={} | total={} ms",
                id,
                elapsedMs(totalStart)
        );
    }

    private Student findOrThrow(Long id) {

        return studentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id
                        )
                );
    }

    private long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }
}