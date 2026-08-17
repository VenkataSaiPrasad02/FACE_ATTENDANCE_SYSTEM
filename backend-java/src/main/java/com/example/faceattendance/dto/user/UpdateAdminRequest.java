package com.example.faceattendance.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Fields an authorized caller (SUPER_ADMIN) may edit on an existing
 * admin account. Password is intentionally excluded — password
 * changes go through the existing Change Password flow. Role is
 * intentionally excluded — role changes are not supported here.
 */
@Data
public class UpdateAdminRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;
}
