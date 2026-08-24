package com.example.faceattendance.controller;

import com.example.faceattendance.dto.student.CreateStudentRequest;
import com.example.faceattendance.dto.student.FilterOptionsResponse;
import com.example.faceattendance.dto.student.StudentResponse;
import com.example.faceattendance.dto.student.UpdateStudentRequest;
import com.example.faceattendance.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * CRUD operations for student management.
 * Controllers only handle HTTP — all business logic is in StudentService.
 */
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER','SUPER_ADMIN')")
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "Create student")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Student created"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "409", description = "Duplicate student number")
    })
    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @Operation(summary = "List students", description = "Paginated list with server-side search plus course/batch/semester/year/teacher filters")
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping
    public ResponseEntity<Page<StudentResponse>> getAll(
            Pageable pageable,
            @Parameter(description = "Search by name, student number, or email")
            @RequestParam(required = false) String search,
            @Parameter(description = "Exact course, e.g. MCA")
            @RequestParam(required = false) String course,
            @Parameter(description = "Exact batch, e.g. 2025-2027")
            @RequestParam(required = false) String batch,
            @Parameter(description = "Exact semester, e.g. 2nd Semester")
            @RequestParam(required = false) String semester,
            @Parameter(description = "Exact year, e.g. 1st Year")
            @RequestParam(required = false) String year,
            @Parameter(description = "Assigned teacher id")
            @RequestParam(required = false) Long teacherId) {
        return ResponseEntity.ok(
                studentService.getAll(pageable, search, course, batch, semester, year, teacherId));
    }

    @Operation(summary = "Filter options", description = "Distinct courses/batches/semesters/years for building filter dropdowns")
    @GetMapping("/filter-options")
    public ResponseEntity<FilterOptionsResponse> getFilterOptions() {
        return ResponseEntity.ok(studentService.getFilterOptions());
    }

    @Operation(summary = "Get student by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Found"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @Operation(summary = "Update student")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Updated"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @Operation(summary = "Delete student", description = "Requires ADMIN role. Cascades to face data and attendance.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Deleted"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
