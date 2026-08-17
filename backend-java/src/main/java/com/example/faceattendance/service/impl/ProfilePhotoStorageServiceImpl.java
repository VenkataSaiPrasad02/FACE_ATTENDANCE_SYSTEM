package com.example.faceattendance.service.impl;

import com.example.faceattendance.service.ProfilePhotoStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class ProfilePhotoStorageServiceImpl implements ProfilePhotoStorageService {

    // Only these content types are accepted — checked against the
    // actual multipart content type, not the filename extension.
    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10MB

    @Value("${app.upload.profile-photos-dir:uploads/profiles}")
    private String storageDir;

    @Value("${app.upload.profile-photos-base-url:/uploads/profiles}")
    private String baseUrl;

    @Override
    public String store(Long userId, MultipartFile file, String previousPhotoUrl) {
        validate(file);

        String extension = extensionFor(Objects.requireNonNull(file.getContentType()));
        String filename = "user-" + userId + "-" + UUID.randomUUID() + extension;

        try {
            Path dir = Paths.get(storageDir);
            Files.createDirectories(dir);

            Path target = dir.resolve(filename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("Failed to store profile photo for user {}: {}", userId, e.getMessage());
            throw new IllegalStateException("Unable to save the uploaded photo. Please try again.");
        }

        // Remove the old file now that the new one is safely written.
        // Not wrapped in the same try/catch — a failure to delete the
        // old file should not fail the upload itself.
        delete(previousPhotoUrl);

        return baseUrl + "/" + filename;
    }

    @Override
    public void delete(String photoUrl) {
        if (photoUrl == null || photoUrl.isBlank()) {
            return;
        }
        String filename = photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
        Path target = Paths.get(storageDir).resolve(filename);
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete old profile photo {}: {}", target, e.getMessage());
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file was uploaded.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Photo must be smaller than 10MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, or WebP images are allowed.");
        }

        // Don't trust the declared content type alone — actually decode
        // the bytes as an image. A renamed .jpg that isn't really an
        // image (e.g. an executable) will fail to decode here.
        try (InputStream in = file.getInputStream()) {
            BufferedImage image = ImageIO.read(in);
            if (image == null) {
                throw new IllegalArgumentException("The uploaded file is not a valid image.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("The uploaded file could not be read as an image.");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}