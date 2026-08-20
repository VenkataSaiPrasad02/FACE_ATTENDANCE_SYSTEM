package com.example.faceattendance.controller;

import com.example.faceattendance.dto.face.FaceRegisterRequest;
import com.example.faceattendance.dto.face.FaceRegisterResponse;
import com.example.faceattendance.service.FaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Face registration endpoint.
 * Does NOT contain any AI or HTTP-call logic — those belong in FaceService and FaceRecognitionClient.
 */
@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
@Tag(name = "Face Recognition", description = "Face registration and health endpoints")
public class FaceController {

    private final FaceService faceService;

    @Operation(summary = "Register face", description = "Requires ADMIN role. Captures embedding and stores it for the student.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Face registered successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found"),
        @ApiResponse(responseCode = "422", description = "Face detection failed — no face, multiple faces, or low quality"),
        @ApiResponse(responseCode = "503", description = "Python face service unavailable")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/register")
    public ResponseEntity<FaceRegisterResponse> register(@Valid @RequestBody FaceRegisterRequest request) {
        return ResponseEntity.ok(faceService.register(request));
    }

    @Operation(summary = "Health check", description = "Public endpoint. Returns ok when service is running.")
    @ApiResponse(responseCode = "200", description = "Service healthy")
    @GetMapping("/health")
    public ResponseEntity<java.util.Map<String, String>> health() {
        return ResponseEntity.ok(java.util.Map.of("status", "ok", "service", "face-attendance-backend"));
    }
}
