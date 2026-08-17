package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.attendance.DashboardStatsResponse;
import com.example.faceattendance.entity.Attendance.AttendanceStatus;
import com.example.faceattendance.repository.AttendanceRepository;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Dashboard statistics business logic.
 * Computes today's attendance summary, guarding against division by zero.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;

    @Override
    public DashboardStatsResponse getStats() {
        LocalDate today = LocalDate.now();

        long totalStudents = studentRepository.count();
        long presentToday  = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.PRESENT);
        long studentsWithFace = studentRepository.countByFaceRegisteredTrue();

        long absentToday = totalStudents - presentToday;
        if (absentToday < 0) absentToday = 0;

        double attendancePercentage = totalStudents == 0
                ? 0.0
                : Math.round((presentToday * 100.0 / totalStudents) * 100.0) / 100.0;

        return DashboardStatsResponse.builder()
                .totalStudents(totalStudents)
                .presentToday(presentToday)
                .absentToday(absentToday)
                .attendancePercentage(attendancePercentage)
                .studentsWithFace(studentsWithFace)
                .build();
    }
}
