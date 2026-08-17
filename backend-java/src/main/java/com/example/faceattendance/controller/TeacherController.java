package com.example.faceattendance.controller;

import com.example.faceattendance.dto.teacher.CreateTeacherRequest;
import com.example.faceattendance.dto.teacher.TeacherResponse;
import com.example.faceattendance.dto.teacher.UpdateTeacherRequest;
import com.example.faceattendance.service.TeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Teacher management endpoints - ADMIN only.
 */
@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
@Tag(name = "Teachers", description = "Teacher management endpoints (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class TeacherController {

    private final TeacherService teacherService;

    @Operation(summary = "Create a new teacher",
            description = "Creates a teacher profile with associated User account")
    @ApiResponse(responseCode = "201", description = "Teacher created successfully")
    @PostMapping
    public ResponseEntity<TeacherResponse> create(@Valid @RequestBody CreateTeacherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.create(request));
    }

    @Operation(summary = "List all teachers",
            description = "Returns paginated list of teachers")
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping
    public ResponseEntity<Page<TeacherResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(teacherService.getAll(pageable, null));
    }

    @Operation(summary = "Get teacher by ID",
            description = "Returns teacher details")
    @ApiResponse(responseCode = "200", description = "Success")
    @ApiResponse(responseCode = "404", description = "Teacher not found")
    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> getById(@Parameter(description = "Teacher ID") @PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getById(id));
    }

    @Operation(summary = "Update teacher",
            description = "Updates teacher profile information")
    @ApiResponse(responseCode = "200", description = "Teacher updated successfully")
    @ApiResponse(responseCode = "404", description = "Teacher not found")
    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> update(
            @Parameter(description = "Teacher ID") @PathVariable Long id,
            @Valid @RequestBody UpdateTeacherRequest request) {
        return ResponseEntity.ok(teacherService.update(id, request));
    }

    @Operation(summary = "Delete teacher",
            description = "Deletes teacher profile and associated User account")
    @ApiResponse(responseCode = "204", description = "Teacher deleted successfully")
    @ApiResponse(responseCode = "404", description = "Teacher not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "Teacher ID") @PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }
}