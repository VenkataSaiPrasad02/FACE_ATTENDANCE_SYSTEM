package com.example.faceattendance.repository;

import com.example.faceattendance.entity.FaceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FaceDataRepository extends JpaRepository<FaceData, Long> {

    Optional<FaceData> findByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);

    void deleteByStudentId(Long studentId);

    /**
     * Returns all face data records — used by the recognition flow to load
     * all stored embeddings as candidates.
     */
    List<FaceData> findAll();
}
