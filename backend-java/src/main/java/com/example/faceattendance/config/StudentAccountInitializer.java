package com.example.faceattendance.config;

import com.example.faceattendance.entity.Student;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.StudentAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * One-time (idempotent) migration executed at startup: every student
 * without a linked login account gets one provisioned —
 * username = roll number, initial password from configuration,
 * {@code mustChangePassword = true}.
 *
 * <p>Each student is processed in its own transaction so a single
 * conflict cannot abort the whole migration.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudentAccountInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final StudentAccountService studentAccountService;

    @Override
    public void run(String... args) {
        List<Student> orphans = studentRepository.findByUserIsNull();
        if (orphans.isEmpty()) {
            return;
        }

        log.info("Provisioning login accounts for {} existing student(s)...", orphans.size());

        int created = 0;
        int failed = 0;
        for (Student student : new ArrayList<>(orphans)) {
            try {
                studentAccountService.ensureAccount(student);
                studentRepository.save(student);
                created++;
            } catch (Exception e) {
                failed++;
                log.warn("Could not provision account for student '{}' ({}): {}",
                        student.getStudentNumber(), student.getFullName(), e.getMessage());
            }
        }

        log.info("Student account provisioning complete: {} linked, {} skipped.", created, failed);
    }
}
