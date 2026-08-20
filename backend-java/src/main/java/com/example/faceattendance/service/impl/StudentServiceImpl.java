package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.student.CreateStudentRequest;
import com.example.faceattendance.dto.student.StudentResponse;
import com.example.faceattendance.dto.student.UpdateStudentRequest;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.exception.DuplicateStudentException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.mapper.StudentMapper;
import com.example.faceattendance.repository.AttendanceRepository;
import com.example.faceattendance.repository.FaceDataRepository;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.AttendanceService;
import com.example.faceattendance.service.EmbeddingCacheService;
import com.example.faceattendance.service.StudentService;
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

        Student saved = studentRepository.save(student);

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
            String search) {

        Page<Student> page =
                StringUtils.hasText(search)
                        ? studentRepository.searchByNameOrNumber(
                        search.trim(),
                        pageable
                )
                        : studentRepository.findAll(pageable);

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
            student.setYear(request.getYear());
        }

        if (StringUtils.hasText(request.getBatch())) {
            student.setBatch(request.getBatch().trim());
        }

        if (StringUtils.hasText(request.getSemester())) {
            student.setSemester(
                    formatSemester(request.getSemester())
            );
        }

        Student saved = studentRepository.save(student);

        log.info(
                "Student updated: id={}",
                saved.getId()
        );

        return studentMapper.toDto(saved);
    }

    private String formatSemester(String semester) {

        if (semester == null || semester.isBlank()) {
            return semester;
        }

        String value = semester.trim();

        // Already formatted
        if (value.matches("\\d+(st|nd|rd|th) Semester")) {
            return value;
        }

        return switch (value) {
            case "1" -> "1st Semester";
            case "2" -> "2nd Semester";
            case "3" -> "3rd Semester";
            case "4" -> "4th Semester";
            case "5" -> "5th Semester";
            case "6" -> "6th Semester";
            case "7" -> "7th Semester";
            case "8" -> "8th Semester";
            default -> value;
        };
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
        // 5. Refresh Java embedding cache
        // ---------------------------------------------------------

        stepStart = System.nanoTime();

        embeddingCacheService.refresh();

        log.info(
                "[DELETE] Embedding cache refresh + Python sync: {} ms | cachedCandidates={}",
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