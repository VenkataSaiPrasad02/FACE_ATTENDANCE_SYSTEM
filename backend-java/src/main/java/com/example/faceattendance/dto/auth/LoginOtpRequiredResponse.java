package com.example.faceattendance.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Returned after successful username/password check; OTP verification is still required before a JWT is issued")
public class LoginOtpRequiredResponse {

    @Schema(description = "Indicates OTP verification is required to complete login", example = "true")
    @Builder.Default
    private boolean otpRequired = true;

    @Schema(description = "Username the OTP was issued for", example = "admin")
    private String username;

    @Schema(description = "Masked registered email the OTP was sent to", example = "a***n@example.com")
    private String maskedEmail;

    @Schema(description = "Human-readable message")
    private String message;
}