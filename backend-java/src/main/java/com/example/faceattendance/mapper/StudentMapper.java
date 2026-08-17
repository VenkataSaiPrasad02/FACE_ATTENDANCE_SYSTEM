package com.example.faceattendance.mapper;

import com.example.faceattendance.dto.student.CreateStudentRequest;
import com.example.faceattendance.dto.student.StudentResponse;
import com.example.faceattendance.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    public StudentResponse toDto(Student student) {

        if (student == null) {
            return null;
        }

        return StudentResponse.builder()
                .id(student.getId())
                .studentNumber(student.getStudentNumber())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .course(student.getCourse())
                .batch(student.getBatch())
                .semester(student.getSemester())
                .year(student.getYear())
                .faceRegistered(student.getFaceRegistered())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    public Student toEntity(CreateStudentRequest request) {

        if (request == null) {
            return null;
        }

        return Student.builder()
                .studentNumber(request.getStudentNumber())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .course(request.getCourse())
                .batch(request.getBatch())
                .semester(request.getSemester())
                .year(request.getYear())
                .faceRegistered(false)
                .build();
    }
}