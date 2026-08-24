package com.example.faceattendance.mapper;

import com.example.faceattendance.dto.user.UserResponse;
import com.example.faceattendance.entity.User;
import org.springframework.stereotype.Component;

/**
 * Converts between User entity and user DTOs.
 */
@Component
public class UserMapper {

    public UserResponse toDto(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
                .createdAt(user.getCreatedAt())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
    }
}
