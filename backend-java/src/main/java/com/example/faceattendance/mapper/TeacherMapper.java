package com.example.faceattendance.mapper;

import com.example.faceattendance.dto.teacher.CreateTeacherRequest;
import com.example.faceattendance.dto.teacher.TeacherResponse;
import com.example.faceattendance.entity.Teacher;
import org.springframework.stereotype.Component;

@Component
public class TeacherMapper {

    public TeacherResponse toDto(Teacher teacher) {
        if (teacher == null) {
            return null;
        }
        return TeacherResponse.builder()
                .id(teacher.getId())
                .fullName(teacher.getUser() != null ? teacher.getUser().getFullName() : null)
                .email(teacher.getEmail())
                .phone(teacher.getPhone())
                .department(teacher.getDepartment())
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
                .profilePhotoUrl(teacher.getUser()!=null?teacher.getUser().getProfilePhotoUrl():null)
                .build();
    }

    public Teacher toEntity(CreateTeacherRequest request) {
        if (request == null) {
            return null;
        }
        return Teacher.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .build();
    }
}