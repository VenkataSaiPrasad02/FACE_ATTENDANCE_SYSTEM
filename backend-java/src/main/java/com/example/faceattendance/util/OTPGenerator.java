package com.example.faceattendance.util;

import java.security.SecureRandom;

public final class OTPGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();
    private OTPGenerator() {}
    public static String generateOTP() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }
}
