package com.example.faceattendance.util;

public final class RedisKeyUtil {
    private static final String OTP = "password-reset:otp:";
    private static final String SESSION = "password-reset:session:";
    private static final String ATTEMPTS = "password-reset:attempts:";
    private static final String BLOCK = "password-reset:block:";

    private static final String LOGIN_OTP = "login:otp:";
    private static final String LOGIN_PENDING = "login:pending:";
    private static final String LOGIN_ATTEMPTS = "login:otp:attempts:";
    private static final String LOGIN_BLOCK = "login:otp:block:";
    private static final String LOGIN_RESEND_COOLDOWN = "login:otp:resend:";

    private RedisKeyUtil() {}

    // Password reset (existing)
    public static String resetOtpKey(String username) { return OTP + username; }
    public static String resetSessionKey(String username) { return SESSION + username; }
    public static String resetAttemptsKey(String username) { return ATTEMPTS + username; }
    public static String resetBlockKey(String username) { return BLOCK + username; }

    // Login OTP (2FA) — new
    /** Stores the actual OTP code for a pending login. */
    public static String loginOtpKey(String username) { return LOGIN_OTP + username; }

    /**
     * Marks that username/password were already verified for this username and a
     * login OTP challenge is pending. Presence of this key is required before
     * verify-otp will accept any OTP — prevents skipping the password step.
     */
    public static String loginPendingKey(String username) { return LOGIN_PENDING + username; }

    public static String loginAttemptsKey(String username) { return LOGIN_ATTEMPTS + username; }
    public static String loginBlockKey(String username) { return LOGIN_BLOCK + username; }

    /** Short-lived cooldown key to rate-limit resend-otp requests. */
    public static String loginResendCooldownKey(String username) { return LOGIN_RESEND_COOLDOWN + username; }
}