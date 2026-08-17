package com.example.faceattendance.exception;

public class OTPExpiredException extends RuntimeException {
    public OTPExpiredException(String message) { super(message); }
}
