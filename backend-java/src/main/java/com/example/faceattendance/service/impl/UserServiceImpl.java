package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.user.CreateAdminRequest;
import com.example.faceattendance.dto.user.UpdateAdminRequest;
import com.example.faceattendance.dto.user.UpdateProfileRequest;
import com.example.faceattendance.dto.user.UserResponse;
import com.example.faceattendance.entity.Role;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.mapper.UserMapper;
import com.example.faceattendance.repository.UserRepository;
import com.example.faceattendance.service.ProfilePhotoStorageService;
import com.example.faceattendance.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User management business logic.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ProfilePhotoStorageService profilePhotoStorageService;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse createAdmin(CreateAdminRequest request) {

        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        // Check password confirmation
        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "Passwords do not match"
            );
        }

        // Check username
        if (userRepository
                .findByUsername(username)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        // Check email
        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        // Create user
        User user = new User();

        user.setUsername(username);
        user.setFullName(
                request.getFullName().trim()
        );
        user.setEmail(email);

        // NEVER store plain password
        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        // Role is controlled by backend
        user.setRole(Role.ADMIN);

        user.setEnabled(true);

        User savedUser =
                userRepository.save(user);

        return userMapper.toDto(savedUser);
    }

    @Override
    public List<UserResponse> getAllAdmins() {
        return userRepository
                .findByRoleInOrderByUsernameAsc(
                        List.of(Role.ADMIN, Role.SUPER_ADMIN)
                )
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateAdmin(Long id, UpdateAdminRequest request) {

        User user = findAdminOrThrow(id);

        String email = request.getEmail().trim();

        if (!email.equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Email already in use");
                }
            });
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional
    public void deleteAdmin(Long id, String actingUsername) {

        User user = findAdminOrThrow(id);

        // Safeguard: never allow a SUPER_ADMIN account to be
        // deleted through this endpoint — that would risk locking
        // the system out of admin-level access.
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new IllegalStateException(
                    "A Super Admin account cannot be deleted."
            );
        }

        // Safeguard: never allow the currently authenticated admin
        // to delete their own account.
        if (user.getUsername().equalsIgnoreCase(actingUsername)) {
            throw new IllegalStateException(
                    "You cannot delete your own account while logged in."
            );
        }

        userRepository.delete(user);
    }

    private User findAdminOrThrow(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + id));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Admin not found: " + id);
        }

        return user;
    }

    @Override
    public UserResponse getOwnProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserResponse updateOwnProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String email = request.getEmail().trim();

        // If email is changing, make sure it isn't already taken by another account
        if (!email.equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Email already in use");
                }
            });
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }
    @Transactional
    @Override
    public UserResponse updateOwnProfilePhoto(String username, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String newUrl = profilePhotoStorageService.store(user.getId(), file, user.getProfilePhotoUrl());
        user.setProfilePhotoUrl(newUrl);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional
    public UserResponse removeOwnProfilePhoto(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        profilePhotoStorageService.delete(user.getProfilePhotoUrl());
        user.setProfilePhotoUrl(null);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }
}