package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * The authenticated student is not part of the batch/class group the
 * attendance session was opened for.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class NotEligibleForSessionException extends RuntimeException {

    public NotEligibleForSessionException(String message) {
        super(message);
    }
}
