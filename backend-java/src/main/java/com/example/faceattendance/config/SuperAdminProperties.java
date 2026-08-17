package com.example.faceattendance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.super-admin")
public record SuperAdminProperties(
        String username,
        String email,
        String fullName,
        String password
) {
}