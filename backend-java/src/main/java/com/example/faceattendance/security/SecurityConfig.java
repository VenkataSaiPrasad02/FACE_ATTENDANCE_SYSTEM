package com.example.faceattendance.security;

import com.example.faceattendance.config.SuperAdminProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.faceattendance.entity.Role;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;

/**
 * Spring Security configuration.
 * Configures JWT-based stateless authentication, role-based access control,
 * and CORS. All security logic is centralized here and in JwtAuthenticationFilter.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final SuperAdminProperties superAdminProperties;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                                // Public endpoints
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/auth/login",
                                        "/api/auth/verify-otp",
                                        "/api/auth/resend-otp",
                                        "/api/auth/forgot-password",
                                        "/api/auth/forgot-password/verify",
                                        "/api/auth/forgot-password/resend-otp"
                                ).permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/face/health").permitAll()
                                .requestMatchers(
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/api-docs/**",
                                        "/v3/api-docs/**"
                                ).permitAll()

                                // Own-profile endpoints — any authenticated user (must be matched before /api/users/** below)
                                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()

                                // Admin-only endpoints
                                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "TEACHER", "SUPER_ADMIN")
                                .requestMatchers("/api/teachers/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                                // Teacher-only endpoints (attendance operations)
                                .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "TEACHER", "SUPER_ADMIN")


                                // Face registration endpoints - ADMIN only
                                .requestMatchers("/api/face/register/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                .requestMatchers("/api/face/delete/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                .requestMatchers("/api/academic-periods/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                // Own-profile endpoints — any authenticated user
                                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()
                                .requestMatchers(HttpMethod.POST, "/api/users/me/photo").authenticated()
                                .requestMatchers(HttpMethod.DELETE, "/api/users/me/photo").authenticated()

// Public read access to stored profile photos — required because the
// JWT lives in localStorage, not a cookie, so a plain <img src="...">
// request from the browser cannot attach an Authorization header.
// Only GET is public; uploading/replacing still requires authentication.
                                .requestMatchers(HttpMethod.GET, "/uploads/profiles/**").permitAll()

                                // All other endpoints require authentication
                                .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CommandLineRunner createSuperAdmin(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {

        return args -> {

            if (userRepository.findByUsername(superAdminProperties.username()).isEmpty()) {

                User user = new User();

                user.setUsername(superAdminProperties.username());
                user.setEmail(superAdminProperties.email());
                user.setFullName(superAdminProperties.fullName());
                user.setPasswordHash(
                        passwordEncoder.encode(superAdminProperties.password())
                );
                user.setRole(Role.SUPER_ADMIN);
                user.setEnabled(true);

                userRepository.save(user);

                System.out.println(
                        "Super Admin " + superAdminProperties.username() +
                                " created successfully!"
                );
            }
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
