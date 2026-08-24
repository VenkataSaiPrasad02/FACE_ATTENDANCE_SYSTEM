package com.example.faceattendance.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * TEMPORARY diagnostic helper — DO NOT SHIP ENABLED.
 *
 * Fires the daily attendance-email job exactly once at startup when
 * --email.trigger.run=true is passed. Used to reproduce/verify the
 * scheduled email flow outside the 18:00 IST cron window. Inactive
 * unless explicitly enabled on the command line.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "email.trigger.run", havingValue = "true")
public class AttendanceEmailSchedulerTrigger implements CommandLineRunner {

    private final AttendanceEmailScheduler scheduler;

    @Override
    public void run(String... args) {
        log.warn("[ATTENDANCE EMAIL] TEMP trigger active — running sendDailyAttendanceEmails() once");
        new Thread(() -> {
            try {
                Thread.sleep(5_000); // let pools/SMTP settle
                scheduler.sendDailyAttendanceEmails();
            } catch (Exception e) {
                log.error("[ATTENDANCE EMAIL] TEMP trigger failed", e);
            }
        }, "temp-email-trigger").start();
    }
}
