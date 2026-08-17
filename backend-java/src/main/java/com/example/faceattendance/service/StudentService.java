package com.example.faceattendance.service;

import com.example.faceattendance.dto.student.CreateStudentRequest;
import com.example.faceattendance.dto.student.StudentResponse;
import com.example.faceattendance.dto.student.UpdateStudentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Student management service contract.
 *
 * Students are profile records only and are not website users.
 */
public interface StudentService {

    /**
     * Creates a new student.
     * Students are stored only in the students table.
     *
     * @param request Student creation request
     * @return Created student response
     */
    StudentResponse create(CreateStudentRequest request);

    /**
     * Returns all students with optional search.
     */
    Page<StudentResponse> getAll(
            Pageable pageable,
            String search
    );

    /**
     * Returns a student by ID.
     */
    StudentResponse getById(Long id);

    /**
     * Updates a student.
     */
    StudentResponse update(
            Long id,
            UpdateStudentRequest request
    );

    /**
     * Deletes a student.
     */
    void delete(Long id);
}