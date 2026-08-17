package com.example.faceattendance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendForgotPasswordOtpRequest {
    @NotBlank(message = "Username is required")
    private String username;
}
