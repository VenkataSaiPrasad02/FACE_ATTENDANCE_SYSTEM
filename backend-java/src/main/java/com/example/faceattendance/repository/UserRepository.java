package com.example.faceattendance.repository;

import com.example.faceattendance.entity.Role;
import com.example.faceattendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    /*
     * Used for Admin Management — a stable, backend-level
     * alphabetical sort by username instead of sorting only the
     * current frontend page.
     */
    List<User> findByRoleInOrderByUsernameAsc(List<Role> roles);
}
