package com.example.faceattendance.controller;

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
import com.example.faceattendance.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login (with 2FA email OTP) and password management")
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Login (step 1: username/password)",
            description = "Verifies username/password. On success, sends an OTP to the user's registered email and returns otpRequired=true. Does NOT return a JWT."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Credentials valid, OTP sent"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "429", description = "Blocked due to prior failed OTP attempts")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Login (step 2: verify OTP)",
            description = "Verifies the OTP for a pending login created by /login. Only on success is the JWT issued."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OTP verified, JWT issued"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired OTP"),
            @ApiResponse(responseCode = "429", description = "Blocked due to too many failed attempts")
    })
    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(
            @Valid @RequestBody VerifyLoginOtpRequest request) {
        return ResponseEntity.ok(authService.verifyLoginOtp(request));
    }

    @Operation(
            summary = "Resend login OTP",
            description = "Resends the OTP for an existing pending login, subject to a cooldown."
    )
    @PostMapping("/resend-otp")
    public ResponseEntity<LoginOtpRequiredResponse> resendOtp(
            @Valid @RequestBody ResendLoginOtpRequest request) {
        return ResponseEntity.ok(authService.resendLoginOtp(request));
    }

    @Operation(
            summary = "Request password reset OTP",
            description = "Takes username, resolves the registered email on the server, and sends an OTP."
    )
    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordActionResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request));
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<PasswordActionResponse> verifyForgotPassword(
            @Valid @RequestBody VerifyForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.verifyPasswordReset(request));
    }

    @PostMapping("/forgot-password/resend-otp")
    public ResponseEntity<PasswordActionResponse> resendForgotPasswordOtp(
            @Valid @RequestBody ResendForgotPasswordOtpRequest request) {
        return ResponseEntity.ok(authService.resendPasswordResetOtp(request));
    }

    @Operation(
            summary = "Change password",
            description = "Changes the authenticated user's password after verifying the current password."
    )
    @PostMapping("/change-password")
    public ResponseEntity<PasswordActionResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        return ResponseEntity.ok(
                authService.changePassword(
                        authentication.getName(),
                        request
                )
        );
    }
}