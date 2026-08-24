package com.example.faceattendance.service;

import com.example.faceattendance.entity.Student;
import com.example.faceattendance.entity.User;

/**
 * Provisions login accounts for students.
 *
 * <p>Username = roll number (studentNumber). The initial password comes
 * from configuration ({@code app.student.initial-password}) and is only
 * ever stored as a BCrypt hash with {@code mustChangePassword=true},
 * forcing a personal password on first login.</p>
 */
public interface StudentAccountService {

    /**
     * Idempotently ensures the student has a linked STUDENT-role user
     * account. Also keeps the username in sync when a roll number is
     * changed.
     *
     * @return the linked account
     */
    User ensureAccount(Student student);
}
