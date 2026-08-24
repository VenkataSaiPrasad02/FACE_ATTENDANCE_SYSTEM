package com.example.faceattendance.repository;

import com.example.faceattendance.entity.StudentAutoFillConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAutoFillConfigRepository
        extends JpaRepository<StudentAutoFillConfig, Long> {

    boolean existsByNameIgnoreCase(String name);

    List<StudentAutoFillConfig> findAllByOrderByNameAsc();
}
