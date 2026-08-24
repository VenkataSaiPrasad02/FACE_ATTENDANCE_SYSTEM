package com.example.faceattendance.controller;

import com.example.faceattendance.dto.autofill.AutoFillConfigRequest;
import com.example.faceattendance.dto.autofill.AutoFillConfigResponse;
import com.example.faceattendance.service.StudentAutoFillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * CRUD for reusable student auto-fill presets.
 * ADMIN and SUPER_ADMIN only — students never see this API.
 */
@RestController
@RequestMapping("/api/student-auto-fill")
@RequiredArgsConstructor
@Tag(name = "Student Auto Fill", description = "Reusable presets that pre-fill common academic fields when adding students")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class StudentAutoFillController {

    private final StudentAutoFillService autoFillService;

    @Operation(summary = "List configurations")
    @ApiResponse(responseCode = "200", description = "Success")
    @GetMapping
    public ResponseEntity<List<AutoFillConfigResponse>> getAll() {
        return ResponseEntity.ok(autoFillService.getAll());
    }

    @Operation(summary = "Get configuration by id")
    @GetMapping("/{id}")
    public ResponseEntity<AutoFillConfigResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(autoFillService.getById(id));
    }

    @Operation(summary = "Create configuration")
    @ApiResponse(responseCode = "201", description = "Created")
    @PostMapping
    public ResponseEntity<AutoFillConfigResponse> create(
            @Valid @RequestBody AutoFillConfigRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(autoFillService.create(request));
    }

    @Operation(summary = "Update configuration",
            description = "Changed values apply to future student creation only; existing students are never rewritten.")
    @PutMapping("/{id}")
    public ResponseEntity<AutoFillConfigResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AutoFillConfigRequest request) {
        return ResponseEntity.ok(autoFillService.update(id, request));
    }

    @Operation(summary = "Activate configuration",
            description = "Makes this preset the default pre-selected option on the Add Student form.")
    @PutMapping("/{id}/activate")
    public ResponseEntity<AutoFillConfigResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(autoFillService.activate(id));
    }

    @Operation(summary = "Delete configuration")
    @ApiResponse(responseCode = "204", description = "Deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        autoFillService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
