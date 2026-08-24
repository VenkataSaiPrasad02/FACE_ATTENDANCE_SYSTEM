package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a student attempts attendance from outside the
 * session's geofence. Distance is validated server-side only.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class OutsideAttendanceAreaException extends RuntimeException {

    public OutsideAttendanceAreaException(String message) {
        super(message);
    }
}
