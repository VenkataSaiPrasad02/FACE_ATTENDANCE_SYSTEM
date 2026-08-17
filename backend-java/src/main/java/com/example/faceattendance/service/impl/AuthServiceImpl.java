package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.auth.*;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.exception.*;
import com.example.faceattendance.repository.UserRepository;
import com.example.faceattendance.security.CustomUserDetails;
import com.example.faceattendance.security.JwtService;
import com.example.faceattendance.service.AuthService;
import com.example.faceattendance.service.EmailService;
import com.example.faceattendance.util.OTPGenerator;
import com.example.faceattendance.util.RedisKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    // Existing password-reset OTP policy — reused as-is for login OTP (2FA),
    // per approved decision: 3 attempts / 2-minute TTL / 5-minute block.
    private static final long OTP_TTL_MINUTES = 2;
    private static final long MAX_ATTEMPTS = 3;
    private static final long BLOCK_TTL_MINUTES = 5;

    // Minimum gap between resend-otp calls for login OTP.
    private static final long LOGIN_OTP_RESEND_COOLDOWN_SECONDS = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;

    // ================================================================
    // LOGIN — STEP 1: username/password verification, triggers OTP
    // ================================================================

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {

        String username = normalize(request.getUsername());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid username or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            log.warn(
                    "Login failed for username '{}': bad password",
                    username
            );

            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new org.springframework.security.authentication.DisabledException(
                    "Account is disabled"
            );
        }

        /*
         * TEMPORARY DEMO MODE:
         *
         * OTP is bypassed.
         * Username + password are enough to issue the JWT.
         *
         * Restore the original OTP login method after the demo.
         */

        CustomUserDetails userDetails =
                new CustomUserDetails(user);

        String token =
                jwtService.generateToken(userDetails);

        log.info(
                "User '{}' logged in successfully (OTP temporarily bypassed) with role {}",
                user.getUsername(),
                user.getRole()
        );

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .expiresIn(jwtService.getJwtExpiration())
                .build();
    }

    // ================================================================
    // LOGIN — STEP 2: OTP verification, issues the existing JWT
    // ================================================================

    @Override
    @Transactional
    public LoginResponse verifyLoginOtp(VerifyLoginOtpRequest request) {
        String username = normalize(request.getUsername());
        checkLoginBlocked(username);

        // The backend — not the frontend — is the source of truth that
        // username/password were already verified for this username.
        String pending = redisTemplate.opsForValue().get(RedisKeyUtil.loginPendingKey(username));
        if (pending == null) {
            throw new OTPExpiredException(
                    "No pending login found for this username. Please sign in again."
            );
        }

        String storedOtp = redisTemplate.opsForValue().get(RedisKeyUtil.loginOtpKey(username));
        if (storedOtp == null) {
            clearLoginOtpState(username);
            throw new OTPExpiredException("OTP expired. Please sign in again to request a new one.");
        }

        if (!storedOtp.equals(request.getOtp())) {
            Long attempts = redisTemplate.opsForValue().increment(RedisKeyUtil.loginAttemptsKey(username));

            if (attempts != null && attempts == 1) {
                redisTemplate.expire(
                        RedisKeyUtil.loginAttemptsKey(username),
                        Duration.ofMinutes(OTP_TTL_MINUTES)
                );
            }

            if (attempts != null && attempts >= MAX_ATTEMPTS) {
                redisTemplate.opsForValue().set(
                        RedisKeyUtil.loginBlockKey(username),
                        "BLOCKED",
                        Duration.ofMinutes(BLOCK_TTL_MINUTES)
                );
                clearLoginOtpState(username);

                throw new UserBlockedException(
                        "You are blocked for 5 minutes due to multiple incorrect OTP attempts. Please wait."
                );
            }

            long remaining = MAX_ATTEMPTS - (attempts == null ? 1 : attempts);
            throw new InvalidOtpException("Invalid OTP. Remaining attempts = " + remaining);
        }

        // OTP correct — invalidate it immediately, then issue the JWT
        // using the existing, unmodified JwtService.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            clearLoginOtpState(username);
            throw new org.springframework.security.authentication.DisabledException("Account is disabled");
        }

        clearLoginOtpState(username);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);

        log.info("User '{}' completed 2FA login successfully with role {}", user.getUsername(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .expiresIn(jwtService.getJwtExpiration())
                .build();
    }

    // ================================================================
    // LOGIN — RESEND OTP
    // ================================================================

    @Override
    public LoginOtpRequiredResponse resendLoginOtp(ResendLoginOtpRequest request) {
        String username = normalize(request.getUsername());
        checkLoginBlocked(username);

        // Must have an active pending login — resend cannot itself start a login.
        String pending = redisTemplate.opsForValue().get(RedisKeyUtil.loginPendingKey(username));
        if (pending == null) {
            throw new OTPExpiredException(
                    "No pending login found for this username. Please sign in again."
            );
        }

        Boolean coolingDown = redisTemplate.hasKey(RedisKeyUtil.loginResendCooldownKey(username));
        if (coolingDown) {
            throw new InvalidOtpException(
                    "Please wait before requesting another OTP."
            );
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        issueLoginOtp(username, user);

        redisTemplate.opsForValue().set(
                RedisKeyUtil.loginResendCooldownKey(username),
                "1",
                Duration.ofSeconds(LOGIN_OTP_RESEND_COOLDOWN_SECONDS)
        );

        log.info("Login OTP resent for user '{}'", username);

        return LoginOtpRequiredResponse.builder()
                .otpRequired(true)
                .username(username)
                .maskedEmail(maskEmail(user.getEmail()))
                .message("A new OTP has been sent to your registered email.")
                .build();
    }

    // ================================================================
    // EXISTING PASSWORD-RESET / CHANGE-PASSWORD METHODS — UNCHANGED
    // ================================================================

    @Override
    public PasswordActionResponse requestPasswordReset(ForgotPasswordRequest request) {
        String username = normalize(request.getUsername());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        ensurePasswordResetAllowed(user);
        checkBlocked(username);

        String otp = OTPGenerator.generateOTP();

        redisTemplate.opsForValue().set(
                RedisKeyUtil.resetOtpKey(username), otp,
                Duration.ofMinutes(OTP_TTL_MINUTES)
        );
        redisTemplate.opsForValue().set(
                RedisKeyUtil.resetSessionKey(username), user.getEmail(),
                Duration.ofMinutes(OTP_TTL_MINUTES)
        );
        redisTemplate.delete(RedisKeyUtil.resetAttemptsKey(username));

        emailService.sendPasswordResetOtp(user.getUsername(), user.getEmail(), otp);

        return PasswordActionResponse.builder()
                .message("OTP sent successfully to your registered email.")
                .maskedEmail(maskEmail(user.getEmail()))
                .build();
    }

    @Override
    @Transactional
    public PasswordActionResponse verifyPasswordReset(VerifyForgotPasswordRequest request) {
        String username = normalize(request.getUsername());
        checkBlocked(username);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        String storedOtp = redisTemplate.opsForValue().get(RedisKeyUtil.resetOtpKey(username));
        if (storedOtp == null) {
            throw new OTPExpiredException("OTP expired. Please request a new one.");
        }

        String sessionEmail = redisTemplate.opsForValue().get(RedisKeyUtil.resetSessionKey(username));
        if (sessionEmail == null) {
            throw new OTPExpiredException("Password reset session expired. Please request a new OTP.");
        }

        if (!storedOtp.equals(request.getOtp())) {
            Long attempts = redisTemplate.opsForValue().increment(RedisKeyUtil.resetAttemptsKey(username));

            if (attempts != null && attempts == 1) {
                redisTemplate.expire(
                        RedisKeyUtil.resetAttemptsKey(username),
                        Duration.ofMinutes(OTP_TTL_MINUTES)
                );
            }

            if (attempts != null && attempts >= MAX_ATTEMPTS) {
                redisTemplate.opsForValue().set(
                        RedisKeyUtil.resetBlockKey(username),
                        "BLOCKED",
                        Duration.ofMinutes(BLOCK_TTL_MINUTES)
                );
                redisTemplate.delete(RedisKeyUtil.resetAttemptsKey(username));

                throw new UserBlockedException(
                        "You are blocked for 5 minutes due to multiple incorrect OTP attempts. Please wait."
                );
            }

            long remaining = MAX_ATTEMPTS - (attempts == null ? 1 : attempts);
            throw new InvalidOtpException("Invalid OTP. Remaining attempts = " + remaining);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        ensurePasswordResetAllowed(user);

        if (!user.getEmail().equalsIgnoreCase(sessionEmail)) {
            clearResetState(username);
            throw new OTPExpiredException(
                    "Password reset session is no longer valid. Please request a new OTP."
            );
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        clearResetState(username);

        return PasswordActionResponse.builder()
                .message("Password changed successfully. You can now sign in.")
                .build();
    }

    @Override
    public PasswordActionResponse resendPasswordResetOtp(ResendForgotPasswordOtpRequest request) {
        String username = normalize(request.getUsername());
        checkBlocked(username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        ensurePasswordResetAllowed(user);

        String otp = OTPGenerator.generateOTP();

        redisTemplate.opsForValue().set(
                RedisKeyUtil.resetOtpKey(username), otp,
                Duration.ofMinutes(OTP_TTL_MINUTES)
        );
        redisTemplate.opsForValue().set(
                RedisKeyUtil.resetSessionKey(username), user.getEmail(),
                Duration.ofMinutes(OTP_TTL_MINUTES)
        );
        redisTemplate.delete(RedisKeyUtil.resetAttemptsKey(username));

        emailService.sendPasswordResetOtp(user.getUsername(), user.getEmail(), otp);

        return PasswordActionResponse.builder()
                .message("A new OTP has been sent to your registered email.")
                .maskedEmail(maskEmail(user.getEmail()))
                .build();
    }

    @Override
    @Transactional
    public PasswordActionResponse changePassword(
            String username,
            ChangePasswordRequest request) {

        User user = userRepository.findByUsername(normalize(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return PasswordActionResponse.builder()
                .message("Password changed successfully.")
                .build();
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    /** Generates a new OTP, stores it + the pending-login marker in Redis, and emails it. */
    private void issueLoginOtp(String username, User user) {
        String otp = OTPGenerator.generateOTP();

        redisTemplate.opsForValue().set(
                RedisKeyUtil.loginOtpKey(username), otp,
                Duration.ofMinutes(OTP_TTL_MINUTES)
        );
        redisTemplate.opsForValue().set(
                RedisKeyUtil.loginPendingKey(username), "1",
                Duration.ofMinutes(OTP_TTL_MINUTES)
        );
        redisTemplate.delete(RedisKeyUtil.loginAttemptsKey(username));

        emailService.sendLoginOtp(user.getUsername(), user.getEmail(), otp);
    }

    private void clearLoginOtpState(String username) {
        redisTemplate.delete(RedisKeyUtil.loginOtpKey(username));
        redisTemplate.delete(RedisKeyUtil.loginPendingKey(username));
        redisTemplate.delete(RedisKeyUtil.loginAttemptsKey(username));
    }

    private void checkLoginBlocked(String username) {
        if (redisTemplate.hasKey(RedisKeyUtil.loginBlockKey(username))) {
            throw new UserBlockedException(
                    "You are blocked for 5 minutes due to multiple incorrect OTP attempts. Please wait."
            );
        }
    }

    private void ensurePasswordResetAllowed(User user) {
        if (user.getRole() != com.example.faceattendance.entity.Role.SUPER_ADMIN
                && user.getRole() != com.example.faceattendance.entity.Role.ADMIN
                && user.getRole() != com.example.faceattendance.entity.Role.TEACHER) {
            throw new AccessDeniedException(
                    "Password recovery is not available for this account type"
            );
        }
    }

    private void checkBlocked(String username) {
        if (redisTemplate.hasKey(RedisKeyUtil.resetBlockKey(username))) {
            throw new UserBlockedException(
                    "You are blocked for 5 minutes due to multiple incorrect OTP attempts. Please wait."
            );
        }
    }

    private void clearResetState(String username) {
        redisTemplate.delete(RedisKeyUtil.resetOtpKey(username));
        redisTemplate.delete(RedisKeyUtil.resetSessionKey(username));
        redisTemplate.delete(RedisKeyUtil.resetAttemptsKey(username));
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim();
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) return "";
        int at = email.indexOf('@');
        if (at <= 0) return "***";
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 2) return local.charAt(0) + "***" + domain;
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + domain;
    }
}