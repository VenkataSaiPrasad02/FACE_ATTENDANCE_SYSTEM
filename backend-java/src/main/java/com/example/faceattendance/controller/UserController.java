package com.example.faceattendance.controller;

import com.example.faceattendance.dto.user.CreateAdminRequest;
import com.example.faceattendance.dto.user.UpdateAdminRequest;
import com.example.faceattendance.dto.user.UpdateProfileRequest;
import com.example.faceattendance.dto.user.UserResponse;
import com.example.faceattendance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * User management endpoints. Restricted to ADMIN role (enforced in SecurityConfig).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User account management (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "List all users", description = "ADMIN role required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @PostMapping("/admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> createAdmin(
            @Valid @RequestBody CreateAdminRequest request) {

        UserResponse response =
                userService.createAdmin(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @Operation(summary = "List admins", description = "Returns ADMIN and SUPER_ADMIN accounts, alphabetically sorted by username. SUPER_ADMIN role required.")
    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        return ResponseEntity.ok(userService.getAllAdmins());
    }

    @Operation(summary = "Update admin", description = "Updates an existing admin's full name/email. SUPER_ADMIN role required.")
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> updateAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminRequest request) {
        return ResponseEntity.ok(userService.updateAdmin(id, request));
    }

    @Operation(summary = "Delete admin", description = "Deletes an existing admin account. SUPER_ADMIN role required. " +
            "A Super Admin account cannot be deleted, and an admin cannot delete their own account.")
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAdmin(
            @PathVariable Long id,
            Authentication authentication) {
        userService.deleteAdmin(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get my profile", description = "Returns the authenticated user's own profile. Any authenticated role.")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getOwnProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getOwnProfile(authentication.getName()));
    }

    @Operation(summary = "Update my profile",
            description = "Updates the authenticated user's own full name and email. " +
                    "Cannot change username, role, or another user's account.")
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateOwnProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateOwnProfile(authentication.getName(), request));
    }
    @Operation(summary = "Upload/replace my profile photo",
            description = "Multipart upload. JPEG/PNG/WebP, max 10MB. Replaces any existing photo.")
    @PostMapping(value = "/me/photo", consumes = "multipart/form-data")
    public ResponseEntity<UserResponse> uploadOwnProfilePhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateOwnProfilePhoto(authentication.getName(), file));
    }

    @Operation(summary = "Remove my profile photo",
            description = "Reverts the account to the initials fallback avatar.")
    @DeleteMapping("/me/photo")
    public ResponseEntity<UserResponse> removeOwnProfilePhoto(Authentication authentication) {
        return ResponseEntity.ok(userService.removeOwnProfilePhoto(authentication.getName()));
    }
}
