package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * The attendance session is no longer usable — either closed by the
 * teacher or expired after its configured duration.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SessionUnavailableException extends RuntimeException {

    public enum Reason {
        SESSION_CLOSED,
        SESSION_EXPIRED,
        SESSION_NOT_OPEN
    }

    private final Reason reason;

    public SessionUnavailableException(String message, Reason reason) {
        super(message);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
