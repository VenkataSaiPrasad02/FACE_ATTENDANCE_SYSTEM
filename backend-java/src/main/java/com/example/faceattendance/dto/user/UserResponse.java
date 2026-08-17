package com.example.faceattendance.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User account information returned by the API")
public class UserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String profilePhotoUrl;
    private Boolean enabled;
    private LocalDateTime createdAt;
}
