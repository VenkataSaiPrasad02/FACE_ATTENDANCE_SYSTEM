package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Anti-proxy guard: the face captured during a student's attendance
 * attempt was recognized as a DIFFERENT student than the
 * authenticated account.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class FaceMismatchException extends RuntimeException {

    public FaceMismatchException(String message) {
        super(message);
    }
}
