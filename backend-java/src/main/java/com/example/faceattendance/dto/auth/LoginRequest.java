package com.example.faceattendance.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Login credentials")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "Account username", example = "admin")
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "Account password", example = "password123")
    private String password;
}
