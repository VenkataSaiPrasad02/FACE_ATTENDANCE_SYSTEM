package com.example.faceattendance.repository;

import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByStudentNumber(String studentNumber);

    Optional<Student> findByStudentNumber(String studentNumber);

    @Query("""
            SELECT s FROM Student s
            WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(s.studentNumber) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    Page<Student> searchByNameOrNumber(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            SELECT s FROM Student s
            WHERE NOT EXISTS (
                SELECT 1
                FROM Attendance a
                WHERE a.student.id = s.id
                  AND a.attendanceDate = :date
                  AND a.status = :presentStatus
            )
            """)
    Page<Student> findAbsentOnDate(
            @Param("date") LocalDate date,
            @Param("presentStatus") AttendanceStatus presentStatus,
            Pageable pageable
    );

    Page<Student> findByCourse(
            String course,
            Pageable pageable
    );

    Page<Student> findByYear(
            String year,
            Pageable pageable
    );

    Page<Student> findByCourseAndYear(
            String course,
            String year,
            Pageable pageable
    );

    long countByFaceRegisteredTrue();

    Optional<Student> findByUserId(Long userId);

    List<Student> findByUserIsNull();

    /*
     * Combined search + course/batch/semester/year filtering.
     * All parameters are optional (null-tolerant) so the same query
     * powers plain search, pure filters, and both together — without
     * loading the whole table into memory.
     */
    @Query("""
            SELECT s FROM Student s
            WHERE (:search IS NULL
                   OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.studentNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:course IS NULL OR LOWER(s.course) = LOWER(:course))
              AND (:batch IS NULL OR LOWER(s.batch) = LOWER(:batch))
              AND (:semester IS NULL OR LOWER(s.semester) = LOWER(:semester))
              AND (:year IS NULL OR LOWER(s.year) = LOWER(:year))
              AND (:teacherId IS NULL OR s.teacher.id = :teacherId)
            """)
    Page<Student> findWithFilters(
            @Param("search") String search,
            @Param("course") String course,
            @Param("batch") String batch,
            @Param("semester") String semester,
            @Param("year") String year,
            @Param("teacherId") Long teacherId,
            Pageable pageable
    );

    // Distinct values for building filter dropdowns server-side.
    @Query("SELECT DISTINCT s.course FROM Student s WHERE s.course IS NOT NULL AND s.course <> '' ORDER BY s.course")
    List<String> findDistinctCourses();

    @Query("SELECT DISTINCT s.batch FROM Student s WHERE s.batch IS NOT NULL AND s.batch <> '' ORDER BY s.batch")
    List<String> findDistinctBatches();

    @Query("SELECT DISTINCT s.semester FROM Student s WHERE s.semester IS NOT NULL AND s.semester <> '' ORDER BY s.semester")
    List<String> findDistinctSemesters();

    @Query("SELECT DISTINCT s.year FROM Student s WHERE s.year IS NOT NULL AND s.year <> '' ORDER BY s.year")
    List<String> findDistinctYears();
}