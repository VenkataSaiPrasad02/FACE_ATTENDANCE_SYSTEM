package com.example.faceattendance.controller;

import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.academicperiod.CreateAcademicPeriodRequest;
import com.example.faceattendance.dto.academicperiod.UpdateAcademicPeriodRequest;
import com.example.faceattendance.service.AcademicPeriodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@RestController
@RequestMapping("/api/academic-periods")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AcademicPeriodController {

    private final AcademicPeriodService academicPeriodService;

    // =========================
    // ADMIN - CREATE
    // =========================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AcademicPeriodResponse> create(
            @Valid
            @RequestBody
            CreateAcademicPeriodRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        academicPeriodService.create(request)
                );
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {

        academicPeriodService.deactivate(id);

        return ResponseEntity.noContent().build();
    }
    // =========================
    // ADMIN + TEACHER
    // =========================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<List<AcademicPeriodResponse>> getAll() {

        return ResponseEntity.ok(
                academicPeriodService.getAll()
        );
    }

    @GetMapping("/course/{course}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<List<AcademicPeriodResponse>>
    getByBranch(
            @PathVariable String course) {

        return ResponseEntity.ok(
                academicPeriodService
                        .getByCourse(course)
        );
    }

    // =========================
    // GET ACTIVE PERIOD
    // =========================

    @GetMapping("/active/{course}/{batch}/{semester}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN','TEACHER', 'STUDENT')"
    )
    public ResponseEntity<AcademicPeriodResponse>
    getActive(
            @PathVariable String course,
            @PathVariable String batch,
            @PathVariable String semester) {

        return ResponseEntity.ok(
                academicPeriodService.getActive(
                        course,
                        batch,
                        semester
                )
        );
    }

    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<AcademicPeriodResponse>
    getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                academicPeriodService.getById(id)
        );
    }

    // =========================
    // ADMIN - UPDATE
    // =========================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AcademicPeriodResponse>
    update(
            @PathVariable Long id,
            @Valid
            @RequestBody
            UpdateAcademicPeriodRequest request) {

        return ResponseEntity.ok(
                academicPeriodService.update(
                        id,
                        request
                )
        );
    }

    // =========================
    // ADMIN - ACTIVATE
    // =========================

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> activate(
            @PathVariable Long id) {

        academicPeriodService.activate(id);

        return ResponseEntity.noContent().build();
    }

    // =========================
    // ADMIN - DELETE
    // =========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        academicPeriodService.delete(id);

        return ResponseEntity.noContent().build();
    }
}