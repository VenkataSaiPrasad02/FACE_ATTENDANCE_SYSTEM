package com.example.faceattendance.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Stores and removes profile-photo files on local disk.
 * Completely independent of the face-recognition pipeline —
 * this is a plain UI avatar, nothing more.
 */
public interface ProfilePhotoStorageService {

    /**
     * Validates and saves the uploaded file, deleting the user's
     * previous photo file (if any) first. Returns the relative URL
     * to store on User.profilePhotoUrl (e.g. "/uploads/profiles/user-3-<uuid>.jpg").
     */
    String store(Long userId, MultipartFile file, String previousPhotoUrl);

    /**
     * Deletes the file referenced by a stored profilePhotoUrl, if it exists.
     * Safe to call with null/blank — does nothing.
     */
    void delete(String photoUrl);
}