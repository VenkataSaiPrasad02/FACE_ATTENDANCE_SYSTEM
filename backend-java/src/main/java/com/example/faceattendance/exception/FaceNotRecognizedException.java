package com.example.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class FaceNotRecognizedException extends RuntimeException {

    public FaceNotRecognizedException(String message) {
        super(message);
    }
}
