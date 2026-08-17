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
}