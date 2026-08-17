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
     * Runs every day at 7:44 PM IST.
     */
    @Scheduled(
            cron = "0 0 18 * * *",
            zone = "Asia/Kolkata"
    )
    public void sendDailyAttendanceEmails() {

        LocalDate today = LocalDate.now();

        log.info(
                "Starting daily attendance email process for {}",
                today
        );

        // =========================================================
        // 1. Check whether today is a working day
        // =========================================================

        if (!holidayService.isWorkingDay(today)) {

            log.info(
                    "Today {} is not a working day. " +
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

        log.info(
                "Found {} students for attendance email.",
                students.size()
        );

        // =========================================================
        // 3. Process every student
        // =========================================================

        for (Student student : students) {

            try {

                // -------------------------------------------------
                // Find student's active academic period
                AcademicPeriodResponse academicPeriod =
                        academicPeriodService.getActive(
                                student.getCourse(),
                                student.getBatch(),
                                student.getSemester()
                        );

                LocalDate periodStart =
                        academicPeriod.getStartDate();

                LocalDate periodEnd =
                        academicPeriod.getEndDate();

                // -------------------------------------------------
                // Make sure today is inside the period
                // -------------------------------------------------

                if (today.isBefore(periodStart)
                        || today.isAfter(periodEnd)) {

                    log.info(
                            "StudentId={} is outside academic period. " +
                                    "Period={} to {}, today={}",
                            student.getId(),
                            periodStart,
                            periodEnd,
                            today
                    );

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

                log.info(
                        "StudentId={}, branch={}, batch={}, " +
                                "semester={}, periodStart={}, " +
                                "workingDays={}, presentDays={}, " +
                                "percentage={}",
                        student.getId(),
                        student.getCourse(),
                        student.getBatch(),
                        student.getSemester(),
                        periodStart,
                        workingDays,
                        presentDays,
                        attendancePercentage
                );

                // =================================================
                // PRESENT
                // =================================================

                if (attendance.isPresent()) {

                    emailService.sendAttendanceEmail(
                            student,
                            attendance.get(),
                            attendancePercentage
                    );

                    log.info(
                            "Present email sent to studentId={}",
                            student.getId()
                    );
                }

                // =================================================
                // ABSENT
                // =================================================

                else {

                    emailService.sendAbsentEmail(
                            student,
                            today,
                            attendancePercentage
                    );

                    log.info(
                            "Absent email sent to studentId={}",
                            student.getId()
                    );
                }

            } catch (Exception exception) {

                log.error(
                        "Failed to process attendance email " +
                                "for studentId={}",
                        student.getId(),
                        exception
                );
            }
        }

        log.info(
                "Daily attendance email process completed for {}",
                today
        );
    }
}