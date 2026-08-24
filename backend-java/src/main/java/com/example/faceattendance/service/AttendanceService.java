package com.example.faceattendance.service;

import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.dto.attendance.RecognizeAttendanceRequest;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.faceattendance.dto.attendance.AttendanceSummaryResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Attendance management service contract.
 */
public interface AttendanceService {

    /**
     * Recognizes a face and marks attendance if a confident match is found.
     */
    AttendanceResponse recognize(RecognizeAttendanceRequest request);

    /**
     * Manually marks a student PRESENT on the given date (today when
     * omitted). Records an audit trail: method = MANUAL plus the
     * userId of the teacher/admin/super-admin performing the action.
     */
    AttendanceResponse markManual(
            com.example.faceattendance.dto.attendance.ManualAttendanceRequest request,
            Long markedByUserId
    );

    /**
     * Returns paginated attendance records with optional filters.
     */
    Page<AttendanceResponse> getAll(
            Pageable pageable,
            Long studentId,
            LocalDate date,
            LocalDate startDate,
            LocalDate endDate,
            AttendanceStatus status
    );
    /**
     * Returns today's attendance summary.
     */
    AttendanceSummaryResponse getSummaryToday();
    /**
     * Returns students who do not have a PRESENT record for the supplied date.
     * These are calculated records and are not persisted as attendance rows.
     */
    Page<AttendanceResponse> getAbsentStudents(
            Pageable pageable,
            LocalDate date
    );

    /**
     * Calculates attendance percentage for each given student, based on
     * each student's active academic period (course + batch + semester).
     * Students are internally grouped by their academic period so this
     * runs a small, bounded number of queries no matter how many
     * students are passed in — never one query/request per student.
     * A student with no active academic period maps to null.
     */
    Map<Long, Double> getAttendancePercentages(List<Student> students);

    /**
     * Number of PRESENT records for a student between two dates (inclusive).
     */
    long countPresent(Long studentId, LocalDate startDate, LocalDate endDate);

}