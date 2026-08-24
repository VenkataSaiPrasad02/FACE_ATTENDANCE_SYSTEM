package com.example.faceattendance.scheduler;

import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.repository.AttendanceRepository;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.AcademicPeriodService;
import com.example.faceattendance.service.EmailService;
import com.example.faceattendance.service.HolidayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceEmailScheduler {

    private final StudentRepository studentRepository;

    private final AttendanceRepository attendanceRepository;

    private final HolidayService holidayService;

    private final AcademicPeriodService academicPeriodService;

    private final EmailService emailService;

    /**
     * Runs every day at 6:00 PM IST.
     */
    @Scheduled(
            cron = "0 0 18 * * *",
            zone = "Asia/Kolkata"
    )
    public void sendDailyAttendanceEmails() {

        LocalDate today = LocalDate.now();

        // [ATTENDANCE EMAIL] 1. Scheduler triggered
        log.info("[ATTENDANCE EMAIL] 1. Scheduler triggered for date {}", today);

        // =========================================================
        // 1. Check whether today is a working day
        // =========================================================

        boolean workingDay = holidayService.isWorkingDay(today);

        // [ATTENDANCE EMAIL] 2a. Working-day check result
        log.info(
                "[ATTENDANCE EMAIL] 2a. isWorkingDay({}) = {}",
                today,
                workingDay
        );

        if (!workingDay) {

            log.info(
                    "[ATTENDANCE EMAIL] Today {} is not a working day. " +
                            "Attendance emails skipped.",
                    today
            );

            return;
        }

        // =========================================================
        // 2. Get all students
        // =========================================================

        List<Student> students =
                studentRepository.findAll();

        // [ATTENDANCE EMAIL] 2b. Attendance data retrieval — student roster
        log.info(
                "[ATTENDANCE EMAIL] 2b. Found {} students for attendance email.",
                students.size()
        );

        int emailsSent = 0;
        int studentsSkipped = 0;
        int studentsFailed = 0;

        // =========================================================
        // 3. Process every student
        // =========================================================

        for (Student student : students) {

            try {

                // -------------------------------------------------
                // Find student's active academic period.
                //
                // findActive() deliberately returns Optional instead of
                // throwing: students from older/other batches legitimately
                // have no active period and must be SKIPPED with an info
                // line — not reported as email failures. The previous
                // getActive() call threw ResourceNotFoundException here,
                // which surfaced as a scary per-student ERROR even though
                // nothing was wrong with the mail pipeline.
                // -------------------------------------------------
                Optional<AcademicPeriodResponse> academicPeriodOpt =
                        academicPeriodService.findActive(
                                student.getCourse(),
                                student.getBatch(),
                                student.getSemester()
                        );

                if (academicPeriodOpt.isEmpty()) {

                    // [ATTENDANCE EMAIL] skip — no active period for this triple
                    log.info(
                            "[ATTENDANCE EMAIL] Skipping studentId={} ({}/{}/{}): " +
                                    "no active academic period.",
                            student.getId(),
                            student.getCourse(),
                            student.getBatch(),
                            student.getSemester()
                    );

                    studentsSkipped++;
                    continue;
                }

                AcademicPeriodResponse academicPeriod =
                        academicPeriodOpt.get();

                LocalDate periodStart =
                        academicPeriod.getStartDate();

                LocalDate periodEnd =
                        academicPeriod.getEndDate();

                // -------------------------------------------------
                // Make sure today is inside the period
                // -------------------------------------------------

                boolean beforePeriod =
                        periodStart != null && today.isBefore(periodStart);

                boolean afterPeriod =
                        periodEnd != null && today.isAfter(periodEnd);

                if (beforePeriod || afterPeriod) {

                    log.info(
                            "[ATTENDANCE EMAIL] Skipping studentId={}: today={} " +
                                    "outside academic period {} to {}",
                            student.getId(),
                            today,
                            periodStart,
                            periodEnd
                    );

                    studentsSkipped++;
                    continue;
                }

                // -------------------------------------------------
                // Calculate working days
                // from academic period start → today
                // -------------------------------------------------

                long workingDays =
                        holidayService.countWorkingDays(
                                periodStart,
                                today
                        );

                // -------------------------------------------------
                // Check today's attendance
                // -------------------------------------------------

                Optional<Attendance> attendance =
                        attendanceRepository
                                .findByStudentIdAndAttendanceDate(
                                        student.getId(),
                                        today
                                );

                // [ATTENDANCE EMAIL] 3. Attendance data fetched for this student
                log.info(
                        "[ATTENDANCE EMAIL] 3. studentId={} recordsToday={} " +
                                "(periodStart={}, workingDays={})",
                        student.getId(),
                        attendance.isPresent(),
                        periodStart,
                        workingDays
                );

                // -------------------------------------------------
                // Count PRESENT only inside this period
                // -------------------------------------------------

                long presentDays =
                        attendanceRepository
                                .countByStudentIdAndStatusAndAttendanceDateBetween(
                                        student.getId(),
                                        Attendance.AttendanceStatus.PRESENT,
                                        periodStart,
                                        today
                                );

                // -------------------------------------------------
                // Calculate percentage
                // -------------------------------------------------

                double attendancePercentage = 0.0;

                if (workingDays > 0) {

                    attendancePercentage =
                            (presentDays * 100.0)
                                    / workingDays;
                }

                attendancePercentage =
                        Math.min(
                                attendancePercentage,
                                100.0
                        );

                // -------------------------------------------------
                // Recipient check
                // -------------------------------------------------

                if (student.getEmail() == null
                        || student.getEmail().isBlank()) {

                    // [ATTENDANCE EMAIL] 4. No recipient for this student
                    log.warn(
                            "[ATTENDANCE EMAIL] 4. Skipping studentId={}: no email address on file.",
                            student.getId()
                    );

                    studentsSkipped++;
                    continue;
                }

                // [ATTENDANCE EMAIL] 4. Recipient found
                log.info(
                        "[ATTENDANCE EMAIL] 4. studentId={}, branch={}, batch={}, " +
                                "semester={}, recipient={}, presentDays={}, " +
                                "percentage={}",
                        student.getId(),
                        student.getCourse(),
                        student.getBatch(),
                        student.getSemester(),
                        student.getEmail(),
                        presentDays,
                        attendancePercentage
                );

                // =================================================
                // PRESENT
                // =================================================

                if (attendance.isPresent()) {

                    // [ATTENDANCE EMAIL] 5. Report generated (PRESENT)
                    log.info(
                            "[ATTENDANCE EMAIL] 5. Building PRESENT report for studentId={} " +
                                    "(date={}, time={})",
                            student.getId(),
                            attendance.get().getAttendanceDate(),
                            attendance.get().getAttendanceTime()
                    );

                    emailService.sendAttendanceEmail(
                            student,
                            attendance.get(),
                            attendancePercentage
                    );

                    log.info(
                            "[ATTENDANCE EMAIL] 8. Present email sent to studentId={}",
                            student.getId()
                    );
                }

                // =================================================
                // ABSENT
                // =================================================

                else {

                    // [ATTENDANCE EMAIL] 5. Report generated (ABSENT)
                    log.info(
                            "[ATTENDANCE EMAIL] 5. Building ABSENT report for studentId={} (date={})",
                            student.getId(),
                            today
                    );

                    emailService.sendAbsentEmail(
                            student,
                            today,
                            attendancePercentage
                    );

                    log.info(
                            "[ATTENDANCE EMAIL] 8. Absent email sent to studentId={}",
                            student.getId()
                    );
                }

                emailsSent++;

            } catch (Exception exception) {

                studentsFailed++;

                // Full stack trace with causes — never swallowed.
                log.error(
                        "[ATTENDANCE EMAIL] Failed to process attendance email "
                                + "for studentId={}",
                        student.getId(),
                        exception
                );
            }
        }

        log.info(
                "[ATTENDANCE EMAIL] Daily attendance email process completed for {}: " +
                        "emailsSent={}, skipped={}, failed={}",
                today,
                emailsSent,
                studentsSkipped,
                studentsFailed
        );
    }
}
