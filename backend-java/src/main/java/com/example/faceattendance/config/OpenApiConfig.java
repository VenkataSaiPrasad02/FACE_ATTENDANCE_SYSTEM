package com.example.faceattendance.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the OpenAPI / Swagger UI documentation.
 * Adds Bearer JWT authentication scheme to all secured endpoints.
 * Access at: /swagger-ui.html
 */
@OpenAPIDefinition(
        info = @Info(
                title       = "Face Attendance API",
                version     = "1.0",
                description = "REST API for the Face Recognition Attendance Management System. " +
                        "Use POST /api/auth/login to obtain a JWT token, then click 'Authorize' above.",
                contact     = @Contact(name = "Face Attendance System")
        )
)
@SecurityScheme(
        name         = "bearerAuth",
        type         = SecuritySchemeType.HTTP,
        scheme       = "bearer",
        bearerFormat = "JWT",
        description  = "Paste your JWT token obtained from POST /api/auth/login"
)
@Configuration
public class OpenApiConfig {
    // Intentionally empty — configuration is done via annotations above.
}