package com.example.faceattendance.mapper;

import com.example.faceattendance.dto.attendance.AttendanceResponse;
import com.example.faceattendance.entity.Attendance;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {

    public AttendanceResponse toDto(Attendance attendance) {

        if (attendance == null) {
            return null;
        }

        var student = attendance.getStudent();

        return AttendanceResponse.builder()
                .id(attendance.getId())
                .studentId(
                        student != null
                                ? student.getId()
                                : null
                )
                .studentName(
                        student != null
                                ? student.getFullName()
                                : null
                )
                .studentNumber(
                        student != null
                                ? student.getStudentNumber()
                                : null
                )
                .course(
                        student != null
                                ? student.getCourse()
                                : null
                )
                .batch(
                        student != null
                                ? student.getBatch()
                                : null
                )
                .semester(
                        student != null
                                ? student.getSemester()
                                : null
                )
                .year(
                        student != null
                                ? student.getYear()
                                : null
                )
                .attendanceDate(attendance.getAttendanceDate())
                .attendanceTime(attendance.getAttendanceTime())
                .status(attendance.getStatus())
                .confidenceScore(attendance.getConfidenceScore())
                .attendanceMethod(attendance.getAttendanceMethod())
                .markedByUserId(attendance.getMarkedByUserId())
                .attendanceSessionId(attendance.getAttendanceSessionId())
                .createdAt(attendance.getCreatedAt())
                .build();
    }
}