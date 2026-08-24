package com.example.faceattendance.repository;

import com.example.faceattendance.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    List<AttendanceSession> findByStatusOrderByOpenedAtDesc(AttendanceSession.SessionStatus status);

    /**
     * Any still-open session for the given academic period — used to
     * prevent conflicting duplicate sessions for the same period.
     */
    boolean existsByAcademicPeriodIdAndStatus(
            Long academicPeriodId,
            AttendanceSession.SessionStatus status);

    /**
     * Open sessions whose academic period matches the given
     * course/batch/semester combination. Used to find the active
     * session eligible for a student and to block conflicting
     * sessions for the same class group.
     */
    @Query("""
            SELECT s FROM AttendanceSession s
            JOIN AcademicPeriod p ON s.academicPeriodId = p.id
            WHERE s.status = 'OPEN'
              AND LOWER(p.course) = LOWER(:course)
              AND LOWER(p.batch) = LOWER(:batch)
              AND LOWER(p.semester) = LOWER(:semester)
            """)
    List<AttendanceSession> findOpenByPeriodTriple(
            @Param("course") String course,
            @Param("batch") String batch,
            @Param("semester") String semester);
}
