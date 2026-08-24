package com.example.faceattendance.service.impl;

import com.example.faceattendance.entity.Role;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.UserRepository;
import com.example.faceattendance.service.StudentAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentAccountServiceImpl implements StudentAccountService {

    /*
     * Shared initial password for newly provisioned student accounts.
     * Configurable so it never has to be hardcoded across the codebase.
     */
    @Value("${app.student.initial-password:${STUDENT_INITIAL_PASSWORD:student@123}}")
    private String initialPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public User ensureAccount(Student student) {

        if (student.getUser() != null) {
            syncUsername(student, student.getUser());
            return student.getUser();
        }

        String username = student.getStudentNumber();

        // An account may already exist if staff created one manually.
        User existing = userRepository.findByUsername(username).orElse(null);

        if (existing != null) {
            if (existing.getRole() != Role.STUDENT) {
                throw new IllegalStateException(
                        "Cannot create student login '" + username
                                + "' — username already used by a staff account");
            }
            student.setUser(existing);
            return existing;
        }

        User account = User.builder()
                .username(username)
                .email(resolveUniqueEmail(student))
                .passwordHash(passwordEncoder.encode(initialPassword))
                .fullName(student.getFullName())
                .role(Role.STUDENT)
                .enabled(true)
                .mustChangePassword(true)
                .build();

        try {
            userRepository.saveAndFlush(account);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException(
                    "Could not create login account for roll number '" + username
                            + "': username or email already taken");
        }

        student.setUser(account);

        log.info("Provisioned STUDENT login '{}' for '{}' (mustChangePassword=true)",
                username, student.getFullName());

        return account;
    }

    /**
     * Roll numbers double as login usernames — when a roll number is
     * edited, the login follows.
     */
    private void syncUsername(Student student, User account) {
        if (account.getUsername().equals(student.getStudentNumber())) {
            return;
        }
        userRepository.findByUsername(student.getStudentNumber())
                .filter(other -> !other.getId().equals(account.getId()))
                .ifPresent(other -> {
                    throw new IllegalStateException(
                            "Cannot rename login to '" + student.getStudentNumber()
                                    + "' — username already exists");
                });
        log.info("Renaming student login '{}' -> '{}'", account.getUsername(), student.getStudentNumber());
        account.setUsername(student.getStudentNumber());
        userRepository.save(account);
    }

    private String resolveUniqueEmail(Student student) {
        String email = student.getEmail();
        if (email != null && !email.isBlank()) {
            boolean free = userRepository.findByEmail(email.trim())
                    .isEmpty();
            if (free) {
                return email.trim();
            }
        }
        // Deterministic fallback domain keeps NOT NULL / UNIQUE satisfied.
        return student.getStudentNumber().toLowerCase() + "@students.local";
    }
}
