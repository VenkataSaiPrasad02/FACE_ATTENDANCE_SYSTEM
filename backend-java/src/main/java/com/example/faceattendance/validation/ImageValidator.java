package com.example.faceattendance.validation;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Base64;

/**
 * Validates base64-encoded image strings before sending them to the Python face service.
 * Keeps image validation logic out of controllers and services.
 */
@Component
public class ImageValidator {

    private static final int MIN_BASE64_LENGTH = 100; // a valid image is at least ~100 chars base64

    /**
     * Validates that the given string is a non-empty, valid Base64-encoded value
     * that could represent an image.
     *
     * @param imageBase64 the base64 string to validate
     * @return true if valid
     */
    public boolean isValid(String imageBase64) {
        if (!StringUtils.hasText(imageBase64)) {
            return false;
        }
        if (imageBase64.length() < MIN_BASE64_LENGTH) {
            return false;
        }
        try {
            Base64.getDecoder().decode(imageBase64);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Throws IllegalArgumentException with a descriptive message if the image is invalid.
     */
    public void validateOrThrow(String imageBase64) {
        if (!isValid(imageBase64)) {
            throw new IllegalArgumentException(
                    "Invalid image: must be a non-empty Base64-encoded image string.");
        }
    }
}
