package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.teacher.CreateTeacherRequest;
import com.example.faceattendance.dto.teacher.TeacherResponse;
import com.example.faceattendance.dto.teacher.UpdateTeacherRequest;
import com.example.faceattendance.entity.Role;
import com.example.faceattendance.entity.Teacher;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.mapper.TeacherMapper;
import com.example.faceattendance.repository.TeacherRepository;
import com.example.faceattendance.repository.UserRepository;
import com.example.faceattendance.service.TeacherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeacherMapper teacherMapper;

    @Override
    @Transactional
    public TeacherResponse create(CreateTeacherRequest request) {

        String username = request.getUsername().trim();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Create User account for the teacher
        User user = User.builder()
                .username(username)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.TEACHER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create Teacher record linked to User
        Teacher teacher = teacherMapper.toEntity(request);
        teacher.setUser(savedUser);

        Teacher saved = teacherRepository.save(teacher);

        log.info("Teacher created with User account: id={}, userId={}",
                saved.getId(), savedUser.getId());

        return teacherMapper.toDto(saved);
    }
    @Override
    @Transactional(readOnly = true)
    public Page<TeacherResponse> getAll(Pageable pageable, String search) {
        // Simple implementation - could add search if needed
        return teacherRepository.findAll(pageable)
                .map(teacherMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponse getById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher not found with id: " + id));
        return teacherMapper.toDto(teacher);
    }

    @Override
    @Transactional
    public TeacherResponse update(
            Long id,
            UpdateTeacherRequest request) {

        Teacher teacher = findOrThrow(id);

        User user = teacher.getUser();

        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(
                    passwordEncoder.encode(request.getPassword())
            );
        }

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }

        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail().trim());
            teacher.setEmail(request.getEmail().trim());
        }

        if (StringUtils.hasText(request.getPhone())) {
            teacher.setPhone(request.getPhone().trim());
        }

        if (StringUtils.hasText(request.getDepartment())) {
            teacher.setDepartment(
                    request.getDepartment().trim()
            );
        }

        userRepository.save(user);

        Teacher saved = teacherRepository.save(teacher);

        return teacherMapper.toDto(saved);
    }
    private Teacher findOrThrow(Long id) {
        return teacherRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Teacher not found with id: " + id
                        )
                );
    }
    @Override
    @Transactional
    public void delete(Long id) {

        Teacher teacher = findOrThrow(id);

        User user = teacher.getUser();

        // First delete the Teacher because teachers.user_id is NOT NULL
        teacherRepository.delete(teacher);
        teacherRepository.flush();

        // Then delete the associated User account
        if (user != null) {
            userRepository.delete(user);
            log.info(
                    "Associated User account deleted: userId={}",
                    user.getId()
            );
        }

        log.info(
                "Teacher deleted: id={}",
                id
        );
    }
}