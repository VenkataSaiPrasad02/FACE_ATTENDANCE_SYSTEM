package com.example.faceattendance.repository;

import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    boolean existsByStudentIdAndAttendanceDate(
            Long studentId,
            LocalDate date
    );

    Optional<Attendance> findByStudentIdAndAttendanceDate(
            Long studentId,
            LocalDate date
    );

    Page<Attendance> findByStudentId(
            Long studentId,
            Pageable pageable
    );

    Page<Attendance> findByAttendanceDate(
            LocalDate date,
            Pageable pageable
    );

    Page<Attendance> findByAttendanceDateBetween(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );

    Page<Attendance> findByStatus(
            AttendanceStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Attendance a
            WHERE (:studentId IS NULL
                   OR a.student.id = :studentId)
              AND (:startDate IS NULL
                   OR a.attendanceDate >= :startDate)
              AND (:endDate IS NULL
                   OR a.attendanceDate <= :endDate)
              AND (:status IS NULL
                   OR a.status = :status)
            """)
    Page<Attendance> findWithFilters(
            @Param("studentId") Long studentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") AttendanceStatus status,
            Pageable pageable
    );

    long countByAttendanceDateAndStatus(
            LocalDate date,
            AttendanceStatus status
    );

    List<Attendance> findByAttendanceDate(
            LocalDate date
    );

    @Query("""
            SELECT COUNT(a) FROM Attendance a
            WHERE a.student.id = :studentId
              AND a.status = :status
            """)
    long countByStudentAndStatus(
            @Param("studentId") Long studentId,
            @Param("status") AttendanceStatus status
    );

    long countByStudentIdAndStatusAndAttendanceDateBetween(
            Long studentId,
            Attendance.AttendanceStatus status,
            LocalDate startDate,
            LocalDate endDate
    );

    /*
     * Batch lookup used to avoid N+1 queries when computing
     * attendance percentage for a group of students that share
     * the same academic period.
     */
    @Query("""
            SELECT a.student.id, COUNT(a)
            FROM Attendance a
            WHERE a.student.id IN :studentIds
              AND a.status = :status
              AND a.attendanceDate BETWEEN :startDate AND :endDate
            GROUP BY a.student.id
            """)
    List<Object[]> countPresentByStudentIds(
            @Param("studentIds") List<Long> studentIds,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /*
     * Delete all attendance records belonging to a student.
     *
     * This MUST happen before deleting the Student entity because
     * attendance.student_id has a foreign-key reference to students.id.
     */
    @Modifying
    @Transactional
    @Query("""
            DELETE FROM Attendance a
            WHERE a.student.id = :studentId
            """)
    int deleteByStudentId(
            @Param("studentId") Long studentId
    );
}