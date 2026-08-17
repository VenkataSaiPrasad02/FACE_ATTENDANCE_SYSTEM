package com.example.faceattendance.service;

import com.example.faceattendance.dto.user.CreateAdminRequest;
import com.example.faceattendance.dto.user.UpdateAdminRequest;
import com.example.faceattendance.dto.user.UpdateProfileRequest;
import com.example.faceattendance.dto.user.UserResponse;

import java.util.List;

/**
 * User management service contract.
 */
public interface UserService {

    /**
     * Returns all registered users (ADMIN-only operation).
     */
    List<UserResponse> getAllUsers();
    UserResponse createAdmin(CreateAdminRequest request);

    /**
     * Returns all ADMIN and SUPER_ADMIN accounts, sorted alphabetically
     * by username (backend-level sort, SUPER_ADMIN-only operation).
     */
    List<UserResponse> getAllAdmins();

    /**
     * Updates an existing admin's full name/email. SUPER_ADMIN-only.
     */
    UserResponse updateAdmin(Long id, UpdateAdminRequest request);

    /**
     * Deletes an existing admin account. SUPER_ADMIN-only.
     * Refuses to delete a SUPER_ADMIN account or the caller's own
     * account, to avoid locking the system out of admin access.
     */
    void deleteAdmin(Long id, String actingUsername);

    /**
     * Returns the authenticated user's own profile.
     */
    UserResponse getOwnProfile(String username);

    /**
     * Updates the authenticated user's own profile (full name, email only).
     */
    UserResponse updateOwnProfile(String username, UpdateProfileRequest request);
    /**
     * Uploads/replaces the authenticated user's profile photo.
     * Deletes the previous photo file, if any.
     */
    UserResponse updateOwnProfilePhoto(String username, org.springframework.web.multipart.MultipartFile file);

    /**
     * Removes the authenticated user's profile photo, reverting
     * the UI to the initials fallback.
     */
    UserResponse removeOwnProfilePhoto(String username);
}
