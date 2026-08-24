package com.example.faceattendance.service;

import com.example.faceattendance.dto.student.CreateStudentRequest;
import com.example.faceattendance.dto.student.FilterOptionsResponse;
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
     * Returns all students with optional search and
     * course/batch/semester/year/teacher filters (server-side, paginated).
     */
    Page<StudentResponse> getAll(
            Pageable pageable,
            String search,
            String course,
            String batch,
            String semester,
            String year,
            Long teacherId
    );

    /**
     * Distinct course/batch/semester/year values present in the
     * students table — used to build filter dropdowns without
     * hardcoding anything.
     */
    FilterOptionsResponse getFilterOptions();

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