package com.example.faceattendance.scheduler;

import com.example.faceattendance.service.AttendanceSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Server-authoritative expiry sweep: flips OPEN sessions past their
 * expiresAt to EXPIRED even when nobody touches them, so dashboards
 * and conflict checks always see accurate state.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceSessionExpiryScheduler {

    private final AttendanceSessionService attendanceSessionService;

    @Scheduled(fixedDelay = 30_000, initialDelay = 15_000)
    public void expireSessions() {
        try {
            attendanceSessionService.expireStaleSessions();
        } catch (Exception e) {
            log.warn("Attendance session expiry sweep failed: {}", e.getMessage());
        }
    }
}
