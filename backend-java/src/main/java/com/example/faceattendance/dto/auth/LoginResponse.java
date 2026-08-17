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
@Schema(description = "Authentication response containing the JWT and user info")
public class LoginResponse {

    @Schema(description = "JWT access token")
    private String token;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "Full name")
    private String fullName;

    @Schema(description = "User role", example = "ADMIN")
    private String role;

    @Schema(description = "Token expiration in milliseconds")
    private long expiresIn;
}
