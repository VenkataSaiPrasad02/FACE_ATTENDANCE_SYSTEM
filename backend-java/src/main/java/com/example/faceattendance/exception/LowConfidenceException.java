package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class LowConfidenceException extends RuntimeException {

    public LowConfidenceException(double confidence, double threshold) {
        super(String.format(
                "Face recognition confidence %.2f is below the minimum threshold %.2f. "
                        + "Please try again with better lighting.",
                confidence, threshold
        ));
    }
}
