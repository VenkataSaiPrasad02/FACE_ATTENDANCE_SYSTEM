package com.example.faceattendance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendLoginOtpRequest {

    @NotBlank(message = "Username is required")
    private String username;
}