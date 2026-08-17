package com.example.faceattendance.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralizes all API error responses.
 * All handlers return a consistent JSON structure.
 * Internal stack traces are NEVER exposed to clients.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ------------------------------------------------------------------
    // Domain exceptions
    // ------------------------------------------------------------------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "NOT_FOUND");
    }

    @ExceptionHandler(DuplicateAttendanceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateAttendance(DuplicateAttendanceException ex) {
        log.warn("Duplicate attendance: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), "DUPLICATE_ATTENDANCE");
    }

    @ExceptionHandler(DuplicateStudentException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateStudent(DuplicateStudentException ex) {
        log.warn("Duplicate student: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), "DUPLICATE_STUDENT");
    }

    @ExceptionHandler(FaceNotRecognizedException.class)
    public ResponseEntity<ErrorResponse> handleFaceNotRecognized(FaceNotRecognizedException ex) {
        log.warn("Face not recognized: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "FACE_NOT_RECOGNIZED");
    }

    @ExceptionHandler(FaceServiceException.class)
    public ResponseEntity<ErrorResponse> handleFaceServiceUnavailable(FaceServiceException ex) {
        log.error("Face service error: {}", ex.getMessage());
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), "FACE_SERVICE_UNAVAILABLE");
    }

    @ExceptionHandler(LowConfidenceException.class)
    public ResponseEntity<ErrorResponse> handleLowConfidence(LowConfidenceException ex) {
        log.warn("Low confidence: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), "LOW_CONFIDENCE");
    }

    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOtp(InvalidOtpException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "INVALID_OTP");
    }

    @ExceptionHandler(OTPExpiredException.class)
    public ResponseEntity<ErrorResponse> handleOtpExpired(OTPExpiredException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "OTP_EXPIRED");
    }

    @ExceptionHandler(UserBlockedException.class)
    public ResponseEntity<ErrorResponse> handleUserBlocked(UserBlockedException ex) {
        return buildResponse(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), "USER_BLOCKED");
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ErrorResponse> handlePasswordMismatch(PasswordMismatchException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "PASSWORD_MISMATCH");
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        ValidationErrorResponse body = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                "VALIDATION_ERROR",
                fieldErrors,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ------------------------------------------------------------------
    // Security
    // ------------------------------------------------------------------

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid username or password", "INVALID_CREDENTIALS");
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabled(DisabledException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Account is disabled", "ACCOUNT_DISABLED");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied — insufficient permissions", "ACCESS_DENIED");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "INVALID_REQUEST");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        log.warn("Illegal state: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), "INVALID_STATE");
    }

    // ------------------------------------------------------------------
    // Catch-all
    // ------------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again.",
                "INTERNAL_ERROR"
        );
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String code) {
        ErrorResponse body = new ErrorResponse(status.value(), message, code, LocalDateTime.now());
        return ResponseEntity.status(status).body(body);
    }

    // ------------------------------------------------------------------
    // Response records
    // ------------------------------------------------------------------

    public record ErrorResponse(int status, String message, String code, LocalDateTime timestamp) {}

    public record ValidationErrorResponse(
            int status,
            String message,
            String code,
            Map<String, String> fieldErrors,
            LocalDateTime timestamp
    ) {}
}
