package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * A conflicting attendance session is already open for the same
 * academic period / class group.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SessionConflictException extends RuntimeException {

    public SessionConflictException(String message) {
        super(message);
    }
}
