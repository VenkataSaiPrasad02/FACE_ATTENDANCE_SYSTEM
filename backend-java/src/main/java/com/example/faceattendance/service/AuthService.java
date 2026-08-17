package com.example.faceattendance.service;

import com.example.faceattendance.dto.auth.ChangePasswordRequest;
import com.example.faceattendance.dto.auth.ForgotPasswordRequest;
import com.example.faceattendance.dto.auth.LoginOtpRequiredResponse;
import com.example.faceattendance.dto.auth.LoginRequest;
import com.example.faceattendance.dto.auth.LoginResponse;
import com.example.faceattendance.dto.auth.PasswordActionResponse;
import com.example.faceattendance.dto.auth.ResendForgotPasswordOtpRequest;
import com.example.faceattendance.dto.auth.ResendLoginOtpRequest;
import com.example.faceattendance.dto.auth.VerifyForgotPasswordRequest;
import com.example.faceattendance.dto.auth.VerifyLoginOtpRequest;

public interface AuthService {

    /**
     * Verifies username/password only. On success, triggers a login OTP challenge
     * (stored in Redis + emailed) and returns a non-JWT response. Does NOT issue a token.
     */
    LoginResponse login(LoginRequest request);

    /**
     * Verifies the login OTP for a pending login challenge created by {@link #login}.
     * Only on success is the existing JWT generated and returned.
     */
    LoginResponse verifyLoginOtp(VerifyLoginOtpRequest request);

    /**
     * Resends a login OTP for an existing pending login challenge, subject to cooldown.
     */
    LoginOtpRequiredResponse resendLoginOtp(ResendLoginOtpRequest request);

    PasswordActionResponse requestPasswordReset(ForgotPasswordRequest request);
    PasswordActionResponse verifyPasswordReset(VerifyForgotPasswordRequest request);
    PasswordActionResponse resendPasswordResetOtp(ResendForgotPasswordOtpRequest request);
    PasswordActionResponse changePassword(String username, ChangePasswordRequest request);
}