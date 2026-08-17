package com.example.faceattendance.service;

import com.example.faceattendance.dto.teacher.CreateTeacherRequest;
import com.example.faceattendance.dto.teacher.TeacherResponse;
import com.example.faceattendance.dto.teacher.UpdateTeacherRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Teacher management service contract.
 */
public interface TeacherService {

    TeacherResponse create(CreateTeacherRequest request);

    Page<TeacherResponse> getAll(Pageable pageable, String search);

    TeacherResponse getById(Long id);

    TeacherResponse update(Long id, UpdateTeacherRequest request);

    void delete(Long id);

}